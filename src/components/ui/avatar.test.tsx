import { render, screen } from '@testing-library/react'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

describe('Avatar', () => {
	test('renders image and fallback slot', () => {
		render(
			<Avatar>
				<AvatarImage src='nonexistent.png' alt='me' data-testid='avatar-img' />
				<AvatarFallback>AB</AvatarFallback>
			</Avatar>
		)

		const root = screen.getByText('AB').closest('[data-slot="avatar"]')
		expect(root).toBeInTheDocument()

		const img = screen.queryByRole('img')
		expect(img).not.toBeInTheDocument()

		// fallback should be present
		const fallback = screen.getByText('AB')
		expect(fallback).toBeInTheDocument()
		expect(fallback.getAttribute('data-slot')).toBe('avatar-fallback')
	})
})
