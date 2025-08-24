import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'
import { dictionary } from '@/i18n/dictionary'
import { DEFAULT_LANGUAGE } from '@/i18n/i18n'
import { $isChatBotVisible } from '@/stores/chat-bot'
import { useStore } from '@nanostores/react'
import { Bot, BotOff, Moon, Sun } from 'lucide-react'

const t = dictionary[DEFAULT_LANGUAGE]

export function ChatToggle() {
	const isVisible = useStore($isChatBotVisible)

	function toggle() {
		$isChatBotVisible.set(!isVisible)
	}

	return (
		<Button size='icon' variant='ghost' onClick={toggle}>
			{isVisible ? <Bot className='size-5' /> : <BotOff className='size-5' />}
			<span className='sr-only'>{t['Chat Toggle']}</span>
		</Button>
	)
}

export function ThemeToggle() {
	const { theme, toggle } = useTheme()

	return (
		<Button size='icon' variant='ghost' onClick={toggle}>
			{theme === 'dark' ? (
				<Sun className='size-4 text-orange-300' />
			) : (
				<Moon className='size-4 text-indigo-500' />
			)}
			<span className='sr-only'>{t['Theme Toggle']}</span>
		</Button>
	)
}
