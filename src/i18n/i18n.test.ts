import { describe, expect, test } from 'vitest'
import {
	getLangPaths,
	getPathnameWithoutLang,
	LANGUAGE_MAP,
	LANGUAGES,
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
})
