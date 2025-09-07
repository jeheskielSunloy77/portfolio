import { render } from '@testing-library/react'
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from './card'

describe('Card', () => {
	test('renders card and its sub slots with children', () => {
		render(
			<Card>
				<CardHeader>
					<CardTitle>My Title</CardTitle>
					<CardDescription>My Desc</CardDescription>
				</CardHeader>
				<CardContent>Body</CardContent>
				<CardFooter>
					<CardAction>Action</CardAction>
				</CardFooter>
			</Card>
		)

		const root = document.querySelector('[data-slot="card"]')
		expect(root).toBeInTheDocument()
		expect(document.querySelector('[data-slot="card-title"]')?.textContent).toBe(
			'My Title'
		)
		expect(
			document.querySelector('[data-slot="card-description"]')?.textContent
		).toBe('My Desc')
		expect(
			document.querySelector('[data-slot="card-content"]')?.textContent
		).toBe('Body')
		expect(document.querySelector('[data-slot="card-action"]')?.textContent).toBe(
			'Action'
		)
	})
})
