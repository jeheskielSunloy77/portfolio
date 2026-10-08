import type {
	DatabaseAdapter,
	InsertSketchInput,
	InsertSketchResult,
} from './types'
import type { APIResponsePaginated, Sketch } from '@/lib/types'
import mysql from 'mysql2/promise'

export class MysqlDatabaseAdapter implements DatabaseAdapter {
	readonly provider = 'mysql' as const
	private pool: mysql.Pool

	constructor(url: string) {
		this.pool = mysql.createPool(url)
	}

	async init(): Promise<void> {
		await this.pool.execute(`
			CREATE TABLE IF NOT EXISTS sketches (
				id VARCHAR(36) PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				message TEXT NOT NULL,
				image MEDIUMBLOB NOT NULL,
				created_at DATETIME(3) NOT NULL,
				ip VARCHAR(64) NOT NULL,
				is_sensitive TINYINT(1) NOT NULL DEFAULT 0,
				INDEX idx_sketches_created_at (created_at),
				INDEX idx_sketches_ip_created_at (ip, created_at)
			);
		`)
		try {
			await this.pool.execute(`
				ALTER TABLE sketches ADD COLUMN is_sensitive TINYINT(1) NOT NULL DEFAULT 0;
			`)
		} catch {
			// Column already exists or freshly created
		}
	}

	async getSketches(
		page: number,
		pageSize: number,
	): Promise<APIResponsePaginated<Sketch>> {
		const offset = page * pageSize
		const limit = pageSize + 1

		const [rows] = await this.pool.query<mysql.RowDataPacket[]>(
			`SELECT id, name, message, created_at, is_sensitive
			 FROM sketches
			 ORDER BY created_at DESC
			 LIMIT ? OFFSET ?`,
			[limit, offset],
		)

		const hasMore = rows.length > pageSize
		const pageDocs = hasMore ? rows.slice(0, pageSize) : rows

		return {
			data: pageDocs.map((r: any) => ({
				_id: String(r.id),
				name: String(r.name),
				message: String(r.message),
				createdAt: new Date(r.created_at),
				isSensitive: Boolean(r.is_sensitive),
			})),
			page,
			pageSize,
			nextPage: hasMore ? page + 1 : undefined,
		}
	}

	async getSketchImageBuffer(id: string): Promise<Buffer | null> {
		const [rows] = await this.pool.query<mysql.RowDataPacket[]>(
			'SELECT image FROM sketches WHERE id = ?',
			[id],
		)

		if (rows.length === 0 || !rows[0].image) {
			return null
		}

		return Buffer.from(rows[0].image)
	}

	async countRecentSketchesByIp(ip: string, since: Date): Promise<number> {
		const [rows] = await this.pool.query<mysql.RowDataPacket[]>(
			'SELECT COUNT(*) as count FROM sketches WHERE ip = ? AND created_at >= ?',
			[ip, since],
		)

		return Number(rows[0]?.count ?? 0)
	}

	async createSketch(input: InsertSketchInput): Promise<InsertSketchResult> {
		const id = crypto.randomUUID()
		const createdAt = new Date()
		const isSensitive = input.isSensitive ? 1 : 0

		await this.pool.execute(
			`INSERT INTO sketches (id, name, message, image, created_at, ip, is_sensitive)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[id, input.name, input.message, input.image, createdAt, input.ip, isSensitive],
		)

		return {
			_id: id,
			name: input.name,
			message: input.message,
			createdAt,
			ip: input.ip,
			isSensitive: Boolean(input.isSensitive),
		}
	}

	async close(): Promise<void> {
		await this.pool.end()
	}
}
