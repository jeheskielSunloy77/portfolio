import assistantContext from '@/lib/ai-assistant-context.md?raw'
import { BOT_NAME, NICK_NAME } from '@/lib/constants'
import { log, tryPromise } from '@/lib/utils'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { convertToModelMessages, streamText } from 'ai'
import { GEMINI_API_KEY, GEMINI_MODEL } from 'astro:env/server'

const TAG = 'ChatBotApi'
const google = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY })

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
		const body = await tryPromise<ChatRequest>(request.json())
		if (body.error) return errResponse(body.error, 'Invalid request body', 400)

		const messages = body.data.messages
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
					model: google(GEMINI_MODEL),
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
