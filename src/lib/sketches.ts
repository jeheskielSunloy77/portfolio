import { SKETCHES_PAGE_SIZE } from '@/lib/sketch-constants'
import { getDbAdapter } from '@/lib/db'
import type { APIResponsePaginated, Sketch } from '@/lib/types'

export { SKETCHES_PAGE_SIZE }

export async function getSketches(
	page: number,
	pageSize: number,
): Promise<APIResponsePaginated<Sketch>> {
	try {
		const adapter = await getDbAdapter()
		if (!adapter) {
			return {
				data: [],
				page,
				pageSize,
			}
		}

		return await adapter.getSketches(page, pageSize)
	} catch {
		return {
			data: [],
			page,
			pageSize,
		}
	}
}