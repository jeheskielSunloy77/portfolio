import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// predictable translator proxy
const t: any = new Proxy(
	{},
	{
		get: (_t, p) => String(p),
	},
)

// provide ResizeObserver and IntersectionObserver shims
;(global as any).ResizeObserver =
	(global as any).ResizeObserver ||
	class {
		observe() {}
		disconnect() {}
		unobserve() {}
	}
;(global as any).IntersectionObserver =
	(global as any).IntersectionObserver ||
	class {
		observe() {}
		disconnect() {}
		unobserve() {}
	}

// Mock date formatting so tests remain deterministic
vi.mock('date-fns', () => ({
	format: () => '01 Jan 2020',
}))

import { Sketch } from './sketch'

describe('Sketch component', () => {
	beforeEach(() => {
		vi.restoreAllMocks()
	})

	test('renders prefetched sketches immediately on mount', async () => {
		const mockSketch = {
			_id: 'sk1',
			name: 'Artwork A',
			message: 'A lovely SVG',
			createdAt: new Date(),
			ip: '127.0.0.1',
		}

		vi.spyOn(global, 'fetch').mockResolvedValue({
			ok: true,
			json: async () => ({
				data: [mockSketch],
				page: 0,
				pageSize: 6,
			}),
		} as any)

		render(
			<Sketch
				t={t}
				initialData={{
					pages: [
						{
							data: [mockSketch],
							page: 0,
							pageSize: 6,
							total: 1,
						},
					],
					pageParams: [0],
				}}
			/>,
		)

		expect(await screen.findByText('Artwork A')).toBeInTheDocument()
		expect(screen.getByText('A lovely SVG')).toBeInTheDocument()
		expect(screen.getByRole('img')).toHaveAttribute('src', '/api/sketches/sk1/image')
	})

	test('fetches sketches and renders SketchCard items and header text', async () => {
		const mockSketch = {
			_id: 'sk1',
			name: 'Artwork A',
			message: 'A lovely SVG',
			createdAt: new Date(),
			ip: '127.0.0.1',
		}

		const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				data: [mockSketch],
				total: 1,
				nextPage: undefined,
			}),
		} as any)

		render(<Sketch t={t} />)

		// wait for the sketch card to appear
		expect(await screen.findByText('Artwork A')).toBeInTheDocument()
		expect(screen.getByText('A lovely SVG')).toBeInTheDocument()

		// header shows the translator key literally in tests
		expect(
			screen.getByText('canvas of chaos, gallery of giggles. 🎨😂'),
		).toBeInTheDocument()

		// ensure fetch called with expected initial page params
		await waitFor(() => {
			expect(fetchMock).toHaveBeenCalledWith('/api/sketches?page=0&pageSize=6', {
				cache: 'no-store',
			})
		})
	})

	test('open dialog when clicking add button', async () => {
		// mock fetch returning empty results so header renders quickly
		vi.spyOn(global, 'fetch').mockResolvedValue({
			ok: true,
			json: async () => ({ data: [], total: 0, nextPage: undefined }),
		} as any)

		render(<Sketch t={t} />)

		// find the RainbowButton by its visible text
		const btn = await screen.findByRole('button', { name: /leave your mark/i })
		expect(btn).toBeInTheDocument()

		// clicking should open the dialog (Sketch contains SketchDialog; presence of dialog inputs
		// is validated in sketch-dialog tests — here ensure click occurs without error)
		await userEvent.click(btn)
	})

	test('renders sensitive sketch with blur overlay and handles reveal and hide toggle', async () => {
		const sensitiveSketch = {
			_id: 'sensitive-1',
			name: 'Anonymous',
			message: 'Sensitive doodle',
			createdAt: new Date(),
			isSensitive: true,
		}

		render(
			<Sketch
				t={t}
				initialData={{
					pages: [
						{
							data: [sensitiveSketch],
							page: 0,
							pageSize: 6,
							total: 1,
						},
					],
					pageParams: [0],
				}}
			/>,
		)

		// Check sensitive content warning badge and view button are rendered
		expect(await screen.findByText('Sensitive content')).toBeInTheDocument()
		const viewBtn = screen.getByRole('button', { name: 'Click to view' })
		expect(viewBtn).toBeInTheDocument()

		// Image should have blur class and masked alt text
		const img = screen.getByRole('img')
		expect(img.className).toContain('blur-xl')
		expect(img).toHaveAttribute('alt', 'Sensitive content')

		// Text should also be blurred
		const messageEl = screen.getByText('Sensitive doodle')
		expect(messageEl.parentElement?.className).toContain('blur-xs')

		// Click to reveal
		await userEvent.click(viewBtn)

		// Warning badge and view button should be gone; content should be revealed
		expect(screen.queryByText('Sensitive content')).not.toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'Click to view' })).not.toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'Hide' })).not.toBeInTheDocument()
		expect(img.className).not.toContain('blur-xl')
		expect(img).toHaveAttribute('alt', 'Sensitive doodle')
		expect(messageEl.parentElement?.className).not.toContain('blur-xs')
	})
})
