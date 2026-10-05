import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSketches } from './sketches'

const mockGetSketches = vi.fn()

vi.mock('@/lib/db', () => ({
	getDbAdapter: vi.fn(() => ({
		getSketches: mockGetSketches,
	})),
}))

describe('getSketches', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	it('returns data and nextPage when more results exist', async () => {
		mockGetSketches.mockResolvedValue({
			data: [
				{ _id: 'id1', name: 'a', message: 'm', createdAt: new Date() },
				{ _id: 'id2', name: 'b', message: 'm2', createdAt: new Date() },
			],
			page: 0,
			pageSize: 2,
			nextPage: 1,
		})

		const result = await getSketches(0, 2)
		expect(result.data).toHaveLength(2)
		expect(result.page).toBe(0)
		expect(result.pageSize).toBe(2)
		expect(result.nextPage).toBe(1)
		expect(mockGetSketches).toHaveBeenCalledWith(0, 2)
	})

	it('handles unconfigured database gracefully', async () => {
		const { getDbAdapter } = await import('@/lib/db')
		;(getDbAdapter as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)

		const result = await getSketches(0, 2)
		expect(result.data).toEqual([])
		expect(result.page).toBe(0)
		expect(result.pageSize).toBe(2)
		expect(result.nextPage).toBeUndefined()
	})
})