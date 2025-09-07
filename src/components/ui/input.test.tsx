import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './input'

describe('Input', () => {
	test('renders input and forwards type/placeholder props', () => {
		render(<Input placeholder='email' type='email' data-testid='inp' />)
		const inp = screen.getByTestId('inp') as HTMLInputElement
		expect(inp).toBeInTheDocument()
		expect(inp).toHaveAttribute('type', 'email')
		expect(inp).toHaveAttribute('placeholder', 'email')
	})

	test('allows typing into input', async () => {
		const user = userEvent.setup()
		render(<Input data-testid='typed' />)
		const inp = screen.getByTestId('typed') as HTMLInputElement
		await user.type(inp, 'hello')
		expect(inp.value).toBe('hello')
	})
})
