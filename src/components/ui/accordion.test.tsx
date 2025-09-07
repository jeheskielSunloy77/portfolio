import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from './accordion'

describe('Accordion', () => {
	test('renders items and toggles content when trigger clicked', async () => {
		render(
			<Accordion type='single' collapsible>
				<AccordionItem value='a'>
					<AccordionTrigger>Header A</AccordionTrigger>
					<AccordionContent>Content A</AccordionContent>
				</AccordionItem>
				<AccordionItem value='b'>
					<AccordionTrigger>Header B</AccordionTrigger>
					<AccordionContent>Content B</AccordionContent>
				</AccordionItem>
			</Accordion>
		)

		const triggerA = screen.getByText('Header A')
		const triggerB = screen.getByText('Header B')

		// Check the item elements' data-state attributes instead of relying on text lookup
		const itemA = triggerA.closest('[data-slot="accordion-item"]')
		const itemB = triggerB.closest('[data-slot="accordion-item"]')
		expect(itemA).toBeInTheDocument()
		expect(itemB).toBeInTheDocument()

		// Initially closed
		expect(itemA?.getAttribute('data-state')).toBe('closed')

		// click to open A
		await userEvent.click(triggerA)
		await waitFor(() => {
			expect(itemA?.getAttribute('data-state')).toBe('open')
		})

		// click B to open B, and depending on single/multiple type, A should close
		await userEvent.click(triggerB)
		await waitFor(() => {
			expect(itemB?.getAttribute('data-state')).toBe('open')
			expect(itemA?.getAttribute('data-state')).toBe('closed')
		})
	})

	test('supports multiple thumbs/edge cases - clicking same header toggles when collapsible', async () => {
		render(
			<Accordion type='single' collapsible defaultValue='a'>
				<AccordionItem value='a'>
					<AccordionTrigger>Only</AccordionTrigger>
					<AccordionContent>Only content</AccordionContent>
				</AccordionItem>
			</Accordion>
		)

		const trigger = screen.getByText('Only')
		const item = trigger.closest('[data-slot="accordion-item"]')

		// initially opened from defaultValue
		expect(item?.getAttribute('data-state')).toBe('open')

		// clicking again should close due to collapsible
		await userEvent.click(trigger)
		await waitFor(() => {
			expect(item?.getAttribute('data-state')).toBe('closed')
		})
	})
})
