export type Language = 'en' | 'id'
export const LANGUAGES: Language[] = ['en', 'id']
export const DEFAULT_LANGUAGE: Language = 'en'

export const LANGUAGE_MAP = {
	en: {
		name: 'English',
		locale: 'en-US',
		emoji: '🇺🇸',
	},
	id: {
		name: 'Bahasa Indonesia',
		locale: 'id-ID',
		emoji: '🇮🇩',
	},
}

export const NON_DEFAULT_LANGUAGES: Language[] = LANGUAGES.filter(
	(lang) => lang !== DEFAULT_LANGUAGE
)

export function getLangPaths() {
	return LANGUAGES.map((lang) => ({ params: { lang } }))
}

export function getNonDefaultLangPaths() {
	return NON_DEFAULT_LANGUAGES.map((lang) => ({ params: { lang } }))
}

export function stripLanguagePrefix(pathname: string) {
	const segments = pathname.split('/')
	if (LANGUAGES.includes(segments[1] as Language)) {
		segments.splice(1, 1)
	}
	return segments.join('/') || '/'
}

export function getPathnameWithoutLang(pathname: string, lang?: Language) {
	const segments = pathname.split('/')
	if (
		lang ? segments[1] === lang : LANGUAGES.includes(segments[1] as Language)
	) {
		segments.splice(1, 1)
	}
	return segments.join('/') || '/'
}

export function getLocalizedPath(pathname: string, lang: Language): string {
	const clean = stripLanguagePrefix(pathname)
	const normalized = clean.startsWith('/') ? clean : `/${clean}`
	if (lang === DEFAULT_LANGUAGE) {
		return normalized
	}
	return normalized === '/' ? `/${lang}` : `/${lang}${normalized}`
}
