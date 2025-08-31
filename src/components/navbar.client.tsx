import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/hooks/use-theme'
import { LANGUAGE_MAP, LANGUAGES, type Language } from '@/i18n/i18n'
import { $isChatBotVisible } from '@/stores/chat-bot'
import { useStore } from '@nanostores/react'
import { Bot, BotOff, Languages, Moon, Sun } from 'lucide-react'

export function ChatToggle() {
	const isVisible = useStore($isChatBotVisible)

	function toggle() {
		$isChatBotVisible.set(!isVisible)
	}
	if (isVisible) return

	return (
		<Button size='icon' variant='ghost' onClick={toggle}>
			{isVisible ? <Bot className='size-5' /> : <BotOff className='size-5' />}
			<span className='sr-only'>Chat Toggle</span>
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
			<span className='sr-only'>Theme Toggle</span>
		</Button>
	)
}
export function LanguageToggle(props: { lang: Language; pathname: string }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button size='icon' variant='ghost'>
					<Languages />
					<span className='sr-only'>Language Toggle</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Languages</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{LANGUAGES.map((lang) => (
					<DropdownMenuItem key={lang} asChild>
						<a href={`/${lang}${props.pathname}`}>
							{LANGUAGE_MAP[lang].emoji} {LANGUAGE_MAP[lang].name}
						</a>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
