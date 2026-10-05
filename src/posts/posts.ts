import { getLocalizedPath, LANGUAGES, type Language } from '@/i18n/i18n'
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
		LANGUAGES.map((lang) => [lang, getLocalizedPath('/blog', lang)])
	) as Record<Language, string>

	for (const post of posts) {
		const [lang, slug] = post.id.split('/') as [Language, string]
		paths[lang] = getLocalizedPath(`/blog/${slug}`, lang)
	}

	return paths
}

export async function getBlogPostsSummaryForAssistant(
	websiteUrl: string,
): Promise<string> {
	try {
		const posts = await getCollection('post')
		if (!posts || posts.length === 0) {
			return '## Blog Posts\n\nNo blog posts published yet.'
		}

		const grouped = new Map<
			string,
			{ title: string; summary: string; enUrl?: string; idUrl?: string }
		>()

		for (const post of posts) {
			const key = post.data.key || post.id
			const [lang, slug] = post.id.split('/')
			const entry = grouped.get(key) || {
				title: post.data.title,
				summary: post.data.description,
			}

			if (lang === 'en') {
				entry.enUrl = `${websiteUrl}/blog/${slug}`
				entry.title = post.data.title
				entry.summary = post.data.description
			} else if (lang === 'id') {
				entry.idUrl = `${websiteUrl}/id/blog/${slug}`
				if (!entry.enUrl) {
					entry.title = post.data.title
					entry.summary = post.data.description
				}
			}
			grouped.set(key, entry)
		}

		const body = Array.from(grouped.values())
			.map((post) => {
				const links = [
					post.enUrl ? `- English: ${post.enUrl}` : undefined,
					post.idUrl ? `- Indonesian: ${post.idUrl}` : undefined,
				]
					.filter(Boolean)
					.join('\n')

				return [`### ${post.title}`, `- Summary: ${post.summary}`, links]
					.filter(Boolean)
					.join('\n')
			})
			.join('\n\n')

		return `## Blog Posts\n\n${body}`
	} catch {
		return '## Blog Posts\n\nNone.'
	}
}
