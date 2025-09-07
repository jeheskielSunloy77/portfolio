import { SketchDialog } from '@/components/sketch-dialog'
import type { APIResponsePaginated, Dictionary } from '@/lib/types'
import {
	QueryClient,
	QueryClientProvider,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from '@tanstack/react-query'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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

export function Sketch(props: { t: Dictionary }) {
	return (
		<QueryClientProvider client={queryClient}>
			<SketchContent t={props.t} />
		</QueryClientProvider>
	)
}

function SketchContent({ t }: { t: Dictionary }) {
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

	const [reachedBottom, setReachedBottom] = useState(false)

	const loadMoreRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const el = loadMoreRef.current
		if (!el) return
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					setReachedBottom(entry.isIntersecting)
					if (entry.isIntersecting && q.hasNextPage && !q.isFetchingNextPage) {
						q.fetchNextPage()
					}
				})
			},
			{ root: null, rootMargin: '200px' }
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [q.hasNextPage, q.isFetchingNextPage, q.fetchNextPage])

	const qc = useQueryClient()
	const queryKey = ['sketches'] as const

	type CreateSketchPayload = { name: string; message: string; svg: string }
	type CreatedSketch = {
		_id: string
		name: string
		message: string
		createdAt: string | Date
		svg: string
		ip?: string
	}

	const createSketchMutationFn = async (
		payload: CreateSketchPayload
	): Promise<CreatedSketch> => {
		const res = await fetch('/api/sketches', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})

		if (res.status === 429) {
			throw { type: 'rate', status: 429 }
		}

		if (!res.ok) {
			let json = null
			try {
				json = await res.json()
			} catch (_) {
				/* ignore */
			}
			throw {
				type: 'error',
				status: res.status,
				message: json?.error ?? 'Failed to save',
			}
		}

		return (await res.json()) as CreatedSketch
	}

	const createSketchMutation = useMutation<
		CreatedSketch,
		unknown,
		CreateSketchPayload,
		{ previous: any; optimisticSketch: any }
	>({
		mutationFn: createSketchMutationFn,
		onMutate: async (payload: CreateSketchPayload) => {
			await qc.cancelQueries({ queryKey })
			const previous = qc.getQueryData(queryKey)
			const optimisticSketch = {
				_id: `temp-${Date.now()}`,
				createdAt: new Date(),
				...payload,
			}

			qc.setQueryData(queryKey, (old: any) => {
				if (!old) {
					return {
						pages: [{ data: [optimisticSketch], total: 1 }],
						pageParams: [],
					}
				}
				const newPages = old.pages.map((p: any, i: number) => {
					if (i !== 0) return p
					return {
						...p,
						data: [optimisticSketch, ...(p.data ?? [])],
						total: typeof p.total === 'number' ? p.total + 1 : p.total,
					}
				})
				return { ...old, pages: newPages }
			})

			return { previous, optimisticSketch }
		},

		onError: (err: unknown, _variables: CreateSketchPayload, context: any) => {
			// rollback
			qc.setQueryData(queryKey, context?.previous)
		},

		onSuccess: (
			data: CreatedSketch,
			_variables: CreateSketchPayload,
			context: any
		) => {
			// replace optimistic item with server response
			qc.setQueryData(queryKey, (old: any) => {
				if (!old) return old
				const newPages = old.pages.map((p: any, i: number) => {
					if (i !== 0) return p
					const dataArr = (p.data ?? []).map((item: any) =>
						item._id === context?.optimisticSketch?._id ? data : item
					)
					return { ...p, data: dataArr }
				})
				return { ...old, pages: newPages }
			})

			// close the dialog (dialog clears its inputs when closed)
			setIsDialogOpen(false)
		},

		onSettled: () => {
			qc.invalidateQueries({ queryKey })
		},
	})

	return (
		<div>
			<div className='space-y-2'>
				<Header
					t={t}
					count={q.data?.pages[0].total}
					onAdd={() => setIsDialogOpen(true)}
					isSaving={createSketchMutation.status === 'pending'}
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

				<div className='flex flex-col items-center mt-4'>
					<div ref={loadMoreRef} className='h-2' />
					{!q.hasNextPage && !q.isPending && (
						<div className='text-sm text-muted-foreground mt-2'>
							such end. very empty. much art. wow. 🐶
						</div>
					)}
				</div>
			</div>

			<SketchDialog
				t={t}
				isOpen={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				createSketchMutation={createSketchMutation}
			/>
		</div>
	)
}

function SketchCard({ sketch }: { sketch: Sketch }) {
	return (
		<article className='rounded-lg border border-border p-2 flex flex-col gap-2'>
			<div
				dangerouslySetInnerHTML={{ __html: sketch.svg }}
				className='aspect-square bg-muted-foreground/25 dark:bg-secondary-foreground/75 rounded-lg overflow-hidden'
			></div>
			<div className='flex-1 flex-col flex justify-between gap-2'>
				<div>
					<p className='text-xs text-muted-foreground line-clamp-2'>{sketch.name}</p>
					<h3 className='font-medium text-foreground text-sm line-clamp-2'>
						{sketch.message}
					</h3>
				</div>
				<span className='text-xs text-muted-foreground'>
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
	t,
	isSaving,
}: {
	count: number | undefined
	onAdd: () => void
	t: Dictionary
	isSaving?: boolean
}) {
	return (
		<div className='flex items-center justify-between bg-muted/30 px-4 py-2 rounded-lg'>
			<div className='text-sm text-muted-foreground'>{`${count ?? '...'} ${
				t['sketches so far — vibe check']
			}  ✅🎨`}</div>
			<RainbowButton onClick={onAdd} disabled={isSaving}>
				<Plus />
				{isSaving ? t['saving...'] : t['leave your mark']}
			</RainbowButton>
		</div>
	)
}
