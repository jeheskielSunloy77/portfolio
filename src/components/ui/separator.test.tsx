import { render, screen } from '@testing-library/react'
import { Separator } from './separator'

describe('Separator', () => {
	test('renders separator with default horizontal orientation and data-slot', () => {
		render(<Separator />)
		const sep =
			(screen.queryByTestId?.('separator') as Element | null) ??
			document.querySelector('[data-slot="separator"]')
		// ensure separator exists
		expect(sep).toBeTruthy()
		// data-slot attribute present
		expect((sep as Element).getAttribute('data-slot')).toBe('separator')
		// default orientation should be horizontal
		expect((sep as Element).getAttribute('data-orientation')).toBe('horizontal')
	})

	test('renders vertical orientation when orientation prop is vertical', () => {
		render(<Separator orientation='vertical' />)
		const sep = document.querySelector('[data-slot="separator"]')
		expect(sep).toBeTruthy()
		expect((sep as Element).getAttribute('data-orientation')).toBe('vertical')
	})
})
