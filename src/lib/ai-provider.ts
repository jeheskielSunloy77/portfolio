import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import type { streamText } from 'ai'
import {
	AI_API_KEY,
	AI_BASE_URL,
	AI_MODEL,
	AI_PROVIDER,
} from 'astro:env/server'

export type AiProviderName = 'google' | 'openai' | 'anthropic'
export type AiModel = Parameters<typeof streamText>[0]['model']

export interface ResolvedAiConfig {
	provider: AiProviderName | null
	model: AiModel | null
	error?: string
}

const VALID_PROVIDERS: readonly AiProviderName[] = [
	'google',
	'openai',
	'anthropic',
]

const DEFAULT_MODELS: Record<AiProviderName, string> = {
	google: 'gemini-2.5-flash',
	openai: 'gpt-4o-mini',
	anthropic: 'claude-3-5-haiku-latest',
}

export function resolveAiProvider(): AiProviderName | null {
	const provider = (AI_PROVIDER?.trim().toLowerCase() || 'google') as AiProviderName
	if (VALID_PROVIDERS.includes(provider)) {
		return provider
	}
	return null
}

export function getChatModel(): ResolvedAiConfig {
	const apiKey = AI_API_KEY?.trim()
	if (!apiKey) {
		return {
			provider: null,
			model: null,
			error:
				'The AI chatbot is currently offline because AI_API_KEY is not configured in .env',
		}
	}

	const provider = resolveAiProvider()
	if (!provider) {
		return {
			provider: null,
			model: null,
			error: `Invalid AI_PROVIDER "${AI_PROVIDER}". Supported providers are: ${VALID_PROVIDERS.join(', ')}.`,
		}
	}

	const baseURL = AI_BASE_URL?.trim() || undefined
	const modelName = AI_MODEL?.trim() || DEFAULT_MODELS[provider]

	switch (provider) {
		case 'openai': {
			const openai = createOpenAI({ apiKey, baseURL })
			return {
				provider: 'openai',
				model: openai(modelName),
			}
		}
		case 'anthropic': {
			const anthropic = createAnthropic({ apiKey, baseURL })
			return {
				provider: 'anthropic',
				model: anthropic(modelName),
			}
		}
		case 'google': {
			const google = createGoogleGenerativeAI({ apiKey, baseURL })
			return {
				provider: 'google',
				model: google(modelName),
			}
		}
	}
}
