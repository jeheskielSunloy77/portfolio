import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import type { streamText } from 'ai'
import {
	AI_API_KEY,
	AI_BASE_URL,
	AI_MODEL,
	AI_PROVIDER,
	ANTHROPIC_API_KEY,
	ANTHROPIC_BASE_URL,
	ANTHROPIC_MODEL,
	GEMINI_API_KEY,
	GEMINI_BASE_URL,
	GEMINI_MODEL,
	OPENAI_API_KEY,
	OPENAI_BASE_URL,
	OPENAI_MODEL,
} from 'astro:env/server'

export type AiProviderName = 'google' | 'openai' | 'anthropic'
export type AiModel = Parameters<typeof streamText>[0]['model']

export interface ResolvedAiConfig {
	provider: AiProviderName | null
	model: AiModel | null
	error?: string
}

export function resolveAiProvider(): AiProviderName | null {
	const rawProvider = AI_PROVIDER?.trim().toLowerCase()
	const provider = rawProvider === 'gemini' ? 'google' : rawProvider

	if (provider === 'openai' || provider === 'anthropic') {
		return provider
	}

	// If explicit provider is set to google/gemini
	if (provider === 'google' && (AI_API_KEY?.trim() || GEMINI_API_KEY?.trim())) {
		return 'google'
	}

	// Auto-detect if provider is default or omitted
	if (OPENAI_API_KEY?.trim()) return 'openai'
	if (ANTHROPIC_API_KEY?.trim()) return 'anthropic'
	if (AI_API_KEY?.trim() || GEMINI_API_KEY?.trim()) return 'google'

	return null
}

export function getChatModel(): ResolvedAiConfig {
	const provider = resolveAiProvider()

	if (!provider) {
		return {
			provider: null,
			model: null,
			error:
				'The AI chatbot is currently offline because no AI API key is configured in .env (AI_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY).',
		}
	}

	if (provider === 'openai') {
		const apiKey = AI_API_KEY?.trim() || OPENAI_API_KEY?.trim()
		if (!apiKey) {
			return {
				provider: 'openai',
				model: null,
				error: 'AI_PROVIDER is set to "openai" but no API key was provided (set AI_API_KEY or OPENAI_API_KEY in .env)',
			}
		}
		const baseURL = (AI_BASE_URL?.trim() || OPENAI_BASE_URL?.trim()) || undefined
		const modelName = (AI_MODEL?.trim() || OPENAI_MODEL?.trim()) || 'gpt-4o-mini'
		const openai = createOpenAI({ apiKey, baseURL })
		return {
			provider: 'openai',
			model: openai(modelName),
		}
	}

	if (provider === 'anthropic') {
		const apiKey = AI_API_KEY?.trim() || ANTHROPIC_API_KEY?.trim()
		if (!apiKey) {
			return {
				provider: 'anthropic',
				model: null,
				error: 'AI_PROVIDER is set to "anthropic" but no API key was provided (set AI_API_KEY or ANTHROPIC_API_KEY in .env)',
			}
		}
		const baseURL = (AI_BASE_URL?.trim() || ANTHROPIC_BASE_URL?.trim()) || undefined
		const modelName = (AI_MODEL?.trim() || ANTHROPIC_MODEL?.trim()) || 'claude-3-5-haiku-latest'
		const anthropic = createAnthropic({ apiKey, baseURL })
		return {
			provider: 'anthropic',
			model: anthropic(modelName),
		}
	}

	// Google / Gemini provider
	const apiKey = AI_API_KEY?.trim() || GEMINI_API_KEY?.trim()
	if (!apiKey) {
		return {
			provider: 'google',
			model: null,
			error: 'AI_PROVIDER is set to "google" but no API key was provided (set AI_API_KEY or GEMINI_API_KEY in .env)',
		}
	}
	const baseURL = (AI_BASE_URL?.trim() || GEMINI_BASE_URL?.trim()) || undefined
	const modelName = (AI_MODEL?.trim() || GEMINI_MODEL?.trim()) || 'gemini-2.5-flash'
	const google = createGoogleGenerativeAI({ apiKey, baseURL })
	return {
		provider: 'google',
		model: google(modelName),
	}
}
