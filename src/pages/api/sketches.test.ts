import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, POST } from './sketches'

const mockCountRecentSketchesByIp = vi.fn()
const mockCreateSketch = vi.fn()
const mockModerateSketch = vi.fn()

vi.mock('@/lib/sketches', () => ({
	getSketches: vi.fn(),
}))

vi.mock('@/lib/sketch-image.server', () => ({
	webpBase64ToBinary: vi.fn((base64: string) => Buffer.from(base64, 'base64')),
}))

vi.mock('@/lib/sketch-moderation.server', () => ({
	moderateSketch: (...args: any[]) => mockModerateSketch(...args),
}))

vi.mock('@/lib/db', () => ({
	getDbAdapter: vi.fn(() => ({
		countRecentSketchesByIp: mockCountRecentSketchesByIp,
		createSketch: mockCreateSketch,
	})),
}))

describe('Sketches API', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		mockModerateSketch.mockResolvedValue({ isSensitive: false })
	})

	describe('GET /api/sketches', () => {
		it('returns paginated sketches without shared caching', async () => {
			const { getSketches } = await import('@/lib/sketches')
			;(getSketches as ReturnType<typeof vi.fn>).mockResolvedValue({
				data: [
					{
						_id: 'id1',
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
			expect(res.headers.get('Cache-Control')).toBe('private, no-store')
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

		it('returns 503 when db adapter is unconfigured', async () => {
			const { getDbAdapter } = await import('@/lib/db')
			;(getDbAdapter as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)

			const req = {
				json: async () => ({
					name: 'a',
					message: 'm',
					imageWebp: 'd2ViYXNkNjQ=',
				}),
				headers: new Headers(),
			} as unknown as Request

			const res = await POST({ request: req })
			expect(res.status).toBe(503)
			const body = await res.json()
			expect(body.error).toContain('database unconfigured')
		})

		it('enforces rate limit and returns 429 when exceeded', async () => {
			mockCountRecentSketchesByIp.mockResolvedValue(5)

			const req = {
				json: async () => ({
					name: 'a',
					message: 'm',
					imageWebp: 'd2ViYXNkNjQ=',
				}),
				headers: new Headers([['x-forwarded-for', '1.2.3.4']]),
			} as unknown as Request

			const res = await POST({ request: req })
			expect(res.status).toBe(429)
			const body = await res.json()
			expect(body).toHaveProperty('error', 'Rate limit exceeded')
			expect(mockCreateSketch).not.toHaveBeenCalled()
		})

		it('stores webp binary and returns metadata, without image bytes', async () => {
			mockCountRecentSketchesByIp.mockResolvedValue(0)
			mockCreateSketch.mockResolvedValue({
				_id: 'newid',
				name: 'user',
				message: 'hi',
				createdAt: new Date('2026-01-01T00:00:00.000Z'),
				ip: '9.9.9.9',
			})

			const req = {
				json: async () => ({
					name: 'user',
					message: 'hi',
					imageWebp: 'd2ViYXNkNjQ=',
				}),
				headers: new Headers([['x-forwarded-for', '9.9.9.9']]),
			} as unknown as Request

			const res = await POST({ request: req })
			expect(res.status).toBe(201)
			const body = await res.json()
			expect(body).toEqual({
				_id: 'newid',
				name: 'user',
				message: 'hi',
				createdAt: expect.any(String),
				ip: '9.9.9.9',
			})
			expect(body).not.toHaveProperty('imageWebp')
			expect(body).not.toHaveProperty('image')
			expect(mockCreateSketch).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'user',
					message: 'hi',
					ip: '9.9.9.9',
					isSensitive: false,
				}),
			)
		})

		it('flags sensitive sketch and persists isSensitive: true', async () => {
			mockCountRecentSketchesByIp.mockResolvedValue(0)
			mockModerateSketch.mockResolvedValue({
				isSensitive: true,
				reason: 'Inappropriate drawing',
			})
			mockCreateSketch.mockResolvedValue({
				_id: 'flagged-id',
				name: 'bad-actor',
				message: 'nsfw',
				createdAt: new Date('2026-01-01T00:00:00.000Z'),
				ip: '9.9.9.9',
				isSensitive: true,
			})

			const req = {
				json: async () => ({
					name: 'bad-actor',
					message: 'nsfw',
					imageWebp: 'd2ViYXNkNjQ=',
				}),
				headers: new Headers([['x-forwarded-for', '9.9.9.9']]),
			} as unknown as Request

			const res = await POST({ request: req })
			expect(res.status).toBe(201)
			const body = await res.json()
			expect(body.isSensitive).toBe(true)
			expect(mockCreateSketch).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'bad-actor',
					message: 'nsfw',
					ip: '9.9.9.9',
					isSensitive: true,
				}),
			)
		})

		it('returns error response when DB insert fails', async () => {
			mockCountRecentSketchesByIp.mockResolvedValue(0)
			mockCreateSketch.mockRejectedValue(new Error('insert fail'))

			const req = {
				json: async () => ({
					name: 'user',
					message: 'hi',
					imageWebp: 'd2ViYXNkNjQ=',
				}),
				headers: new Headers(),
			} as unknown as Request

			const res = await POST({ request: req })
			expect(res.status).toBe(500)
			const body = await res.json()
			expect(body).toHaveProperty('error')
		})
	})
})