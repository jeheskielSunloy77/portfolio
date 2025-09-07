import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from './sketches'

vi.mock('@/lib/mongodb', () => ({
	getDb: vi.fn(),
}))

describe('Sketches API', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	describe('GET /api/sketches', () => {
		it('returns paginated sketches with nextPage when there are more results', async () => {
			const mockDocs = [
				{
					_id: { toString: () => 'id1' },
					svg: '<svg></svg>',
					dataUrl: 'data:1',
					name: 'a',
					message: 'm',
					createdAt: new Date(),
				},
				{
					_id: { toString: () => 'id2' },
					svg: '<svg></svg>',
					dataUrl: 'data:2',
					name: 'b',
					message: 'm2',
					createdAt: new Date(),
				},
			]
			const mockCol = {
				countDocuments: vi.fn().mockResolvedValue(10),
				find: vi.fn(() => ({
					sort: vi.fn(() => ({
						skip: vi.fn(() => ({
							limit: vi.fn(() => ({
								toArray: vi.fn().mockResolvedValue(mockDocs),
							})),
						})),
					})),
				})),
			}
			const { getDb } = await import('@/lib/mongodb')
			;(getDb as ReturnType<typeof vi.fn>).mockResolvedValue({
				collection: () => mockCol,
			})

			const req = new Request('https://example.com/api/sketches?page=1&pageSize=2')
			const res = await GET(req)
			expect(res).toBeInstanceOf(Response)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body).toHaveProperty('data')
			expect(Array.isArray(body.data)).toBe(true)
			expect(body.page).toBe(1)
			expect(body.pageSize).toBe(2)
			expect(body.nextPage).toBe(2) // because total 10 and (1+1)*2 < 10
			expect(mockCol.countDocuments).toHaveBeenCalled()
			expect(mockCol.find).toHaveBeenCalled()
		})

		it('handles invalid query params (negative page/pageSize) by normalizing them', async () => {
			const mockDocs: any[] = []
			const mockCol = {
				countDocuments: vi.fn().mockResolvedValue(0),
				find: vi.fn(() => ({
					sort: vi.fn(() => ({
						skip: vi.fn(() => ({
							limit: vi.fn(() => ({
								toArray: vi.fn().mockResolvedValue(mockDocs),
							})),
						})),
					})),
				})),
			}
			const { getDb } = await import('@/lib/mongodb')
			;(getDb as ReturnType<typeof vi.fn>).mockResolvedValue({
				collection: () => mockCol,
			})

			const req = new Request(
				'https://example.com/api/sketches?page=-5&pageSize=0'
			)
			const res = await GET(req)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.page).toBe(0)
			expect(body.pageSize).toBe(1) // pageSize normalized to at least 1
			expect(body.data).toEqual([])
		})

		it('returns error response when DB throws', async () => {
			const { getDb } = await import('@/lib/mongodb')
			;(getDb as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('db fail'))

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
				json: async () => ({ name: 'a', message: 'm' }), // missing svg
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
			// inserted svg should have script removed and onload attribute removed
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
