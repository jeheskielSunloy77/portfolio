import { buildPortfolioAssistantContext } from '@/lib/ai-context'
import { getChatModel } from '@/lib/ai-provider'
import { BOT_NAME, NICK_NAME } from '@/site.config'
import { log, tryPromise } from '@/lib/utils'
import { convertToModelMessages, streamText } from 'ai'

const TAG = 'ChatBotApi'

function errResponse(error: Error, message: string, status = 500) {
	log(
		'error',
		TAG,
		`message: ${message}\n error: ${error.message} stack: ${error.stack}`
	)
	return new Response(JSON.stringify({ error: message }), { status })
}

interface ChatMessage {
	id: string
	role: string
	parts: { type: string; text: string }[]
}

interface ChatRequest {
	id?: string
	trigger?: string
	messages: ChatMessage[]
}

export async function POST({ request }: { request: Request }) {
	try {
		const aiConfig = getChatModel()
		if (!aiConfig.model) {
			return new Response(
				JSON.stringify({
					error:
						aiConfig.error ||
						'The AI chatbot is currently offline because no AI provider is configured in .env',
				}),
				{ status: 503, headers: { 'Content-Type': 'application/json' } }
			)
		}

		const body = await tryPromise<ChatRequest>(request.json())
		if (body.error) return errResponse(body.error, 'Invalid request body', 400)

		const messages = body.data.messages
		const assistantContext = await buildPortfolioAssistantContext()
		const prompt =
			`You are ${BOT_NAME}, a friendly chatbot for ${NICK_NAME}'s personal developer portfolio website. ` +
			`You are trying to convince potential employers to hire ${NICK_NAME} as a software engineer. ` +
			"Answer only with facts from the provided portfolio context. " +
			"If the answer is not in the context, say that you do not know. " +
			"Reply in the same language as the user's latest message. " +
			'Be concise, format responses in markdown, and include relevant links only when they explicitly exist in the context. format the internal links like "/<path>" no extensions needed.\n\n' +
			`Portfolio context:\n\n${assistantContext}`

		const resultStream = await tryPromise(
			Promise.resolve().then(() =>
				streamText({
					model: aiConfig.model!,
					system: prompt,
					messages: convertToModelMessages(messages as any),
					temperature: 0,
				})
			)
		)

		if (resultStream.error)
			return errResponse(resultStream.error, 'Failed to process the message')

		return resultStream.data.toUIMessageStreamResponse()
	} catch (error) {
		log('error', TAG, 'Unexpected error:', error)
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
		})
	}
}
