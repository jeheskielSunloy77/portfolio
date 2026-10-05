import type {
	DatabaseAdapter,
	InsertSketchInput,
	InsertSketchResult,
} from './types'
import type { APIResponsePaginated, Sketch } from '@/lib/types'
import pg from 'pg'

const { Pool } = pg

export class PostgresDatabaseAdapter implements DatabaseAdapter {
	readonly provider = 'postgres' as const
	private pool: pg.Pool

	constructor(url: string) {
		this.pool = new Pool({ connectionString: url })
	}

	async init(): Promise<void> {
		await this.pool.query(`
			CREATE TABLE IF NOT EXISTS sketches (
				id VARCHAR(36) PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				message TEXT NOT NULL,
				image BYTEA NOT NULL,
				created_at TIMESTAMPTZ NOT NULL,
				ip VARCHAR(64) NOT NULL
			);
			CREATE INDEX IF NOT EXISTS idx_sketches_created_at ON sketches(created_at DESC);
			CREATE INDEX IF NOT EXISTS idx_sketches_ip_created_at ON sketches(ip, created_at);
		`)
	}

	async getSketches(
		page: number,
		pageSize: number,
	): Promise<APIResponsePaginated<Sketch>> {
		const offset = page * pageSize
		const limit = pageSize + 1

		const res = await this.pool.query<{
			id: string
			name: string
			message: string
			created_at: Date | string
		}>(
			`SELECT id, name, message, created_at
			 FROM sketches
			 ORDER BY created_at DESC
			 LIMIT $1 OFFSET $2`,
			[limit, offset],
		)

		const hasMore = res.rows.length > pageSize
		const pageDocs = hasMore ? res.rows.slice(0, pageSize) : res.rows

		return {
			data: pageDocs.map((r) => ({
				_id: r.id,
				name: r.name,
				message: r.message,
				createdAt: new Date(r.created_at),
			})),
			page,
			pageSize,
			nextPage: hasMore ? page + 1 : undefined,
		}
	}

	async getSketchImageBuffer(id: string): Promise<Buffer | null> {
		const res = await this.pool.query<{ image: Buffer }>(
			'SELECT image FROM sketches WHERE id = $1',
			[id],
		)

		if (res.rows.length === 0 || !res.rows[0].image) {
			return null
		}

		return Buffer.from(res.rows[0].image)
	}

	async countRecentSketchesByIp(ip: string, since: Date): Promise<number> {
		const res = await this.pool.query<{ count: number | string }>(
			'SELECT COUNT(*)::int as count FROM sketches WHERE ip = $1 AND created_at >= $2',
			[ip, since],
		)

		return Number(res.rows[0]?.count ?? 0)
	}

	async createSketch(input: InsertSketchInput): Promise<InsertSketchResult> {
		const id = crypto.randomUUID()
		const createdAt = new Date()

		await this.pool.query(
			`INSERT INTO sketches (id, name, message, image, created_at, ip)
			 VALUES ($1, $2, $3, $4, $5, $6)`,
			[id, input.name, input.message, input.image, createdAt, input.ip],
		)

		return {
			_id: id,
			name: input.name,
			message: input.message,
			createdAt,
			ip: input.ip,
		}
	}

	async close(): Promise<void> {
		await this.pool.end()
	}
}
