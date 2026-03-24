'use client'

import { useEffect, useState } from 'react'
import { Particles } from './ui/particles'

export function BackgroundParticles() {
	const [isEnabled, setIsEnabled] = useState(false)
	const [color, setColor] = useState('#000000')

	useEffect(() => {
		const updateState = () => {
			const isDark = document.documentElement.classList.contains('dark')
			const prefersReducedMotion = window.matchMedia(
				'(prefers-reduced-motion: reduce)',
			).matches
			const isLargeViewport = window.matchMedia('(min-width: 1024px)').matches

			setColor(isDark ? '#ffffff' : '#000000')
			setIsEnabled(!prefersReducedMotion && isLargeViewport)
		}

		updateState()

		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.attributeName === 'class') {
					updateState()
				}
			})
		})

		window.addEventListener('resize', updateState)

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		})

		return () => {
			observer.disconnect()
			window.removeEventListener('resize', updateState)
		}
	}, [])

	if (!isEnabled) {
		return null
	}

	return (
		<Particles
			className='fixed inset-0 -z-10 opacity-80'
			quantity={40}
			staticity={36}
			ease={80}
			size={0.55}
			color={color}
		/>
	)
}
