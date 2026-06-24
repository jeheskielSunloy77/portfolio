export const EXIT_INTENT_SKETCH_STORAGE_KEY = 'portfolio_has_added_sketch'
export const EXIT_INTENT_DISMISSED_KEY = 'portfolio_exit_intent_dismissed'
export const EXIT_INTENT_POPPED_KEY = 'portfolio_exit_intent_popped'

export function hasAddedSketch(): boolean {
	if (typeof window === 'undefined') return false
	return localStorage.getItem(EXIT_INTENT_SKETCH_STORAGE_KEY) === 'true'
}

export function markSketchAdded(): void {
	if (typeof window === 'undefined') return
	localStorage.setItem(EXIT_INTENT_SKETCH_STORAGE_KEY, 'true')
}

export function shouldSuppressExitIntent(): boolean {
	if (typeof window === 'undefined') return true
	if (hasAddedSketch()) return true
	if (sessionStorage.getItem(EXIT_INTENT_DISMISSED_KEY) === 'true') return true
	if (sessionStorage.getItem(EXIT_INTENT_POPPED_KEY) === 'true') return true
	return false
}