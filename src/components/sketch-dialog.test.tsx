import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Lightweight translator proxy
const t: any = new Proxy(
	{},
	{
		get: (_t, p) => String(p),
	}
)

// Mock perfect-freehand so polygon generation is deterministic
vi.mock('@/lib/sketch-image-client', () => ({
	svgStringToWebpBase64: vi.fn(async () => 'd2ViYXNkNjQ='),
}))

vi.mock('perfect-freehand', () => {
	return {
		getStroke: (points: number[][]) => {
			// return a simple polygon based on input points for predictable SVG paths
			return points.map((p) => [p[0] + 0.5, p[1] + 0.5])
		},
		default: undefined,
	}
})

// Provide simple ResizeObserver and getBoundingClientRect for jsdom
;(global as any).ResizeObserver =
	(global as any).ResizeObserver ||
	class {
		observe() {}
		disconnect() {}
		unobserve() {}
	}

/* Ensure elements return a sensible DOMRect-like bounding rect so the component sets sizePx.
   Provide x/y and toJSON to satisfy the DOMRect type expected by TypeScript. */
Element.prototype.getBoundingClientRect = function (): DOMRect {
	return {
		x: 0,
		y: 0,
		width: 300,
		height: 300,
		top: 0,
		left: 0,
		right: 300,
		bottom: 300,
		toJSON: () => ({} as any),
	} as DOMRect
}

// jsdom lacks pointer capture methods used by the drawing code
Element.prototype.setPointerCapture = Element.prototype.setPointerCapture || (() => {})
Element.prototype.releasePointerCapture = Element.prototype.releasePointerCapture || (() => {})

import { SketchDialog } from './sketch-dialog'

describe('SketchDialog', () => {
	test('renders inputs and controls when open', () => {
		const onOpenChange = vi.fn()
		const mockMutation: any = { status: 'idle', mutate: vi.fn() }

		render(
			<SketchDialog
				isOpen={true}
				onOpenChange={onOpenChange}
				createSketchMutation={mockMutation}
				t={t}
			/>
		)

		// placeholders from t keys should appear
		expect(screen.getByPlaceholderText('enter your name')).toBeInTheDocument()
		expect(
			screen.getByPlaceholderText('leave a message or description...')
		).toBeInTheDocument()

		// Cancel & Save buttons (save shows 'save sketch' when not pending)
		expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: /save sketch/i })
		).toBeInTheDocument()
	})

	test('submitting form calls mutation with payload and closes dialog', async () => {
		const user = userEvent.setup()
		const onOpenChange = vi.fn()
		const mutate = vi.fn()
		const mockMutation: any = { status: 'idle', mutate }

		render(
			<SketchDialog
				isOpen={true}
				onOpenChange={onOpenChange}
				createSketchMutation={mockMutation}
				t={t}
			/>
		)

		const nameInput = screen.getByPlaceholderText('enter your name')
		const messageInput = screen.getByPlaceholderText(
			'leave a message or description...'
		)
		const saveBtn = screen.getByRole('button', { name: /save sketch/i })

		await user.type(nameInput, 'Tester')
		await user.type(messageInput, 'This is a test sketch message.')

		// pick a non-black color via the native color input
		const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement
		if (colorInput) {
			colorInput.value = '#ef4444'
			fireEvent.input(colorInput, { target: { value: '#ef4444' } })
			fireEvent.change(colorInput, { target: { value: '#ef4444' } })
		}

		// simulate drawing a stroke using fireEvent (more reliable in jsdom)
		const surface = screen.getByTestId('drawing-surface')
		// first point (down)
		fireEvent.pointerDown(surface, { clientX: 60, clientY: 60, pointerId: 1, pressure: 0.5, buttons: 1 })
		// second point (move)
		fireEvent.pointerMove(surface, { clientX: 160, clientY: 160, pointerId: 1, pressure: 0.5, buttons: 1 })
		// up
		fireEvent.pointerUp(surface, { clientX: 160, clientY: 160, pointerId: 1, buttons: 0 })

		await user.click(saveBtn)

		// mutate called once with payload containing name, message and webp base64
		expect(mutate).toHaveBeenCalledTimes(1)
		const payload = mutate.mock.calls[0][0]
		expect(payload).toHaveProperty('name', 'Tester')
		expect(payload).toHaveProperty('message', 'This is a test sketch message.')
		expect(payload).toHaveProperty('imageWebp', 'd2ViYXNkNjQ=')

		// dialog closed via onOpenChange(false)
		expect(onOpenChange).toHaveBeenCalledWith(false)
	})
})
