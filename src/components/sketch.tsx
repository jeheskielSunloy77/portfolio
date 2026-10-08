import { SketchDialog } from '@/components/sketch-dialog'
import { markSketchAdded } from '@/lib/exit-intent'
import { SKETCHES_PAGE_SIZE } from '@/lib/sketch-constants'
import { sketchImageSrc } from '@/lib/sketch-image-client'
import type { APIResponsePaginated, Dictionary, Sketch } from '@/lib/types'
import {
	QueryClient,
	QueryClientProvider,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
	type InfiniteData,
} from '@tanstack/react-query'
import { Eye, EyeOff, ImageOff, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { RainbowButton } from './magicui/rainbow-button'

function createSketchQueryClient() {
	return new QueryClient()
}

export function Sketch(props: {
	t: Dictionary
	initialData?: InfiniteData<APIResponsePaginated<Sketch>>
}) {
	const [queryClient] = useState(createSketchQueryClient)

	return (
		<QueryClientProvider client={queryClient}>
			<SketchContent t={props.t} initialData={props.initialData} />
		</QueryClientProvider>
	)
}

function SketchContent({
	t,
	initialData,
}: {
	t: Dictionary
	initialData?: InfiniteData<APIResponsePaginated<Sketch>>
}) {
	const q = useInfiniteQuery({
		queryKey: ['sketches'],
		initialPageParam: 0,
		initialData,
		queryFn: async ({ pageParam = 0 }) => {
			const pageNum = Number(pageParam ?? 0)
			const res = await fetch(
				`/api/sketches?page=${pageNum}&pageSize=${SKETCHES_PAGE_SIZE}`,
				{ cache: 'no-store' },
			)
			if (!res.ok) throw new Error('Failed to fetch sketches')
			return (await res.json()) as APIResponsePaginated<Sketch>
		},
		getNextPageParam: (lastPage) => lastPage.nextPage,
	})

	const sketches: Sketch[] = q.data?.pages.flatMap((p) => p.data) ?? []

	const [isDialogOpen, setIsDialogOpen] = useState(false)

	const loadMoreRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const el = loadMoreRef.current
		if (!el) return
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && q.hasNextPage && !q.isFetchingNextPage) {
						q.fetchNextPage()
					}
				})
			},
			{ root: null, rootMargin: '200px' },
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [q.hasNextPage, q.isFetchingNextPage, q.fetchNextPage])

	const qc = useQueryClient()
	const queryKey = ['sketches'] as const

	type CreateSketchPayload = {
		name: string
		message: string
		imageWebp: string
	}
	type CreatedSketch = {
		_id: string
		name: string
		message: string
		createdAt: string | Date
		ip?: string
	}

	const createSketchMutationFn = async (
		payload: CreateSketchPayload,
	): Promise<CreatedSketch> => {
		const res = await fetch('/api/sketches', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})

		if (res.status === 403) {
			let json = null
			try {
				json = await res.json()
			} catch (_) {
				/* ignore */
			}
			throw {
				type: 'cooldown',
				status: 403,
				cooldownUntil: json?.cooldownUntil,
				message: json?.error ?? 'Device in cooldown',
			}
		}

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

		onError: (_err: unknown, _variables: CreateSketchPayload, context: any) => {
			// rollback
			qc.setQueryData(queryKey, context?.previous)
		},

		onSuccess: (
			data: CreatedSketch,
			_variables: CreateSketchPayload,
			context: any,
		) => {
			markSketchAdded()

			// replace optimistic item with server response
			qc.setQueryData(queryKey, (old: any) => {
				if (!old) return old
				const newPages = old.pages.map((p: any, i: number) => {
					if (i !== 0) return p
					const dataArr = (p.data ?? []).map((item: any) =>
						item._id === context?.optimisticSketch?._id ? data : item,
					)
					return { ...p, data: dataArr }
				})
				return { ...old, pages: newPages }
			})

			// close the dialog (dialog clears its inputs when closed)
			setIsDialogOpen(false)
		},
	})

	return (
		<div>
			<div className='space-y-2'>
				<Header
					t={t}
					onAdd={() => setIsDialogOpen(true)}
					isSaving={createSketchMutation.status === 'pending'}
				/>
				{!q.isError ? (
					<>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{q.isLoading ? (
									Array.from({ length: SKETCHES_PAGE_SIZE }).map((_, i) => (
										<SketchSkeleton key={i} />
									))
								) : (
								<>
									{sketches.map((sketch) => (
										<SketchCard key={sketch._id} sketch={sketch} t={t} />
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
									{t['such end. very empty. much art. wow. 🐶']}
								</div>
							)}
						</div>
					</>
				) : (
					<div className='text-sm text-destructive'>
						{t['failed to load sketches. please try again later.']}
					</div>
				)}
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

function SketchCard({ sketch, t }: { sketch: Sketch; t: Dictionary }) {
	const [isRevealed, setIsRevealed] = useState(false)
	const [hasImageError, setHasImageError] = useState(false)
	const isSensitive = Boolean(sketch.isSensitive)

	return (
		<article className='rounded-lg border bg-background p-2'>
			<div className='relative aspect-square bg-muted-foreground/25 mb-2 dark:bg-secondary-foreground/75 rounded-lg overflow-hidden group'>
				{hasImageError ? (
					<div className='flex flex-col items-center justify-center h-full w-full text-muted-foreground/50 p-4 text-center select-none'>
						<ImageOff className='w-8 h-8 opacity-40' />
					</div>
				) : (
					<img
						src={sketchImageSrc(sketch)}
						alt={isSensitive && !isRevealed ? t['Sensitive content'] : sketch.message}
						loading='lazy'
						decoding='async'
						onError={() => setHasImageError(true)}
						className={`h-full w-full object-cover transition duration-200 ${
							isSensitive && !isRevealed ? 'filter blur-xl scale-105' : ''
						}`}
					/>
				)}

				{isSensitive && !isRevealed && (
					<div
						onClick={() => setIsRevealed(true)}
						className='absolute inset-0 z-10 flex flex-col items-center justify-center p-3 rounded-lg text-center bg-background/40 dark:bg-background/55 backdrop-blur-md transition-all duration-300 cursor-pointer select-none'
					>
						<button
							type='button'
							onClick={(e) => {
								e.stopPropagation()
								setIsRevealed(true)
							}}
							className='group/reveal inline-flex flex-col items-center gap-2 px-4 py-2.5 rounded-lg  backdrop-blur-xl border border-border/80 hover:border-foreground/20 text-foreground shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer'
							aria-label={t['Click to view']}
						>
							<div className='flex items-center justify-center w-7 h-7 rounded-full bg-muted text-muted-foreground group-hover/reveal:text-foreground group-hover/reveal:bg-muted transition-colors duration-200'>
								<EyeOff className='w-3.5 h-3.5 transition-transform duration-200 group-hover/reveal:scale-110' />
							</div>
							<div className='flex flex-col items-center gap-0.5'>
								<span className='text-xs font-medium text-foreground tracking-tight'>
									{t['Sensitive content']}
								</span>
								<span className='inline-flex items-center gap-1 text-[11px] text-muted-foreground font-normal'>
									<Eye className='w-3 h-3 opacity-70' />
									<span>{t['Click to view']}</span>
								</span>
							</div>
						</button>
					</div>
				)}
			</div>
			<div
				className={`transition duration-200 ${
					isSensitive && !isRevealed ? 'filter blur-xs select-none' : ''
				}`}
			>
				<p className='text-xs text-muted-foreground line-clamp-2'>{sketch.name}</p>
				<h3 className='font-medium text-foreground text-sm line-clamp-2'>
					{sketch.message}
				</h3>
			</div>
		</article>
	)
}

function SketchSkeleton() {
	return (
		<article className='rounded-lg border bg-background p-2 space-y-2 animate-pulse'>
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
	onAdd,
	t,
	isSaving,
}: {
	onAdd: () => void
	t: Dictionary
	isSaving?: boolean
}) {
	return (
		<div className='flex items-center justify-between border bg-background px-4 py-2 rounded-lg'>
			<div className='text-sm text-muted-foreground'>
				{t['canvas of chaos, gallery of giggles. 🎨😂']}
			</div>
			<RainbowButton onClick={onAdd} disabled={isSaving}>
				<Plus />
				{isSaving ? t['saving...'] : t['leave your mark']}
			</RainbowButton>
		</div>
	)
}
