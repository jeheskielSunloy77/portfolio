import { render, screen } from '@testing-library/react'
import { Dialog, DialogContent } from './dialog'

describe('Dialog', () => {
	test('DialogContent renders and toggles close button with showCloseButton prop', () => {
		const { rerender } = render(
			<Dialog open>
				<DialogContent>content</DialogContent>
			</Dialog>
		)
		// default includes close button
		expect(screen.queryByRole('button', { name: /close/i })).toBeInTheDocument()

		rerender(
			<Dialog open>
				<DialogContent showCloseButton={false}>content2</DialogContent>
			</Dialog>
		)
		expect(
			screen.queryByRole('button', { name: /close/i })
		).not.toBeInTheDocument()
	})
})
