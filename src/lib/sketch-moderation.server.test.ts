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

import {
	checkTextSafety,
	DEFAULT_MODERATION_TIMEOUT_MS,
	moderateSketch,
	ModerationUnavailableError,
} from './sketch-moderation.server'

describe('sketch moderation service', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('checkTextSafety fast-path', () => {
		it('flags hate speech and religious hostility immediately', () => {
			const res1 = checkTextSafety('fuck all islam and muslim', 'cancer for world')
			expect(res1?.isSensitive).toBe(true)

			const res2 = checkTextSafety('attacker', 'DEATH TO ALL JEWS')
			expect(res2?.isSensitive).toBe(true)

			const res3 = checkTextSafety('user', 'kill all the fucking muslim islam cancer community')
			expect(res3?.isSensitive).toBe(true)

			const res4 = checkTextSafety('user', 'fuck islam! fuck muslim! fuck allah!')
			expect(res4?.isSensitive).toBe(true)
		})

		it('flags racial and ethnic slurs', () => {
			const res = checkTextSafety('bad', 'you are a faggot')
			expect(res?.isSensitive).toBe(true)
		})

		it('flags sexually explicit solicitation', () => {
			const res = checkTextSafety('user', 'fuck me please')
			expect(res?.isSensitive).toBe(true)
		})

		it('returns null for safe and friendly messages', () => {
			expect(checkTextSafety('Alice', 'Hello world! Lovely site.')).toBeNull()
			expect(checkTextSafety('Bob', 'Nice portfolio and great projects!')).toBeNull()
		})
	})

	describe('moderateSketch', () => {
		it('flags sensitive text via fast-path without invoking AI model', async () => {
			const result = await moderateSketch({
				image: Buffer.from('test-image'),
				name: 'fuck all islam and muslim',
				message: 'this community is cancer for world',
			})

			expect(result.isSensitive).toBe(true)
			expect(mockGenerateObject).not.toHaveBeenCalled()
			expect(mockGetChatModel).not.toHaveBeenCalled()
		})

		it('returns isSensitive: false when AI model is not configured and text is safe', async () => {
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
				name: 'Artist',
				message: 'Look at my drawing',
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

		it('returns isSensitive: false for safe sketches evaluated by AI', async () => {
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

		it('fails closed and throws ModerationUnavailableError when AI call fails or times out', async () => {
			mockGetChatModel.mockReturnValue({
				provider: 'google',
				model: { modelId: 'gemini-2.5-flash' },
			})

			mockGenerateObject.mockRejectedValue(new Error('AI API rate limited or timeout'))

			await expect(
				moderateSketch({
					image: Buffer.from('test-image'),
					name: 'Visitor',
					message: 'Nice art',
				}),
			).rejects.toThrow(ModerationUnavailableError)
		})

		it('has DEFAULT_MODERATION_TIMEOUT_MS set to 10000ms', () => {
			expect(DEFAULT_MODERATION_TIMEOUT_MS).toBe(10000)
		})
	})
})
