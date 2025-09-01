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
	placeholder: string
}

export function SearchablePostList({ posts, placeholder }: Props) {
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
					placeholder={placeholder}
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

			<Card className='py-4'>
				<ul className='flex flex-col'>
					{filtered.map((post, i) => (
						<PostCard
							key={i}
							post={{ ...post.data, id: post.id }}
							useSeparator={i !== 0}
						/>
					))}
				</ul>
			</Card>
		</div>
	)
}
