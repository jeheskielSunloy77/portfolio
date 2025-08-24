export type Language = 'en' | 'id'
export const LANGUAGES: Language[] = ['en', 'id']
export const DEFAULT_LANGUAGE: Language = 'en'

export function getLangPaths() {
	return LANGUAGES.map((lang) => ({ params: { lang } }))
}
