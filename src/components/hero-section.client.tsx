import { LANGUAGE_MAP, LANGUAGES, type Language } from '@/i18n/i18n'
import { CheckIcon, FileDownIcon, LoaderCircleIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { RainbowButton } from './magicui/rainbow-button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'

const THANK_YOU_LABELS: Record<Language, string> = {
	en: 'Thank You',
	id: 'Terima Kasih',
}

function getDownloadFilename(contentDisposition: string | null, language: Language) {
	const match = contentDisposition?.match(/filename="([^"]+)"/i)

	return match?.[1] ?? `resume-${language}.pdf`
}

export function ResumeButton() {
	const [open, setOpen] = useState(false)
	const [activeLanguage, setActiveLanguage] = useState<Language | null>(null)
	const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
	const resetTimeoutRef = useRef<number | null>(null)

	useEffect(() => {
		return () => {
			if (resetTimeoutRef.current !== null) {
				window.clearTimeout(resetTimeoutRef.current)
			}
		}
	}, [])

	async function handleDownload(language: Language) {
		if (status !== 'idle') {
			return
		}

		setOpen(true)
		setActiveLanguage(language)
		setStatus('loading')

		try {
			if (resetTimeoutRef.current !== null) {
				window.clearTimeout(resetTimeoutRef.current)
				resetTimeoutRef.current = null
			}

			const response = await fetch(`/resume/${language}`)

			if (!response.ok) {
				throw new Error(`Failed to download resume for ${language}`)
			}

			const blob = await response.blob()
			const objectUrl = URL.createObjectURL(blob)
			const link = document.createElement('a')

			link.href = objectUrl
			link.download = getDownloadFilename(
				response.headers.get('content-disposition'),
				language
			)
			document.body.appendChild(link)
			link.click()
			link.remove()
			URL.revokeObjectURL(objectUrl)

			setStatus('success')
			resetTimeoutRef.current = window.setTimeout(() => {
				setStatus('idle')
				setActiveLanguage(null)
				resetTimeoutRef.current = null
			}, 4000)
		} catch (error) {
			console.error(error)
			setStatus('idle')
			setActiveLanguage(null)
		}
	}

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger render={<RainbowButton variant='outline' />}>
				Resume
				<FileDownIcon />
			</DropdownMenuTrigger>
			<DropdownMenuContent className='min-w-44'>
				{LANGUAGES.map((language) => (
					<DropdownMenuItem
						key={language}
						disabled={status !== 'idle'}
						onSelect={(event) => {
							event.preventDefault()
							void handleDownload(language)
						}}
						className='data-disabled:cursor-wait data-disabled:opacity-60'
					>
						{activeLanguage === language && status === 'loading' ? (
							<LoaderCircleIcon
								className='size-4 animate-spin text-muted-foreground'
								aria-hidden='true'
							/>
						) : activeLanguage === language && status === 'success' ? (
							<CheckIcon className='size-4 text-green-600' aria-hidden='true' />
						) : (
							<span aria-hidden='true'>{LANGUAGE_MAP[language].emoji}</span>
						)}
						<span>
							{activeLanguage === language && status === 'success'
								? THANK_YOU_LABELS[language]
								: LANGUAGE_MAP[language].name}
						</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
