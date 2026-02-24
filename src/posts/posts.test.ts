import { describe, expect, it, vi } from 'vitest'

vi.mock('astro:content', () => {
	const samplePosts = [
		{
			id: 'en/how-i-keep-my-go-code-clean-without-going-crazy',
			data: {
				lang: 'en',
				key: 'go-clean-code',
				publishedAt: new Date('2023-01-01'),
			},
		},
		{
			id: 'en/redesigning-my-portfolio-making-space-for-what-matters',
			data: {
				lang: 'en',
				key: 'portfolio-redesign',
				publishedAt: new Date('2025-01-01'),
			},
		},
		{
			id: 'id/mendesain-ulang-portofolio-memberi-ruang-untuk-hal-yang-penting',
			data: {
				lang: 'id',
				key: 'portfolio-redesign',
				publishedAt: new Date('2024-06-01'),
			},
		},
		{
			id: 'id/kotlin-multiplatform-vs-react-native',
			data: {
				lang: 'id',
				key: 'kotlin-multiplatform-vs-react-native',
				publishedAt: new Date('2025-01-01'),
			},
		},
		{
			id: 'en/orphaned-english-post',
			data: {
				lang: 'en',
				key: 'orphaned-post',
				publishedAt: new Date('2025-02-01'),
			},
		},
	]

	return {
		getCollection: async (_collection: string, filter?: (p: any) => any) => {
			if (typeof filter === 'function') return samplePosts.filter(filter)
			return samplePosts
		},
	}
})

import { getLocalizedBlogPaths, getPosts } from './posts'

describe('src/posts/posts.ts', () => {
	it('filters posts by language and sorts by publishedAt descending', async () => {
		const posts = await getPosts({ lang: 'en' })
		expect(posts).toBeInstanceOf(Array)
		expect(posts.every((p) => p.data.lang === 'en')).toBe(true)
		expect(posts[0].data.publishedAt.getTime()).toBeGreaterThanOrEqual(
			posts[1].data.publishedAt.getTime()
		)
	})

	it('respects the limit parameter', async () => {
		const posts = await getPosts({ lang: 'en', limit: 1 })
		expect(posts.length).toBe(1)
		expect(posts[0].data.publishedAt.getTime()).toBe(new Date('2025-02-01').getTime())
	})

	it('uses a custom filter when provided', async () => {
		const custom = await getPosts({
			filter: (post) =>
				['en/how-i-keep-my-go-code-clean-without-going-crazy', 'id/kotlin-multiplatform-vs-react-native'].includes(post.id),
		})
		expect(custom.map((p) => p.id).sort()).toEqual([
			'en/how-i-keep-my-go-code-clean-without-going-crazy',
			'id/kotlin-multiplatform-vs-react-native',
		])
	})

	it('returns localized slugs for each language when translations exist', async () => {
		const paths = await getLocalizedBlogPaths('portfolio-redesign')

		expect(paths.en).toBe('/en/blog/redesigning-my-portfolio-making-space-for-what-matters')
		expect(paths.id).toBe(
			'/id/blog/mendesain-ulang-portofolio-memberi-ruang-untuk-hal-yang-penting'
		)
	})

	it('falls back to target language blog index when translation is missing', async () => {
		const paths = await getLocalizedBlogPaths('orphaned-post')

		expect(paths.en).toBe('/en/blog/orphaned-english-post')
		expect(paths.id).toBe('/id/blog')
	})
})
