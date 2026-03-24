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
						? React.cloneElement(child as any, {
								__dropdownOpen: actualOpen,
								__setDropdownOpen: (next: boolean) => {
									if (!isControlled) {
										setInternalOpen(next)
									}
									onOpenChange?.(next)
								},
							})
						: child,
				)}
			</div>
		)
	},
	DropdownMenuTrigger: ({
		children,
		render,
		__dropdownOpen,
		__setDropdownOpen,
	}: any) =>
		render ? (
			React.cloneElement(
				render,
				{
					onClick: () => __setDropdownOpen(!__dropdownOpen),
				},
				children,
			)
		) : (
			<button type='button' onClick={() => __setDropdownOpen(!__dropdownOpen)}>
				{children}
			</button>
		),
	DropdownMenuContent: ({ children, __dropdownOpen }: any) =>
		__dropdownOpen ? <div>{children}</div> : null,
	DropdownMenuItem: ({ children, disabled, onClick, onSelect }: any) => (
		<button
			type='button'
			disabled={disabled}
			onClick={(event) => {
				onClick?.(event)
				onSelect?.(event)
			}}
		>
			{children}
		</button>
	),
}))

import { ResumeButton } from './hero-section.client'

describe('ResumeButton', () => {
	const fetchMock = vi.fn()
	const clickedHrefMock = vi.fn()
	const clickMock = vi
		.spyOn(HTMLAnchorElement.prototype, 'click')
		.mockImplementation(function (this: HTMLAnchorElement) {
			clickedHrefMock(this.getAttribute('href'))
		})

	beforeEach(() => {
		vi.useFakeTimers()
		fetchMock.mockReset()
		clickedHrefMock.mockClear()
		clickMock.mockClear()
		vi.stubGlobal('fetch', fetchMock)
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
	})

	test('allows each language to download independently and resets after 4 seconds', async () => {
		render(<ResumeButton />)

		const trigger = screen.getByRole('button', { name: /resume/i })
		expect(trigger).toBeInTheDocument()

		fireEvent.click(trigger)

		const indonesianItem = screen.getByRole('button', { name: /bahasa/i })
		const englishItem = screen.getByRole('button', { name: /english/i })

		await act(async () => {
			fireEvent.click(indonesianItem)
		})

		expect(indonesianItem).toBeDisabled()
		expect(englishItem).toBeEnabled()

		await act(async () => {
			fireEvent.click(englishItem)
		})

		expect(indonesianItem).toBeDisabled()
		expect(englishItem).toBeDisabled()

		await act(async () => {
			await vi.advanceTimersByTimeAsync(500)
		})

		expect(fetchMock).not.toHaveBeenCalled()
		expect(clickMock).toHaveBeenCalledTimes(2)
		expect(clickedHrefMock).toHaveBeenNthCalledWith(1, '/resume/id')
		expect(clickedHrefMock).toHaveBeenNthCalledWith(2, '/resume/en')
		expect(
			screen.getByRole('button', { name: /thank you/i }),
		).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: /terima kasih/i }),
		).toBeInTheDocument()

		await act(async () => {
			await vi.advanceTimersByTimeAsync(4000)
		})

		expect(screen.getByRole('button', { name: /bahasa/i })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /english/i })).toBeInTheDocument()
		expect(
			screen.queryByRole('button', { name: /terima kasih/i }),
		).not.toBeInTheDocument()
		expect(
			screen.queryByRole('button', { name: /thank you/i }),
		).not.toBeInTheDocument()
	})
})
