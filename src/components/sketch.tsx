import { SketchDialog } from '@/components/sketch-modal'
import { Button } from '@/components/ui/button'
import type { APIResponsePaginated } from '@/lib/types'
import {
	QueryClient,
	QueryClientProvider,
	useInfiniteQuery,
} from '@tanstack/react-query'
import { format } from 'date-fns'
import { ChevronDown, Plus } from 'lucide-react'
import { useState } from 'react'

interface Sketch {
	id: string
	name: string
	message: string
	dataUrl: string
	createdAt: Date
}

const queryClient = new QueryClient()

export function Sketch() {
	return (
		<QueryClientProvider client={queryClient}>
			<SketchInner />
		</QueryClientProvider>
	)
}

function SketchInner() {
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
					count={q.data?.pages[0].total ?? 0}
					onAdd={() => setIsDialogOpen(true)}
				/>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{q.isLoading ? (
						Array.from({ length: 9 }).map((_, i) => <SketchSkeleton key={i} />)
					) : (
						<>
							{sketches.map((sketch) => (
								<SketchCard key={sketch.id} sketch={sketch} />
							))}
							{q.isFetchingNextPage &&
								Array.from({ length: 3 }).map((_, i) => <SketchSkeleton key={i} />)}
						</>
					)}
				</div>

				{q.hasNextPage && !q.isFetchingNextPage && (
					<div className='flex justify-center mt-4'>
						<Button onClick={() => q.fetchNextPage()} disabled={q.isFetchingNextPage}>
							Load More <ChevronDown />
						</Button>
					</div>
				)}
			</div>

			<SketchDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
		</div>
	)
}

function SketchCard({ sketch }: { sketch: Sketch }) {
	return (
		<article className='rounded-lg border border-border p-2 space-y-2'>
			<div className='aspect-square bg-muted-foreground/25 dark:bg-secondary-foreground/75 rounded-lg overflow-hidden'>
				<img src={sketch.dataUrl} alt={sketch.name} className='w-full h-full' />
			</div>
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

function Header({ count, onAdd }: { count: number; onAdd: () => void }) {
	return (
		<div className='flex items-center justify-between bg-muted/30 px-4 py-2 rounded-lg'>
			<div className='text-sm text-muted-foreground'>{`${count} ${
				count === 1 ? 'sketch' : 'sketches'
			} so far — vibe check ✅🎨`}</div>
			<Button
				size='sm'
				className='bg-primary hover:bg-primary/90 shadow-sm'
				onClick={onAdd}
			>
				<Plus className='w-4 h-4 mr-2' />
				Leave a Sketch
			</Button>
		</div>
	)
}
