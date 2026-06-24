import {
	SKETCH_IMAGE_SIZE,
	SKETCH_IMAGE_WEBP_QUALITY,
} from '@/lib/sketch-constants'

export function sketchImageUrl(id: string) {
	return `/api/sketches/${id}/image`
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.onload = () => resolve(img)
		img.onerror = () => reject(new Error('Failed to load sketch preview'))
		img.src = src
	})
}

function blobToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			const result = reader.result
			if (typeof result !== 'string') {
				reject(new Error('Failed to encode sketch image'))
				return
			}
			const base64 = result.split(',')[1]
			if (!base64) {
				reject(new Error('Failed to encode sketch image'))
				return
			}
			resolve(base64)
		}
		reader.onerror = () => reject(new Error('Failed to encode sketch image'))
		reader.readAsDataURL(blob)
	})
}

export async function svgStringToWebpBase64(
	svg: string,
	width = SKETCH_IMAGE_SIZE,
	height = SKETCH_IMAGE_SIZE,
): Promise<string> {
	const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
	const url = URL.createObjectURL(svgBlob)

	try {
		const img = await loadImage(url)
		const canvas = document.createElement('canvas')
		canvas.width = width
		canvas.height = height
		const ctx = canvas.getContext('2d')
		if (!ctx) throw new Error('Canvas is not available')

		ctx.drawImage(img, 0, 0, width, height)

		const blob = await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob(
				(result) =>
					result
						? resolve(result)
						: reject(new Error('Failed to encode sketch image')),
				'image/webp',
				SKETCH_IMAGE_WEBP_QUALITY / 100,
			)
		})

		return blobToBase64(blob)
	} finally {
		URL.revokeObjectURL(url)
	}
}