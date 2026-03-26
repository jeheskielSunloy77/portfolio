import { LANGUAGE_MAP, LANGUAGES, type Language } from '@/i18n/i18n'
import { CheckCircle2, FileDownIcon, LoaderCircleIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { RainbowButton } from './magicui/rainbow-button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'

const THANK_YOU_LABELS: Record<Language, string> = {
	en: 'Thank You 🙏',
	id: 'Terima Kasih 🙏',
}

export function ResumeButton() {
	const [open, setOpen] = useState(false)
	const [statuses, setStatuses] = useState<
		Record<Language, 'idle' | 'loading' | 'success'>
	>(
		() =>
			Object.fromEntries(
				LANGUAGES.map((language) => [language, 'idle']),
			) as Record<Language, 'idle' | 'loading' | 'success'>,
	)
	const isDownloading = Object.values(statuses).includes('loading')
	const resetTimeoutRef = useRef<Partial<Record<Language, number>>>({})
	const statusesRef = useRef(statuses)

	useEffect(() => {
		statusesRef.current = statuses
	}, [statuses])

	function hasPendingDownloads(
		nextStatuses: Record<Language, 'idle' | 'loading' | 'success'>,
	) {
		return Object.values(nextStatuses).some((status) => status !== 'idle')
	}

	useEffect(() => {
		return () => {
			for (const timeoutId of Object.values(resetTimeoutRef.current)) {
				if (timeoutId !== undefined) {
					window.clearTimeout(timeoutId)
				}
			}
		}
	}, [])

	function showSuccessState(language: Language) {
		setStatuses((current) => ({ ...current, [language]: 'success' }))
		resetTimeoutRef.current[language] = window.setTimeout(() => {
			const nextStatuses: Record<Language, 'idle' | 'loading' | 'success'> = {
				...statusesRef.current,
				[language]: 'idle',
			}

			setStatuses(nextStatuses)

			if (!hasPendingDownloads(nextStatuses)) {
				setOpen(false)
			}

			delete resetTimeoutRef.current[language]
		}, 4000)
	}

	async function handleDownload(language: Language) {
		if (isDownloading) {
			return
		}

		setOpen(true)
		setStatuses((current) => ({ ...current, [language]: 'loading' }))

		try {
			if (resetTimeoutRef.current[language] !== undefined) {
				window.clearTimeout(resetTimeoutRef.current[language])
				delete resetTimeoutRef.current[language]
			}

			const link = document.createElement('a')
			link.href = `/resume/${language}`
			link.download = `resume-${language}.pdf`
			document.body.appendChild(link)
			link.click()
			link.remove()
			await new Promise((resolve) => setTimeout(resolve, 2000))
			showSuccessState(language)
		} catch {
			setStatuses((current) => ({ ...current, [language]: 'idle' }))
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
						disabled={isDownloading}
						closeOnClick={false}
						onClick={() => handleDownload(language)}
					>
						{statuses[language] === 'loading' ? (
							<LoaderCircleIcon
								className='size-[18px] animate-spin text-muted-foreground'
								aria-hidden='true'
							/>
						) : statuses[language] === 'success' ? (
							<CheckCircle2
								className='size-[18px] text-green-600 dark:text-green-500'
								aria-hidden='true'
							/>
						) : (
							<span aria-hidden='true'>{LANGUAGE_MAP[language].emoji}</span>
						)}
						<span>
							{statuses[language] === 'success'
								? THANK_YOU_LABELS[language]
								: LANGUAGE_MAP[language].name}
						</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
