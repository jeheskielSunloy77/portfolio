import '@testing-library/jest-dom'

// Provide a simple ResizeObserver mock for the test environment.
// Some UI primitives rely on ResizeObserver, which jsdom doesn't provide by default.
class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}

;(global as any).ResizeObserver =
	(global as any).ResizeObserver || ResizeObserverMock

if (typeof HTMLElement !== 'undefined') {
	// Polyfill pointer capture methods used by interactive UI primitives.
	// jsdom doesn't implement PointerEvent API fully; provide no-op implementations
	// so components that call these methods won't throw during tests.
	;(HTMLElement.prototype as any).hasPointerCapture =
		(HTMLElement.prototype as any).hasPointerCapture || (() => false)
	;(HTMLElement.prototype as any).releasePointerCapture =
		(HTMLElement.prototype as any).releasePointerCapture || (() => {})

	// Polyfill DOM scrolling methods used by positioned/interactive components.
	;(HTMLElement.prototype as any).scrollIntoView =
		(HTMLElement.prototype as any).scrollIntoView || (() => {})
}

// Also provide Element-level polyfill if needed
if (typeof Element !== 'undefined') {
	;(Element.prototype as any).scrollIntoView =
		(Element.prototype as any).scrollIntoView || (() => {})
}

if (typeof window !== 'undefined') {
	;(window as any).matchMedia =
		(window as any).matchMedia ||
		((query: string) => ({
			matches: false,
			media: query,
			addEventListener: () => {},
			removeEventListener: () => {},
		}))
}
