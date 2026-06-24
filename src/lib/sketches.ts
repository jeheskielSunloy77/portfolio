import { SKETCHES_PAGE_SIZE } from '@/lib/sketch-constants'
import { getDb } from '@/lib/mongodb'
import type { APIResponsePaginated, Sketch } from '@/lib/types'

export { SKETCHES_PAGE_SIZE } from '@/lib/sketch-constants'

const COLLECTION = 'sketches'

export async function getSketches(
	page: number,
	pageSize: number,
): Promise<APIResponsePaginated<Sketch>> {
	const db = await getDb()
	const col = db.collection(COLLECTION)

	const docs = await col
		.find(
			{},
			{ projection: { svg: 1, name: 1, message: 1, createdAt: 1 } },
		)
		.sort({ createdAt: -1 })
		.skip(page * pageSize)
		.limit(pageSize + 1)
		.toArray()

	const hasMore = docs.length > pageSize
	const pageDocs = hasMore ? docs.slice(0, pageSize) : docs

	const mapped = pageDocs.map((d) => ({
		...d,
		_id: d._id.toString(),
	})) as Sketch[]

	return {
		data: mapped,
		page,
		pageSize,
		nextPage: hasMore ? page + 1 : undefined,
	}
}