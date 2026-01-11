import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Provide predictable translations
const t: any = new Proxy(
	{},
	{
		get: (_t, p) => String(p),
	}
)

// Mock nanostores useStore to control visibility
vi.mock('@nanostores/react', () => ({
	useStore: () => true,
}))

// Mock the AI chat hook with controllable values
const sendMessageMock = vi.fn()
vi.mock('@ai-sdk/react', () => ({
	useChat: () => ({
		messages: [],
		setMessages: () => {},
		error: undefined,
		status: 'ready',
		sendMessage: sendMessageMock,
	}),
}))

import { ChatBot } from './chat-bot'

describe('ChatBot', () => {
	beforeEach(() => {
		sendMessageMock.mockReset()
	})

	test('renders placeholder content when there are no messages', async () => {
		render(<ChatBot t={t} lang='en' />)

		// open the chat
		await userEvent.click(screen.getByRole('button', { name: /J-assist/i }))

		// Placeholder lines from component text keys should be present
		expect(
			await screen.findByText('Beep boop! Systems online — fire away, human!')
		).toBeInTheDocument()
		expect(
			screen.getByText(
				"I'm a helpful little robot who knows about Jay — ask me anything and I'll fetch the best bits (with extra beeps)."
			)
		).toBeInTheDocument()
	})

	test('send message through input triggers useChat.sendMessage', async () => {
		// Mock hook to expose a sendMessage that resolves
		vi.mocked(sendMessageMock).mockResolvedValue(undefined)

		render(<ChatBot t={t} lang='en' />)

		// open the chat
		await userEvent.click(screen.getByRole('button', { name: /J-assist/i }))

		const input = screen.getByPlaceholderText('Ask something...')
		await userEvent.type(input, 'hello{Enter}')

		// sendMessage should have been called once with a message-like object
		expect(sendMessageMock).toHaveBeenCalledTimes(1)
		const calledWith = sendMessageMock.mock.calls[0][0]
		expect(calledWith).toHaveProperty('role', 'user')
		// message contains typed text in parts
		expect(calledWith.parts?.[0]?.text).toContain('hello')
	})
})
