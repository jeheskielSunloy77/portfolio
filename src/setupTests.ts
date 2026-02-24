import '@testing-library/jest-dom'

// Provide a simple ResizeObserver mock for the test environment.
// Some Radix primitives use ResizeObserver (e.g. use-size) which is not available in jsdom by default.
class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}

;(global as any).ResizeObserver =
	(global as any).ResizeObserver || ResizeObserverMock

if (typeof HTMLElement !== 'undefined') {
	// Polyfill pointer capture methods used by some Radix primitives.
	// jsdom doesn't implement PointerEvent API fully; provide no-op implementations
	// so components that call these methods won't throw during tests.
	;(HTMLElement.prototype as any).hasPointerCapture =
		(HTMLElement.prototype as any).hasPointerCapture || (() => false)
	;(HTMLElement.prototype as any).releasePointerCapture =
		(HTMLElement.prototype as any).releasePointerCapture || (() => {})

	// Polyfill DOM scrolling method used by Radix (scrollIntoView)
	;(HTMLElement.prototype as any).scrollIntoView =
		(HTMLElement.prototype as any).scrollIntoView || (() => {})
}

// Also provide Element-level polyfill if needed
if (typeof Element !== 'undefined') {
	;(Element.prototype as any).scrollIntoView =
		(Element.prototype as any).scrollIntoView || (() => {})
}
