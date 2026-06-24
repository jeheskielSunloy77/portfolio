import { Binary } from 'mongodb'
import { describe, expect, it } from 'vitest'
import { toImageBuffer, webpBase64ToBinary } from './sketch-image.server'

describe('sketch-image.server', () => {
	it('reads node buffers for stored images', () => {
		const buffer = Buffer.from('hello')
		expect(toImageBuffer(buffer)?.toString()).toBe('hello')
	})

	it('reads mongodb binary payloads', () => {
		const source = Buffer.from('webp-bytes')
		const binary = new Binary(source, Binary.SUBTYPE_BYTE_ARRAY)
		expect(toImageBuffer(binary)?.toString()).toBe('webp-bytes')
	})

	it('encodes uploaded webp as mongodb binary', () => {
		const binary = webpBase64ToBinary('aGVsbG8=')
		expect(Buffer.from(binary.buffer).toString()).toBe('hello')
	})
})