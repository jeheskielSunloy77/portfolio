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

export function getLangPaths() {
	return LANGUAGES.map((lang) => ({ params: { lang } }))
}

export function getPathnameWithoutLang(pathname: string, lang: Language) {
	const segments = pathname.split('/')
	if (segments[1] === lang) {
		segments.splice(1, 1)
	}
	return segments.join('/') || '/'
}
