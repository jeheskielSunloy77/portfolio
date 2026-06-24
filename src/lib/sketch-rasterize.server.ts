import {
	SKETCH_IMAGE_SIZE,
	SKETCH_IMAGE_WEBP_QUALITY,
} from '@/lib/sketch-constants'
import { Binary } from 'mongodb'
import sharp from 'sharp'

export function toImageBuffer(value: unknown): Buffer | null {
	if (!value) return null
	if (Buffer.isBuffer(value)) return value
	if (value instanceof Binary) return Buffer.from(value.buffer)
	return null
}

export async function rasterizeSvgToWebp(svg: string): Promise<Buffer> {
	const normalized = svg.includes('xmlns')
		? svg
		: svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')

	return sharp(Buffer.from(normalized), { density: 144 })
		.resize(SKETCH_IMAGE_SIZE, SKETCH_IMAGE_SIZE, {
			fit: 'contain',
			background: { r: 197, g: 197, b: 197, alpha: 0.6 },
		})
		.webp({ quality: SKETCH_IMAGE_WEBP_QUALITY })
		.toBuffer()
}

export async function rasterizeSourceToWebp(source: {
	svg?: string | null
	dataUrl?: string | null
	image?: unknown
}): Promise<Buffer | null> {
	const existing = toImageBuffer(source.image)
	if (existing) return existing

	if (source.svg) {
		return rasterizeSvgToWebp(source.svg)
	}

	if (source.dataUrl) {
		const match = source.dataUrl.match(/^data:([^;]+);base64,(.+)$/)
		if (!match) return null
		const input = Buffer.from(match[2], 'base64')
		return sharp(input)
			.resize(SKETCH_IMAGE_SIZE, SKETCH_IMAGE_SIZE, {
				fit: 'contain',
				background: { r: 197, g: 197, b: 197, alpha: 0.6 },
			})
			.webp({ quality: SKETCH_IMAGE_WEBP_QUALITY })
			.toBuffer()
	}

	return null
}