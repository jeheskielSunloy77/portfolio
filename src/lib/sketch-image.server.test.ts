import { describe, expect, it } from 'vitest'
import { rasterizeSvgToWebp, toImageBuffer } from './sketch-rasterize.server'

describe('sketch-image.server', () => {
	it('converts svg to webp bytes', async () => {
		const svg =
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#000000"/></svg>'
		const webp = await rasterizeSvgToWebp(svg)

		expect(webp.byteLength).toBeGreaterThan(0)
		expect(webp.subarray(0, 4).toString('ascii')).toBe('RIFF')
	})

	it('reads node buffers for stored images', () => {
		const buffer = Buffer.from('hello')
		expect(toImageBuffer(buffer)?.toString()).toBe('hello')
	})
})