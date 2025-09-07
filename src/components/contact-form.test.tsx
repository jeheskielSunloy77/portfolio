import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Define a mock ActionError type to satisfy TypeScript
type MockActionError = {
	message: string
	type: 'ActionError'
	code:
		| 'BAD_REQUEST'
		| 'UNAUTHORIZED'
		| 'PAYMENT_REQUIRED'
		| 'FORBIDDEN'
		| 'NOT_FOUND'
		| 'METHOD_NOT_ALLOWED'
		| 'NOT_ACCEPTABLE'
		| 'PROXY_AUTHENTICATION_REQUIRED'
		| 'REQUEST_TIMEOUT'
		| 'CONFLICT'
		| 'GONE'
		| 'LENGTH_REQUIRED'
		| 'PRECONDITION_FAILED'
		| 'PAYLOAD_TOO_LARGE'
		| 'URI_TOO_LONG'
		| 'UNSUPPORTED_MEDIA_TYPE'
		| 'RANGE_NOT_SATISFIABLE'
		| 'EXPECTATION_FAILED'
		| 'IM_A_TEAPOT'
		| 'MISDIRECTED_REQUEST'
		| 'UNPROCESSABLE_CONTENT'
		| 'LOCKED'
		| 'FAILED_DEPENDENCY'
		| 'TOO_EARLY'
		| 'UPGRADE_REQUIRED'
		| 'PRECONDITION_REQUIRED'
		| 'TOO_MANY_REQUESTS'
		| 'REQUEST_HEADER_FIELDS_TOO_LARGE'
		| 'UNAVAILABLE_FOR_LEGAL_REASONS'
		| 'INTERNAL_SERVER_ERROR'
		| 'NOT_IMPLEMENTED'
		| 'BAD_GATEWAY'
		| 'SERVICE_UNAVAILABLE'
		| 'GATEWAY_TIMEOUT'
		| 'HTTP_VERSION_NOT_SUPPORTED'
		| 'VARIANT_ALSO_NEGOTIATES'
		| 'INSUFFICIENT_STORAGE'
		| 'LOOP_DETECTED'
		| 'NOT_EXTENDED'
		| 'NETWORK_AUTHENTICATION_REQUIRED'
		| 'CONTENT_TOO_LARGE'
	status: number
	name: string
}

// Mock astro actions before importing the component
vi.mock('astro:actions', () => {
	return {
		actions: {
			sendEmail: vi.fn(),
		},
	}
})

import ContactForm from './contact-form' // import after mock

// Simple translator proxy that returns the key requested so tests can assert strings easily
const t: any = new Proxy(
	{},
	{
		get: (_target, prop) => String(prop),
	}
)

// hold the imported mock module so tests can reference the mocked actions
let actionsMod: any = null

