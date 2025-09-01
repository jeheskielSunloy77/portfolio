import { dictionary } from '@/i18n/dictionary'
import { type Language } from '@/i18n/i18n'
import { BOT_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { $isChatBotVisible } from '@/stores/chat-bot'
import { useChat, type UIMessage } from '@ai-sdk/react'
import { useStore } from '@nanostores/react'
import { type ChatStatus, type UIDataTypes, type UITools } from 'ai'
import { Bot, Loader2, SendHorizontal, Trash } from 'lucide-react'
import { useEffect, useRef, useState, type HTMLAttributes } from 'react'
import Markdown from 'react-markdown'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from './ui/accordion'
import { Button } from './ui/button'
import { Input } from './ui/input'

export function ChatBot(props: { lang: Language }) {
	const isVisible = useStore($isChatBotVisible)
	if (isVisible) return <Chat lang={props.lang} />
}

function Chat({ lang }: { lang: Language }) {
	const { messages, setMessages, error, status, sendMessage } = useChat()
	const [isOpen, setIsOpen] = useState(false)

	return (
		<Accordion
			type='single'
			collapsible
			className='flex relative z-40'
			onValueChange={(v) => setIsOpen(v === 'chat')}
			value={isOpen ? 'chat' : ''}
		>
			<AccordionItem
				value='chat'
				className='fixed bottom-8 right-8 w-80 rounded-md border bg-background'
			>
				<AccordionTrigger className='border-b px-6'>
					<ChatHeader isOpen={isOpen} lang={lang} />
				</AccordionTrigger>
				<AccordionContent className='flex max-h-96 min-h-80 flex-col justify-between p-0'>
					<ChatMessages
						messages={messages}
						error={error}
						status={status}
						lang={lang}
					/>
					<ChatInput
						sendMessage={sendMessage}
						setMessages={setMessages}
						status={status}
						isClearable={messages.length > 0}
						lang={lang}
					/>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	)
}

function ChatHeader(props: { isOpen: boolean; lang: Language }) {
	const t = dictionary[props.lang]
	return (
		<section className='flex w-full items-center justify-start gap-3'>
			{!props.isOpen && <Bot className='size-5' />}
			<div className='flex flex-col items-start'>
				<p className='text-xs text-muted-foreground'>{t['Chat with']}</p>
				<div className='flex items-center gap-2'>
					<span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
					<p className='text-sm font-medium'>{BOT_NAME}</p>
				</div>
			</div>
		</section>
	)
}

type Message = UIMessage<unknown, UIDataTypes, UITools>

interface ChatInputProps extends HTMLAttributes<HTMLFormElement> {
	sendMessage: ReturnType<typeof useChat>['sendMessage']
	setMessages: (
		messages: Message[] | ((messages: Message[]) => Message[])
	) => void
	isClearable: boolean
	status: ChatStatus
	lang: Language
}

function ChatInput({
	sendMessage,
	setMessages,
	status,
	isClearable,
	lang,
}: ChatInputProps) {
	const t = dictionary[lang]

	const [input, setInput] = useState('')

	const isReady = status === 'ready'

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (input.length === 0) return

		const message: Message = {
			id: crypto.randomUUID(),
			role: 'user',
			parts: [{ type: 'text', text: input }],
		}

		await sendMessage(message)
		setInput('')
	}

	return (
		<form onSubmit={handleSubmit} className='flex gap-1 border-t px-2 py-3'>
			{isClearable && (
				<Button
					title={t['Clear chat']}
					variant='outline'
					onClick={() => setMessages([])}
					className='px-3 py-2'
					disabled={!isReady}
					type='button'
				>
					<Trash className='size-4 text-rose-500' />
				</Button>
			)}
			<Input
				autoFocus
				placeholder={t['Ask something...']}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				disabled={!isReady}
				onKeyDown={(e) => {
					if (e.key !== 'Enter') return
					e.preventDefault()
					handleSubmit(e)
				}}
			/>
			<Button
				title={t['Send message']}
				variant='default'
				className='px-3 py-2'
				disabled={input.length === 0 || !isReady}
				type='submit'
			>
				<SendHorizontal className='size-4' />
			</Button>
		</form>
	)
}

interface ChatMessagesProps {
	messages: Message[]
	error: Error | undefined
	status: ChatStatus
	lang: Language
}

function ChatMessages({ messages, error, status, lang }: ChatMessagesProps) {
	const t = dictionary[lang]

	const scrollRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight
		}
	}, [messages])

	return (
		<div className='h-full overflow-y-auto p-3' ref={scrollRef}>
			<ul>
				{messages.map((msg) => (
					<li key={msg.id}>
						<ChatMessage message={msg} lang={lang} />
					</li>
				))}
			</ul>

			{!error && messages.length === 0 && (
				<div className='mt-16 flex h-full flex-col items-center justify-center gap-2'>
					<Bot />
					<p className='font-medium text-center text-sm'>
						{t['Beep boop! Systems online — fire away, human!']}
					</p>
					<p className='text-center text-xs text-muted-foreground'>
						{
							t[
								"I'm a helpful little robot who knows about Jay — ask me anything and I'll fetch the best bits (with extra beeps)."
							]
						}
					</p>
				</div>
			)}

			{status === 'streaming' && (
				<div className='flex items-center justify-center'>
					<Loader2 className='mr-1.5 size-3 animate-spin text-muted-foreground' />
					<p className='text-center text-xs text-muted-foreground'>
						{t['Thinking...']}
					</p>
				</div>
			)}

			{error && (
				<p className='text-center text-xs text-rose-500'>
					{t['Something went wrong. Please try again!']}
				</p>
			)}
		</div>
	)
}

interface ChatMessageProps {
	message: Message
	lang: Language
}

function ChatMessage({ message, lang }: ChatMessageProps) {
	const t = dictionary[lang]
	const isBot = message.role === 'assistant'

	function messageToText(message: Message): string {
		const texts = message.parts
			.filter((part) => part.type === 'text')
			.map((part) => part.text)
		return texts.join('\n')
	}

	return (
		<div
			className={cn(
				'mb-3 flex items-center',
				isBot ? 'justify-start' : 'justify-end'
			)}
		>
			{isBot && <Bot className='mr-2' />}
			<div
				className={cn(
					'max-w-64 rounded border px-3 py-2',
					isBot ? 'bg-background' : 'bg-foreground text-background'
				)}
			>
				<Markdown
					components={{
						a: ({ node, href, ...props }) => (
							<a
								href={href ?? ''}
								className='underline underline-offset-2'
								{...props}
							/>
						),
						p: ({ node, ...props }) => <p className='mt-3 first:mt-0' {...props} />,
						ul: ({ node, ...props }) => (
							<ul className='mt-3 list-inside list-disc first:mt-0' {...props} />
						),
					}}
				>
					{messageToText(message)}
				</Markdown>
			</div>
		</div>
	)
}
