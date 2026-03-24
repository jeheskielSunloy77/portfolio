import { act, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, vi } from 'vitest'

// Mock i18n language map so ResumeButton renders predictable links
vi.mock('@/i18n/i18n', () => ({
	LANGUAGE_MAP: {
		en: { emoji: '🇺🇸', name: 'English' },
		id: { emoji: '🇮🇩', name: 'Bahasa' },
	},
	LANGUAGES: ['en', 'id'],
}))

vi.mock('./ui/dropdown-menu', () => ({
	DropdownMenu: ({ children, open, onOpenChange }: any) => {
		const [internalOpen, setInternalOpen] = React.useState(false)
		const isControlled = open !== undefined
		const actualOpen = isControlled ? open : internalOpen

		return (
			<div data-open={actualOpen}>
				{React.Children.map(children, (child: any) =>
					React.isValidElement(child)
						? React.cloneElement(child, {
								__dropdownOpen: actualOpen,
								__setDropdownOpen: (next: boolean) => {
									if (!isControlled) {
										setInternalOpen(next)
									}
									onOpenChange?.(next)
								},
							})
						: child
				)}
			</div>
		)
	},
	DropdownMenuTrigger: ({ children, render, __dropdownOpen, __setDropdownOpen }: any) =>
		render
			? React.cloneElement(render, {
					onClick: () => __setDropdownOpen(!__dropdownOpen),
				}, children)
			: (
				<button type='button' onClick={() => __setDropdownOpen(!__dropdownOpen)}>
					{children}
				</button>
			),
	DropdownMenuContent: ({ children, __dropdownOpen }: any) =>
		__dropdownOpen ? <div>{children}</div> : null,
	DropdownMenuItem: ({ children, disabled, onSelect }: any) => (
		<button
			type='button'
			disabled={disabled}
			onClick={(event) => onSelect?.(event)}
		>
			{children}
		</button>
	),
}))

import { ResumeButton } from './hero-section.client'

describe('ResumeButton', () => {
	const fetchMock = vi.fn()
	const createObjectUrlMock = vi.fn(() => 'blob:resume')
	const revokeObjectUrlMock = vi.fn()
	const clickMock = vi
		.spyOn(HTMLAnchorElement.prototype, 'click')
		.mockImplementation(() => {})

	beforeEach(() => {
		vi.useFakeTimers()
		fetchMock.mockReset()
		createObjectUrlMock.mockClear()
		revokeObjectUrlMock.mockClear()
		clickMock.mockClear()
		vi.stubGlobal('fetch', fetchMock)
		vi.stubGlobal('URL', {
			createObjectURL: createObjectUrlMock,
			revokeObjectURL: revokeObjectUrlMock,
		})
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
	})

	test('shows loading then success state for the selected language and resets after 4 seconds', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			blob: vi.fn().mockResolvedValue(new Blob(['resume'])),
			headers: {
				get: vi.fn(() => 'attachment; filename="resume-id.pdf"'),
			},
		})

		render(<ResumeButton />)

		const trigger = screen.getByRole('button', { name: /resume/i })
		expect(trigger).toBeInTheDocument()

		fireEvent.click(trigger)

		const indonesianItem = screen.getByRole('button', { name: /bahasa/i })
		const englishItem = screen.getByRole('button', { name: /english/i })

		await act(async () => {
			fireEvent.click(indonesianItem)
			await Promise.resolve()
			await Promise.resolve()
		})

		expect(fetchMock).toHaveBeenCalledWith('/resume/id')

		expect(indonesianItem).toBeDisabled()
		expect(englishItem).toBeDisabled()
		expect(screen.getByRole('button', { name: /terima kasih/i })).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: /bahasa/i })).not.toBeInTheDocument()
		expect(clickMock).toHaveBeenCalledTimes(1)
		expect(createObjectUrlMock).toHaveBeenCalledTimes(1)
		expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:resume')

		await act(async () => {
			await vi.advanceTimersByTimeAsync(4000)
		})

		expect(screen.getByRole('button', { name: /bahasa/i })).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: /terima kasih/i })).not.toBeInTheDocument()
		expect(screen.getByRole('button', { name: /english/i })).toBeEnabled()
	})
})
