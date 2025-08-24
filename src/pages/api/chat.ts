import { tryPromise } from '@/lib/utils'
import { getVectorStore } from '@/lib/vector-db'
import { toUIMessageStream } from '@ai-sdk/langchain'
import { UpstashRedisCache } from '@langchain/community/caches/upstash_redis'
import {
	AIMessage,
	AIMessageChunk,
	HumanMessage,
} from '@langchain/core/messages'
import {
	ChatPromptTemplate,
	MessagesPlaceholder,
	PromptTemplate,
} from '@langchain/core/prompts'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { Redis } from '@upstash/redis'

import { createUIMessageStreamResponse } from 'ai'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever'
import { createRetrievalChain } from 'langchain/chains/retrieval'

function errResponse(error: Error, message: string, status = 500) {
	console.error(
		`[CHAT_BOT_API] [ERROR] message: ${message}\n error: ${error.message} stack: ${error.stack}`
	)
	return new Response(JSON.stringify({ error: message }), { status })
}

export async function POST({ request }: { request: Request }) {
	try {
		const body = await tryPromise(request.json())
		if (body.error) return errResponse(body.error, 'Invalid request body', 400)

		const messages = body.data.messages

		const latestMessage = messages[messages.length - 1].content

		const cache = new UpstashRedisCache({
			client: new Redis({
				url: import.meta.env.UPSTASH_REDIS_REST_URL,
				token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
			}),
		})

		const chatModel = new ChatGoogleGenerativeAI({
			model: 'gemini-2.5-flash',
			streaming: true,
			temperature: 0,
			apiKey: import.meta.env.GEMINI_API_KEY!,
			cache,
		})

		const rephraseModel = new ChatGoogleGenerativeAI({
			model: 'gemini-2.5-flash',
			temperature: 0,
			apiKey: import.meta.env.GEMINI_API_KEY!,
			cache,
		})

		const vectorStore = await tryPromise(getVectorStore())
		if (vectorStore.error)
			return errResponse(vectorStore.error, 'Failed to initialize vector store')

		const retriever = vectorStore.data.asRetriever()

		// Format chat history for LangChain
		const chatHistory = messages
			.slice(0, -1)
			.map((msg: any) =>
				msg.role === 'user'
					? new HumanMessage(msg.content)
					: new AIMessage(msg.content)
			)

		// Rephrasing prompt
		const rephrasePrompt = ChatPromptTemplate.fromMessages([
			new MessagesPlaceholder('chat_history'),
			['user', '{input}'],
			[
				'user',
				'Given the above conversation history, generate a search query to look up information relevant to the current question. ' +
					'Do not leave out any relevant keywords. ' +
					'Only return the query and no other text.',
			],
		])

		const historyAwareRetrievalChain = await tryPromise(
			createHistoryAwareRetriever({
				llm: rephraseModel,
				retriever,
				rephrasePrompt,
			})
		)

		if (historyAwareRetrievalChain.error)
			return errResponse(
				historyAwareRetrievalChain.error,
				'Failed to create retrieval chain'
			)

		// Final chatbot prompt
		const prompt = ChatPromptTemplate.fromMessages([
			[
				'system',
				"You are Ted Support, a friendly chatbot for Ted's personal developer portfolio website. " +
					'You are trying to convince potential employers to hire Ted as a software developer. ' +
					"Be concise and only answer the user's questions based on the provided context below. " +
					'Provide links to pages that contain relevant information about the topic from the given context. ' +
					'Format your messages in markdown.\n\n' +
					'Context:\n{context}',
			],
			new MessagesPlaceholder('chat_history'),
			['user', '{input}'],
		])

		// Combine retrieved docs with LLM
		const combineDocsChain = await tryPromise(
			createStuffDocumentsChain({
				llm: chatModel,
				prompt,
				documentPrompt: PromptTemplate.fromTemplate(
					'Page content:\n{page_content}'
				),
				documentSeparator: '\n------\n',
			})
		)

		if (combineDocsChain.error)
			return errResponse(combineDocsChain.error, 'Failed to create document chain')

		const retrievalChain = await createRetrievalChain({
			combineDocsChain: combineDocsChain.data,
			retriever: historyAwareRetrievalChain.data,
		})

		// 🚀 Run the retrieval chain with streaming output
		const resultStream = await tryPromise(
			retrievalChain.stream({
				input: latestMessage,
				chat_history: chatHistory,
			})
		)

		if (resultStream.error)
			return errResponse(resultStream.error, 'Failed to process the message')

		// Map `{ context, answer }` → `AIMessageChunk` for AI SDK v5
		const answerStream = new ReadableStream<AIMessageChunk>({
			async start(controller) {
				for await (const chunk of resultStream.data) {
					if (chunk.answer) {
						controller.enqueue(new AIMessageChunk({ content: chunk.answer }))
					}
				}
				controller.close()
			},
		})

		// Convert to AI SDK v5 UI stream
		const uiStream = toUIMessageStream(answerStream)

		return createUIMessageStreamResponse({ stream: uiStream })
	} catch (error) {
		console.error(error)
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
		})
	}
}
