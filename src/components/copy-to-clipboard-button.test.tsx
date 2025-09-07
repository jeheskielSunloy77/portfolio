import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { CopyToClipboardButton } from './copy-to-clipboard-button'

describe('CopyToClipboardButton', () => {
	const originalClipboard = (global as any).navigator?.clipboard

	beforeEach(() => {
		// ensure a clean mock for each test
		if ((global as any).navigator == null) {
			;(global as any).navigator = {}
		}
	})

	afterEach(() => {
		// restore original clipboard
		;(global as any).navigator.clipboard = originalClipboard
		vi.restoreAllMocks()
	})

	test('copies provided url to clipboard and alerts on success', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined)
		;(global as any).navigator.clipboard = { writeText }
		const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

		render(<CopyToClipboardButton url='https://example.com' />)
		const btn = screen.getByRole('button', { name: /Copy link to clipboard/i })

		await userEvent.click(btn)

		expect(writeText).toHaveBeenCalledWith('https://example.com')
		expect(alertSpy).toHaveBeenCalledWith('Link copied to clipboard!')
	})

	test('handles clipboard write failure and logs error', async () => {
		const error = new Error('fail')
		const writeText = vi.fn().mockRejectedValue(error)
		;(global as any).navigator.clipboard = { writeText }
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
		const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

		render(<CopyToClipboardButton url='https://fail.example' />)
		const btn = screen.getByRole('button', { name: /Copy link to clipboard/i })

		await userEvent.click(btn)

		// writeText attempted
		expect(writeText).toHaveBeenCalledWith('https://fail.example')
		// alert should not be called on failure
		expect(alertSpy).not.toHaveBeenCalled()
		// error logged
		expect(consoleSpy).toHaveBeenCalled()
	})
})
