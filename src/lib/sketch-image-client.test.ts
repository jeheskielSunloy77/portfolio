import { describe, expect, test } from 'vitest'
import { sketchImageSrc, sketchImageUrl } from './sketch-image-client'

describe('sketchImageUrl', () => {
	test('returns API path for sketch id', () => {
		expect(sketchImageUrl('abc123')).toBe('/api/sketches/abc123/image')
	})
})

describe('sketchImageSrc', () => {
	test('returns API path for persisted sketches', () => {
		expect(sketchImageSrc({ _id: 'abc123' })).toBe('/api/sketches/abc123/image')
	})

	test('returns data URL for optimistic sketches', () => {
		expect(
			sketchImageSrc({ _id: 'temp-123', imageWebp: 'Zm9v' }),
		).toBe('data:image/webp;base64,Zm9v')
	})

	test('falls back to API path when optimistic sketch lacks image data', () => {
		expect(sketchImageSrc({ _id: 'temp-123' })).toBe(
			'/api/sketches/temp-123/image',
		)
	})
})