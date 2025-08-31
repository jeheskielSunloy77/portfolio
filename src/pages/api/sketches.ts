import { getDb } from '@/lib/mongodb'

function jsonResponse(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	})
}

function errResponse(message: string, status = 500) {
	return jsonResponse({ error: message }, status)
}

export async function GET(request: Request) {
	try {
		const url = new URL(request.url)
		const page = Math.max(0, Number(url.searchParams.get('page') ?? '0'))
		const pageSize = Math.max(1, Number(url.searchParams.get('pageSize') ?? '9'))

		const db = await getDb()
		const collectionName = process.env.SKETCHES_COLLECTION || 'sketches'
		const col = db.collection(collectionName)

		// total count for pagination info
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
		const { name, message, dataUrl } = body || {}

		if (!dataUrl) return errResponse('dataUrl is required', 400)

		const db = await getDb()
		const collectionName = process.env.SKETCHES_COLLECTION || 'sketches'
		const col = db.collection(collectionName)

		const doc = {
			name: name || 'Untitled Sketch',
			message: message || '',
			dataUrl,
			createdAt: new Date(),
		}

		const result = await col.insertOne(doc)

		const inserted = {
			_id: result.insertedId.toString(),
			...doc,
		}

		return jsonResponse(inserted, 201)
	} catch (e: any) {
		console.error('[SKETCHES_API][POST]', e)
		return errResponse('Failed to save sketch')
	}
}
