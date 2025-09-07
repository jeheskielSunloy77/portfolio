import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Mock i18n language map so ResumeButton renders predictable links
vi.mock('@/i18n/i18n', () => ({
	LANGUAGE_MAP: {
		en: { emoji: '🇺🇸', name: 'English' },
		id: { emoji: '🇮🇩', name: 'Bahasa' },
	},
	LANGUAGES: ['en', 'id'],
}))

import { ResumeButton } from './hero-section.client'

describe('ResumeButton', () => {
	test('renders trigger and shows resume links for configured languages', async () => {
		render(<ResumeButton />)

		// The trigger button contains the visible label "Resume"
		const trigger = screen.getByText('Resume')
		expect(trigger).toBeInTheDocument()

		// Click to open dropdown content
		await userEvent.click(trigger)

		// Links should exist for each mocked language
		const enLink = screen.getByRole('menuitem', { name: /English/i })
		const idLink = screen.getByRole('menuitem', { name: /Bahasa/i })
		expect(enLink).toBeInTheDocument()
		expect(idLink).toBeInTheDocument()

		// hrefs should point to the expected resume assets
		expect(enLink.getAttribute('href')).toBe('/resume-en.pdf')
		expect(idLink.getAttribute('href')).toBe('/resume-id.pdf')
	})
})
