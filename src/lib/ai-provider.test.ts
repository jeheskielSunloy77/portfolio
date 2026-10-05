// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

const { googleFactoryMock, openaiFactoryMock, anthropicFactoryMock } = vi.hoisted(() => ({
	googleFactoryMock: vi.fn(),
	openaiFactoryMock: vi.fn(),
	anthropicFactoryMock: vi.fn(),
}))

vi.mock('@ai-sdk/google', () => ({
	createGoogleGenerativeAI: vi.fn((opts) => {
		googleFactoryMock(opts)
		return (model: string) => `google:${model}`
	}),
}))

vi.mock('@ai-sdk/openai', () => ({
	createOpenAI: vi.fn((opts) => {
		openaiFactoryMock(opts)
		return (model: string) => `openai:${model}`
	}),
}))

vi.mock('@ai-sdk/anthropic', () => ({
	createAnthropic: vi.fn((opts) => {
		anthropicFactoryMock(opts)
		return (model: string) => `anthropic:${model}`
	}),
}))

let mockEnv: Record<string, string | undefined> = {}

vi.mock('astro:env/server', () => ({
	get AI_PROVIDER() {
		return mockEnv.AI_PROVIDER
	},
	get AI_API_KEY() {
		return mockEnv.AI_API_KEY
	},
	get AI_MODEL() {
		return mockEnv.AI_MODEL
	},
	get AI_BASE_URL() {
		return mockEnv.AI_BASE_URL
	},
	get GEMINI_API_KEY() {
		return mockEnv.GEMINI_API_KEY
	},
	get GEMINI_MODEL() {
		return mockEnv.GEMINI_MODEL
	},
	get GEMINI_BASE_URL() {
		return mockEnv.GEMINI_BASE_URL
	},
	get OPENAI_API_KEY() {
		return mockEnv.OPENAI_API_KEY
	},
	get OPENAI_MODEL() {
		return mockEnv.OPENAI_MODEL
	},
	get OPENAI_BASE_URL() {
		return mockEnv.OPENAI_BASE_URL
	},
	get ANTHROPIC_API_KEY() {
		return mockEnv.ANTHROPIC_API_KEY
	},
	get ANTHROPIC_MODEL() {
		return mockEnv.ANTHROPIC_MODEL
	},
	get ANTHROPIC_BASE_URL() {
		return mockEnv.ANTHROPIC_BASE_URL
	},
}))

import { getChatModel, resolveAiProvider } from './ai-provider'

describe('ai-provider', () => {
	it('resolves null when no keys or providers configured', () => {
		mockEnv = {}
		expect(resolveAiProvider()).toBeNull()
		const res = getChatModel()
		expect(res.model).toBeNull()
		expect(res.error).toContain('offline')
	})

	it('works with unified AI_* variables defaulting to google', () => {
		mockEnv = {
			AI_API_KEY: 'test-google-key',
		}
		expect(resolveAiProvider()).toBe('google')
		const res = getChatModel()
		expect(res.provider).toBe('google')
		expect(res.model).toBe('google:gemini-2.5-flash')
		expect(googleFactoryMock).toHaveBeenCalledWith({
			apiKey: 'test-google-key',
			baseURL: undefined,
		})
	})

	it('supports AI_PROVIDER="openai" with unified AI_API_KEY and custom AI_BASE_URL', () => {
		mockEnv = {
			AI_PROVIDER: 'openai',
			AI_API_KEY: 'sk-test',
			AI_MODEL: 'llama-3.3-70b',
			AI_BASE_URL: 'http://localhost:11434/v1',
		}
		expect(resolveAiProvider()).toBe('openai')
		const res = getChatModel()
		expect(res.provider).toBe('openai')
		expect(res.model).toBe('openai:llama-3.3-70b')
		expect(openaiFactoryMock).toHaveBeenCalledWith({
			apiKey: 'sk-test',
			baseURL: 'http://localhost:11434/v1',
		})
	})

	it('supports AI_PROVIDER="anthropic" with unified AI_API_KEY', () => {
		mockEnv = {
			AI_PROVIDER: 'anthropic',
			AI_API_KEY: 'claude-key',
		}
		expect(resolveAiProvider()).toBe('anthropic')
		const res = getChatModel()
		expect(res.provider).toBe('anthropic')
		expect(res.model).toBe('anthropic:claude-3-5-haiku-latest')
		expect(anthropicFactoryMock).toHaveBeenCalledWith({
			apiKey: 'claude-key',
			baseURL: undefined,
		})
	})

	it('maps legacy AI_PROVIDER="gemini" to "google"', () => {
		mockEnv = {
			AI_PROVIDER: 'gemini',
			AI_API_KEY: 'gem-key',
		}
		expect(resolveAiProvider()).toBe('google')
		const res = getChatModel()
		expect(res.provider).toBe('google')
	})

	it('falls back to legacy OPENAI_API_KEY when AI_API_KEY is not set', () => {
		mockEnv = {
			OPENAI_API_KEY: 'legacy-key',
		}
		expect(resolveAiProvider()).toBe('openai')
		const res = getChatModel()
		expect(res.provider).toBe('openai')
		expect(res.model).toBe('openai:gpt-4o-mini')
	})
})
