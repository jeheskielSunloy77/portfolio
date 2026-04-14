import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Provide predictable translations
const t: any = new Proxy(
	{},
	{
		get: (_t, p) => String(p),
	},
)

// Mock the AI chat hook with controllable values
const sendMessageMock = vi.fn()
const regenerateMock = vi.fn()
const clearErrorMock = vi.fn()
let chatState: any
vi.mock('@ai-sdk/react', () => ({
	useChat: () => chatState,
}))

import { ChatBot } from './chat-bot'

describe('ChatBot', () => {
	beforeEach(() => {
		sendMessageMock.mockReset()
		regenerateMock.mockReset()
		clearErrorMock.mockReset()
		chatState = {
			messages: [],
			setMessages: vi.fn(),
			error: undefined,
			status: 'ready',
			sendMessage: sendMessageMock,
			regenerate: regenerateMock,
			clearError: clearErrorMock,
		}
		;(window as any).matchMedia = vi.fn().mockImplementation((query: string) => ({
			matches: false,
			media: query,
			addEventListener: () => {},
			removeEventListener: () => {},
		}))
	})

	test('renders placeholder content when there are no messages', async () => {
		render(<ChatBot t={t} lang='en' />)

		// open the chat
		await userEvent.click(screen.getByRole('button', { name: /jassist/i }))

		// Placeholder lines from component text keys should be present
		expect(
			await screen.findByText('Beep boop! Systems online'),
		).toBeInTheDocument()
		expect(screen.getByText('fire away, human!')).toBeInTheDocument()
		expect(
			screen.getByText(
				'Ask about Jay.',
			),
		).toBeInTheDocument()
	})

	test('send message through input triggers useChat.sendMessage', async () => {
		// Mock hook to expose a sendMessage that resolves
		vi.mocked(sendMessageMock).mockResolvedValue(undefined)

		render(<ChatBot t={t} lang='en' />)

		// open the chat
		await userEvent.click(screen.getByRole('button', { name: /jassist/i }))

		const input = screen.getByPlaceholderText('Ask something...')
		await userEvent.type(input, 'hello{Enter}')

		// sendMessage should have been called once with a message-like object
		expect(sendMessageMock).toHaveBeenCalledTimes(1)
		const calledWith = sendMessageMock.mock.calls[0][0]
		expect(calledWith).toHaveProperty('role', 'user')
		// message contains typed text in parts
		expect(calledWith.parts?.[0]?.text).toContain('hello')
	})

	test('shows a retryable error and keeps the composer enabled', async () => {
		chatState.status = 'error'
		chatState.error = new Error(
			'RetryError [AI_RetryError]: Failed after 3 attempts. Last error: This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
		)

		render(<ChatBot t={t} lang='en' />)

		await userEvent.click(screen.getByRole('button', { name: /jassist/i }))

		expect(
			await screen.findByText('Busy right now'),
		).toBeInTheDocument()

		const input = screen.getByPlaceholderText('Ask something...')
		expect(input).toBeEnabled()

		await userEvent.type(input, 'retry please{Enter}')

		expect(sendMessageMock).toHaveBeenCalledTimes(1)

		await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
		expect(regenerateMock).toHaveBeenCalledTimes(1)
	})

	test('clear chat also clears the error state', async () => {
		chatState.status = 'error'
		chatState.error = new Error('RetryError [AI_RetryError]: Failed after 3 attempts.')
		chatState.messages = [
			{
				id: 'user-1',
				role: 'user',
				parts: [{ type: 'text', text: 'hello' }],
			},
		]

		render(<ChatBot t={t} lang='en' />)

		await userEvent.click(screen.getByRole('button', { name: /jassist/i }))
		expect(await screen.findByText('Busy right now')).toBeInTheDocument()

		await userEvent.click(screen.getByRole('button', { name: 'Clear chat' }))

		expect(clearErrorMock).toHaveBeenCalledTimes(1)
		expect(chatState.setMessages).toHaveBeenCalledWith([])
	})

	test('shows an assistant thinking bubble while a response is pending', async () => {
		chatState.status = 'submitted'
		chatState.messages = [
			{
				id: 'user-1',
				role: 'user',
				parts: [{ type: 'text', text: 'hello' }],
			},
		]

		render(<ChatBot t={t} lang='en' />)

		await userEvent.click(screen.getByRole('button', { name: /jassist/i }))

		expect(await screen.findByLabelText('Thinking...')).toBeInTheDocument()
	})

	test('clicking outside closes the open chat', async () => {
		render(
			<div>
				<button type='button'>Outside</button>
				<ChatBot t={t} lang='en' />
			</div>,
		)

		await userEvent.click(screen.getByRole('button', { name: /jassist/i }))
		expect(
			screen.getByText('Beep boop! Systems online'),
		).toBeInTheDocument()
		expect(screen.getByText('fire away, human!')).toBeInTheDocument()

		await userEvent.click(screen.getByRole('button', { name: 'Outside' }))

		await waitFor(() => {
			expect(
				screen.queryByText('Beep boop! Systems online'),
			).not.toBeInTheDocument()
			expect(screen.queryByText('fire away, human!')).not.toBeInTheDocument()
		})
	})

	test('dock-sheet mode renders only when open and can be closed from its button', async () => {
		const onOpenChange = vi.fn()

		const { rerender } = render(
			<ChatBot
				t={t}
				lang='en'
				mode='dock-sheet'
				isOpen={false}
				onOpenChange={onOpenChange}
			/>,
		)

		expect(
			screen.queryByText('Beep boop! Systems online'),
		).not.toBeInTheDocument()
		expect(screen.queryByText('fire away, human!')).not.toBeInTheDocument()

		rerender(
			<ChatBot
				t={t}
				lang='en'
				mode='dock-sheet'
				isOpen={true}
				onOpenChange={onOpenChange}
			/>,
		)

		expect(
			await screen.findByText('Beep boop! Systems online'),
		).toBeInTheDocument()
		expect(screen.getByText('fire away, human!')).toBeInTheDocument()

		await userEvent.click(screen.getByRole('button', { name: 'Close chat' }))

		expect(onOpenChange).toHaveBeenCalledWith(false)
	})
})
