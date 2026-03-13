import { render, screen } from '@testing-library/react'
import { RainbowButton } from './rainbow-button'

describe('RainbowButton', () => {
	test('renders as button with provided children and data-slot', () => {
		render(<RainbowButton>Click me</RainbowButton>)
		const btn = screen.getByRole('button', { name: /click me/i })
		expect(btn).toBeInTheDocument()
		expect(btn).toHaveAttribute('data-slot', 'button')
	})

	test('renders with a custom element through render', () => {
		render(<RainbowButton render={<a href='/test' />}>Link</RainbowButton>)
		const link = screen.getByRole('button', { name: /link/i })
		expect(link).toBeInTheDocument()
		expect(link).toHaveAttribute('href', '/test')
		expect(link).toHaveAttribute('data-slot', 'button')
	})

	test('applies size variant classes for icon size', () => {
		render(<RainbowButton size='icon'>Icon</RainbowButton>)
		const btn = screen.getByRole('button', { name: /icon/i })
		const cls = btn.getAttribute('class') || ''
		expect(cls).toContain('size-9')
	})
})
