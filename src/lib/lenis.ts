import Lenis from 'lenis'
import { initRevealObserver } from './motion'

let lenis: Lenis | null = null

export function initSmoothScroll() {
	if (typeof window === 'undefined') return
	if (lenis) return lenis

	initRevealObserver()

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
	if (prefersReducedMotion) return null

	lenis = new Lenis({
		duration: 1.0,
		easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
		orientation: 'vertical',
		gestureOrientation: 'vertical',
		smoothWheel: true,
		wheelMultiplier: 1,
		touchMultiplier: 1,
		infinite: false,
		autoRaf: true,
	})

	return lenis
}

