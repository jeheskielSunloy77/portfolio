import { z } from 'zod'

export function defineCollection<T>(config: T) {
	return config
}

export async function getCollection() {
	throw new Error('astro:content test shim should be mocked in this test')
}

export async function render() {
	throw new Error('astro:content test shim should be mocked in this test')
}

export { z }
