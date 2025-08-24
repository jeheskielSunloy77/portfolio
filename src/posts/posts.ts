import type { Language } from '@/i18n/i18n'
import { getCollection, type CollectionEntry } from 'astro:content'

export async function getPosts(params: {
	lang?: Language
	limit?: number
	filter?: (post: CollectionEntry<'post'>) => any
}) {
	const posts = await getCollection(
		'post',
		params.filter ?? ((post) => post.data.lang === params.lang)
	)

	const sorted = posts.sort(
		(a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
	)

	if (!params.limit) return sorted

	return sorted.slice(0, params.limit)
}
