import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSketches } from './sketches'

vi.mock('@/lib/mongodb', () => ({
	getDb: vi.fn(),
}))

function createFindChain(docs: unknown[]) {
	return {
		sort: vi.fn(() => ({
			skip: vi.fn(() => ({
				limit: vi.fn(() => ({
					toArray: vi.fn().mockResolvedValue(docs),
				})),
			})),
		})),
	}
}

describe('getSketches', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	it('returns a page and nextPage when more results exist', async () => {
		const mockDocs = [
			{ _id: { toString: () => 'id1' }, svg: '<svg></svg>', name: 'a', message: 'm' },
			{ _id: { toString: () => 'id2' }, svg: '<svg></svg>', name: 'b', message: 'm2' },
			{ _id: { toString: () => 'id3' }, svg: '<svg></svg>', name: 'c', message: 'm3' },
		]
		const mockCol = { find: vi.fn(() => createFindChain(mockDocs)) }
		const { getDb } = await import('@/lib/mongodb')
		;(getDb as ReturnType<typeof vi.fn>).mockResolvedValue({
			collection: () => mockCol,
		})

		const result = await getSketches(0, 2)

		expect(result.data).toHaveLength(2)
		expect(result.page).toBe(0)
		expect(result.pageSize).toBe(2)
		expect(result.nextPage).toBe(1)
		expect(mockCol.find).toHaveBeenCalled()
	})

	it('omits nextPage when the result set is exhausted', async () => {
		const mockDocs = [
			{ _id: { toString: () => 'id1' }, svg: '<svg></svg>', name: 'a', message: 'm' },
		]
		const mockCol = { find: vi.fn(() => createFindChain(mockDocs)) }
		const { getDb } = await import('@/lib/mongodb')
		;(getDb as ReturnType<typeof vi.fn>).mockResolvedValue({
			collection: () => mockCol,
		})

		const result = await getSketches(0, 2)

		expect(result.data).toHaveLength(1)
		expect(result.nextPage).toBeUndefined()
	})
})