import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import type { Dictionary } from '@/lib/types'
import type { UseMutationResult } from '@tanstack/react-query'
import {
	AlertCircle,
	Circle,
	Eraser,
	MoreHorizontal,
	Redo2,
	RotateCcw,
	Undo2,
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Checkbox } from './ui/checkbox'

interface Props {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	createSketchMutation?: UseMutationResult<any, unknown, any, any>
	t: Dictionary
}

type Point = [number, number, number?] // x, y, pressure (optional)
type Stroke = {
	points: Point[] // raw input points
	color: string
	size: number
	isEraser?: boolean
	polygon?: number[][] // optional cached polygon (from perfect-freehand)
}

const BG_COLOR = '#c5c5c5'
const BG_OPACITY = 0.6

function pointsToSvgPath(stroke: number[][]) {
	if (!stroke || stroke.length === 0) return ''
	const d = stroke.reduce((acc, [x, y], i) => {
		const cmd = i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
		return acc + ' ' + cmd
	}, '')
	return d + ' Z'
}

export function SketchDialog({
	isOpen,
	onOpenChange,
	createSketchMutation,
	t,
}: Props) {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const svgRef = useRef<SVGSVGElement | null>(null)

	const [isDrawing, setIsDrawing] = useState(false)
	const [isEraser, setIsEraser] = useState(false)
	const [brushSize, setBrushSize] = useState(12)
	const [color, setColor] = useState('#000000')

	// advanced perfect-freehand options (global defaults)
	const [strokeOptions, setStrokeOptions] = useState({
		thinning: 0.5,
		smoothing: 0.5,
		streamline: 0.5,
		simulatePressure: true,
		startTaper: 0,
		endTaper: 0,
	})

	// strokes = list of drawn strokes
	const [strokes, setStrokes] = useState<Stroke[]>([])

	// history stores snapshots (deep copies) of strokes
	const [history, setHistory] = useState<Stroke[][]>([])
	const [historyIndex, setHistoryIndex] = useState(-1)

	const [newSketchName, setNewSketchName] = useState('')
	const [newSketchMessage, setNewSketchMessage] = useState('')
	const [error, setError] = useState<{
		title: string
		description: string
	} | null>(null)

	const presetColors = [
		'#000000',
		'#FFFFFF',
		'#EF4444',
		'#3B82F6',
		'#22C55E',
		'#EAB308',
		'#FB923C',
		'#A855F7',
	]

	/* Mutation is provided by parent via props (createSketchMutation) */

	// For drawing in-progress points
	const currentPointsRef = useRef<Point[]>([])
	const pointerIdRef = useRef<number | null>(null)
	const maskIdRef = useRef(`eraser-mask-${Math.random().toString(36).slice(2)}`)
	const [sizePx, setSizePx] = useState<{ width: number; height: number }>({
		width: 512,
		height: 512,
	})

	// lightweight sampling refs to reduce pointermove churn
	const lastPointRef = useRef<{ x: number; y: number; t: number } | null>(null)
	const lastSampleTimeRef = useRef<number>(0)
	const MIN_DIST = 2 // pixels
	const MIN_TIME = 16 // ms (~60fps)

	// dynamic import reference for perfect-freehand
	const getStrokeRef = useRef<
		null | ((points: number[][], options?: any) => number[][])
	>(null)

	useEffect(() => {
		if (isOpen) {
			// when opening, initialize strokes and history with empty background snapshot
			setStrokes([])
			const initial: Stroke[][] = [[]]
			setHistory(initial)
			setHistoryIndex(0)
			// set initial SVG container size
			const container = containerRef.current
			if (container) {
				const rect = container.getBoundingClientRect()
				const width = Math.max(256, Math.floor(rect.width))
				const height = Math.max(256, Math.floor(rect.height))
				setSizePx({ width, height })
			}
		} else {
			setStrokes([])
			setHistory([])
			setHistoryIndex(-1)
			currentPointsRef.current = []
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen])

	// lazy-load perfect-freehand when component mounts
	useEffect(() => {
		let mounted = true
		import('perfect-freehand')
			.then((mod) => {
				if (!mounted) return
				// support both default and named export
				// @ts-ignore
				getStrokeRef.current = mod.default ?? mod.getStroke ?? Object.values(mod)[0]
				// once loaded, compute polygons for any existing strokes that lack them
				setStrokes((prev) =>
					prev.map((s) => {
						if (s.polygon || !s.points || s.points.length === 0) return s
						try {
							const poly = getStrokeRef.current!(s.points as number[][], {
								size: s.size,
								thinning: strokeOptions.thinning,
								smoothing: strokeOptions.smoothing,
								streamline: strokeOptions.streamline,
								simulatePressure: strokeOptions.simulatePressure,
								start: { taper: strokeOptions.startTaper },
								end: { taper: strokeOptions.endTaper },
							})
							return { ...s, polygon: poly }
						} catch {
							return s
						}
					})
				)
			})
			.catch((e) => console.warn('failed to load perfect-freehand', e))
		return () => {
			mounted = false
		}
	}, [])

	// Save snapshot of strokes to history
	const saveToHistory = (nextStrokes?: Stroke[]) => {
		const snap = (nextStrokes ?? strokes).map((s) => ({
			points: s.points.map((p) => [...p]) as Point[],
			color: s.color,
			size: s.size,
			isEraser: !!s.isEraser,
			polygon: s.polygon ? s.polygon.map((p) => [...p]) : undefined,
		}))
		const newHistory = history.slice(0, historyIndex + 1)
		newHistory.push(snap)
		setHistory(newHistory)
		setHistoryIndex(newHistory.length - 1)
	}

	const undo = () => {
		if (historyIndex > 0) {
			const newIndex = historyIndex - 1
			const snap = history[newIndex]
			setStrokes(snap.map((s) => ({ ...s, points: s.points.map((p) => [...p]) })))
			setHistoryIndex(newIndex)
		}
	}

	const redo = () => {
		if (historyIndex < history.length - 1) {
			const newIndex = historyIndex + 1
			const snap = history[newIndex]
			setStrokes(snap.map((s) => ({ ...s, points: s.points.map((p) => [...p]) })))
			setHistoryIndex(newIndex)
		}
	}

	const clearCanvas = () => {
		setStrokes([])
		saveToHistory([])
	}

	// pointer events handlers
	const onPointerDown = (e: React.PointerEvent) => {
		const svg = svgRef.current
		const container = containerRef.current
		if (!svg || !container) return
		// only left button
		if ((e as any).button && (e as any).button !== 0) return
		;(e.target as Element).setPointerCapture(e.pointerId)
		pointerIdRef.current = e.pointerId
		setIsDrawing(true)
		currentPointsRef.current = []

		const rect = svg.getBoundingClientRect()
		const scaleX = sizePx.width / rect.width
		const scaleY = sizePx.height / rect.height
		const x = (e.clientX - rect.left) * scaleX
		const y = (e.clientY - rect.top) * scaleY
		const pressure = (e as React.PointerEvent).pressure ?? 0.5
		currentPointsRef.current.push([x, y, pressure])
		e.preventDefault()
	}

	const onPointerMove = (e: React.PointerEvent) => {
		if (!isDrawing) return
		const svg = svgRef.current
		if (!svg) return
		const rect = svg.getBoundingClientRect()
		const scaleX = sizePx.width / rect.width
		const scaleY = sizePx.height / rect.height
		const x = (e.clientX - rect.left) * scaleX
		const y = (e.clientY - rect.top) * scaleY
		const pressure = (e as React.PointerEvent).pressure ?? 0.5

		// sampling: only add a point if moved enough distance or enough time passed
		const now = performance.now()
		const last = lastPointRef.current
		if (last) {
			const dx = x - last.x
			const dy = y - last.y
			const dist2 = dx * dx + dy * dy
			if (
				dist2 < MIN_DIST * MIN_DIST &&
				now - lastSampleTimeRef.current < MIN_TIME
			) {
				return
			}
		}
		lastPointRef.current = { x, y, t: now }
		lastSampleTimeRef.current = now

		currentPointsRef.current.push([x, y, pressure])

		// create a lightweight preview stroke (with polygon if getStroke is available)
		// prefer reusing cached polygon computation if available
		const previewPoints = currentPointsRef.current.slice()
		const previewStroke: Stroke = {
			points: previewPoints,
			color: isEraser ? BG_COLOR : color,
			size: brushSize,
			isEraser,
		}

		if (getStrokeRef.current) {
			try {
				// compute polygon but keep preview lightweight — don't block or heavy-handle errors
				const poly = getStrokeRef.current(previewPoints as number[][], {
					size: brushSize,
					thinning: strokeOptions.thinning,
					smoothing: strokeOptions.smoothing,
					streamline: strokeOptions.streamline,
					simulatePressure: strokeOptions.simulatePressure,
					start: { taper: strokeOptions.startTaper },
					end: { taper: strokeOptions.endTaper },
				})
				previewStroke.polygon = poly
			} catch {
				// fall back to no polygon on preview
			}
		}

		// update preview by using state; keep lightweight
		setPreview(previewStroke)
	}

	const onPointerUp = (e: React.PointerEvent) => {
		if (!isDrawing) return
		setIsDrawing(false)
		const svg = svgRef.current
		if (!svg) {
			pointerIdRef.current = null
			currentPointsRef.current = []
			return
		}
		try {
			;(e.target as Element).releasePointerCapture?.(e.pointerId)
		} catch {
			// ignore
		}
		pointerIdRef.current = null
		// finalize stroke
		const rawPoints = currentPointsRef.current.slice()
		if (rawPoints.length >= 2) {
			const baseStroke: Stroke = {
				points: rawPoints,
				color: isEraser ? BG_COLOR : color,
				size: brushSize,
				isEraser,
			}

			// compute polygon immediately if possible and attach to stroke to avoid recompute
			if (getStrokeRef.current) {
				try {
					const poly = getStrokeRef.current(rawPoints as number[][], {
						size: brushSize,
						thinning: strokeOptions.thinning,
						smoothing: strokeOptions.smoothing,
						streamline: strokeOptions.streamline,
						simulatePressure: strokeOptions.simulatePressure,
						start: { taper: strokeOptions.startTaper },
						end: { taper: strokeOptions.endTaper },
					})
					baseStroke.polygon = poly
				} catch {
					/* ignore */
				}
			}

			const next = [...strokes, baseStroke]
			setStrokes(next)
			setPreview(null)
			saveToHistory(next)
		} else {
			setPreview(null)
		}
		currentPointsRef.current = []
	}

	// preview stroke while drawing
	const [preview, setPreview] = useState<Stroke | null>(null)

	// build SVG content string for saving
	const buildSvgString = (
		width: number,
		height: number,
		strokesToRender: Stroke[]
	) => {
		const lines: string[] = []
		lines.push(
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">`
		)
		// background rectangle (mimic original canvas fill)
		lines.push(`<rect width="100%" height="100%"  fill-opacity="0"/>`)

		// use a mask so eraser strokes actually cut out pixels
		const maskId =
			maskIdRef.current || `eraser-mask-${Math.random().toString(36).slice(2)}`
		lines.push(`<defs>`)
		lines.push(`<mask id="${maskId}">`)
		// white = show, black = hide (eraser)
		lines.push(`<rect width="100%" height="100%" fill="white"/>`)
		for (const s of strokesToRender) {
			if (!s.isEraser) continue
			if (!s.points || s.points.length === 0) continue
			// prefer cached polygon if available
			let strokePolygon = s.polygon
			if (!strokePolygon && getStrokeRef.current) {
				try {
					strokePolygon = getStrokeRef.current(s.points as number[][], {
						size: s.size,
						thinning: strokeOptions.thinning,
						smoothing: strokeOptions.smoothing,
						streamline: strokeOptions.streamline,
						simulatePressure: strokeOptions.simulatePressure,
						start: { taper: strokeOptions.startTaper },
						end: { taper: strokeOptions.endTaper },
					})
				} catch {
					strokePolygon = undefined
				}
			}
			if (!strokePolygon || strokePolygon.length === 0) continue
			const pathD = pointsToSvgPath(strokePolygon)
			lines.push(`<path d="${pathD}" fill="black" stroke="none" />`)
		}
		lines.push(`</mask>`)
		lines.push(`</defs>`)

		// render normal strokes inside group with mask applied so eraser areas are transparent
		lines.push(`<g mask="url(#${maskId})">`)
		for (const s of strokesToRender) {
			if (!s.points || s.points.length === 0) continue
			if (s.isEraser) continue
			let strokePolygon = s.polygon
			if (!strokePolygon && getStrokeRef.current) {
				try {
					strokePolygon = getStrokeRef.current(s.points as number[][], {
						size: s.size,
						thinning: strokeOptions.thinning,
						smoothing: strokeOptions.smoothing,
						streamline: strokeOptions.streamline,
						simulatePressure: strokeOptions.simulatePressure,
						start: { taper: strokeOptions.startTaper },
						end: { taper: strokeOptions.endTaper },
					})
				} catch {
					strokePolygon = undefined
				}
			}
			if (!strokePolygon || strokePolygon.length === 0) continue
			const pathD = pointsToSvgPath(strokePolygon)
			lines.push(`<path d="${pathD}"  stroke="none" />`)
		}
		lines.push(`</g>`)
		lines.push(`</svg>`)
		return lines.join('')
	}

	const saveSketch = () => {
		if (createSketchMutation?.status === 'pending') return
		setError(null)
		handleClose(false)

		// build payload (can throw if svg build fails)
		const width = sizePx.width
		const height = sizePx.height
		const payload = {
			name: newSketchName,
			message: newSketchMessage,
			svg: buildSvgString(width, height, strokes),
		}

		createSketchMutation?.mutate(payload)
	}

	const handleClose = (open: boolean) => {
		onOpenChange(open)
		if (!open) {
			setNewSketchName('')
			setNewSketchMessage('')
			setHistory([])
			setHistoryIndex(-1)
			setStrokes([])
			setPreview(null)
		}
	}

	// update size when container resizes
	useEffect(() => {
		const container = containerRef.current
		if (!container) return
		const ro = new ResizeObserver(() => {
			const rect = container.getBoundingClientRect()
			const width = Math.max(256, Math.floor(rect.width))
			const height = Math.max(256, Math.floor(rect.height))
			setSizePx({ width, height })
		})
		ro.observe(container)
		return () => ro.disconnect()
	}, [])

	// Rendered strokes as SVG elements
	const renderStrokeElement = (s: Stroke, idx: number) => {
		if (!s.points || s.points.length === 0) return null
		const polygon = s.polygon
		const effectivePolygon = polygon && polygon.length > 0 ? polygon : undefined
		if (!effectivePolygon) return null
		const d = pointsToSvgPath(effectivePolygon)
		// eraser strokes are handled via an SVG mask; skip rendering them here
		if (s.isEraser) {
			return null
		}
		return <path key={idx} d={d} fill={s.color} stroke='none' />
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent
				className='overflow-hidden p-2 sm:max-w-xl'
				showCloseButton={false}
			>
				<form
					onSubmit={(e) => {
						e.preventDefault()
						void saveSketch()
					}}
				>
					<div>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-1'>
								<div className='flex items-center gap-1'>
									{presetColors.map((presetColor) => (
										<Button
											size='iconSm'
											variant={presetColor === color ? 'secondary' : 'ghost'}
											key={presetColor}
											onClick={() => setColor(presetColor)}
										>
											<div
												style={{ backgroundColor: presetColor }}
												className='size-5 rounded-full border cursor-pointer transition-all'
											/>
										</Button>
									))}
									<input
										type='color'
										value={color}
										onChange={(e) => setColor(e.target.value)}
										className='w-6 h-6 rounded border border-border cursor-pointer'
									/>
								</div>

								<div className='h-4 w-px bg-border mx-1' />

								<Button
									variant='ghost'
									size='iconSm'
									onClick={undo}
									disabled={historyIndex <= 0}
								>
									<Undo2 className='w-4 h-4' />
								</Button>
								<Button
									variant='ghost'
									size='iconSm'
									onClick={redo}
									disabled={historyIndex >= history.length - 1}
								>
									<Redo2 className='w-4 h-4' />
								</Button>
								<Button variant='ghost' size='iconSm' onClick={clearCanvas}>
									<RotateCcw className='w-4 h-4' />
								</Button>
							</div>

							<div className='flex items-center gap-1'>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button size='iconSm' variant='ghost'>
											<Circle className='w-4 h-4' />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent sideOffset={8} className='w-44 p-3'>
										<div className='flex items-center gap-2'>
											<Slider
												min={1}
												max={60}
												value={[brushSize]}
												onValueChange={(value) => setBrushSize(value[0])}
												className='w-full'
											/>
											<span className='text-sm w-8 text-center'>{brushSize}px</span>
										</div>
									</DropdownMenuContent>
								</DropdownMenu>
								<Button
									variant={isEraser ? 'default' : 'ghost'}
									size='iconSm'
									onClick={() => setIsEraser(!isEraser)}
								>
									<Eraser className='w-4 h-4' />
								</Button>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button size='iconSm' variant='ghost'>
											<MoreHorizontal className='w-4 h-4' />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent sideOffset={8} className='w-64 p-3'>
										<div className='space-y-2 text-sm'>
											<label className='flex items-center justify-between gap-2'>
												<span className='whitespace-nowrap'>Thinning</span>
												<Slider
													min={-1}
													max={1}
													step={0.01}
													value={[strokeOptions.thinning]}
													onValueChange={(value) =>
														setStrokeOptions((p) => ({
															...p,
															thinning: value[0],
														}))
													}
													className='w-40'
												/>
												<span className='w-12 text-right'>{strokeOptions.thinning}</span>
											</label>

											<label className='flex items-center justify-between gap-2'>
												<span className='whitespace-nowrap'>Smoothing</span>
												<Slider
													min={0}
													max={1}
													step={0.01}
													value={[strokeOptions.smoothing]}
													onValueChange={(value) =>
														setStrokeOptions((p) => ({
															...p,
															smoothing: value[0],
														}))
													}
													className='w-40'
												/>
												<span className='w-12 text-right'>{strokeOptions.smoothing}</span>
											</label>

											<label className='flex items-center justify-between gap-2'>
												<span className='whitespace-nowrap'>Streamline</span>
												<Slider
													min={0}
													max={1}
													step={0.01}
													value={[strokeOptions.streamline]}
													onValueChange={(value) =>
														setStrokeOptions((p) => ({
															...p,
															streamline: value[0],
														}))
													}
													className='w-40'
												/>
												<span className='w-12 text-right'>{strokeOptions.streamline}</span>
											</label>

											<label className='flex items-center justify-between'>
												<span>Simulate Pressure</span>
												<Checkbox
													checked={!!strokeOptions.simulatePressure}
													onCheckedChange={(checked) =>
														setStrokeOptions((p) => ({
															...p,
															simulatePressure: !!checked,
														}))
													}
													className='ml-2'
												/>
											</label>

											<label className='flex items-center justify-between gap-2'>
												<span className='whitespace-nowrap'>Start Taper</span>
												<Slider
													min={0}
													max={50}
													step={1}
													value={[strokeOptions.startTaper]}
													onValueChange={(value) =>
														setStrokeOptions((p) => ({
															...p,
															startTaper: value[0],
														}))
													}
													className='w-40'
												/>
												<span className='w-12 text-right'>{strokeOptions.startTaper}</span>
											</label>

											<label className='flex items-center justify-between gap-2'>
												<span className='whitespace-nowrap'>End Taper</span>
												<Slider
													min={0}
													max={50}
													step={1}
													value={[strokeOptions.endTaper]}
													onValueChange={(value) =>
														setStrokeOptions((p) => ({
															...p,
															endTaper: value[0],
														}))
													}
													className='w-40'
												/>
												<span className='w-12 text-right'>{strokeOptions.endTaper}</span>
											</label>
										</div>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>

						<div
							ref={containerRef}
							className='flex-1 flex justify-center items-center rounded-lg mt-1 mb-4'
							style={{ minHeight: 256 }}
						>
							<div
								className='rounded-lg shadow-sm cursor-crosshair bg-[#c5c5c5] w-full aspect-square overflow-hidden'
								style={{ touchAction: 'none' }}
								onPointerDown={onPointerDown}
								onPointerMove={onPointerMove}
								onPointerUp={onPointerUp}
								onPointerCancel={onPointerUp}
							>
								<svg
									ref={svgRef}
									width='100%'
									height='100%'
									viewBox={`0 0 ${sizePx.width} ${sizePx.height}`}
									xmlns='http://www.w3.org/2000/svg'
									style={{ display: 'block' }}
								>
									<rect
										width='100%'
										height='100%'
										fill={BG_COLOR}
										fillOpacity={BG_OPACITY}
									/>

									{/* build mask from eraser strokes so they actually cut out pixels */}
									<defs>
										<mask id={maskIdRef.current}>
											{/* white = show, black = hide */}
											<rect width='100%' height='100%' fill='white' />
											{strokes
												.filter((s) => s.isEraser)
												.map((s, i) => {
													const polygon = s.polygon
													if (!polygon || polygon.length === 0) return null
													const d = pointsToSvgPath(polygon)
													return <path key={`mask-${i}`} d={d} fill='black' stroke='none' />
												})}
											{/* include preview eraser in mask */}
											{preview && preview.isEraser
												? (() => {
														const polygon = preview.polygon
														if (!polygon || polygon.length === 0) return null
														const d = pointsToSvgPath(polygon)
														return (
															<path key='mask-preview' d={d} fill='black' stroke='none' />
														)
												  })()
												: null}
										</mask>
									</defs>

									{/* render normal strokes inside masked group */}
									<g mask={`url(#${maskIdRef.current})`}>
										{strokes
											.filter((s) => !s.isEraser)
											.map((s, i) => renderStrokeElement(s, i))}
										{/* render preview if it's a normal stroke */}
										{preview && !preview.isEraser
											? renderStrokeElement(preview, -1)
											: null}
									</g>
								</svg>
							</div>
						</div>

						<div className='space-y-2'>
							<Input
								id='sketch-name'
								required
								placeholder={t['enter your name']}
								value={newSketchName}
								onChange={(e) => setNewSketchName(e.target.value)}
								className='focus:ring-2 focus:ring-primary/20'
							/>
							<Textarea
								id='sketch-message'
								required
								placeholder={t['leave a message or description...']}
								value={newSketchMessage}
								onChange={(e) => setNewSketchMessage(e.target.value)}
								rows={2}
								className='focus:ring-2 focus:ring-primary/20 resize-none'
							/>
							{error && (
								<Alert variant='destructive'>
									<AlertCircle />
									<AlertTitle>{error.title}</AlertTitle>
									<AlertDescription>{error.description}</AlertDescription>
								</Alert>
							)}
						</div>
					</div>
					<DialogFooter className='mt-4'>
						<Button
							type='button'
							variant='outline'
							onClick={() => handleClose(false)}
							className='px-6'
						>
							{t['cancel']}
						</Button>
						<Button
							type='submit'
							className='px-6 shadow-sm'
							disabled={createSketchMutation?.status === 'pending'}
						>
							{createSketchMutation?.status === 'pending'
								? t['saving...']
								: t['save sketch']}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
