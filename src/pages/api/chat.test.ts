import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './chat'

// Prevent external SDKs and networked clients from being constructed / run during tests
vi.mock('@/lib/vector-db', () => ({
	getVectorStore: vi.fn(),
}))

vi.mock('@langchain/google-genai', () => ({
	ChatGoogleGenerativeAI: vi.fn().mockImplementation(() => ({})),
}))

vi.mock('@langchain/community/caches/upstash_redis', () => ({
	UpstashRedisCache: vi.fn().mockImplementation(() => ({})),
}))

vi.mock('@upstash/redis', () => ({
	Redis: vi.fn().mockImplementation(() => ({})),
}))

vi.mock('ai', () => ({
	createUIMessageStreamResponse: vi
		.fn()
		.mockImplementation(() => new Response(null, { status: 200 })),
}))

vi.mock('langchain/chains/history_aware_retriever', () => ({
	createHistoryAwareRetriever: vi.fn().mockResolvedValue({}),
}))

vi.mock('langchain/chains/combine_documents', () => ({
	createStuffDocumentsChain: vi.fn().mockResolvedValue({}),
}))

vi.mock('langchain/chains/retrieval', () => ({
	createRetrievalChain: vi.fn().mockResolvedValue({
		stream: async () =>
			(async function* () {
				yield { answer: 'mocked answer' }
			})(),
	}),
}))

describe('POST /api/chat', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	it('returns 400 when request.json() rejects (invalid request body)', async () => {
		const badRequest = {
			json: async () => {
				throw new Error('bad json')
			},
		} as unknown as Request

		const res = await POST({ request: badRequest })
		expect(res).toBeInstanceOf(Response)
		expect(res.status).toBe(400)
		const body = JSON.parse(await res.text())
		expect(body).toHaveProperty('error', 'Invalid request body')
	})

	it('returns 500 with specific message when vector store initialization fails', async () => {
		const { getVectorStore } = await import('@/lib/vector-db')
		;(getVectorStore as ReturnType<typeof vi.fn>).mockImplementation(() =>
			Promise.reject(new Error('db failure'))
		)

		const goodRequest = {
			json: async () => ({
				messages: [
					{
						id: '1',
						role: 'user',
						parts: [{ type: 'text', text: 'hello' }],
					},
				],
			}),
		} as unknown as Request

		const res = await POST({ request: goodRequest })
		expect(res).toBeInstanceOf(Response)
		expect(res.status).toBe(500)
		const body = JSON.parse(await res.text())
		// The handler should return the 'Failed to initialize vector store' message for this case
		expect(body).toHaveProperty('error', 'Failed to initialize vector store')
	})
})
