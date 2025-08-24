import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export async function tryPromise<T>(
	promise: Promise<T>
): Promise<{ data: T; error: null } | { data: null; error: Error }> {
	try {
		return { data: await promise, error: null }
	} catch (error) {
		if (error instanceof Error) return { data: null, error }
		return {
			data: null,
			error: new Error('An unknown error occurred', { cause: error }),
		}
	}
}
