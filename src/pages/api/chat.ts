import assistantContext from '@/lib/ai-assistant-context.md?raw'
import { BOT_NAME, NICK_NAME } from '@/lib/constants'
import { log, tryPromise } from '@/lib/utils'
import { toUIMessageStream } from '@ai-sdk/langchain'
import { UpstashRedisCache } from '@langchain/community/caches/upstash_redis'
import {
	AIMessage,
	HumanMessage,
	SystemMessage,
} from '@langchain/core/messages'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { Redis } from '@upstash/redis'
import { createUIMessageStreamResponse } from 'ai'
import {
	GEMINI_API_KEY,
	GEMINI_MODEL,
	UPSTASH_REDIS_REST_TOKEN,
	UPSTASH_REDIS_REST_URL,
} from 'astro:env/server'

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
		const body = await tryPromise<ChatRequest>(request.json())
		if (body.error) return errResponse(body.error, 'Invalid request body', 400)

		const messages = body.data.messages

		function getMessageText(msg: ChatMessage) {
			return (
				msg.parts
					?.filter((p) => p.type === 'text')
					.map((p) => p.text)
					.join('\n') ?? ''
			)
		}

		const latestMessage = getMessageText(messages[messages.length - 1])

		const cache = new UpstashRedisCache({
			client: new Redis({
				url: UPSTASH_REDIS_REST_URL,
				token: UPSTASH_REDIS_REST_TOKEN,
			}),
		})

		const chatModel = new ChatGoogleGenerativeAI({
			model: GEMINI_MODEL,
			streaming: true,
			temperature: 0,
			apiKey: GEMINI_API_KEY,
			cache,
		})

		const chatHistory = messages
			.slice(0, -1)
			.map((msg: any) =>
				msg.role === 'user'
					? new HumanMessage(getMessageText(msg))
					: new AIMessage(getMessageText(msg))
			)

		const prompt = new SystemMessage(
			`You are ${BOT_NAME}, a friendly chatbot for ${NICK_NAME}'s personal developer portfolio website. ` +
				`You are trying to convince potential employers to hire ${NICK_NAME} as a software engineer. ` +
				"Answer only with facts from the provided portfolio context. " +
				"If the answer is not in the context, say that you do not know. " +
				"Reply in the same language as the user's latest message. " +
				'Be concise, format responses in markdown, and include relevant links only when they explicitly exist in the context. format the internal links like "/<path>" no extensions needed.\n\n' +
				`Portfolio context:\n\n${assistantContext}`
		)

		const resultStream = await tryPromise(
			chatModel.stream([prompt, ...chatHistory, new HumanMessage(latestMessage)])
		)

		if (resultStream.error)
			return errResponse(resultStream.error, 'Failed to process the message')

		const uiStream = toUIMessageStream(resultStream.data)

		return createUIMessageStreamResponse({ stream: uiStream })
	} catch (error) {
		log('error', TAG, 'Unexpected error:', error)
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
		})
	}
}
