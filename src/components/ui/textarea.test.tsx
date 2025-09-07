import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from './textarea'

describe('Textarea', () => {
	test('forwards placeholder and accepts input', async () => {
		const user = userEvent.setup()
		render(<Textarea placeholder='desc' data-testid='ta' />)
		const ta = screen.getByTestId('ta') as HTMLTextAreaElement
		expect(ta).toBeInTheDocument()
		expect(ta).toHaveAttribute('placeholder', 'desc')
		await user.type(ta, 'hello textarea')
		expect(ta.value).toBe('hello textarea')
	})
})
