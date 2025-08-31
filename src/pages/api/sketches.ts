import { getDb } from '@/lib/mongodb'
import z from 'zod'

function jsonResponse(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	})
}

function errResponse(message: string, status = 500) {
	return jsonResponse({ error: message }, status)
}

const COLLECTION = import.meta.env.SKETCHES_COLLECTION

export async function GET(request: Request) {
	try {
		const url = new URL(request.url)
		const page = Math.max(0, Number(url.searchParams.get('page') ?? '0'))
		const pageSize = Math.max(1, Number(url.searchParams.get('pageSize') ?? '9'))

		const db = await getDb()
		const col = db.collection(COLLECTION)

		const total = await col.countDocuments()

		const docs = await col
			.find({}, { projection: { dataUrl: 1, name: 1, message: 1, createdAt: 1 } })
			.sort({ createdAt: -1 })
			.skip(page * pageSize)
			.limit(pageSize)
			.toArray()

		const mapped = docs.map((d: any) => ({
			_id: d._id.toString(),
			name: d.name,
			message: d.message,
			dataUrl: d.dataUrl,
			createdAt: d.createdAt,
		}))

		const hasMore = (page + 1) * pageSize < total

		return jsonResponse({
			data: mapped,
			page,
			pageSize,
			total,
			nextPage: hasMore ? page + 1 : undefined,
		})
	} catch (e: any) {
		console.error('[SKETCHES_API][GET]', e)
		return errResponse('Failed to fetch sketches')
	}
}

export async function POST({ request }: { request: Request }) {
	try {
		const body = await request.json()

		const parsed = sketchInsertSchema.safeParse(body)
		if (!parsed.success) return errResponse('Invalid request body', 400)

		const db = await getDb()
		const col = db.collection(COLLECTION)

		const ip =
			request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
			request.headers.get('x-real-ip') ||
			request.headers.get('cf-connecting-ip') ||
			'unknown'

		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
		const recentCount = await col.countDocuments({
			ip,
			createdAt: { $gte: oneHourAgo },
		})
		if (recentCount >= 5) {
			return jsonResponse(
				{
					error:
						"Rate limit exceeded. Looks like you've submitted quite a few sketches recently. Please try again later.",
				},
				429
			)
		}

		const doc = { ...parsed.data, createdAt: new Date(), ip }

		const result = {
			_id: (await col.insertOne(doc)).insertedId.toString(),
			...doc,
		}

		return jsonResponse(result, 201)
	} catch (e: any) {
		console.error('[SKETCHES_API][POST]', e)
		return errResponse('Failed to save sketch')
	}
}

const sketchInsertSchema = z.object({
	name: z.string(),
	message: z.string(),
	dataUrl: z.string(),
})
