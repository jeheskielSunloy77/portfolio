import type React from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { Circle, Eraser, Plus, Redo2, RotateCcw, Undo2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Sketch {
	id: string
	name: string
	message: string
	dataUrl: string
	createdAt: Date
}

export function Sketch() {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [isDrawing, setIsDrawing] = useState(false)
	const [isEraser, setIsEraser] = useState(false)
	const [brushSize, setBrushSize] = useState(5)
	const [color, setColor] = useState('#000000')
	const [sketches, setSketches] = useState<Sketch[]>([])
	const [history, setHistory] = useState<ImageData[]>([])
	const [historyIndex, setHistoryIndex] = useState(-1)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [newSketchName, setNewSketchName] = useState('')
	const [newSketchMessage, setNewSketchMessage] = useState('')

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

	useEffect(() => {
		if (isModalOpen) {
			const canvas = canvasRef.current
			if (!canvas) return

			const ctx = canvas.getContext('2d')
			if (!ctx) return

			const container = canvas.parentElement
			if (container) {
				canvas.width = container.clientWidth
				canvas.height = container.clientHeight
			}

			ctx.fillStyle = '#c5c5c5'
			ctx.globalAlpha = 0.6
			ctx.fillRect(0, 0, canvas.width, canvas.height)
			ctx.globalAlpha = 1.0

			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
			setHistory([imageData])
			setHistoryIndex(0)
		}
	}, [isModalOpen])

	useEffect(() => {
		const fetchSketches = async () => {
			try {
				const res = await fetch('/api/sketches')
				if (!res.ok) return
				const data = await res.json()
				const mapped = (data as any[]).map((s) => ({
					id: s._id ?? s.id,
					name: s.name,
					message: s.message,
					dataUrl: s.dataUrl,
					createdAt: new Date(s.createdAt),
				}))
				setSketches(mapped)
			} catch (e) {
				console.error('Failed to fetch sketches', e)
			}
		}
		fetchSketches()
	}, [])

	const saveToHistory = () => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
		const newHistory = history.slice(0, historyIndex + 1)
		newHistory.push(imageData)
		setHistory(newHistory)
		setHistoryIndex(newHistory.length - 1)
	}

	const undo = () => {
		if (historyIndex > 0) {
			const canvas = canvasRef.current
			if (!canvas) return

			const ctx = canvas.getContext('2d')
			if (!ctx) return

			const newIndex = historyIndex - 1
			ctx.putImageData(history[newIndex], 0, 0)
			setHistoryIndex(newIndex)
		}
	}

	const redo = () => {
		if (historyIndex < history.length - 1) {
			const canvas = canvasRef.current
			if (!canvas) return

			const ctx = canvas.getContext('2d')
			if (!ctx) return

			const newIndex = historyIndex + 1
			ctx.putImageData(history[newIndex], 0, 0)
			setHistoryIndex(newIndex)
		}
	}

	const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current
		if (!canvas) return

		const rect = canvas.getBoundingClientRect()
		const scaleX = canvas.width / rect.width
		const scaleY = canvas.height / rect.height
		const x = (e.clientX - rect.left) * scaleX
		const y = (e.clientY - rect.top) * scaleY

		setIsDrawing(true)
		draw(x, y)
	}

	const draw = (x: number, y: number) => {
		const canvas = canvasRef.current
		if (!canvas || !isDrawing) return

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		ctx.lineWidth = brushSize
		ctx.lineCap = 'round'
		ctx.lineJoin = 'round'

		if (!isEraser) {
			ctx.globalCompositeOperation = 'source-over'
			ctx.strokeStyle = color
		} else {
			ctx.globalCompositeOperation = 'destination-out'
		}

		ctx.lineTo(x, y)
		ctx.stroke()
		ctx.beginPath()
		ctx.moveTo(x, y)
	}

	const stopDrawing = () => {
		if (isDrawing) {
			setIsDrawing(false)
			const canvas = canvasRef.current
			if (canvas) {
				const ctx = canvas.getContext('2d')
				if (ctx) {
					ctx.beginPath()
					saveToHistory()
				}
			}
		}
	}

	const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (!isDrawing) return

		const canvas = canvasRef.current
		if (!canvas) return

		const rect = canvas.getBoundingClientRect()
		const scaleX = canvas.width / rect.width
		const scaleY = canvas.height / rect.height
		const x = (e.clientX - rect.left) * scaleX
		const y = (e.clientY - rect.top) * scaleY

		draw(x, y)
	}

	const clearCanvas = () => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		ctx.fillStyle = '#c5c5c5'
		ctx.globalAlpha = 0.6
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		ctx.globalAlpha = 1.0
		saveToHistory()
	}

	const saveSketch = async () => {
		const canvas = canvasRef.current
		if (!canvas) return

		const payload = {
			name: newSketchName,
			message: newSketchMessage,
			dataUrl: canvas.toDataURL(),
		}

		try {
			const res = await fetch('/api/sketches', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			})
			if (!res.ok) {
				console.error('Failed to save sketch', await res.text())
				return
			}
			const saved = await res.json()
			const newSketchFromServer: Sketch = {
				id: saved._id ?? saved.id ?? Date.now().toString(),
				name: saved.name,
				message: saved.message,
				dataUrl: saved.dataUrl,
				createdAt: new Date(saved.createdAt),
			}

			setSketches((prev) => [newSketchFromServer, ...prev])
			setNewSketchName('')
			setNewSketchMessage('')
			setIsModalOpen(false)
		} catch (e) {
			console.error('Error saving sketch', e)
		}
	}

	const handleModalClose = (open: boolean) => {
		setIsModalOpen(open)
		if (!open) {
			setNewSketchName('')
			setNewSketchMessage('')
			setHistory([])
			setHistoryIndex(-1)
		}
	}

	return (
		<div>
			<div className='space-y-2'>
				<Header count={sketches.length} onAdd={() => setIsModalOpen(true)} />
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{sketches.map((sketch) => (
						<SketchCard key={sketch.id} sketch={sketch} />
					))}
				</div>
			</div>
			<Dialog open={isModalOpen} onOpenChange={handleModalClose}>
				<DialogContent className='overflow-hidden p-2' showCloseButton={false}>
					<form
						onSubmit={(e) => {
							e.preventDefault()
							saveSketch()
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

									<Select
										value={brushSize.toString()}
										onValueChange={(value) => setBrushSize(Number(value))}
									>
										<SelectTrigger className='w-8 h-8 p-0 border-0 bg-transparent'>
											<Circle className='w-4 h-4' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='1'>1px</SelectItem>
											<SelectItem value='3'>3px</SelectItem>
											<SelectItem value='5'>5px</SelectItem>
											<SelectItem value='8'>8px</SelectItem>
											<SelectItem value='12'>12px</SelectItem>
											<SelectItem value='16'>16px</SelectItem>
											<SelectItem value='20'>20px</SelectItem>
										</SelectContent>
									</Select>
									<Button
										variant={isEraser ? 'default' : 'ghost'}
										size='iconSm'
										onClick={() => setIsEraser(!isEraser)}
									>
										<Eraser className='w-4 h-4' />
									</Button>
								</div>

								<div className='flex items-center gap-1'>
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
							</div>

							<div className='flex-1 flex justify-center items-center rounded-lg mt-1 mb-4'>
								<canvas
									ref={canvasRef}
									className='rounded-lg shadow-sm cursor-crosshair bg-[#c5c5c5] w-full aspect-square'
									onMouseDown={startDrawing}
									onMouseMove={handleMouseMove}
									onMouseUp={stopDrawing}
									onMouseLeave={stopDrawing}
								/>
							</div>

							<div className='space-y-2'>
								<Input
									id='sketch-name'
									required
									placeholder='Enter your name...'
									value={newSketchName}
									onChange={(e) => setNewSketchName(e.target.value)}
									className='focus:ring-2 focus:ring-primary/20'
								/>
								<Textarea
									id='sketch-message'
									required
									placeholder='Leave a message or description...'
									value={newSketchMessage}
									onChange={(e) => setNewSketchMessage(e.target.value)}
									rows={2}
									className='focus:ring-2 focus:ring-primary/20 resize-none'
								/>
							</div>
						</div>
						<DialogFooter className='mt-4'>
							<Button
								type='button'
								variant='outline'
								onClick={() => setIsModalOpen(false)}
								className='px-6'
							>
								Cancel
							</Button>
							<Button type='submit' className='px-6 shadow-sm'>
								Save Sketch
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
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

function Header({ count, onAdd }: { count: number; onAdd: () => void }) {
	return (
		<div className='flex items-center justify-between bg-muted/30 px-4 py-2 rounded-lg'>
			<div className='text-sm text-muted-foreground'>
				{`${count} ${count === 1 ? 'sketch' : 'sketches'} so far — vibe check ✅🎨`}
			</div>
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
