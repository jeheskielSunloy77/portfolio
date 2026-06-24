import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from './sketches'

vi.mock('@/lib/sketches', () => ({
	getSketches: vi.fn(),
	SKETCHES_PAGE_SIZE: 6,
}))

vi.mock('@/lib/mongodb', () => ({
	getDb: vi.fn(),
}))

describe('Sketches API', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	describe('GET /api/sketches', () => {
		it('returns paginated sketches with cache headers', async () => {
			const { getSketches } = await import('@/lib/sketches')
			;(getSketches as ReturnType<typeof vi.fn>).mockResolvedValue({
				data: [
					{
						_id: 'id1',
						svg: '<svg></svg>',
						name: 'a',
						message: 'm',
						createdAt: new Date(),
					},
				],
				page: 0,
				pageSize: 6,
				nextPage: 1,
			})

			const req = new Request('https://example.com/api/sketches?page=0&pageSize=6')
			const res = await GET(req)

			expect(res.status).toBe(200)
			expect(res.headers.get('Cache-Control')).toBe(
				's-maxage=60, stale-while-revalidate=300',
			)
			const body = await res.json()
			expect(body.data).toHaveLength(1)
			expect(body.nextPage).toBe(1)
			expect(getSketches).toHaveBeenCalledWith(0, 6)
		})

		it('handles invalid query params (negative page/pageSize) by normalizing them', async () => {
			const { getSketches } = await import('@/lib/sketches')
			;(getSketches as ReturnType<typeof vi.fn>).mockResolvedValue({
				data: [],
				page: 0,
				pageSize: 1,
			})

			const req = new Request(
				'https://example.com/api/sketches?page=-5&pageSize=0',
			)
			const res = await GET(req)

			expect(res.status).toBe(200)
			expect(getSketches).toHaveBeenCalledWith(0, 1)
		})

		it('returns error response when getSketches throws', async () => {
			const { getSketches } = await import('@/lib/sketches')
			;(getSketches as ReturnType<typeof vi.fn>).mockRejectedValue(
				new Error('db fail'),
			)

			const req = new Request('https://example.com/api/sketches')
			const res = await GET(req)

			expect(res.status).toBe(500)
			const body = await res.json()
			expect(body).toHaveProperty('error')
		})
	})

	describe('POST /api/sketches', () => {
		it('returns 400 for invalid request body', async () => {
			const badReq = {
				json: async () => ({ name: 'a', message: 'm' }),
				headers: new Headers(),
			} as unknown as Request

			const res = await POST({ request: badReq })
			expect(res.status).toBe(400)
			const body = await res.json()
			expect(body).toHaveProperty('error')
		})

		it('enforces rate limit and returns 429 when exceeded', async () => {
			const mockCol = {
				countDocuments: vi.fn().mockResolvedValue(5),
				insertOne: vi.fn(),
			}
			const { getDb } = await import('@/lib/mongodb')
			;(getDb as ReturnType<typeof vi.fn>).mockResolvedValue({
				collection: () => mockCol,
			})

			const req = {
				json: async () => ({ name: 'a', message: 'm', svg: '<svg></svg>' }),
				headers: new Headers([['x-forwarded-for', '1.2.3.4']]),
			} as unknown as Request

			const res = await POST({ request: req })
			expect(res.status).toBe(429)
			const body = await res.json()
			expect(body).toHaveProperty('error', 'Rate limit exceeded')
			expect(mockCol.insertOne).not.toHaveBeenCalled()
		})

		it('sanitizes svg and saves document, returning 201 with inserted id', async () => {
			const insertedId = { toString: () => 'newid' }
			const mockCol = {
				countDocuments: vi.fn().mockResolvedValue(0),
				insertOne: vi.fn().mockResolvedValue({ insertedId }),
			}
			const { getDb } = await import('@/lib/mongodb')
			;(getDb as ReturnType<typeof vi.fn>).mockResolvedValue({
				collection: () => mockCol,
			})

			const maliciousSvg = `<svg onload="steal()" ><script>alert(1)</script><rect /></svg>`
			const req = {
				json: async () => ({ name: 'user', message: 'hi', svg: maliciousSvg }),
				headers: new Headers([['x-forwarded-for', '9.9.9.9']]),
			} as unknown as Request

			const res = await POST({ request: req })
			expect(res.status).toBe(201)
			const body = await res.json()
			expect(body).toHaveProperty('_id', 'newid')
			expect(body).toHaveProperty('name', 'user')
			expect(body.svg).not.toContain('<script')
			expect(body.svg).not.toContain('onload=')
			expect(mockCol.insertOne).toHaveBeenCalled()
		})

		it('returns error response when DB insert fails', async () => {
			const mockCol = {
				countDocuments: vi.fn().mockResolvedValue(0),
				insertOne: vi.fn().mockRejectedValue(new Error('insert fail')),
			}
			const { getDb } = await import('@/lib/mongodb')
			;(getDb as ReturnType<typeof vi.fn>).mockResolvedValue({
				collection: () => mockCol,
			})

			const req = {
				json: async () => ({ name: 'user', message: 'hi', svg: '<svg></svg>' }),
				headers: new Headers(),
			} as unknown as Request

			const res = await POST({ request: req })
			expect(res.status).toBe(500)
			const body = await res.json()
			expect(body).toHaveProperty('error')
		})
	})
})