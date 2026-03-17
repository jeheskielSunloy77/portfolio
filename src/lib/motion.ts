const REVEAL_SELECTOR = '[data-reveal]'
const GROUP_SELECTOR = '[data-reveal-group]'
const DEFAULT_STAGGER_MS = 90

function setRevealDelay(element: HTMLElement) {
	const delay = Number(element.dataset.revealDelay ?? 0)
	element.style.setProperty('--reveal-delay', `${delay}ms`)
}

function prepareRevealGroups(root: ParentNode = document) {
	root.querySelectorAll<HTMLElement>(GROUP_SELECTOR).forEach((group) => {
		const stagger = Number(group.dataset.revealStagger ?? DEFAULT_STAGGER_MS)
		const items = Array.from(group.querySelectorAll<HTMLElement>(REVEAL_SELECTOR))

		items.forEach((item, index) => {
			if (!item.dataset.revealDelay) {
				item.dataset.revealDelay = String(index * stagger)
			}
			setRevealDelay(item)
		})
	})

	root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach(setRevealDelay)
}

function revealAll(root: ParentNode = document) {
	root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((element) => {
		element.dataset.revealVisible = 'true'
	})
}

export function initRevealObserver(root: ParentNode = document) {
	if (typeof window === 'undefined') return

	prepareRevealGroups(root)

	const shouldReduceMotion = window.matchMedia(
		'(prefers-reduced-motion: reduce)'
	).matches

	if (shouldReduceMotion || !('IntersectionObserver' in window)) {
		revealAll(root)
		return
	}

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return
				const target = entry.target as HTMLElement
				target.dataset.revealVisible = 'true'
				observer.unobserve(target)
			})
		},
		{
			root: null,
			threshold: 0.16,
			rootMargin: '0px 0px -8% 0px',
		}
	)

	root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((element) => {
		if (element.dataset.revealVisible === 'true') return
		observer.observe(element)
	})
}
