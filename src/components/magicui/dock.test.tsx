import { render, screen } from '@testing-library/react'
import { Dock, DockIcon } from './dock'

describe('Dock', () => {
	test('renders Dock and DockIcon children and applies padding based on iconSize', () => {
		const { container } = render(
			<Dock iconSize={50}>
				<DockIcon>Icon</DockIcon>
				<div>Other</div>
			</Dock>
		)

		const icon = screen.getByText('Icon')
		expect(icon).toBeInTheDocument()

		const iconDiv = icon.parentElement as HTMLElement | null
		expect(iconDiv).toBeTruthy()
		// DockIcon renders a wrapper with aspect-square/flex classes on the outer element
		expect(iconDiv).toHaveClass('flex')
		expect(iconDiv?.className).toContain('aspect-square')

		// padding should reflect iconSize (50 * 0.2 = 10 -> '10px')
		expect(iconDiv).toHaveStyle({ padding: '10px' })

		// non-Dock child renders unchanged
		expect(screen.getByText('Other')).toBeInTheDocument()
	})
})
