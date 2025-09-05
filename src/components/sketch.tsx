import { SketchDialog } from '@/components/sketch-dialog'
import { Button } from '@/components/ui/button'
import { dictionary } from '@/i18n/dictionary'
import type { Language } from '@/i18n/i18n'
import type { APIResponsePaginated } from '@/lib/types'
import {
	QueryClient,
	QueryClientProvider,
	useInfiniteQuery,
} from '@tanstack/react-query'
import { format } from 'date-fns'
import { ChevronDown, Plus } from 'lucide-react'
import { useState } from 'react'
import { RainbowButton } from './magicui/rainbow-button'

interface Sketch {
	_id: string
	name: string
	message: string
	createdAt: Date
	svg: string
	ip: string
}

const queryClient = new QueryClient()

export function Sketch(props: { lang: Language }) {
	return (
		<QueryClientProvider client={queryClient}>
			<SketchContent lang={props.lang} />
		</QueryClientProvider>
	)
}

function SketchContent({ lang }: { lang: Language }) {
	const t = dictionary[lang]

	const q = useInfiniteQuery({
		queryKey: ['sketches'],
		initialPageParam: 0,
		queryFn: async ({ pageParam = 0 }) => {
			const pageNum = Number(pageParam ?? 0)
			const res = await fetch(`/api/sketches?page=${pageNum}&pageSize=9`)
			if (!res.ok) throw new Error('Failed to fetch sketches')
			return (await res.json()) as APIResponsePaginated<Sketch>
		},
		getNextPageParam: (lastPage) => lastPage.nextPage,
	})

	const sketches: Sketch[] = q.data?.pages.flatMap((p) => p.data) ?? []

	const [isDialogOpen, setIsDialogOpen] = useState(false)

	return (
		<div>
			<div className='space-y-2'>
				<Header
					lang={lang}
					count={q.data?.pages[0].total}
					onAdd={() => setIsDialogOpen(true)}
				/>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{q.isLoading ? (
						Array.from({ length: 9 }).map((_, i) => <SketchSkeleton key={i} />)
					) : (
						<>
							{sketches.map((sketch) => (
								<SketchCard key={sketch._id} sketch={sketch} />
							))}
							{q.isFetchingNextPage &&
								Array.from({ length: 3 }).map((_, i) => <SketchSkeleton key={i} />)}
						</>
					)}
				</div>

				{q.hasNextPage && !q.isFetchingNextPage && (
					<div className='flex justify-center mt-4'>
						<Button onClick={() => q.fetchNextPage()} disabled={q.isFetchingNextPage}>
							{t['load more']}
							<ChevronDown />
						</Button>
					</div>
				)}
			</div>

			<SketchDialog
				lang={lang}
				isOpen={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			/>
		</div>
	)
}

function SketchCard({ sketch }: { sketch: Sketch }) {
	return (
		<article className='rounded-lg border border-border p-2 space-y-2'>
			<div
				dangerouslySetInnerHTML={{ __html: sketch.svg }}
				className='aspect-square bg-muted-foreground/25 dark:bg-secondary-foreground/75 rounded-lg overflow-hidden'
			></div>
			<div>
				<p className='text-xs text-muted-foreground line-clamp-2'>{sketch.name}</p>
				<h3 className='font-medium text-foreground truncate text-sm'>
					{sketch.message}
				</h3>
				<span className='text-xs text-muted-foreground mt-2'>
					{format(sketch.createdAt, 'dd MMM yyyy')}
				</span>
			</div>
		</article>
	)
}

function SketchSkeleton() {
	return (
		<article className='rounded-lg border border-border p-2 space-y-2 animate-pulse'>
			<div className='aspect-square bg-muted-foreground/10 dark:bg-secondary-foreground/20 rounded-lg overflow-hidden' />
			<div>
				<div className='h-3 bg-muted rounded w-3/4 mb-2' />
				<div className='h-4 bg-muted rounded w-full mb-1' />
				<div className='h-3 bg-muted rounded w-1/2 mt-2' />
			</div>
		</article>
	)
}

function Header({
	count,
	onAdd,
	lang,
}: {
	count: number | undefined
	onAdd: () => void
	lang: Language
}) {
	const t = dictionary[lang]
	return (
		<div className='flex items-center justify-between bg-muted/30 px-4 py-2 rounded-lg'>
			<div className='text-sm text-muted-foreground'>{`${count ?? '...'} ${
				t['sketches so far — vibe check']
			}  ✅🎨`}</div>
			<RainbowButton onClick={onAdd}>
				<Plus />
				{t['leave your mark']}
			</RainbowButton>
		</div>
	)
}
