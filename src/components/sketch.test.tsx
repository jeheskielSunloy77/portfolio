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

	test('fetches sketches and renders SketchCard items and header count', async () => {
		const mockSketch = {
			_id: 'sk1',
			name: 'Artwork A',
			message: 'A lovely SVG',
			createdAt: new Date().toISOString(),
			svg: '<svg></svg>',
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

		// header shows count (uses the translator key literally in tests)
		expect(
			screen.getByText(
				(content, node) =>
					/1/.test(content) && content.includes('sketches so far — vibe check'),
			),
		).toBeInTheDocument()

		// ensure fetch called with expected initial page params
		await waitFor(() => {
			expect(fetchMock).toHaveBeenCalledWith('/api/sketches?page=0&pageSize=9')
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
})
