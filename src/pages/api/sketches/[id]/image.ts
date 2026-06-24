import { SKETCH_IMAGE_MIME_TYPE } from '@/lib/sketch-constants'
import { getSketchImageBuffer } from '@/lib/sketch-image.server'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ params }) => {
	const id = params.id
	if (!id) {
		return new Response('Not found', { status: 404 })
	}

	try {
		const buffer = await getSketchImageBuffer(id)
		if (!buffer) {
			return new Response('Not found', { status: 404 })
		}

		return new Response(new Uint8Array(buffer), {
			status: 200,
			headers: {
				'Content-Type': SKETCH_IMAGE_MIME_TYPE,
				'Cache-Control': 'public, max-age=31536000, immutable',
			},
		})
	} catch {
		return new Response('Failed to load sketch image', { status: 500 })
	}
}