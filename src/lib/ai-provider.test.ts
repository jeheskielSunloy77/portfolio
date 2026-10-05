// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

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
}))

import { getChatModel, resolveAiProvider } from './ai-provider'

describe('ai-provider', () => {
	beforeEach(() => {
		mockEnv = {}
		vi.clearAllMocks()
	})

	it('returns offline error when AI_API_KEY is not set', () => {
		mockEnv = { AI_PROVIDER: 'google' }
		const res = getChatModel()
		expect(res.provider).toBeNull()
		expect(res.model).toBeNull()
		expect(res.error).toContain('AI_API_KEY is not configured')
	})

	it('returns null and error for invalid AI_PROVIDER', () => {
		mockEnv = {
			AI_PROVIDER: 'unsupported-provider',
			AI_API_KEY: 'test-key',
		}
		expect(resolveAiProvider()).toBeNull()
		const res = getChatModel()
		expect(res.provider).toBeNull()
		expect(res.model).toBeNull()
		expect(res.error).toContain('Invalid AI_PROVIDER')
	})

	it('rejects legacy "gemini" as AI_PROVIDER', () => {
		mockEnv = {
			AI_PROVIDER: 'gemini',
			AI_API_KEY: 'test-key',
		}
		expect(resolveAiProvider()).toBeNull()
		const res = getChatModel()
		expect(res.provider).toBeNull()
		expect(res.model).toBeNull()
		expect(res.error).toContain('Invalid AI_PROVIDER')
	})

	it('defaults to google when AI_PROVIDER is omitted', () => {
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

	it('supports google with custom model and custom AI_BASE_URL', () => {
		mockEnv = {
			AI_PROVIDER: 'google',
			AI_API_KEY: 'test-google-key',
			AI_MODEL: 'gemini-1.5-pro',
			AI_BASE_URL: 'https://my-google-proxy.example.com',
		}
		expect(resolveAiProvider()).toBe('google')
		const res = getChatModel()
		expect(res.provider).toBe('google')
		expect(res.model).toBe('google:gemini-1.5-pro')
		expect(googleFactoryMock).toHaveBeenCalledWith({
			apiKey: 'test-google-key',
			baseURL: 'https://my-google-proxy.example.com',
		})
	})

	it('supports AI_PROVIDER="openai" with default model', () => {
		mockEnv = {
			AI_PROVIDER: 'openai',
			AI_API_KEY: 'sk-test',
		}
		expect(resolveAiProvider()).toBe('openai')
		const res = getChatModel()
		expect(res.provider).toBe('openai')
		expect(res.model).toBe('openai:gpt-4o-mini')
		expect(openaiFactoryMock).toHaveBeenCalledWith({
			apiKey: 'sk-test',
			baseURL: undefined,
		})
	})

	it('supports AI_PROVIDER="openai" with custom model and custom AI_BASE_URL', () => {
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

	it('supports AI_PROVIDER="anthropic" with default and custom settings', () => {
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
})
