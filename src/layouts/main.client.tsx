import { Button } from '@/components/ui/button'
import { Bot, BotOff, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ChatToggle() {
	const [isVisible, setIsVisible] = useState(false)

	return (
		<Button size='icon' variant='ghost' onClick={() => setIsVisible(!isVisible)}>
			{isVisible ? <Bot className='size-5' /> : <BotOff className='size-5' />}
			<span className='sr-only'>Chat Toggle</span>
		</Button>
	)
}

type Theme = 'light' | 'dark'

export function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>('light')

	useEffect(() => {
		const stored = localStorage.getItem('theme')
		if (stored) {
			setTheme(stored as Theme)
			document.documentElement.classList.toggle('dark', stored === 'dark')
		} else {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
			setTheme(prefersDark ? 'dark' : 'light')
			document.documentElement.classList.toggle('dark', prefersDark)
		}
	}, [])

	const toggleTheme = () => {
		const newTheme = theme === 'light' ? 'dark' : 'light'
		setTheme(newTheme)
		document.documentElement.classList.toggle('dark', newTheme === 'dark')
		localStorage.setItem('theme', newTheme)
	}

	return (
		<Button size='icon' variant='ghost' onClick={toggleTheme}>
			{theme === 'dark' ? (
				<Sun className='size-4 text-orange-300' />
			) : (
				<Moon className='size-4 text-indigo-500' />
			)}
			<span className='sr-only'>Theme Toggle</span>
		</Button>
	)
}
