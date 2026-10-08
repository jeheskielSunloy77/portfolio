import type {
	DatabaseAdapter,
	InsertSketchInput,
	InsertSketchResult,
} from './types'
import type { APIResponsePaginated, Sketch } from '@/lib/types'
import { createClient, type Client } from '@libsql/client'

export class SqliteDatabaseAdapter implements DatabaseAdapter {
	readonly provider = 'sqlite' as const
	private client: Client

	constructor(url: string) {
		this.client = createClient({ url })
	}

	async init(): Promise<void> {
		await this.client.execute(`
			CREATE TABLE IF NOT EXISTS sketches (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				message TEXT NOT NULL,
				image BLOB NOT NULL,
				created_at TEXT NOT NULL,
				ip TEXT NOT NULL,
				is_sensitive INTEGER NOT NULL DEFAULT 0
			);
		`)
		try {
			await this.client.execute(`
				ALTER TABLE sketches ADD COLUMN is_sensitive INTEGER NOT NULL DEFAULT 0;
			`)
		} catch {
			// Column already exists or table freshly created
		}
		await this.client.execute(`
			CREATE INDEX IF NOT EXISTS idx_sketches_created_at ON sketches(created_at DESC);
		`)
		await this.client.execute(`
			CREATE INDEX IF NOT EXISTS idx_sketches_ip_created_at ON sketches(ip, created_at);
		`)
	}

	async getSketches(
		page: number,
		pageSize: number,
	): Promise<APIResponsePaginated<Sketch>> {
		const offset = page * pageSize
		const limit = pageSize + 1

		const res = await this.client.execute({
			sql: `SELECT id, name, message, created_at, is_sensitive
				  FROM sketches
				  ORDER BY created_at DESC
				  LIMIT ? OFFSET ?`,
			args: [limit, offset],
		})

		const hasMore = res.rows.length > pageSize
		const pageDocs = hasMore ? res.rows.slice(0, pageSize) : res.rows

		return {
			data: pageDocs.map((r) => ({
				_id: String(r.id),
				name: String(r.name),
				message: String(r.message),
				createdAt: new Date(String(r.created_at)),
				isSensitive: Boolean(r.is_sensitive),
			})),
			page,
			pageSize,
			nextPage: hasMore ? page + 1 : undefined,
		}
	}

	async getSketchImageBuffer(id: string): Promise<Buffer | null> {
		const res = await this.client.execute({
			sql: 'SELECT image FROM sketches WHERE id = ?',
			args: [id],
		})

		if (res.rows.length === 0 || !res.rows[0].image) {
			return null
		}

		const img = res.rows[0].image
		if (Buffer.isBuffer(img)) return img
		if (img instanceof ArrayBuffer) return Buffer.from(img)
		if (ArrayBuffer.isView(img)) return Buffer.from(img.buffer, img.byteOffset, img.byteLength)
		return Buffer.from(img as any)
	}

	async countRecentSketchesByIp(ip: string, since: Date): Promise<number> {
		const res = await this.client.execute({
			sql: 'SELECT COUNT(*) as count FROM sketches WHERE ip = ? AND created_at >= ?',
			args: [ip, since.toISOString()],
		})

		return Number(res.rows[0]?.count ?? 0)
	}

	async createSketch(input: InsertSketchInput): Promise<InsertSketchResult> {
		const id = crypto.randomUUID()
		const createdAt = new Date()

		const imageBlob = new Uint8Array(
			input.image.buffer,
			input.image.byteOffset,
			input.image.byteLength,
		)

		const isSensitive = input.isSensitive ? 1 : 0

		await this.client.execute({
			sql: `INSERT INTO sketches (id, name, message, image, created_at, ip, is_sensitive)
				  VALUES (?, ?, ?, ?, ?, ?, ?)`,
			args: [id, input.name, input.message, imageBlob, createdAt.toISOString(), input.ip, isSensitive],
		})

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
		this.client.close()
	}
}
