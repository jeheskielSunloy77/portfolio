import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
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
import {
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
import { useEffect, useState, type ReactElement, type ReactNode } from 'react'

import { Dock, DockIcon } from '@/components/magicui/dock'
import { buttonVariants } from '@/components/ui/button'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Dictionary, LocalizedString } from '@/lib/types'
import { cn } from '@/lib/utils'

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
	languageSwitchUrls?: Partial<Record<Language, string>>
	children: ReactNode
	label: LocalizedString
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={props.children as ReactElement} />
			<DropdownMenuContent className='min-w-44'>
				<DropdownMenuGroup>
					<DropdownMenuLabel>{props.label}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{LANGUAGES.map((lang) => (
						<DropdownMenuItem
							key={lang}
							render={
								<a
									href={props.languageSwitchUrls?.[lang] ?? `/${lang}${props.pathname}`}
								/>
							}
						>
							{LANGUAGE_MAP[lang].emoji} {LANGUAGE_MAP[lang].name}
						</DropdownMenuItem>
					))}
				</DropdownMenuGroup>
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

	const navItems = [
		{ label: t['home'], href: `/${lang}`, icon: HomeIcon },
		{
			label: t['projects'],
			href: `/${lang}/projects`,
			icon: CalendarIcon,
		},
		{
			label: t['blog'],
			href: `/${lang}/blog`,
			icon: PenLineIcon,
		},
		{
			label: t['contact'],
			href: `/${lang}/contact`,
			icon: MailIcon,
		},
		{
			label: t['visitors'],
			href: `/${lang}/visitors`,
			icon: UsersIcon,
		},
	]

	return (
		<TooltipProvider>
			<Dock direction='middle'>
				{navItems.map((item, i) => {
					const isActive = pathname === item.href || pathname === `${item.href}/`

					return (
						<DockIcon key={i}>
							<Tooltip>
								<TooltipTrigger
									render={
										<a
											href={item.href}
											aria-label={item.label}
											className={cn(
												buttonVariants({
													variant: isActive ? 'default' : 'ghost',
													size: 'icon',
												}),
												'size-12 rounded-full',
											)}
										/>
									}
								>
									<item.icon className='size-4' />
								</TooltipTrigger>
								<TooltipContent>
									<p>{item.label}</p>
								</TooltipContent>
							</Tooltip>
						</DockIcon>
					)
				})}
			</Dock>
		</TooltipProvider>
	)
}

export function Navbar(props: {
	lang: Language
	pathname: string
	languageSwitchUrls?: Partial<Record<Language, string>>
	dockNavbar?: boolean
	t: Dictionary
}) {
	const { t, lang, pathname, languageSwitchUrls, dockNavbar = true } = props

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
			{ root: null, threshold: 0 },
		)

		observer.observe(el)

		return () => observer.disconnect()
	}, [isMobile])

	return (
		<>
			{!isMobile && (
				<motion.header
					id='headerNavbar'
					initial={{ opacity: 0, y: -18 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
					className='z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-2xl'
				>
					<div className='mx-auto max-w-3xl px-8 py-6'>
						<nav className='flex items-center justify-between'>
							<a
								href={`/${lang}`}
								className='motion-link hover:text-foreground hover:underline'
							>
								{t['home']}
							</a>
							<div className='flex items-center gap-4'>
								<ul className='flex gap-4'>
									{navItems.map((nav) => {
										const isActive = pathname === nav.href || pathname === `${nav.href}/`

										return (
											<li
												key={nav.label}
												className={isActive ? 'font-semibold underline' : ''}
											>
												<a
													href={nav.href}
													className='motion-link hover:text-foreground hover:underline'
												>
													{nav.label}
												</a>
											</li>
										)
									})}
								</ul>
								<div className='flex gap-2'>
									<LanguageDropdown
										label='languages'
										lang={lang}
										pathname={getPathnameWithoutLang(pathname, lang)}
										languageSwitchUrls={languageSwitchUrls}
									>
										<Button size='icon' variant='ghost'>
											<Languages />
											<span className='sr-only'>{t['toggle language']}</span>
										</Button>
									</LanguageDropdown>
									<ThemeToggle />
								</div>
							</div>
						</nav>
					</div>
				</motion.header>
			)}
			{dockNavbar && (
				<AnimatePresence>
					{(isMobile || !isHeaderNavbarVisible) && (
						<motion.nav
							initial={{ opacity: 0, y: 28, scale: 0.94 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 28, scale: 0.94 }}
							transition={{ type: 'spring', stiffness: 320, damping: 26 }}
							className='fixed bottom-4 left-1/2 -translate-x-1/2 z-50'
						>
							<DockNavbar lang={lang} pathname={pathname} t={t} />
						</motion.nav>
					)}
				</AnimatePresence>
			)}
		</>
	)
}
