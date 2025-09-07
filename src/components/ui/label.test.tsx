import { render, screen } from '@testing-library/react'
import { Label } from './label'

describe('Label', () => {
	test('forwards htmlFor and renders data-slot', () => {
		render(
			<Label htmlFor='x' data-testid='lbl'>
				Lbl
			</Label>
		)
		const label = screen.getByTestId('lbl')
		expect(label).toBeInTheDocument()
		expect(label).toHaveAttribute('for', 'x')
		expect(label).toHaveAttribute('data-slot', 'label')
	})
})
