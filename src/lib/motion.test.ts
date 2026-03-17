import { initRevealObserver } from './motion'

function mockMatchMedia(reduceMotion: boolean) {
	return (query: string) => ({
		matches: query === '(prefers-reduced-motion: reduce)' ? reduceMotion : false,
		media: query,
		addEventListener: () => {},
		removeEventListener: () => {},
	})
}

describe('initRevealObserver', () => {
	test('reveals all elements immediately for reduced-motion users', () => {
		;(window as any).matchMedia = mockMatchMedia(true)

		const container = document.createElement('div')
		container.innerHTML = `
			<div data-reveal-group>
				<div data-reveal="fade-up"></div>
				<div data-reveal="scale-in" data-reveal-delay="140"></div>
			</div>
		`

		initRevealObserver(container)

		const revealItems = container.querySelectorAll<HTMLElement>('[data-reveal]')
		expect(revealItems[0].dataset.revealVisible).toBe('true')
		expect(revealItems[1].dataset.revealVisible).toBe('true')
		expect(revealItems[1].style.getPropertyValue('--reveal-delay')).toBe('140ms')
	})

	test('observes elements, applies staggered delay, and reveals once intersecting', () => {
		;(window as any).matchMedia = mockMatchMedia(false)

		const observed: Element[] = []
		const unobserved: Element[] = []
		let observerCallback: IntersectionObserverCallback | undefined

		;(window as any).IntersectionObserver = class {
			constructor(callback: IntersectionObserverCallback) {
				observerCallback = callback
			}

			observe(element: Element) {
				observed.push(element)
			}

			unobserve(element: Element) {
				unobserved.push(element)
			}

			disconnect() {}
		}

		const container = document.createElement('div')
		container.innerHTML = `
			<div data-reveal-group>
				<div id="first" data-reveal="fade-up"></div>
				<div id="second" data-reveal="scale-in"></div>
			</div>
		`

		initRevealObserver(container)

		const first = container.querySelector<HTMLElement>('#first')!
		const second = container.querySelector<HTMLElement>('#second')!

		expect(observed).toHaveLength(2)
		expect(first.style.getPropertyValue('--reveal-delay')).toBe('0ms')
		expect(second.style.getPropertyValue('--reveal-delay')).toBe('90ms')

		observerCallback?.(
			[
				{
					target: second,
					isIntersecting: true,
				} as unknown as IntersectionObserverEntry,
			],
			{} as IntersectionObserver
		)

		expect(second.dataset.revealVisible).toBe('true')
		expect(unobserved).toContain(second)
		expect(first.dataset.revealVisible).toBeUndefined()
	})
})
