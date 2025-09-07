import { defineMiddleware } from 'astro:middleware'
import { DEFAULT_LANGUAGE, LANGUAGES, type Language } from './i18n/i18n'

const omitedPaths = [
	'/api',
	'/robots.txt',
	'/_',
	'/favicon.ico',
	'/sitemap.xml',
]

export const onRequest = defineMiddleware((context, next) => {
	const url = new URL(context.request.url)

	if (omitedPaths.some((path) => url.pathname.startsWith(path))) {
		return next()
	}

	if (LANGUAGES.includes(url.pathname.split('/')[1] as Language)) {
		return next()
	}

	return Response.redirect(
		`${url.origin}/${DEFAULT_LANGUAGE}${url.pathname}`,
		302
	)
})
