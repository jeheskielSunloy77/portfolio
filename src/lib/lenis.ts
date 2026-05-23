import Lenis from 'lenis'
import { prepareRevealGroups } from './motion'

let lenis: Lenis | null = null

export function initSmoothScroll() {
	if (typeof window === 'undefined') return
	if (lenis) return lenis

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
	if (prefersReducedMotion) return null

	prepareRevealGroups()

	lenis = new Lenis({
		duration: 1.8,
		easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
		orientation: 'vertical',
		gestureOrientation: 'vertical',
		smoothWheel: true,
		wheelMultiplier: 1,
		touchMultiplier: 1,
		infinite: false,
		autoRaf: true,
	})

	const unrevealed = new Set<HTMLElement>()

	function initUnrevealed() {
		unrevealed.clear()
		document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
			if (el.dataset.revealVisible !== 'true') unrevealed.add(el)
		})
	}

	function checkReveals() {
		if (unrevealed.size === 0) return
		const vh = window.innerHeight
		for (const el of unrevealed) {
			const rect = el.getBoundingClientRect()
			if (rect.top < vh * 0.92) {
				const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0)
				if (visible > rect.height * 0.16) {
					el.dataset.revealVisible = 'true'
					unrevealed.delete(el)
				}
			}
		}
	}

	lenis.on('scroll', checkReveals)
	initUnrevealed()
	checkReveals()

	return lenis
}
