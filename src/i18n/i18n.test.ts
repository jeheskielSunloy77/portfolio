import { describe, expect, test } from 'vitest'
import {
	getLangPaths,
	getLocalizedPath,
	getNonDefaultLangPaths,
	getPathnameWithoutLang,
	LANGUAGE_MAP,
	LANGUAGES,
	NON_DEFAULT_LANGUAGES,
	stripLanguagePrefix,
} from './i18n'

describe('i18n helpers', () => {
	test('getLangPaths returns an entry for each configured language', () => {
		const paths = getLangPaths()
		expect(Array.isArray(paths)).toBe(true)
		const langs = paths.map((p) => p.params.lang)
		expect(langs).toEqual(LANGUAGES)
	})

	test('LANGUAGE_MAP contains expected entries and properties', () => {
		for (const lang of LANGUAGES) {
			const m = LANGUAGE_MAP[lang]
			expect(m).toBeDefined()
			expect(m).toHaveProperty('name')
			expect(m).toHaveProperty('locale')
			expect(m).toHaveProperty('emoji')
		}
	})

	describe('getPathnameWithoutLang', () => {
		test('removes language segment when present as first path segment', () => {
			expect(getPathnameWithoutLang('/en/blog/my-post', 'en')).toBe(
				'/blog/my-post'
			)
			expect(getPathnameWithoutLang('/id/projects', 'id')).toBe('/projects')
		})

		test('returns root ("/") when path is just the language', () => {
			expect(getPathnameWithoutLang('/en', 'en')).toBe('/')
			expect(getPathnameWithoutLang('/id', 'id')).toBe('/')
		})

		test('preserves path when language is not the first segment', () => {
			expect(getPathnameWithoutLang('/blog/en/my-post', 'en')).toBe(
				'/blog/en/my-post'
			)
			expect(getPathnameWithoutLang('/some/path', 'en')).toBe('/some/path')
		})

		test('edge case: trailing slash after language returns joined segments (documented behavior)', () => {
			// Note: behaviour for trailing slash is to return the joined segments (e.g. '/' for '/en/')
			expect(getPathnameWithoutLang('/en/', 'en')).toBe('/')
		})
	})

	test('getNonDefaultLangPaths returns entries only for non-default languages', () => {
		const paths = getNonDefaultLangPaths()
		expect(Array.isArray(paths)).toBe(true)
		const langs = paths.map((p) => p.params.lang)
		expect(langs).toEqual(NON_DEFAULT_LANGUAGES)
		expect(langs).not.toContain('en')
	})

	describe('stripLanguagePrefix', () => {
		test('strips known language prefixes', () => {
			expect(stripLanguagePrefix('/en')).toBe('/')
			expect(stripLanguagePrefix('/en/')).toBe('/')
			expect(stripLanguagePrefix('/en/blog')).toBe('/blog')
			expect(stripLanguagePrefix('/id/projects')).toBe('/projects')
			expect(stripLanguagePrefix('/projects')).toBe('/projects')
			expect(stripLanguagePrefix('/')).toBe('/')
		})
	})

	describe('getLocalizedPath', () => {
		test('formats path without prefix for default language (en)', () => {
			expect(getLocalizedPath('/', 'en')).toBe('/')
			expect(getLocalizedPath('/blog', 'en')).toBe('/blog')
			expect(getLocalizedPath('/blog/my-post', 'en')).toBe('/blog/my-post')
			expect(getLocalizedPath('/en/blog', 'en')).toBe('/blog')
			expect(getLocalizedPath('/id/blog', 'en')).toBe('/blog')
			expect(getLocalizedPath('/id', 'en')).toBe('/')
		})

		test('formats path with prefix for non-default language (id)', () => {
			expect(getLocalizedPath('/', 'id')).toBe('/id')
			expect(getLocalizedPath('/blog', 'id')).toBe('/id/blog')
			expect(getLocalizedPath('/blog/my-post', 'id')).toBe('/id/blog/my-post')
			expect(getLocalizedPath('/en/blog', 'id')).toBe('/id/blog')
			expect(getLocalizedPath('/id/blog', 'id')).toBe('/id/blog')
			expect(getLocalizedPath('/en', 'id')).toBe('/id')
		})
	})
})
