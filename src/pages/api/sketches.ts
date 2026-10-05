import { SKETCHES_PAGE_SIZE } from '@/lib/sketch-constants'
import { webpBase64ToBinary } from '@/lib/sketch-image.server'
import { getSketches } from '@/lib/sketches'
import { getDbAdapter } from '@/lib/db'
import { log } from '@/lib/utils'
import z from 'zod'

function jsonResponse(
	data: unknown,
	status = 200,
	extraHeaders?: Record<string, string>,
) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...extraHeaders,
		},
	})
}

function errResponse(tag: string, message: string, status = 500) {
	log('error', tag, message)
	return jsonResponse({ error: message }, status)
}

export async function GET(request: Request) {
	const TAG = 'SketchesApiGet'

	try {
		const url = new URL(request.url)
		const page = Math.max(0, Number(url.searchParams.get('page') ?? '0'))
		const pageSize = Math.max(
			1,
			Number(url.searchParams.get('pageSize') ?? String(SKETCHES_PAGE_SIZE)),
		)

		const result = await getSketches(page, pageSize)

		return jsonResponse(result, 200, {
			'Cache-Control': 'private, no-store',
		})
	} catch (e: any) {
		return errResponse(TAG, 'Failed to fetch sketches')
	}
}

export async function POST({ request }: { request: Request }) {
	const TAG = 'SketchesApiPOST'

	try {
		const body = await request.json()

		const parsed = sketchInsertSchema.safeParse(body)
		if (!parsed.success) return errResponse(TAG, 'Invalid request body', 400)

		const adapter = await getDbAdapter()
		if (!adapter) {
			return errResponse(
				TAG,
				'Visitor wall is currently disabled (database unconfigured).',
				503,
			)
		}

		const ip =
			request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
			request.headers.get('x-real-ip') ||
			request.headers.get('cf-connecting-ip') ||
			'unknown'

		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
		const recentCount = await adapter.countRecentSketchesByIp(ip, oneHourAgo)
		if (recentCount >= 5) {
			return jsonResponse({ error: 'Rate limit exceeded' }, 429)
		}

		const result = await adapter.createSketch({
			name: parsed.data.name,
			message: parsed.data.message,
			image: webpBase64ToBinary(parsed.data.imageWebp),
			ip,
		})

		log('info', TAG, `New sketch submitted from IP ${ip} with id ${result._id}`)
		return jsonResponse(result, 201)
	} catch (e: any) {
		return errResponse(TAG, 'Failed to save sketch')
	}
}

const sketchInsertSchema = z.object({
	name: z.string(),
	message: z.string(),
	imageWebp: z.string().min(1),
})