import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { Language } from '@/i18n/i18n'
import type { Dictionary, LocalizedString } from '@/lib/types'
import { BOT_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useChat, type UIMessage } from '@ai-sdk/react'
import { type ChatStatus, type UIDataTypes, type UITools } from 'ai'
import {
	Bot,
	Mic,
	MicOff,
	RotateCcw,
	SendHorizontal,
	Sparkles,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'

type Message = UIMessage<unknown, UIDataTypes, UITools>

interface ChatPageProps {
	t: Dictionary
	lang: Language
}

interface ChatMessageProps {
	message: Message
}

interface TypingIndicatorProps {
	status: ChatStatus
	t: Dictionary
}

interface SpeechRecognitionConstructor {
	new (): SpeechRecognitionInstance
}

interface SpeechRecognitionInstance extends EventTarget {
	continuous: boolean
	interimResults: boolean
	lang: string
	start: () => void
	stop: () => void
	abort: () => void
	onstart: ((event: Event) => void) | null
	onend: ((event: Event) => void) | null
	onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
	onresult: ((event: SpeechRecognitionEventLike) => void) | null
}

interface SpeechRecognitionResultAlternativeLike {
	transcript: string
	confidence: number
}

interface SpeechRecognitionResultLike {
	isFinal: boolean
	length: number
	[index: number]: SpeechRecognitionResultAlternativeLike
}

interface SpeechRecognitionResultListLike {
	length: number
	[index: number]: SpeechRecognitionResultLike
}

interface SpeechRecognitionEventLike extends Event {
	resultIndex: number
	results: SpeechRecognitionResultListLike
}

interface SpeechRecognitionErrorEventLike extends Event {
	error: string
	message?: string
}

interface WindowWithSpeechRecognition extends Window {
	SpeechRecognition?: SpeechRecognitionConstructor
	webkitSpeechRecognition?: SpeechRecognitionConstructor
}

const promptSuggestions: LocalizedString[] = [
	"What are Jay's strongest skills?",
	'Show me a couple of standout projects.',
	"Summarize Jay's tech stack.",
	'Is Jay open to freelance or remote roles?',
]

export function ChatPage({ t, lang }: ChatPageProps) {
	const { messages, setMessages, error, status, sendMessage } = useChat()
	const [input, setInput] = useState('')
	const [voicePreview, setVoicePreview] = useState('')
	const [isListening, setIsListening] = useState(false)
	const [speechSupported, setSpeechSupported] = useState(true)
	const [speechError, setSpeechError] = useState<string | null>(null)
	const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
	const scrollRef = useRef<HTMLDivElement>(null)

	const isReady = status === 'ready'
	const sayHelloText = t['Say hello to {BOT_NAME}.'].replace('{BOT_NAME}', BOT_NAME)

	useEffect(() => {
		if (typeof window === 'undefined') return
		const browserWindow = window as WindowWithSpeechRecognition
		const Recognition =
			browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition
		if (!Recognition) {
			setSpeechSupported(false)
			return
		}

		const recognition = new Recognition()
		recognition.continuous = false
		recognition.interimResults = true
		recognition.lang = lang === 'id' ? 'id-ID' : 'en-US'

		recognition.onstart = () => {
			setSpeechError(null)
			setIsListening(true)
		}

		recognition.onend = () => {
			setIsListening(false)
			setVoicePreview('')
		}

		recognition.onerror = (event) => {
			setSpeechError(event.error || 'speech-error')
			setIsListening(false)
		}

		recognition.onresult = (event) => {
			let interimTranscript = ''
			let finalTranscript = ''

			for (let i = event.resultIndex; i < event.results.length; i += 1) {
				const result = event.results[i]
				const transcript = result?.[0]?.transcript ?? ''
				if (result?.isFinal) {
					finalTranscript += transcript
				} else {
					interimTranscript += transcript
				}
			}

			if (interimTranscript.trim()) {
				setVoicePreview(interimTranscript.trim())
			}

			if (finalTranscript.trim()) {
				const cleaned = finalTranscript.trim()
				setInput((prev) => (prev ? `${prev} ${cleaned}` : cleaned))
				setVoicePreview('')
			}
		}

		recognitionRef.current = recognition
		setSpeechSupported(true)

		return () => {
			recognition.onstart = null
			recognition.onend = null
			recognition.onerror = null
			recognition.onresult = null
			recognitionRef.current = null
		}
	}, [lang])

	useEffect(() => {
		if (!scrollRef.current) return
		scrollRef.current.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: 'smooth',
		})
	}, [messages, status])

	async function sendInput() {
		const trimmed = input.trim()
		if (!trimmed || !isReady) return

		const message: Message = {
			id: crypto.randomUUID(),
			role: 'user',
			parts: [{ type: 'text', text: trimmed }],
		}

		if (recognitionRef.current && isListening) {
			recognitionRef.current.stop()
		}

		await sendMessage(message)
		setInput('')
		setVoicePreview('')
	}

	function handlePromptClick(prompt: LocalizedString) {
		setInput(t[prompt])
	}

	function handleClearChat() {
		setMessages([])
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		void sendInput()
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			void sendInput()
		}
	}

	function handleMicToggle() {
		if (!speechSupported || !recognitionRef.current) return
		setSpeechError(null)

		if (isListening) {
			recognitionRef.current.stop()
			return
		}

		try {
			recognitionRef.current.start()
		} catch (error) {
			setSpeechError('speech-error')
			setIsListening(false)
		}
	}

	return (
		<motion.section
			className='relative overflow-hidden'
			initial={{ opacity: 0, y: 18 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.45, delay: 0.1 }}
		>
			<div className='flex min-h-[75vh] flex-col'>
				<div ref={scrollRef} className='flex-1 overflow-y-auto px-6 py-6'>
					<ul className='space-y-5'>
						{messages.map((message) => (
							<li key={message.id}>
								<ChatMessage message={message} />
							</li>
						))}
					</ul>

					{messages.length === 0 && !error && (
						<div className='mt-10 flex h-full flex-col items-center justify-center gap-4 text-center'>
							<div className='flex size-16 items-center justify-center rounded-full bg-foreground text-background shadow-lg shadow-foreground/20'>
								<Sparkles className='size-6' />
							</div>
							<div>
								<p className='text-lg font-semibold'>{sayHelloText}</p>
								<p className='text-sm text-muted-foreground'>
									{
										t[
											'Ask anything about Jay, I can pull projects, experience, and links.'
										]
									}
								</p>
							</div>
							<div className='flex items-center flex-wrap gap-2 justify-center'>
								{promptSuggestions.map((prompt) => (
									<button
										key={prompt}
										className='rounded-full border border-border/80 bg-background/60 px-3 py-1.5 text-xs text-foreground/80 transition hover:border-foreground/40 hover:text-foreground'
										onClick={() => handlePromptClick(prompt)}
										type='button'
									>
										{t[prompt]}
									</button>
								))}
							</div>
						</div>
					)}

					<TypingIndicator status={status} t={t} />

					{error && (
						<p className='mt-4 text-center text-sm text-destructive'>
							{t['Something went wrong. Please try again!']}
						</p>
					)}
				</div>

				<form onSubmit={handleSubmit} className='bg-background/70 px-6 py-5'>
					<div className='space-y-3'>
						<Textarea
							value={input}
							onChange={(event) => setInput(event.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={t['Ask something...']}
							disabled={!isReady}
							className='min-h-[120px] resize-none rounded-2xl bg-background/60'
						/>
						{voicePreview && (
							<p className='text-xs text-muted-foreground'>
								{t['Listening...']} {voicePreview}
							</p>
						)}
						<div className='flex flex-wrap items-center justify-between gap-3'>
							<div className='text-xs text-muted-foreground italic'>
								{t['AI make mistakes, double-check it']}
							</div>
							<div className='flex items-center gap-2'>
								{!!messages.length && isReady && (
									<Button variant='outline' size='icon' onClick={handleClearChat}>
										<RotateCcw className='size-4' />
									</Button>
								)}
								<Button
									type='button'
									variant='outline'
									size='icon'
									onClick={handleMicToggle}
									disabled={!speechSupported}
									aria-label={isListening ? t['Stop recording'] : t['Voice input']}
									className={cn(
										'border-border/70',
										isListening &&
											'border-emerald-400/60 bg-emerald-500/10 text-emerald-500'
									)}
								>
									{isListening ? (
										<MicOff className='size-4' />
									) : (
										<Mic className='size-4' />
									)}
								</Button>
								<Button
									type='submit'
									disabled={!isReady || input.trim().length === 0}
									className='gap-2'
								>
									<SendHorizontal className='size-4' />
									<span>{t['Send']}</span>
								</Button>
							</div>
						</div>
					</div>
				</form>
			</div>
		</motion.section>
	)
}

function TypingIndicator({ status, t }: TypingIndicatorProps) {
	if (status !== 'streaming' && status !== 'submitted') return null

	return (
		<div className='mt-4 flex items-center gap-3'>
			<div className='flex items-center gap-1 rounded-full border border-border/80 bg-card/80 px-3 py-2 shadow-sm'>
				<span className='size-2 rounded-full bg-foreground/70 animate-[pulse_1.2s_ease-in-out_infinite]' />
				<span
					className='size-2 rounded-full bg-foreground/70 animate-[pulse_1.2s_ease-in-out_infinite]'
					style={{ animationDelay: '0.15s' }}
				/>
				<span
					className='size-2 rounded-full bg-foreground/70 animate-[pulse_1.2s_ease-in-out_infinite]'
					style={{ animationDelay: '0.3s' }}
				/>
			</div>
			<span className='text-xs text-muted-foreground'>{t['Thinking...']}</span>
		</div>
	)
}

function ChatMessage({ message }: ChatMessageProps) {
	const isBot = message.role === 'assistant'
	const content = message.parts
		.filter((part) => part.type === 'text')
		.map((part) => part.text)
		.join('\n')

	return (
		<motion.div
			className={cn(
				'flex w-full items-start gap-3',
				isBot ? 'justify-start' : 'justify-end'
			)}
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
		>
			{isBot && (
				<div className='flex size-9 items-center justify-center rounded-full border bg-card text-foreground shadow-sm'>
					<Bot className='size-4' />
				</div>
			)}
			<div
				className={cn(
					'max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm',
					isBot
						? 'border border-border/80 bg-card/80 text-foreground'
						: 'bg-foreground text-background'
				)}
			>
				{isBot ? (
					<Markdown
						components={{
							a: ({ node, href, ...props }) => (
								<a
									href={href ?? ''}
									className='underline underline-offset-2'
									{...props}
								/>
							),
							p: ({ node, ...props }) => (
								<p className='mt-3 first:mt-0 leading-relaxed' {...props} />
							),
							ul: ({ node, ...props }) => (
								<ul className='mt-3 list-inside list-disc first:mt-0' {...props} />
							),
						}}
					>
						{content}
					</Markdown>
				) : (
					<p className='whitespace-pre-wrap leading-relaxed'>{content}</p>
				)}
			</div>
		</motion.div>
	)
}
