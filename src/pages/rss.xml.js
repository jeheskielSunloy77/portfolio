import { LANGUAGE_MAP } from '@/i18n/i18n';
import { FULL_NAME } from '@/lib/constants';
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const posts = await getCollection('post');

    return rss({
        title: `${FULL_NAME} - Blog`,
        description: 'Latest posts from my blog, covering web & mobile development, software achitecture, and tech insights.',
        site: context.site,
        items: posts.map((post) => {
            const [lang, slug] = post.id.split('/');

            return {
                title: post.data.title,
                pubDate: post.data.publishedAt,
                description: post.data.description,
                link: `/${lang}/blog/${slug}`,
                author: post.data.author || FULL_NAME,
                customData: `<language>${LANGUAGE_MAP[lang].locale}</language>`,
                categories: post.data.tags,
            }
        }),
    });
}