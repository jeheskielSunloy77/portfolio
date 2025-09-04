import { useStore } from '@nanostores/react'
import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { theme } from '../stores/theme'

export function useTheme() {
	const $theme = useStore(theme)

	// function toggle() {
	// 	const themeToChange = $theme === 'light' ? 'dark' : 'light'
	// 	theme.set(themeToChange)

	// 	if (themeToChange === 'dark') {
	// 		document.documentElement.classList.add('dark')
	// 		document.documentElement.style.colorScheme = 'dark'
	// 	} else {
	// 		document.documentElement.classList.remove('dark')
	// 		document.documentElement.style.colorScheme = 'light'
	// 	}

	// 	localStorage.setItem('theme', themeToChange)
	// }

	const buttonRef = useRef<HTMLButtonElement | null>(null)
	const toggle = async () => {
		if (!buttonRef.current) return

		await document.startViewTransition(() => {
			flushSync(() => {
				const dark = document.documentElement.classList.toggle('dark')
				if (dark) {
					theme.set('dark')
					document.documentElement.style.colorScheme = 'dark'
					localStorage.setItem('theme', 'dark')
				} else {
					theme.set('light')
					document.documentElement.style.colorScheme = 'light'
					localStorage.setItem('theme', 'light')
				}
			})
		}).ready

		const { top, left, width, height } = buttonRef.current.getBoundingClientRect()
		const y = top + height / 2
		const x = left + width / 2

		const right = window.innerWidth - left
		const bottom = window.innerHeight - top
		const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom))

		document.documentElement.animate(
			{
				clipPath: [
					`circle(0px at ${x}px ${y}px)`,
					`circle(${maxRad}px at ${x}px ${y}px)`,
				],
			},
			{
				duration: 700,
				easing: 'ease-in-out',
				pseudoElement: '::view-transition-new(root)',
			}
		)
	}

	return { theme: $theme, toggle, buttonRef }
}
