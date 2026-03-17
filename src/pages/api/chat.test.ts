// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { HumanMessage, SystemMessage } from '@langchain/core/messages'

const streamMock = vi.fn()

vi.mock('@/lib/ai-assistant-context.md?raw', () => ({
	default: '# Test Context\n\n- Portfolio link: https://example.com',
}))

vi.mock('@langchain/google-genai', () => ({
	ChatGoogleGenerativeAI: vi.fn().mockImplementation(() => ({
		stream: streamMock,
	})),
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

vi.mock('@ai-sdk/langchain', () => ({
	toUIMessageStream: vi.fn().mockImplementation((stream) => stream),
}))

import { POST } from './chat'

describe('POST /api/chat', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		streamMock.mockResolvedValue(
			(async function* () {
				yield { content: 'mocked answer' }
			})()
		)
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

	it('passes the markdown context and chat history directly to the model', async () => {
		const goodRequest = {
			json: async () => ({
				messages: [
					{
						id: '0',
						role: 'assistant',
						parts: [{ type: 'text', text: 'hello there' }],
					},
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
		expect(res.status).toBe(200)
		expect(streamMock).toHaveBeenCalledTimes(1)

		const [inputMessages] = streamMock.mock.calls[0]
		expect(inputMessages).toHaveLength(3)

		const systemMessage = inputMessages[0] as SystemMessage
		const historyMessage = inputMessages[1]
		const latestMessage = inputMessages[2] as HumanMessage

		expect(systemMessage.content).toContain('# Test Context')
		expect(systemMessage.content).toContain('Portfolio link: https://example.com')
		expect(historyMessage.content).toBe('hello there')
		expect(latestMessage.content).toBe('hello')
	})

	it('returns 500 when model streaming fails', async () => {
		streamMock.mockRejectedValueOnce(new Error('model failure'))

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
		expect(body).toHaveProperty('error', 'Failed to process the message')
	})
})
