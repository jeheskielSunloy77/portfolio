import { FULL_NAME } from '@/lib/constants';
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const posts = await getCollection('post');

    return rss({
        title: `${FULL_NAME} - Blog`,
        description: 'Latest posts from my blog, covering web & mobile development, software achitecture, and tech insights.',
        site: context.site,
        items: posts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.publishedAt,
            description: post.data.description,
            link: `/blog/${post.id}/`,
            author: post.data.author || FULL_NAME,
        })),
        customData: `<language>en-us</language>`,
    });
}