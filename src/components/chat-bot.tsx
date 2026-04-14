import type { Language } from '@/i18n/i18n'
import { BOT_NAME } from '@/lib/constants'
import type { Dictionary } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useChat, type UIMessage } from '@ai-sdk/react'
import { type ChatStatus, type UIDataTypes, type UITools } from 'ai'
import { Bot, RotateCcw, SendHorizontal, Trash, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type HTMLAttributes } from 'react'
import Markdown from 'react-markdown'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface ChatBotProps {
	t: Dictionary
	lang: Language
	mode?: 'floating' | 'dock-sheet'
	isOpen?: boolean
	onOpenChange?: (isOpen: boolean) => void
}

export function ChatBot({
	t,
	lang,
	mode = 'floating',
	isOpen,
	onOpenChange,
}: ChatBotProps) {
	const isMobile = useIsMobile()

	if (mode === 'floating') {
		if (isMobile) return null

		return (
			<motion.div
				initial={{ opacity: 0, y: 18, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
				className='fixed bottom-8 right-8 z-40'
			>
				<Chat t={t} lang={lang} mode='floating' />
			</motion.div>
		)
	}

	return (
		<Chat
			t={t}
			lang={lang}
			mode={mode}
			isOpen={isOpen}
			onOpenChange={onOpenChange}
		/>
	)
}

function useIsMobile() {
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		if (
			typeof window === 'undefined' ||
			typeof window.matchMedia !== 'function'
		) {
			return
		}

		const mq = window.matchMedia('(max-width: 639px)')
		const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches)

		setIsMobile(mq.matches)
		mq.addEventListener('change', onChange)

		return () => mq.removeEventListener('change', onChange)
	}, [])

	return isMobile
}

function Chat({
	t,
	lang,
	mode,
	isOpen: controlledIsOpen,
	onOpenChange,
}: {
	t: Dictionary
	lang: Language
	mode: 'floating' | 'dock-sheet'
	isOpen?: boolean
	onOpenChange?: (isOpen: boolean) => void
}) {
	const {
		messages,
		setMessages,
		error,
		status,
		sendMessage,
		regenerate,
		clearError,
	} = useChat()
	const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false)
	const containerRef = useRef<HTMLElement>(null)
	const sectionId = 'chat-bot-panel'
	const contentId = 'chat-bot-content'
	const isControlled = controlledIsOpen !== undefined
	const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen

	function setIsOpen(nextValue: boolean | ((value: boolean) => boolean)) {
		const nextOpen =
			typeof nextValue === 'function' ? nextValue(isOpen) : nextValue

		if (!isControlled) {
			setUncontrolledIsOpen(nextOpen)
		}

		onOpenChange?.(nextOpen)
	}

	useEffect(() => {
		if (!isOpen) return

		function handleOutsideInteraction(event: MouseEvent | TouchEvent) {
			const target = event.target
			if (!(target instanceof Node)) return
			if (containerRef.current?.contains(target)) return

			setIsOpen(false)
		}

		document.addEventListener('mousedown', handleOutsideInteraction)
		document.addEventListener('touchstart', handleOutsideInteraction)

		return () => {
			document.removeEventListener('mousedown', handleOutsideInteraction)
			document.removeEventListener('touchstart', handleOutsideInteraction)
		}
	}, [isOpen])

	if (mode === 'dock-sheet') {
		return (
			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.section
						ref={containerRef}
						id={sectionId}
						initial={{ opacity: 0, y: 20, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.96 }}
						transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
						className='fixed bottom-24 left-1/2 z-40 flex h-[min(32rem,65svh)] w-[min(calc(100vw-1.5rem),28rem)] -translate-x-1/2 flex-col overflow-hidden rounded-[1.75rem] border bg-background shadow-lg'
					>
						<ChatPanel
							contentId={contentId}
							isOpen={isOpen}
							lang={lang}
							messages={messages}
							error={error}
							panelClassName='h-full'
							showPanelHeader={true}
							clearError={clearError}
							regenerate={regenerate}
							sendMessage={sendMessage}
							setIsOpen={setIsOpen}
							setMessages={setMessages}
							status={status}
							t={t}
						/>
					</motion.section>
				)}
			</AnimatePresence>
		)
	}

	return (
		<motion.section
			ref={containerRef}
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
						<X className='size-4' />
					</motion.span>
				)}
			</button>
			<ChatPanel
				contentId={contentId}
				isOpen={isOpen}
				lang={lang}
				messages={messages}
				error={error}
				panelClassName='h-[calc(100%-72px)]'
				clearError={clearError}
				regenerate={regenerate}
				sendMessage={sendMessage}
				setIsOpen={setIsOpen}
				setMessages={setMessages}
				status={status}
				t={t}
			/>
		</motion.section>
	)
}

interface ChatPanelProps {
	contentId: string
	isOpen: boolean
	lang: Language
	messages: Message[]
	error: Error | undefined
	panelClassName?: string
	showPanelHeader?: boolean
	clearError: ReturnType<typeof useChat>['clearError']
	regenerate: ReturnType<typeof useChat>['regenerate']
	sendMessage: ReturnType<typeof useChat>['sendMessage']
	setIsOpen: (value: boolean | ((value: boolean) => boolean)) => void
	setMessages: (
		messages: Message[] | ((messages: Message[]) => Message[]),
	) => void
	status: ChatStatus
	t: Dictionary
}

