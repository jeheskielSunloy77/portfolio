'use client'

import { useEffect, useState } from 'react'
import { Particles } from './ui/particles'

export function BackgroundParticles() {
	const [color, setColor] = useState('#000000')

	useEffect(() => {
		const isDark = document.documentElement.classList.contains('dark')
		setColor(isDark ? '#ffffff' : '#000000')

		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.attributeName === 'class') {
					const isDarkNow = document.documentElement.classList.contains('dark')
					setColor(isDarkNow ? '#ffffff' : '#000000')
				}
			})
		})

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		})

		return () => observer.disconnect()
	}, [])

	return (
		<Particles
			className='fixed inset-0 -z-10 opacity-80'
			quantity={100}
			staticity={30}
			ease={50}
			size={0.6}
			refresh
			color={color}
		/>
	)
}
