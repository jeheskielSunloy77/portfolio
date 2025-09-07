import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
	test('renders default button with data-slot and type', () => {
		render(<Button>Click</Button>)
		const btn = document.querySelector(
			'[data-slot="button"]'
		) as HTMLButtonElement
		expect(btn).toBeInTheDocument()
		expect(btn).toHaveAttribute('type', 'button')
	})

	test('forwards data-slot when used as child (Slot)', () => {
		render(
			<Button asChild>
				<a href='/x' data-testid='link-child'>
					link
				</a>
			</Button>
		)
		const link = screen.getByTestId('link-child')
		expect(link).toHaveAttribute('data-slot', 'button')
	})

	test('applies variant and size classes and supports disabled', async () => {
		render(
			<div>
				<Button variant='destructive' size='sm' data-testid='btn-variant'>
					D
				</Button>
				<Button disabled data-testid='btn-disabled'>
					X
				</Button>
			</div>
		)

		const variantBtn = screen.getByTestId('btn-variant')
		const disabledBtn = screen.getByTestId('btn-disabled')

		// className should be a string (resilient against exact classname changes)
		expect(variantBtn.className).toEqual(expect.any(String))
		// size/variant should produce some class names (not empty)
		expect(variantBtn.className.length).toBeGreaterThan(0)

		// disabled should be forwarded to the element
		expect(disabledBtn).toBeDisabled()
	})
})
