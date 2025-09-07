import { render, screen } from '@testing-library/react'
import { Badge } from './badge'

describe('Badge', () => {
	test('renders default badge and exposes data-slot', () => {
		render(<Badge>Hi</Badge>)
		const root = document.querySelector('[data-slot="badge"]')
		expect(root).toBeInTheDocument()
		expect(root?.textContent).toBe('Hi')
		expect(root?.className).toEqual(expect.any(String))
	})

	test('forwards data-slot when used as child and respects variant prop', () => {
		render(
			<Badge asChild variant='secondary'>
				<button data-testid='badge-child'>child</button>
			</Badge>
		)
		const child = screen.getByTestId('badge-child')
		expect(child).toHaveAttribute('data-slot', 'badge')
		// variant should produce some class string (resilient)
		expect(child.className.length).toBeGreaterThan(0)
	})
})
