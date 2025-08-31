import type React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Brush, Circle, Eraser, Plus, Redo2, Trash2, Undo2 } from 'lucide-react'
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

	const presetColors = ['#000000', '#FF0000', '#0000FF', '#00FF00', '#FFFF00']

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

			ctx.fillStyle = 'hsl(var(--muted))'
			ctx.globalAlpha = 0.6
			ctx.fillRect(0, 0, canvas.width, canvas.height)
			ctx.globalAlpha = 1.0

			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
			setHistory([imageData])
			setHistoryIndex(0)
		}
	}, [isModalOpen])

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

		ctx.fillStyle = 'hsl(var(--muted))'
		ctx.globalAlpha = 0.6
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		ctx.globalAlpha = 1.0
		saveToHistory()
	}

	const saveSketch = () => {
		const canvas = canvasRef.current
		if (!canvas) return

		const dataUrl = canvas.toDataURL()
		const newSketch: Sketch = {
			id: Date.now().toString(),
			name: newSketchName || 'Untitled Sketch',
			message: newSketchMessage,
			dataUrl,
			createdAt: new Date(),
		}

		setSketches((prev) => [newSketch, ...prev])
		setNewSketchName('')
		setNewSketchMessage('')
		setIsModalOpen(false)
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

	const deleteSketch = (id: string) => {
		setSketches((prev) => prev.filter((sketch) => sketch.id !== id))
	}

	return (
		<div className='min-h-screen bg-background p-6'>
			<div className='max-w-6xl mx-auto space-y-8'>
				{/* Header */}
				<div className='text-center space-y-4'>
					<h1 className='text-4xl font-bold text-foreground'>Sketch Studio</h1>
					<p className='text-muted-foreground'>
						Create beautiful sketches with our modern drawing tools
					</p>

					<Dialog open={isModalOpen} onOpenChange={handleModalClose}>
						<DialogTrigger asChild>
							<Button size='lg' className='bg-primary hover:bg-primary/90 shadow-lg'>
								<Plus className='w-5 h-5 mr-2' />
								Create New Sketch
							</Button>
						</DialogTrigger>
						<DialogContent className='max-w-[95vw] max-h-[95vh] w-full h-full overflow-hidden'>
							<DialogHeader className='pb-2'>
								<DialogTitle className='text-2xl font-semibold'>
									Create Your Sketch
								</DialogTitle>
							</DialogHeader>

							<div className='flex flex-col h-full space-y-4'>
								<div className='flex items-center justify-center gap-1 bg-muted/30 p-1 rounded-lg'>
									<Button
										variant={isEraser ? 'default' : 'ghost'}
										size='sm'
										onClick={() => setIsEraser(!isEraser)}
										className='h-8 w-8 p-0'
									>
										<Eraser className='w-4 h-4' />
									</Button>

									<div className='h-4 w-px bg-border mx-1' />

									<div className='flex items-center gap-1'>
										{presetColors.map((presetColor) => (
											<button
												key={presetColor}
												onClick={() => setColor(presetColor)}
												className={`w-6 h-6 rounded border cursor-pointer transition-all ${
													color === presetColor
														? 'border-foreground scale-110'
														: 'border-border hover:scale-105'
												}`}
												style={{ backgroundColor: presetColor }}
											/>
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

									<div className='h-4 w-px bg-border mx-1' />

									<Button
										variant='ghost'
										size='sm'
										onClick={undo}
										disabled={historyIndex <= 0}
										className='h-8 w-8 p-0'
									>
										<Undo2 className='w-4 h-4' />
									</Button>
									<Button
										variant='ghost'
										size='sm'
										onClick={redo}
										disabled={historyIndex >= history.length - 1}
										className='h-8 w-8 p-0'
									>
										<Redo2 className='w-4 h-4' />
									</Button>
									<Button
										variant='ghost'
										size='sm'
										onClick={clearCanvas}
										className='h-8 w-8 p-0'
									>
										<Trash2 className='w-4 h-4' />
									</Button>
								</div>

								<div className='flex-1 flex justify-center items-center bg-muted/20 rounded-lg'>
									<canvas
										ref={canvasRef}
										className='border border-border rounded-lg shadow-sm cursor-crosshair bg-muted/60 w-full h-full'
										onMouseDown={startDrawing}
										onMouseMove={handleMouseMove}
										onMouseUp={stopDrawing}
										onMouseLeave={stopDrawing}
									/>
								</div>

								<div className='grid grid-cols-1 gap-3 bg-muted/30 p-4 rounded-lg'>
									<div className='space-y-2'>
										<Label htmlFor='sketch-name' className='text-sm font-medium'>
											Name <span className='text-muted-foreground'>(optional)</span>
										</Label>
										<Input
											id='sketch-name'
											placeholder='Enter sketch name...'
											value={newSketchName}
											onChange={(e) => setNewSketchName(e.target.value)}
											className='focus:ring-2 focus:ring-primary/20'
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='sketch-message' className='text-sm font-medium'>
											Message <span className='text-muted-foreground'>(optional)</span>
										</Label>
										<Textarea
											id='sketch-message'
											placeholder='Add a message or description...'
											value={newSketchMessage}
											onChange={(e) => setNewSketchMessage(e.target.value)}
											rows={2}
											className='focus:ring-2 focus:ring-primary/20 resize-none'
										/>
									</div>
								</div>

								<div className='flex justify-end gap-3 pt-2 border-t'>
									<Button
										variant='outline'
										onClick={() => setIsModalOpen(false)}
										className='px-6'
									>
										Cancel
									</Button>
									<Button onClick={saveSketch} className='px-6 shadow-sm'>
										Save Sketch
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>

				{sketches.length > 0 ? (
					<div className='space-y-6'>
						<h2 className='text-2xl font-semibold text-center'>Your Sketches</h2>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
							{sketches.map((sketch) => (
								<Card
									key={sketch.id}
									className='overflow-hidden hover:shadow-lg transition-shadow'
								>
									<CardContent className='p-4 space-y-3'>
										<div className='aspect-square bg-muted rounded-lg overflow-hidden'>
											<img
												src={sketch.dataUrl || '/placeholder.svg'}
												alt={sketch.name}
												className='w-full h-full object-cover'
											/>
										</div>
										<div className='space-y-2'>
											<h3 className='font-medium text-foreground truncate'>
												{sketch.name}
											</h3>
											{sketch.message && (
												<p className='text-sm text-muted-foreground line-clamp-2'>
													{sketch.message}
												</p>
											)}
											<div className='flex items-center justify-between'>
												<span className='text-xs text-muted-foreground'>
													{sketch.createdAt.toLocaleDateString()}
												</span>
												<Button
													variant='ghost'
													size='sm'
													onClick={() => deleteSketch(sketch.id)}
													className='text-destructive hover:text-destructive hover:bg-destructive/10'
												>
													<Trash2 className='w-4 h-4' />
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				) : (
					<div className='text-center py-16 space-y-4'>
						<div className='w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center'>
							<Brush className='w-12 h-12 text-muted-foreground' />
						</div>
						<div className='space-y-2'>
							<h3 className='text-xl font-medium'>No sketches yet</h3>
							<p className='text-muted-foreground'>
								Create your first sketch to get started!
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
