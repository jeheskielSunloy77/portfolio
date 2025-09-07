import { render, screen } from '@testing-library/react'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from './dropdown-menu'

describe('DropdownMenu', () => {
	test('renders item, checkbox item (checked) and radio item with slots/attributes', () => {
		render(
			<DropdownMenu open>
				<DropdownMenuContent>
					<DropdownMenuItem data-testid='item' data-variant='destructive'>
						Item
					</DropdownMenuItem>
					<DropdownMenuCheckboxItem checked data-testid='checkbox-item'>
						Cb
					</DropdownMenuCheckboxItem>
					<DropdownMenuRadioGroup value='r1'>
						<DropdownMenuRadioItem value='r1' data-testid='radio-item'>
							Radio
						</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		)

		const item = screen.getByTestId('item')
		expect(item).toBeInTheDocument()
		expect(item.getAttribute('data-variant')).toBe('destructive')

		const cb = screen.getByTestId('checkbox-item')
		expect(cb).toBeInTheDocument()
		// checked indicator should render an SVG inside the checkbox item (Radix ItemIndicator)
		expect(cb.querySelector('svg')).toBeTruthy()

		const radio = screen.getByTestId('radio-item')
		expect(radio).toBeInTheDocument()
		expect(radio.querySelector('svg')).toBeTruthy()
	})
})
