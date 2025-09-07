import { render } from '@testing-library/react'
import { Slider } from './slider'

describe('Slider', () => {
	test('renders two thumbs by default (min/max fallback) and respects value prop length', () => {
		const { rerender } = render(<Slider />)
		// default should render two thumbs (min and max)
		const thumbsDefault = document.querySelectorAll('[data-slot="slider-thumb"]')
		expect(thumbsDefault.length).toBe(2)

		// when passing a value array, number of thumbs should reflect it
		rerender(<Slider value={[10, 50, 90]} />)
		const thumbsThree = document.querySelectorAll('[data-slot="slider-thumb"]')
		expect(thumbsThree.length).toBe(3)
	})
})
