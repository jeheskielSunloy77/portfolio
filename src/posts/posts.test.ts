import { describe, expect, it, vi } from 'vitest'

// Mock `astro:content` before importing the module under test.
// The mock implements getCollection(collection, filter) and applies the filter
// function (if provided) to a static sample set so the module's logic can be tested.
vi.mock('astro:content', () => {
	const samplePosts = [
		{
			id: 'a',
			data: {
				lang: 'en',
				publishedAt: new Date('2023-01-01'),
			},
		},
		{
			id: 'b',
			data: {
				lang: 'en',
				publishedAt: new Date('2025-01-01'),
			},
		},
		{
			id: 'c',
			data: {
				lang: 'id',
				publishedAt: new Date('2022-06-01'),
			},
		},
		{
			id: 'd',
			data: {
				lang: 'en',
				publishedAt: new Date('2025-01-01'),
			},
		},
	]

	return {
		// getCollection should accept an optional filter function and return
		// the posts that satisfy it, mimicking the real behavior.
		getCollection: async (_collection: string, filter?: (p: any) => any) => {
			if (typeof filter === 'function') {
				return samplePosts.filter(filter)
			}
			return samplePosts
		},
	}
})

import { getPosts } from './posts'

describe('src/posts/posts.ts', () => {
	it('filters posts by language and sorts by publishedAt descending', async () => {
		const posts = await getPosts({ lang: 'en' })
		expect(posts).toBeInstanceOf(Array)
		// Should only include 'en' posts and be sorted with newest first
		expect(posts.every((p) => p.data.lang === 'en')).toBe(true)
		expect(posts[0].data.publishedAt.getTime()).toBeGreaterThanOrEqual(
			posts[1].data.publishedAt.getTime()
		)
	})

	it('respects the limit parameter', async () => {
		const posts = await getPosts({ lang: 'en', limit: 1 })
		expect(posts.length).toBe(1)
		// The single returned post should be the most recent one
		expect(posts[0].data.publishedAt.getTime()).toBeGreaterThan(
			new Date('2023-01-01').getTime()
		)
	})

	it('uses a custom filter when provided', async () => {
		// custom filter returns only posts with id 'a' or 'c'
		const custom = await getPosts({
			filter: (post) => ['a', 'c'].includes(post.id),
		})
		expect(custom.map((p) => p.id).sort()).toEqual(['a', 'c'])
	})

	it('when limit > length returns all matching posts', async () => {
		const posts = await getPosts({ lang: 'id', limit: 10 })
		expect(posts.length).toBeGreaterThan(0)
		// ensure they are the id-language posts only
		expect(posts.every((p) => p.data.lang === 'id')).toBe(true)
	})

	it('when no lang and no filter returns all posts sorted', async () => {
		const posts = await getPosts({})
		// the mock returns all posts when filter is absent.
		expect(posts.length).toBeGreaterThanOrEqual(4)
		// newest should be 2025-01-01
		const newest = posts[0].data.publishedAt.getTime()
		expect(newest).toBe(new Date('2025-01-01').getTime())
	})
})
