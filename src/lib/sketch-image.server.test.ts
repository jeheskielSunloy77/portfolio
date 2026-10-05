import { Binary } from 'mongodb'
import { describe, expect, it, vi } from 'vitest'
import {
	getSketchImageBuffer,
	toImageBuffer,
	webpBase64ToBinary,
} from './sketch-image.server'

const mockGetSketchImageBuffer = vi.fn()

vi.mock('@/lib/db', () => ({
	getDbAdapter: vi.fn(() => ({
		getSketchImageBuffer: mockGetSketchImageBuffer,
	})),
}))

describe('sketch-image.server', () => {
	it('reads node buffers for stored images', () => {
		const buffer = Buffer.from('hello')
		expect(toImageBuffer(buffer)?.toString()).toBe('hello')
	})

	it('reads mongodb binary payloads and Uint8Arrays', () => {
		const source = Buffer.from('webp-bytes')
		const binary = new Binary(source, Binary.SUBTYPE_BYTE_ARRAY)
		expect(toImageBuffer(binary)?.toString()).toBe('webp-bytes')

		const uint8 = new Uint8Array(source)
		expect(toImageBuffer(uint8)?.toString()).toBe('webp-bytes')
	})

	it('encodes uploaded webp base64 to buffer', () => {
		const binary = webpBase64ToBinary('aGVsbG8=')
		expect(binary.toString()).toBe('hello')
	})

	it('fetches image buffer from db adapter', async () => {
		mockGetSketchImageBuffer.mockResolvedValueOnce(Buffer.from('image-data'))
		const res = await getSketchImageBuffer('any-valid-id-123')
		expect(res?.toString()).toBe('image-data')
		expect(mockGetSketchImageBuffer).toHaveBeenCalledWith('any-valid-id-123')
	})

	it('returns null for empty id', async () => {
		const res = await getSketchImageBuffer('')
		expect(res).toBeNull()
	})
})