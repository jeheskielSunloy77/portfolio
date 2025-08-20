import { format } from 'date-fns'
import { Separator } from './ui/separator'

interface Props {
	post: {
		data: {
			title: string
			summary?: string
			publishedAt: string | Date
		}
		id: string
	}
	useSeparator?: boolean
}

export function PostCard({ post, useSeparator }: Props) {
	const publishedAt =
		post.data.publishedAt instanceof Date
			? post.data.publishedAt
			: new Date(post.data.publishedAt)

	return (
		<li>
			{useSeparator && <Separator />}
			<a href={`/blog/${post.id}`}>
				<div className='flex flex-col justify-between p-6 sm:flex-row sm:items-center'>
					<div className='max-w-md md:max-w-lg'>
						<h3 className='text-lg font-semibold'>{post.data.title}</h3>
						<p className='mt-1 line-clamp-2 text-sm font-light text-muted-foreground'>
							{post.data.summary}
						</p>
					</div>

					<p className='mt-2 flex w-full justify-end text-sm font-light sm:mt-0 sm:w-auto'>
						<time dateTime={publishedAt.toISOString()}>
							{format(publishedAt, 'MMM d, yyyy')}
						</time>
					</p>
				</div>
			</a>
		</li>
	)
}
