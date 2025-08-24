import type { InferEntrySchema } from 'astro:content'
import { format } from 'date-fns'
import { Separator } from './ui/separator'

interface Props {
	post: InferEntrySchema<'post'> & { id: string }
	useSeparator?: boolean
}

export function PostCard({ post, useSeparator }: Props) {
	const publishedAt = format(post.publishedAt, 'MMM d, yyyy')

	const [lang, slug] = post.id.split('/')

	return (
		<li className='group'>
			{useSeparator && <Separator />}
			<a href={`/${lang}/blog/${slug}`}>
				<div className='flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center'>
					<div className='min-w-0 flex-1'>
						<h3 className='text-lg font-semibold group-hover:underline'>
							{post.title}
						</h3>
						<p className='mt-1 line-clamp-2 text-sm font-light text-muted-foreground'>
							{post.description}
						</p>
					</div>

					<p className='flex w-full justify-end text-sm font-light sm:mt-0 sm:w-auto'>
						<time dateTime={publishedAt}>{publishedAt}</time>
					</p>
				</div>
			</a>
		</li>
	)
}
