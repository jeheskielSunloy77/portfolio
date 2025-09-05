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
import { dictionary } from '@/i18n/dictionary'
import type { Language } from '@/i18n/i18n'
import { useQueryClient } from '@tanstack/react-query'
import {
	AlertCircle,
	Circle,
	Eraser,
	MoreHorizontal,
	Redo2,
	RotateCcw,
	Undo2,
} from 'lucide-react'
import getStroke from 'perfect-freehand'
import React, { useEffect, useRef, useState } from 'react'
import { Checkbox } from './ui/checkbox'

interface Props {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	lang: Language
}

type Point = [number, number, number?] // x, y, pressure (optional)
type Stroke = {
	points: Point[] // raw input points
	color: string
	size: number
	isEraser?: boolean
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

async function svgStringToPngDataUrl(
	svgString: string,
	width: number,
	height: number
) {
	return await new Promise<string>((resolve, reject) => {
		const img = new Image()
		const svg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
			svgString
		)}`
		img.onload = () => {
			try {
				const canvas = document.createElement('canvas')
				canvas.width = width
				canvas.height = height
				const ctx = canvas.getContext('2d')
				if (!ctx) {
					reject(new Error('2D context not available'))
					return
				}
				// white (or transparent) background is fine — original used grey background
				ctx.drawImage(img, 0, 0, width, height)
				const dataUrl = canvas.toDataURL()
				resolve(dataUrl)
			} catch (e) {
				reject(e)
			}
		}
		img.onerror = (e) => reject(e)
		img.src = svg
	})
}

export function SketchDialog({ lang, isOpen, onOpenChange }: Props) {
	const t = dictionary[lang]

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
	const [isSaving, setIsSaving] = useState(false)
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

	const qc = useQueryClient()

	// For drawing in-progress points
	const currentPointsRef = useRef<Point[]>([])
	const pointerIdRef = useRef<number | null>(null)
	const maskIdRef = useRef(`eraser-mask-${Math.random().toString(36).slice(2)}`)
	const [sizePx, setSizePx] = useState<{ width: number; height: number }>({
		width: 512,
		height: 512,
	})

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
			// cleanup
			setStrokes([])
			setHistory([])
			setHistoryIndex(-1)
			currentPointsRef.current = []
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen])

	// Save snapshot of strokes to history
	const saveToHistory = (nextStrokes?: Stroke[]) => {
		const snap = (nextStrokes ?? strokes).map((s) => ({
			points: s.points.map((p) => [...p]) as Point[],
			color: s.color,
			size: s.size,
			isEraser: !!s.isEraser,
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
		currentPointsRef.current.push([x, y, pressure])
		// trigger re-render for live preview by updating a dummy state
		// but to keep things simple, we'll update strokes with a temporary preview stroke
		const previewStroke: Stroke = {
			points: currentPointsRef.current.slice(),
			color: isEraser ? BG_COLOR : color,
			size: brushSize,
			isEraser,
		}
		// replace last preview if present (we keep a temporary flag by making last stroke a preview if it has _preview property - avoid complexity: keep separate preview state)
		setPreview(previewStroke)
	}

	const onPointerUp = (e: React.PointerEvent) => {
		if (!isDrawing) return
		setIsDrawing(false)
		pointerIdRef.current = null
		// finalize stroke
		const rawPoints = currentPointsRef.current.slice()
		if (rawPoints.length >= 2) {
			const stroke: Stroke = {
				points: rawPoints,
				color: isEraser ? BG_COLOR : color,
				size: brushSize,
				isEraser,
			}
			const next = [...strokes, stroke]
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
			const strokePolygon = getStroke(s.points as number[][], {
				size: s.size,
				thinning: strokeOptions.thinning,
				smoothing: strokeOptions.smoothing,
				streamline: strokeOptions.streamline,
				simulatePressure: strokeOptions.simulatePressure,
				start: { taper: strokeOptions.startTaper },
				end: { taper: strokeOptions.endTaper },
			})
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
			const strokePolygon = getStroke(s.points as number[][], {
				size: s.size,
				thinning: strokeOptions.thinning,
				smoothing: strokeOptions.smoothing,
				streamline: strokeOptions.streamline,
				simulatePressure: strokeOptions.simulatePressure,
				start: { taper: strokeOptions.startTaper },
				end: { taper: strokeOptions.endTaper },
			})
			if (!strokePolygon || strokePolygon.length === 0) continue
			const pathD = pointsToSvgPath(strokePolygon)
			lines.push(`<path d="${pathD}"  stroke="none" />`)
		}
		lines.push(`</g>`)
		lines.push(`</svg>`)
		return lines.join('')
	}

	const saveSketch = async () => {
		if (isSaving) return
		setIsSaving(true)
		setError(null)

		// prepare svg/data first (this can fail before the network request)
		const width = sizePx.width
		const height = sizePx.height

		const payload = {
			name: newSketchName,
			message: newSketchMessage,
			svg: buildSvgString(width, height, strokes),
		}

		const queryKey = ['sketches']
		const previous = qc.getQueryData(queryKey)

		const optimisticSketch = {
			_id: `temp-${Date.now()}`,
			createdAt: new Date(),
			...payload,
		}

		// optimistic update: prepend to first page and bump total if present
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

		try {
			const res = await fetch('/api/sketches', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})

			if (res.status === 429) {
				const errorMessage = {
					title: t['Rate limit exceeded'],
					description:
						t[
							'You have made too many requests in a short period. Please wait and try again later.'
						],
				}
				console.error(errorMessage)
				// rollback
				qc.setQueryData(queryKey, previous)
				setError(errorMessage)
				setIsSaving(false)
				return
			}

			if (!res.ok) {
				let errorMessage: { title: string; description: string } = {
					title: t['Failed to save sketch'],
					description:
						t['An error occurred while saving your sketch. Please try again later.'],
				}
				try {
					const json = await res.json()
					if (json?.error) errorMessage.title = json.error
				} catch (_) {
					const text = await res.text().catch(() => null)
					if (text) errorMessage.description = text
				}
				// rollback
				qc.setQueryData(queryKey, previous)
				setError(errorMessage)
				setIsSaving(false)
				return
			}

			// server created sketch
			const created = await res.json()

			// replace the optimistic item (by tempId) with the real server response
			qc.setQueryData(queryKey, (old: any) => {
				if (!old) return old
				const newPages = old.pages.map((p: any, i: number) => {
					if (i !== 0) return p
					const data = (p.data ?? []).map((item: any) =>
						item._id === optimisticSketch._id ? created : item
					)
					return { ...p, data }
				})
				return { ...old, pages: newPages }
			})

			setNewSketchName('')
			setNewSketchMessage('')
			onOpenChange(false)
		} catch (e) {
			console.error('Error saving sketch', e)
			qc.setQueryData(queryKey, previous)
			setError({
				title: t['Failed to save sketch'],
				description: String(e),
			})
		} finally {
			setIsSaving(false)
		}
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
		const polygon = getStroke(s.points as number[][], {
			size: s.size,
			thinning: strokeOptions.thinning,
			smoothing: strokeOptions.smoothing,
			streamline: strokeOptions.streamline,
			simulatePressure: strokeOptions.simulatePressure,
			start: { taper: strokeOptions.startTaper },
			end: { taper: strokeOptions.endTaper },
		})
		if (!polygon || polygon.length === 0) return null
		const d = pointsToSvgPath(polygon)
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
													const polygon = getStroke(s.points as number[][], {
														size: s.size,
														thinning: strokeOptions.thinning,
														smoothing: strokeOptions.smoothing,
														streamline: strokeOptions.streamline,
														simulatePressure: strokeOptions.simulatePressure,
														start: { taper: strokeOptions.startTaper },
														end: { taper: strokeOptions.endTaper },
													})
													if (!polygon || polygon.length === 0) return null
													const d = pointsToSvgPath(polygon)
													return <path key={`mask-${i}`} d={d} fill='black' stroke='none' />
												})}
											{/* include preview eraser in mask */}
											{preview && preview.isEraser
												? (() => {
														const polygon = getStroke(preview.points as number[][], {
															size: preview.size,
															thinning: strokeOptions.thinning,
															smoothing: strokeOptions.smoothing,
															streamline: strokeOptions.streamline,
															simulatePressure: strokeOptions.simulatePressure,
															start: { taper: strokeOptions.startTaper },
															end: { taper: strokeOptions.endTaper },
														})
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
						<Button type='submit' className='px-6 shadow-sm' disabled={isSaving}>
							{isSaving ? t['saving...'] : t['save sketch']}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
