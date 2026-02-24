import { LANGUAGES, type Language } from '@/i18n/i18n'
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

export async function getLocalizedBlogPaths(key: string) {
	const posts = await getCollection(
		'post',
		(post: CollectionEntry<'post'>) => post.data.key === key
	)

	const paths = Object.fromEntries(
		LANGUAGES.map((lang) => [lang, `/${lang}/blog`])
	) as Record<Language, string>

	for (const post of posts) {
		const [lang, slug] = post.id.split('/') as [Language, string]
		paths[lang] = `/${lang}/blog/${slug}`
	}

	return paths
}
