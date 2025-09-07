import { describe, expect, it, vi } from 'vitest'

// Mock astro:middleware so defineMiddleware just returns the handler.
vi.mock('astro:middleware', () => ({
	defineMiddleware: (fn: any) => fn,
}))

import { DEFAULT_LANGUAGE, LANGUAGES } from './i18n/i18n'
import { onRequest } from './middleware'

describe('src/middleware.ts', () => {
	it('calls next for omitted paths', async () => {
		const next = vi.fn(async () => new Response('ok', { status: 200 }))
		const context = {
			request: new Request('https://example.com/api/health'),
		} as any

		const res = await onRequest(context, next)
		expect(next).toHaveBeenCalled()
		expect(res).toBeInstanceOf(Response)
		const text = await res!!.text()
		expect(text).toBe('ok')
	})

	it('calls next when URL has a supported language prefix', async () => {
		const lang = LANGUAGES[0]
		const next = vi.fn(async () => new Response('lang', { status: 200 }))
		const context = {
			request: new Request(`https://example.com/${lang}/posts`),
		} as any

		const res = await onRequest(context, next)
		expect(next).toHaveBeenCalled()
		expect(res).toBeInstanceOf(Response)
		expect(await res!!.text()).toBe('lang')
	})

	it('redirects to default language when no lang provided', async () => {
		const next = vi.fn()
		const context = {
			request: new Request('https://example.com/some/page'),
		} as any

		const res = await onRequest(context, next)
		expect(next).not.toHaveBeenCalled()
		expect(res).toBeInstanceOf(Response)
		expect(res!!.status).toBe(302)
		const location = res!!.headers.get('location')
		expect(location).toBe(`https://example.com/${DEFAULT_LANGUAGE}/some/page`)
	})
})
