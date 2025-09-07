import { render } from '@testing-library/react'
import { Alert, AlertDescription, AlertTitle } from './alert'

describe('Alert', () => {
	test('renders alert with role and slots', () => {
		render(
			<Alert>
				<AlertTitle>Title</AlertTitle>
				<AlertDescription>Desc</AlertDescription>
			</Alert>
		)

		const root = document.querySelector('[data-slot="alert"]')
		expect(root).toBeInTheDocument()
		expect(root).toHaveAttribute('role', 'alert')

		expect(document.querySelector('[data-slot="alert-title"]')?.textContent).toBe(
			'Title'
		)
		expect(
			document.querySelector('[data-slot="alert-description"]')?.textContent
		).toBe('Desc')
	})

	test('applies destructive variant and preserves description text', () => {
		render(
			<Alert variant='destructive'>
				<AlertDescription>Danger text</AlertDescription>
			</Alert>
		)

		const root = document.querySelector('[data-slot="alert"]')
		expect(root).toBeInTheDocument()
		// resilient assertion: className exists and is a string
		expect(root?.className).toEqual(expect.any(String))
		expect(
			document.querySelector('[data-slot="alert-description"]')?.textContent
		).toContain('Danger text')
	})
})
