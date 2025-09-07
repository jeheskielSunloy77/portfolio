import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './tooltip'

describe('Tooltip', () => {
	test('renders tooltip provider and content in portal', async () => {
		render(
			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger>Hi</TooltipTrigger>
					<TooltipContent sideOffset={4}>Tip</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		)
		const trigger = screen.getByText('Hi')
		await userEvent.hover(trigger)
		await waitFor(() => {
			expect(
				document.querySelector('[data-slot="tooltip-content"]')
			).toBeInTheDocument()
		})

		// content should include provided text
		expect(
			document.querySelector('[data-slot="tooltip-content"]')?.textContent
		).toContain('Tip')
	})
})