function ChatPanel({
	contentId,
	isOpen,
	lang,
	messages,
	error,
	panelClassName,
	showPanelHeader = false,
	clearError,
	regenerate,
	sendMessage,
	setIsOpen,
	setMessages,
	status,
	t,
}: ChatPanelProps) {
	return (
		<AnimatePresence initial={false}>
			{isOpen && (
				<motion.div
					id={contentId}
					key='chat-panel'
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 12 }}
					transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
					className={cn('flex flex-col overflow-hidden', panelClassName)}
				>
					{showPanelHeader && (
						<div className='flex items-center justify-between border-b px-5 py-4'>
							<ChatHeader isOpen={true} t={t} />
							<button
								type='button'
								onClick={() => setIsOpen(false)}
								aria-label={t['Close chat']}
								title={t['Close chat']}
								className='text-muted-foreground transition hover:text-foreground'
							>
								<X className='size-4' />
							</button>
						</div>
					)}
					<div className='flex items-center justify-between border-b px-4 py-3 text-[11px] text-muted-foreground'>
						<span>
							{t['Chat with']} {BOT_NAME}
						</span>
						<div className='flex items-center gap-3'>
							<a
								href={`/${lang}/chat`}
								className='text-foreground/80 underline underline-offset-4 transition hover:text-foreground'
							>
								{t['Open full chat']}
							</a>
						</div>
					</div>
					<ChatMessages
						messages={messages}
						error={error}
						regenerate={regenerate}
						status={status}
						t={t}
					/>
					<ChatInput
						sendMessage={sendMessage}
						clearError={clearError}
						setMessages={setMessages}
						status={status}
						isClearable={messages.length > 0}
						t={t}
					/>
				</motion.div>
			)}
		</AnimatePresence>
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
	clearError: ReturnType<typeof useChat>['clearError']
	setMessages: (
		messages: Message[] | ((messages: Message[]) => Message[]),
	) => void
	isClearable: boolean
	status: ChatStatus
	t: Dictionary
}

function ChatInput({
	sendMessage,
	clearError,
	setMessages,
	status,
	isClearable,
	t,
}: ChatInputProps) {
	const [input, setInput] = useState('')

	const isReady = status !== 'streaming' && status !== 'submitted'

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
					onClick={() => {
						setMessages([])
						clearError()
					}}
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
	regenerate: ReturnType<typeof useChat>['regenerate']
	status: ChatStatus
	t: Dictionary
}

function ChatMessages({
	messages,
	error,
	regenerate,
	status,
	t,
}: ChatMessagesProps) {
	const scrollRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight
		}
	}, [messages, status])

	return (
		<div className='scrollbar-page flex-1 overflow-y-auto p-3' ref={scrollRef}>
			<ul>
				{messages.map((msg) => (
					<li key={msg.id}>
						<ChatMessage message={msg} />
					</li>
				))}

				{(status === 'submitted' || status === 'streaming') && (
					<li aria-label={t['Thinking...']}>
						<ThinkingMessage />
					</li>
				)}
			</ul>

			{!error && messages.length === 0 && (
				<div className='flex h-full flex-col items-center justify-center gap-1.5 text-center'>
					<Bot />
					<p className='text-sm font-medium'>
						{t['Beep boop! Systems online']}
					</p>
					<p className='text-sm font-medium'>
						{t['fire away, human!']}
					</p>
					<p className='text-xs text-muted-foreground'>
						{t['Ask about Jay.']}
					</p>
				</div>
			)}

			{error && (
				<div className='mt-3'>
					<div className='mb-2 flex items-center justify-start'>
						<Bot className='mr-2' />
						<div className='max-w-64 rounded border bg-background px-3 py-2 text-xs'>
							<p>{t['Busy right now']}</p>
						</div>
					</div>
					<div className='flex justify-start pl-7'>
						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={() => void regenerate()}
							disabled={status === 'streaming' || status === 'submitted'}
							className='h-7 gap-1.5 px-2.5 text-xs'
						>
							<RotateCcw className='size-3.5' />
							{t['Retry']}
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}

interface ChatMessageProps {
	message: Message
}

const THINKING_LINES = [
	'One tiny sec',
	'Waking up the brain',
	'Digging for the good stuff',
	'Connecting the dots',
	'Polishing the reply',
	'Doing the smart robot thing',
	'Picking the juicy bits',
	'Almost there',
] as const

function ThinkingMessage() {
	const [lineIndex, setLineIndex] = useState(0)

	useEffect(() => {
		const intervalId = window.setInterval(() => {
			setLineIndex((current) => {
				if (THINKING_LINES.length <= 1) return current

				let nextIndex = current
				while (nextIndex === current) {
					nextIndex = Math.floor(Math.random() * THINKING_LINES.length)
				}

				return nextIndex
			})
		}, 1200)

		return () => window.clearInterval(intervalId)
	}, [])

	return (
		<div className='mb-3 flex items-center justify-start'>
			<Bot className='mr-2' />
			<div className='rounded border bg-background px-3 py-2 text-xs text-muted-foreground'>
				<div className='relative min-w-28'>
					<AnimatePresence mode='wait' initial={false}>
						<motion.span
							key={THINKING_LINES[lineIndex]}
							initial={{ opacity: 0, y: 4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -4 }}
							transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
							className='block whitespace-nowrap'
						>
							{THINKING_LINES[lineIndex]}...
						</motion.span>
					</AnimatePresence>
				</div>
			</div>
		</div>
	)
}

function ChatMessage({ message }: ChatMessageProps) {
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
					'max-w-64 rounded border px-3 py-2 text-xs',
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
