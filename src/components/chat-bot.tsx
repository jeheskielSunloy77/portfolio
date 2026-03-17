import type { Language } from '@/i18n/i18n'
import { BOT_NAME } from '@/lib/constants'
import type { Dictionary } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useChat, type UIMessage } from '@ai-sdk/react'
import { type ChatStatus, type UIDataTypes, type UITools } from 'ai'
import { Bot, ChevronDown, Loader2, SendHorizontal, Trash } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type HTMLAttributes } from 'react'
import Markdown from 'react-markdown'
import { Button } from './ui/button'
import { Input } from './ui/input'

export function ChatBot({ t, lang }: { t: Dictionary; lang: Language }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 18, scale: 0.96 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
			className='fixed bottom-8 right-8 z-40'
		>
			<Chat t={t} lang={lang} />
		</motion.div>
	)
}

function Chat({ t, lang }: { t: Dictionary; lang: Language }) {
	const { messages, setMessages, error, status, sendMessage } = useChat()
	const [isOpen, setIsOpen] = useState(false)
	const sectionId = 'chat-bot-panel'
	const contentId = 'chat-bot-content'

	return (
		<motion.section
			id={sectionId}
			initial={false}
			animate={{
				width: isOpen ? 352 : 56,
				height: isOpen ? 512 : 56,
			}}
			transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
			className='origin-bottom-right overflow-hidden rounded-2xl border bg-background shadow-lg'
		>
			<button
				type='button'
				aria-controls={contentId}
				aria-expanded={isOpen}
				aria-label={`${t['Chat with']} ${BOT_NAME}`}
				onClick={() => setIsOpen((value) => !value)}
				className={cn(
					'flex w-full text-left transition-[padding] duration-200',
					isOpen
						? 'items-center justify-between border-b px-5 py-4'
						: 'size-14 items-center justify-center px-0 py-0',
				)}
			>
				<ChatHeader isOpen={isOpen} t={t} />
				{isOpen && (
					<motion.span
						initial={{ opacity: 0, rotate: -90 }}
						animate={{ rotate: 180, opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.18 }}
						className='text-muted-foreground'
					>
						<ChevronDown className='size-4' />
					</motion.span>
				)}
			</button>
			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						id={contentId}
						key='chat-panel'
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 12 }}
						transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
						className='flex h-[calc(100%-72px)] flex-col overflow-hidden'
					>
						<div className='flex items-center justify-between border-b px-3 py-2 text-[11px] text-muted-foreground'>
							<span>
								{t['Chat with']} {BOT_NAME}
							</span>
							<a
								href={`/${lang}/chat`}
								className='text-foreground/80 underline underline-offset-4 transition hover:text-foreground'
							>
								{t['Open full chat']}
							</a>
						</div>
						<ChatMessages messages={messages} error={error} status={status} t={t} />
						<ChatInput
							sendMessage={sendMessage}
							setMessages={setMessages}
							status={status}
							isClearable={messages.length > 0}
							t={t}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.section>
	)
}

function ChatHeader({ isOpen, t }: { isOpen: boolean; t: Dictionary }) {
	return (
		<div className={cn('flex items-center', isOpen ? 'gap-3' : 'justify-center')}>
			<div className='relative shrink-0'>
				<Bot className='size-5' />
				{!isOpen && (
					<span className='absolute -right-0.5 -top-0.5 flex size-2'>
						<span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
						<span className='relative inline-flex size-2 rounded-full border border-background bg-emerald-500' />
					</span>
				)}
			</div>
			{isOpen && (
				<section className='flex w-full flex-col items-start'>
					<p className='text-xs text-muted-foreground'>{t['Chat with']}</p>
					<div className='flex items-center gap-2'>
						<span className='size-2 animate-pulse rounded-full bg-emerald-500' />
						<p className='text-sm font-medium'>{BOT_NAME}</p>
					</div>
				</section>
			)}
		</div>
	)
}

type Message = UIMessage<unknown, UIDataTypes, UITools>

interface ChatInputProps extends HTMLAttributes<HTMLFormElement> {
	sendMessage: ReturnType<typeof useChat>['sendMessage']
	setMessages: (
		messages: Message[] | ((messages: Message[]) => Message[]),
	) => void
	isClearable: boolean
	status: ChatStatus
	t: Dictionary
}

function ChatInput({
	sendMessage,
	setMessages,
	status,
	isClearable,
	t,
}: ChatInputProps) {
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
	t: Dictionary
}

function ChatMessages({ messages, error, status, t }: ChatMessagesProps) {
	const scrollRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight
		}
	}, [messages])

	return (
		<div className='scrollbar-page flex-1 overflow-y-auto p-3' ref={scrollRef}>
			<ul>
				{messages.map((msg) => (
					<li key={msg.id}>
						<ChatMessage message={msg} t={t} />
					</li>
				))}
			</ul>

			{!error && messages.length === 0 && (
				<div className='flex h-full flex-col items-center justify-center gap-2'>
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
	t: Dictionary
}

function ChatMessage({ message, t }: ChatMessageProps) {
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
				isBot ? 'justify-start' : 'justify-end',
			)}
		>
			{isBot && <Bot className='mr-2' />}
			<div
				className={cn(
					'max-w-64 rounded border px-3 py-2',
					isBot ? 'bg-background' : 'bg-foreground text-background',
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
