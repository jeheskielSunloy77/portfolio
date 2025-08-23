import type { InferEntrySchema } from 'astro:content'
import { Delete } from 'lucide-react'
import { useState } from 'react'
import { PostCard } from './post-card'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'

interface Props {
	posts: {
		id: string
		data: InferEntrySchema<'post'>
	}[]
}

export function SearchablePostList({ posts }: Props) {
	const [query, setQuery] = useState('')

	const filtered = posts.filter((post) =>
		post.data.title?.toLowerCase().includes(query.toLowerCase())
	)

	const resetFilter = () => setQuery('')

	return (
		<div className='flex flex-col gap-12'>
			<div className='flex items-center gap-3'>
				<Input
					type='text'
					placeholder='Search something...'
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>
				<Button
					size='sm'
					variant='secondary'
					onClick={resetFilter}
					disabled={query.length === 0}
				>
					Clear
					<Delete className='ml-2 size-4' />
				</Button>
			</div>

			<Card>
				<ul className='flex flex-col'>
					{filtered.map((post, i) => (
						<PostCard
							post={post}
							useSeparator={i !== 0 && i !== filtered.length - 1}
						/>
					))}
				</ul>
			</Card>
		</div>
	)
}
