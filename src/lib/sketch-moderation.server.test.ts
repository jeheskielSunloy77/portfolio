// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetChatModel = vi.fn()
const mockGenerateObject = vi.fn()

vi.mock('@/lib/ai-provider', () => ({
	getChatModel: () => mockGetChatModel(),
}))

vi.mock('ai', () => ({
	generateObject: (...args: any[]) => mockGenerateObject(...args),
}))

import { moderateSketch } from './sketch-moderation.server'

describe('sketch moderation service', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('returns isSensitive: false when AI model is not configured', async () => {
		mockGetChatModel.mockReturnValue({
			provider: null,
			model: null,
			error: 'AI unconfigured',
		})

		const result = await moderateSketch({
			image: Buffer.from('test-image'),
			name: 'Visitor',
			message: 'Hello',
		})

		expect(result).toEqual({ isSensitive: false })
		expect(mockGenerateObject).not.toHaveBeenCalled()
	})

	it('returns isSensitive: true and reason when AI flags sensitive content', async () => {
		mockGetChatModel.mockReturnValue({
			provider: 'google',
			model: { modelId: 'gemini-2.5-flash' },
		})

		mockGenerateObject.mockResolvedValue({
			object: {
				isSensitive: true,
				reason: 'Explicit suggestive drawing',
			},
		})

		const result = await moderateSketch({
			image: Buffer.from('test-image'),
			name: 'BadUser',
			message: 'Nasty doodle',
		})

		expect(result).toEqual({
			isSensitive: true,
			reason: 'Explicit suggestive drawing',
		})
		expect(mockGenerateObject).toHaveBeenCalledTimes(1)
		const callArgs = mockGenerateObject.mock.calls[0][0]
		expect(callArgs.messages[0].content).toHaveLength(2)
		expect(callArgs.messages[0].content[0].type).toBe('text')
		expect(callArgs.messages[0].content[1].type).toBe('image')
	})

	it('returns isSensitive: false for safe sketches', async () => {
		mockGetChatModel.mockReturnValue({
			provider: 'google',
			model: { modelId: 'gemini-2.5-flash' },
		})

		mockGenerateObject.mockResolvedValue({
			object: {
				isSensitive: false,
			},
		})

		const result = await moderateSketch({
			image: Buffer.from('test-image'),
			name: 'CuteCat',
			message: 'Just a smiling cat doodle',
		})

		expect(result).toEqual({
			isSensitive: false,
			reason: undefined,
		})
	})

	it('gracefully falls back to isSensitive: false when AI generation fails', async () => {
		mockGetChatModel.mockReturnValue({
			provider: 'google',
			model: { modelId: 'gemini-2.5-flash' },
		})

		mockGenerateObject.mockRejectedValue(new Error('AI API rate limited or timeout'))

		const result = await moderateSketch({
			image: Buffer.from('test-image'),
			name: 'Visitor',
			message: 'Nice art',
		})

		expect(result).toEqual({ isSensitive: false })
	})
})
