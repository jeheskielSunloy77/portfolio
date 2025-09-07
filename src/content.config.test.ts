import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

// Mock astro loaders and content APIs before importing the config.
vi.mock('astro/loaders', () => ({
	glob: (opts: any) => opts,
}))

vi.mock('astro:content', () => ({
	// return the same object so tests can inspect loader and schema
	defineCollection: (obj: any) => obj,
	z,
}))

// Import after mocks
import { collections, post } from './content.config'

describe('src/content.config.ts', () => {
	it('exports a post collection with the expected loader options', () => {
		expect(post).toBeDefined()
		// Our mock glob returns the passed options object
		expect((post as any).loader).toHaveProperty('base', './src/posts')
		expect((post as any).loader).toHaveProperty('pattern', '**/*.{md,mdx}')
		expect(collections).toHaveProperty('post')
	})

	it('produces a Zod schema that validates valid post frontmatter and rejects invalid', () => {
		// The schema in the real file is a function that receives an object with `image`.
		// Provide a fake image() helper returning a string schema for testing.
		const schema = (post as any).schema({ image: () => z.string() })

		const valid = {
			title: 'Hello',
			description: 'Desc',
			tags: ['a', 'b'],
			keywords: 'kw',
			publishedAt: new Date(),
			readTime: 3,
			lang: 'en',
		}

		// Should not throw for valid input
		expect(() => schema.parse(valid)).not.toThrow()

		const invalid = {
			// missing title, publishedAt wrong type, readTime too small
			description: 'Desc',
			tags: [],
			keywords: 'kw',
			publishedAt: 'not-a-date',
			readTime: 0,
			lang: 'en',
		}

		expect(() => schema.parse(invalid)).toThrow()
	})
})
