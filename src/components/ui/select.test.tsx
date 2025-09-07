import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './select'

describe('Select', () => {
	test('SelectTrigger respects size prop and forwards data-slot', () => {
		render(
			<Select>
				<SelectTrigger size='sm' data-testid='trigger'>
					Open
				</SelectTrigger>
			</Select>
		)
		const trigger = screen.getByTestId('trigger')
		expect(trigger).toBeInTheDocument()
		expect(trigger.getAttribute('data-size')).toBe('sm')
		expect(trigger).toHaveAttribute('data-slot', 'select-trigger')
	})

	test('SelectContent and items render and item includes indicator area', async () => {
		render(
			<Select>
				<SelectTrigger>
					<SelectValue placeholder='Select an option' />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value='one' data-testid='item-one'>
						One
					</SelectItem>
					<SelectItem value='two' data-testid='item-two'>
						Two
					</SelectItem>
				</SelectContent>
			</Select>
		)

		// open the select menu
		await userEvent.click(screen.getByRole('combobox'))

		const itemOne = screen.getByTestId('item-one')
		const itemTwo = screen.getByTestId('item-two')
		expect(itemOne).toBeInTheDocument()
		expect(itemTwo).toBeInTheDocument()
		// Item should include an indicator container (span) or SVG for selected state area
		expect(
			itemOne.querySelector('span') || itemOne.querySelector('svg')
		).toBeTruthy()
	})
})
