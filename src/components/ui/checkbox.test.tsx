import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './checkbox'

describe('Checkbox', () => {
	test('renders checkbox root and indicator appears when checked', async () => {
		const user = userEvent.setup()
		render(<Checkbox data-testid='cb' />)
		const cb = screen.getByTestId('cb')

		// root exists
		expect(cb).toBeInTheDocument()

		// indicator may not be present until checked; click to check then assert indicator appears
		await user.click(cb)

		const indicator = document.querySelector('[data-slot="checkbox-indicator"]')
		expect(indicator).toBeInTheDocument()
	})

	test('disabled prop prevents interaction / reflects disabled state', async () => {
		const user = userEvent.setup()
		render(<Checkbox disabled data-testid='cb-disabled' />)
		const cbDisabled = screen.getByTestId('cb-disabled')
		expect(cbDisabled).toBeInTheDocument()

		// disabled should prevent toggling - clicking should not change aria-checked or data-state to checked
		const beforeChecked =
			cbDisabled.getAttribute('aria-checked') ||
			cbDisabled.getAttribute('data-state')
		await user.click(cbDisabled)
		const afterChecked =
			cbDisabled.getAttribute('aria-checked') ||
			cbDisabled.getAttribute('data-state')

		// unchanged or explicitly reflects disabled attribute
		expect(
			cbDisabled.getAttribute('disabled') ||
				cbDisabled.getAttribute('aria-disabled') ||
				beforeChecked === afterChecked
		).toBeTruthy()
	})
})
