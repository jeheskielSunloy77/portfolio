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
import {
	getPathnameWithoutLang,
	LANGUAGE_MAP,
	LANGUAGES,
	type Language,
} from '@/i18n/i18n'
import { $isChatBotVisible } from '@/stores/chat-bot'
import { useStore } from '@nanostores/react'
import {
	Bot,
	BotOff,
	CalendarIcon,
	HomeIcon,
	Languages,
	MailIcon,
	Moon,
	PenLineIcon,
	Sun,
	UsersIcon,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { Dock, DockIcon } from '@/components/magicui/dock'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Dictionary, LocalizedString } from '@/lib/types'
import { cn } from '@/lib/utils'

function ChatToggle() {
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

function ThemeToggle() {
	const { theme, toggle, buttonRef } = useTheme()

	return (
		<Button size='icon' variant='ghost' ref={buttonRef} onClick={toggle}>
			{theme === 'dark' ? (
				<Sun className='size-4 text-orange-300' />
			) : (
				<Moon className='size-4 text-indigo-500' />
			)}
			<span className='sr-only'>Theme Toggle</span>
		</Button>
	)
}
function LanguageDropdown(props: {
	lang: Language
	pathname: string
	children: React.ReactNode
	label: LocalizedString
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>{props.label}</DropdownMenuLabel>
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

function DockNavbar(props: {
	lang: Language
	pathname: string
	t: Dictionary
}) {
	const { t, lang, pathname } = props

	const { theme, toggle: toggleTheme, buttonRef: themeButtonRef } = useTheme()

	const isChatBotVisible = useStore($isChatBotVisible)

	const navItems = [
		{ label: t['home'], href: `/${lang}`, icon: HomeIcon },
		{
			label: t['projects'],
			href: `/${lang}/projects`,
			icon: CalendarIcon,
		},
		{ label: t['blog'], href: `/${lang}/blog`, icon: PenLineIcon },
		{ label: t['contact'], href: `/${lang}/contact`, icon: MailIcon },
		{ label: t['visitors'], href: `/${lang}/visitors`, icon: UsersIcon },
	]

	return (
		<TooltipProvider>
			<Dock direction='middle'>
				{navItems.map((item, i) => {
					const isActive = pathname === item.href || pathname === `${item.href}/`

					return (
						<DockIcon key={i}>
							<Tooltip>
								<TooltipTrigger asChild>
									<a
										href={item.href}
										aria-label={item.label}
										className={cn(
											buttonVariants({
												variant: isActive ? 'default' : 'ghost',
												size: 'icon',
											}),
											'size-12 rounded-full'
										)}
									>
										<item.icon className='size-4' />
									</a>
								</TooltipTrigger>
								<TooltipContent>
									<p>{item.label}</p>
								</TooltipContent>
							</Tooltip>
						</DockIcon>
					)
				})}
				<Separator orientation='vertical' className='h-full' />
				<DockIcon>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								onClick={toggleTheme}
								ref={themeButtonRef}
								aria-label={t['toggle theme']}
								variant='ghost'
								size='icon'
								className='size-12 rounded-full'
							>
								{theme === 'dark' ? (
									<Sun className='size-4' />
								) : (
									<Moon className='size-4' />
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>{t['toggle theme']}</p>
						</TooltipContent>
					</Tooltip>
				</DockIcon>
				<DockIcon>
					<Tooltip>
						<TooltipTrigger asChild>
							<LanguageDropdown
								label='languages'
								lang={lang}
								pathname={getPathnameWithoutLang(pathname, lang)}
							>
								<Button
									aria-label={t['toggle language']}
									variant='ghost'
									size='icon'
									className='size-12 rounded-full'
								>
									<Languages className='size-4' />
								</Button>
							</LanguageDropdown>
						</TooltipTrigger>
						<TooltipContent>
							<p>{t['toggle language']}</p>
						</TooltipContent>
					</Tooltip>
				</DockIcon>
				<DockIcon>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								aria-label={t['toggle chat']}
								variant='ghost'
								size='icon'
								className='size-12 rounded-full'
								onClick={() => ($isChatBotVisible.set(!isChatBotVisible), true)}
							>
								<Bot className='size-4' />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>{t['toggle chat']}</p>
						</TooltipContent>
					</Tooltip>
				</DockIcon>
			</Dock>
		</TooltipProvider>
	)
}

export function Navbar(props: {
	lang: Language
	pathname: string
	dockNavbar?: boolean
	t: Dictionary
}) {
	const { t, lang, pathname, dockNavbar = true } = props

	const navItems = [
		{ label: t['projects'], href: `/${lang}/projects` },
		{ label: t['blog'], href: `/${lang}/blog` },
		{ label: t['contact'], href: `/${lang}/contact` },
		{ label: t['visitors'], href: `/${lang}/visitors` },
	]

	const [isHeaderNavbarVisible, setIsHeaderNavbarVisible] =
		useState<boolean>(true)
	const [isMobile, setIsMobile] = useState<boolean>(false)

	useEffect(() => {
		if (typeof window === 'undefined') return
		const mq = window.matchMedia('(max-width: 639px)')
		const onChange = (e: any) => setIsMobile(!!e.matches)

		mq.addEventListener('change', onChange)

		setIsMobile(mq.matches)

		return () => mq.removeEventListener('change', onChange)
	}, [])

	useEffect(() => {
		if (typeof window === 'undefined') {
			setIsHeaderNavbarVisible(true)
			return
		}

		// on mobile we don't render the header; force header hidden
		if (isMobile) {
			setIsHeaderNavbarVisible(false)
			return
		}

		const el = document.getElementById('headerNavbar')
		if (!el) {
			setIsHeaderNavbarVisible(false)
			return
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0]
				setIsHeaderNavbarVisible(!!entry && entry.isIntersecting)
			},
			{ root: null, threshold: 0 }
		)

		observer.observe(el)

		return () => observer.disconnect()
	}, [isMobile])

	return (
		<>
			{!isMobile && (
				<header
					id='headerNavbar'
					className='z-50 w-full bg-background/60 backdrop-blur-2xl'
				>
					<div className='mx-auto max-w-3xl px-8 py-6'>
						<nav className='flex items-center justify-between'>
							<a href={`/${lang}`} className='hover:text-foreground hover:underline'>
								{t['home']}
							</a>
							<div className='flex items-center gap-4'>
								<ul className='flex gap-4'>
									{navItems.map((nav) => {
										const isActive = pathname === nav.href || pathname === `${nav.href}/`

										return (
											<li
												key={nav.label}
												className={
													isActive
														? 'underline font-semibold'
														: 'hover:text-foreground hover:underline'
												}
											>
												<a href={nav.href}>{nav.label}</a>
											</li>
										)
									})}
								</ul>
								<div className='flex gap-2'>
									<LanguageDropdown
										label='languages'
										lang={lang}
										pathname={getPathnameWithoutLang(pathname, lang)}
									>
										<Button size='icon' variant='ghost'>
											<Languages />
											<span className='sr-only'>{t['toggle language']}</span>
										</Button>
									</LanguageDropdown>
									<ChatToggle />
									<ThemeToggle />
								</div>
							</div>
						</nav>
					</div>
				</header>
			)}
			{dockNavbar && (
				<AnimatePresence>
					{(isMobile || !isHeaderNavbarVisible) && (
						<motion.nav
							initial={{ opacity: 0, y: 24 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 24 }}
							transition={{ duration: 0.25 }}
							className='fixed bottom-4 left-1/2 -translate-x-1/2 z-50'
						>
							<DockNavbar
								lang={lang}
								pathname={pathname}
								t={t}
							/>
						</motion.nav>
					)}
				</AnimatePresence>
			)}
		</>
	)
}
