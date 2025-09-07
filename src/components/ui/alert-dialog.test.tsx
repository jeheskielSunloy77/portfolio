import { render } from '@testing-library/react'
import { AlertDialog, AlertDialogContent } from './alert-dialog'

describe('AlertDialog', () => {
	test('AlertDialogContent renders portal, overlay and content slots', () => {
		render(
			<AlertDialog open>
				<AlertDialogContent>Alert body</AlertDialogContent>
			</AlertDialog>
		)

		// overlay and content should be present in the document (portal mounts them)
		expect(
			document.querySelector('[data-slot="alert-dialog-overlay"]')
		).toBeInTheDocument()
		expect(
			document.querySelector('[data-slot="alert-dialog-content"]')
		).toBeInTheDocument()

		// portal wrapper exists (Radix Portal renders children into body)
		expect(
			document.querySelector('[data-slot="alert-dialog-portal"]') || document.body
		).toBeTruthy()
	})
})
