import { render, screen } from '@testing-library/react'
import React from 'react'
import { vi } from 'vitest'

// predictable translator
const t: any = new Proxy(
	{},
	{
		get: (_t, p) => String(p),
	}
)

// Mock theme hook used by Navbar
vi.mock('@/hooks/use-theme', () => ({
	useTheme: () => ({
		theme: 'dark',
		toggle: () => {},
		buttonRef: React.createRef(),
	}),
}))

// Mock nanostores/react useStore for chat visibility
vi.mock('@nanostores/react', () => ({
	useStore: () => false,
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
	DropdownMenu: ({ children }: any) => <>{children}</>,
	DropdownMenuTrigger: ({ children }: any) => <>{children}</>,
	DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
	DropdownMenuItem: ({ children }: any) => <div>{children}</div>,
	DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
	DropdownMenuSeparator: () => <hr />,
}))

// Provide a simple IntersectionObserver and matchMedia polyfills for the test environment
;(global as any).IntersectionObserver =
	(global as any).IntersectionObserver ||
	class {
		observe() {}
		disconnect() {}
		unobserve() {}
	}

function mockMatchMedia(matches: boolean) {
	return function (query: string) {
		return {
			matches,
			media: query,
			addEventListener: (_: string, __: any) => {},
			removeEventListener: (_: string, __: any) => {},
		}
	}
}

import { Navbar } from './navbar'

describe('Navbar', () => {
	test('renders header links on desktop (matchMedia false)', () => {
		// Desktop: not mobile
		;(window as any).matchMedia = mockMatchMedia(false)
		// Ensure an element exists with id headerNavbar so IntersectionObserver logic can observe
		const el = document.createElement('div')
		el.id = 'headerNavbar'
		document.body.appendChild(el)

		render(<Navbar t={t} lang={'en'} pathname={'/en'} />)

		// header should render a link with text 'home' (translated key)
		expect(screen.getByText('home')).toBeInTheDocument()

		// cleanup
		document.body.removeChild(el)
	})

	test('renders dock (mobile) when matchMedia returns true', () => {
		;(window as any).matchMedia = mockMatchMedia(true)

		render(<Navbar t={t} lang={'en'} pathname={'/en'} />)

		// DockNavbar renders navigation icons with aria-label equal to item.label (the translation key)
		// Expect at least the projects button (label 'projects') to be present
		const projectsBtn = screen.getAllByLabelText('projects')[0]
		expect(projectsBtn).toBeInTheDocument()
	})

	test('uses localized override URLs in language switcher when provided', () => {
		;(window as any).matchMedia = mockMatchMedia(false)
		const el = document.createElement('div')
		el.id = 'headerNavbar'
		document.body.appendChild(el)

		render(
			<Navbar
				t={t}
				lang={'en'}
				pathname={'/en/blog/redesigning-my-portfolio-making-space-for-what-matters'}
				languageSwitchUrls={{
					en: '/en/blog/redesigning-my-portfolio-making-space-for-what-matters',
					id: '/id/blog/mendesain-ulang-portofolio-memberi-ruang-untuk-hal-yang-penting',
				}}
			/>
		)

		const indonesianLink = screen.getByRole('link', { name: /Bahasa Indonesia/i })
		expect(indonesianLink).toHaveAttribute(
			'href',
			'/id/blog/mendesain-ulang-portofolio-memberi-ruang-untuk-hal-yang-penting'
		)

		document.body.removeChild(el)
	})

	test('falls back to same pathname when localized override is not provided', () => {
		;(window as any).matchMedia = mockMatchMedia(false)
		const el = document.createElement('div')
		el.id = 'headerNavbar'
		document.body.appendChild(el)

		render(
			<Navbar
				t={t}
				lang={'en'}
				pathname={'/en/blog/kotlin-multiplatform-vs-react-native'}
			/>
		)

		const indonesianLink = screen.getByRole('link', { name: /Bahasa Indonesia/i })
		expect(indonesianLink).toHaveAttribute(
			'href',
			'/id/blog/kotlin-multiplatform-vs-react-native'
		)

		document.body.removeChild(el)
	})
})
