import { RESUME_URLS } from '@/site.config'
import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = ({ params, redirect }) => {
	const lang = (params.lang as keyof typeof RESUME_URLS) || 'en'
	const url = RESUME_URLS[lang] || RESUME_URLS.en

	return redirect(url, 302)
}
