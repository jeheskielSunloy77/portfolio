// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
	streamMock,
	convertToModelMessagesMock,
	googleMock,
	openaiMock,
	anthropicMock,
	toUIMessageStreamResponseMock,
} = vi.hoisted(() => ({
	streamMock: vi.fn(),
	convertToModelMessagesMock: vi.fn(),
	googleMock: vi.fn(),
	openaiMock: vi.fn(),
	anthropicMock: vi.fn(),
	toUIMessageStreamResponseMock: vi
		.fn()
		.mockImplementation(() => new Response(null, { status: 200 })),
}))

vi.mock('@/lib/ai-context', () => {
	return {
		buildPortfolioAssistantContext: vi
			.fn()
			.mockReturnValue('# Test Context\n\n- Portfolio link: https://example.com'),
	}
})

vi.mock('@ai-sdk/google', () => ({
	createGoogleGenerativeAI: vi.fn().mockImplementation(() => googleMock),
}))

vi.mock('@ai-sdk/openai', () => ({
	createOpenAI: vi.fn().mockImplementation(() => openaiMock),
}))

vi.mock('@ai-sdk/anthropic', () => ({
	createAnthropic: vi.fn().mockImplementation(() => anthropicMock),
}))

vi.mock('astro:env/server', () => ({
	AI_PROVIDER: 'google',
	AI_API_KEY: 'test-ai-api-key',
	AI_MODEL: 'gemini-2.5-flash',
	AI_BASE_URL: undefined,
}))

vi.mock('ai', () => ({
	streamText: streamMock,
	convertToModelMessages: convertToModelMessagesMock,
}))

import { POST } from './chat'

describe('POST /api/chat', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		googleMock.mockReturnValue('mock-model')
		convertToModelMessagesMock.mockReturnValue([{ role: 'user', content: 'hello' }])
		streamMock.mockReturnValue({
			toUIMessageStreamResponse: toUIMessageStreamResponseMock,
		})
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

	it('passes the generated context and chat history directly to the model', async () => {
		const messages = [
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
		]

		const goodRequest = {
			json: async () => ({
				messages,
			}),
		} as unknown as Request

		const res = await POST({ request: goodRequest })
		expect(res).toBeInstanceOf(Response)
		expect(res.status).toBe(200)
		expect(convertToModelMessagesMock).toHaveBeenCalledWith(messages)
		expect(googleMock).toHaveBeenCalledTimes(1)
		expect(googleMock).toHaveBeenCalledWith(expect.any(String))
		expect(streamMock).toHaveBeenCalledTimes(1)
		expect(streamMock).toHaveBeenCalledWith(
			expect.objectContaining({
				model: 'mock-model',
				temperature: 0,
				messages: [{ role: 'user', content: 'hello' }],
				system: expect.stringContaining('# Test Context'),
			})
		)
		expect(streamMock.mock.calls[0][0].system).toContain(
			'Portfolio link: https://example.com'
		)
		expect(toUIMessageStreamResponseMock).toHaveBeenCalledTimes(1)
	})

	it('returns 500 when model streaming fails', async () => {
		streamMock.mockImplementationOnce(() => {
			throw new Error('model failure')
		})

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