describe('ContactForm', () => {
	beforeEach(async () => {
		// Clear mock calls between tests
		actionsMod = await import('astro:actions')
		;(actionsMod.actions.sendEmail as any).mockReset()
	})

	test.skip('shows validation errors when submitting empty form', async () => {
		render(<ContactForm t={t} lang={'en'} />)

		const sendBtn = screen.getByRole('button', { name: /Send Message/i })
		await userEvent.click(sendBtn)

		expect(await screen.findByText('Name is required.')).toBeInTheDocument()
		expect(await screen.findByText('Email is required.')).toBeInTheDocument()
		expect(await screen.findByText('Message is required.')).toBeInTheDocument()
	})

	test.skip('shows email invalid and short message errors', async () => {
		render(<ContactForm t={t} lang={'en'} />)

		const nameInput = screen.getByPlaceholderText('Name')
		const emailInput = screen.getByPlaceholderText('Email')
		const messageTextarea = screen.getByPlaceholderText(
			'Leave feedback about the site, career opportunities or just to say hello etc.'
		)

		await userEvent.type(nameInput, 'John Doe')
		await userEvent.type(emailInput, 'not-an-email')
		await userEvent.type(messageTextarea, 'short')

		const sendBtn = screen.getByRole('button', { name: /Send Message/i })
		await userEvent.click(sendBtn)

		expect(await screen.findByText('Email is invalid.')).toBeInTheDocument()
		expect(
			await screen.findByText('Message must be at least 10 characters long.')
		).toBeInTheDocument()
	})

	test('valid submission opens confirmation dialog', async () => {
		render(<ContactForm t={t} lang={'en'} />)

		const nameInput = screen.getByPlaceholderText('Name')
		const emailInput = screen.getByPlaceholderText('Email')
		const messageTextarea = screen.getByPlaceholderText(
			'Leave feedback about the site, career opportunities or just to say hello etc.'
		)

		await userEvent.type(nameInput, 'Jane')
		await userEvent.type(emailInput, 'jane@example.com')
		await userEvent.type(
			messageTextarea,
			'This is a valid message longer than ten characters.'
		)

		const sendBtn = screen.getByRole('button', { name: /Send Message/i })
		await userEvent.click(sendBtn)

		// The component shows a confirmation AlertDialog with title key 'Just a quick check! 🤔'
		expect(await screen.findByText('Just a quick check! 🤔')).toBeInTheDocument()

		// It should show the email we entered in the confirmation
		expect(await screen.findByText(/jane@example.com/)).toBeInTheDocument()
	})

	test('confirming sends email and uses actions.sendEmail; handles success', async () => {
		const mod = await import('astro:actions')
		;(mod.actions.sendEmail as any).mockResolvedValueOnce({
			data: { success: true },
			error: undefined,
		} as any)

		render(<ContactForm t={t} lang={'en'} />)

		const nameInput = screen.getByPlaceholderText('Name')
		const emailInput = screen.getByPlaceholderText('Email')
		const messageTextarea = screen.getByPlaceholderText(
			'Leave feedback about the site, career opportunities or just to say hello etc.'
		)

		await userEvent.type(nameInput, 'Sam')
		await userEvent.type(emailInput, 'sam@example.com')
		await userEvent.type(
			messageTextarea,
			'This is a sufficiently long message for testing.'
		)

		const sendBtn = screen.getByRole('button', { name: /Send Message/i })
		await userEvent.click(sendBtn)

		// Wait for confirmation dialog to appear
		const dialogSendBtn = await screen.findByRole('button', { name: 'Send' })
		await userEvent.click(dialogSendBtn)

		await waitFor(() => {
			expect(actionsMod.actions.sendEmail).toHaveBeenCalledTimes(1)
		})

		expect(actionsMod.actions.sendEmail).toHaveBeenCalledWith({
			name: 'Sam',
			email: 'sam@example.com',
			message: 'This is a sufficiently long message for testing.',
		})

		// After successful send, the form sets a success message string (translated key)
		expect(
			await screen.findByText('Message sent successfully!')
		).toBeInTheDocument()
	})

	test('sendEmail error is handled and shows error state', async () => {
		const mockError: MockActionError = {
			message: 'boom',
			type: 'ActionError',
			code: 'INTERNAL_SERVER_ERROR',
			status: 500,
			name: 'ActionError',
		}
		const mod = await import('astro:actions')
		;(mod.actions.sendEmail as any).mockResolvedValueOnce({
			data: undefined,
			error: mockError,
		} as any)

		render(<ContactForm t={t} lang={'en'} />)

		const nameInput = screen.getByPlaceholderText('Name')
		const emailInput = screen.getByPlaceholderText('Email')
		const messageTextarea = screen.getByPlaceholderText(
			'Leave feedback about the site, career opportunities or just to say hello etc.'
		)

		await userEvent.type(nameInput, 'Sam')
		await userEvent.type(emailInput, 'sam@example.com')
		await userEvent.type(
			messageTextarea,
			'This is a sufficiently long message for testing.'
		)

		const sendBtn = screen.getByRole('button', { name: /Send Message/i })
		await userEvent.click(sendBtn)

		// Confirm dialog appears
		const dialogSendBtn = await screen.findByRole('button', { name: 'Send' })
		await userEvent.click(dialogSendBtn)

		await waitFor(() => {
			expect(actionsMod.actions.sendEmail).toHaveBeenCalledTimes(1)
		})

		// Error message key should be displayed
		expect(await screen.findByText('boom')).toBeInTheDocument()
		expect(
			await screen.findByText('Something went wrong. Please try again!')
		).toBeInTheDocument()
	})
})
