import type { Language } from '@/i18n/i18n'
import { getCollection, type CollectionEntry } from 'astro:content'

export async function getPosts(params: {
	lang?: Language
	limit?: number
	filter?: (post: CollectionEntry<'post'>) => any
}) {
	const {
		lang,
		limit,
		filter = lang
			? (post: CollectionEntry<'post'>) => post.data.lang === lang
			: undefined,
	} = params

	const posts = await getCollection('post', filter)

	const sorted = posts.sort(
		(a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
	)

	if (!limit) return sorted

	return sorted.slice(0, limit)
}
