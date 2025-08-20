import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const post = defineCollection({
	loader: glob({ base: './src/posts', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			summary: z.string(),
			publishedAt: z.coerce.date(),
			image: image().optional(),
		}),
})

export const collections = { post }
