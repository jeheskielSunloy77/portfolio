'use client'

import { actions } from 'astro:actions'
import { RotateCcw, Send } from 'lucide-react'
import { useState } from 'react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from './ui/alert-dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

type FormState = {
	message?: string
	state: 'idle' | 'submitting' | 'success' | 'error' | 'waiting-confirmation'
}
export default function ContactForm() {
	const [form, setForm] = useState<FormState>({ state: 'idle' })

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [message, setMessage] = useState('')

	const [errors, setErrors] = useState<Record<string, string>>({})

	async function sendMessage() {
		setForm({ ...form, state: 'submitting' })
		const { error } = await actions.sendEmail({ name, email, message })
		if (error) return setForm({ message: error.message, state: 'error' })

		setForm({ message: 'Message sent successfully!', state: 'success' })
	}

	function validateForm() {
		const newErrors: Record<string, string> = {}
		if (!name.trim()) {
			newErrors.name = 'Name is required.'
		}
		if (!email.trim()) {
			newErrors.email = 'Email is required.'
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			newErrors.email = 'Email is invalid.'
		}
		if (!message.trim()) {
			newErrors.message = 'Message is required.'
		} else if (message.length < 10) {
			newErrors.message = 'Message must be at least 10 characters long.'
		}
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	function onSubmit(event: React.FormEvent) {
		event.preventDefault()
		setErrors({})

		if (!validateForm()) return

		setForm({ ...form, state: 'waiting-confirmation' })
	}

	return (
		<>
			<form onSubmit={onSubmit}>
				<div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
					<div className='h-16'>
						<Input
							id='name'
							type='text'
							placeholder='Name'
							autoComplete='given-name'
							name='name'
							value={name}
							onChange={(e) => {
								setName(e.target.value)
								if (errors.name) validateForm()
							}}
							required
						/>

						{errors.name && (
							<p className='text-xs text-destructive mt-1'>{errors.name}</p>
						)}
					</div>

					<div className='h-16'>
						<Input
							id='email'
							type='email'
							placeholder='Email'
							autoComplete='email'
							name='email'
							value={email}
							onChange={(e) => {
								setEmail(e.target.value)
								if (errors.email) validateForm()
							}}
							required
						/>

						{errors.email && (
							<p className='text-xs text-destructive mt-1'>{errors.email}</p>
						)}
					</div>

					<div className='h-32 sm:col-span-2'>
						<Textarea
							rows={4}
							placeholder='Leave feedback about the site, career opportunities or just to say hello etc.'
							autoComplete='Message'
							className='resize-none'
							name='message'
							value={message}
							onChange={(e) => {
								setMessage(e.target.value)
								if (errors.message) validateForm()
							}}
							required
						/>

						{errors.message && (
							<p className='text-xs text-destructive mt-1'>{errors.message}</p>
						)}
					</div>
				</div>

				<div className='mt-2'>
					<Button
						type='submit'
						disabled={form.state === 'submitting'}
						className='w-full disabled:opacity-50'
					>
						<div className='flex items-center'>
							<span>Send Message</span>
							<Send className='ml-2' />
						</div>
					</Button>
					<p className='mt-4 text-xs text-muted-foreground'>
						By submitting this form, I agree to the{' '}
						<a href='/privacy' className='link font-semibold'>
							privacy&nbsp;policy.
						</a>
					</p>
				</div>
			</form>

			<AlertDialog
				open={form.state === 'waiting-confirmation'}
				onOpenChange={(open) => !open && setForm({ ...form, state: 'idle' })}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Just a quick check! 🤔</AlertDialogTitle>
						<AlertDialogDescription asChild>
							<div>
								<p>Hey! Remember to use a real email so I can reply you personally.</p>
								<p className='mt-4 font-medium'>
									I&apos;ll be sending my reply to:{' '}
									<span className='text-foreground'>{email}</span>
								</p>
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Let me fix that</AlertDialogCancel>
						<AlertDialogAction
							type='button'
							onClick={sendMessage}
							disabled={form.state === 'submitting'}
						>
							{form.state === 'submitting' ? (
								<>
									<span>Sending...</span>
									<RotateCcw className='ml-2 h-4 w-4 animate-spin' />
								</>
							) : (
								<>
									<span>Send</span>
									<Send className='ml-2 h-4 w-4' />
								</>
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
