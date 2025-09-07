import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Provide predictable translator
const t: any = new Proxy(
	{},
	{
		get: (_t, p) => String(p),
	}
)

// Mock constants used by the component with small predictable datasets
vi.mock('@/lib/constants', () => {
	return {
		CAREERS: [
			{
				href: 'https://company.example',
				logo: '/logo.png',
				name: 'Acme Co',
				title: 'Senior Engineer',
				start: '2020',
				end: '2022',
				list: [{ isMarkdown: false, content: 'Built things' }],
				description: 'Worked on many things',
				links: [
					{ href: 'https://repo.example', name: 'Repo', icon: () => <span /> },
				],
			},
			{
				href: 'https://present.example',
				logo: '/logo2.png',
				name: 'PresentCo',
				title: 'Lead',
				start: '2023',
				// no end -> should show "Present" text from translations
				list: [],
			},
		],
		EDUCATIONS: [
			{
				href: 'https://school.example',
				logo: '/school.png',
				name: 'University',
				subtitle: '2010 - 2014',
				list: [],
			},
		],
	}
})

import { ExperienceSection } from './experiance-section'

describe('ExperienceSection', () => {
	test('renders Work and Education tabs and lists experiences', async () => {
		render(<ExperienceSection t={t} />)

		// Tabs present
		expect(screen.getByText('Work')).toBeInTheDocument()
		expect(screen.getByText('Education')).toBeInTheDocument()

		// Work timeline should include company names from mocked CAREERS
		expect(screen.getByText('Acme Co')).toBeInTheDocument()
		expect(screen.getByText('PresentCo')).toBeInTheDocument()

		// The first career entry shows the title and description
		expect(screen.getByText('Senior Engineer')).toBeInTheDocument()
		expect(screen.getByText('Worked on many things')).toBeInTheDocument()

		// The item without an end date should render the 'Present' translation key
		expect(screen.getAllByText('Present').length).toBeGreaterThan(0)

		// Education tab content should render the school name
		// Click education tab trigger to ensure content appears
		await userEvent.click(screen.getByText('Education'))
		expect(screen.getByText('University')).toBeInTheDocument()
	})
})
