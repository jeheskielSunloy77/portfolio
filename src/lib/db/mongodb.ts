import type {
	DatabaseAdapter,
	InsertSketchInput,
	InsertSketchResult,
} from './types'
import type { APIResponsePaginated, Sketch } from '@/lib/types'
import { Binary, MongoClient, ObjectId, type Db } from 'mongodb'

const COLLECTION = 'sketches'

export class MongoDatabaseAdapter implements DatabaseAdapter {
	readonly provider = 'mongodb' as const
	private client: MongoClient
	private db: Db
	private url: string

	constructor(url: string) {
		this.url = url
		this.client = new MongoClient(url)
		this.db = this.client.db()
	}

	async init(): Promise<void> {
		try {
			await this.client.connect()
		} catch (err: any) {
			if (
				err?.codeName === 'AuthenticationFailed' &&
				!this.url.includes('authSource=')
			) {
				const separator = this.url.includes('?') ? '&' : '?'
				const retryUrl = `${this.url}${separator}authSource=admin`
				const retryClient = new MongoClient(retryUrl)
				await retryClient.connect()
				this.client = retryClient
				this.db = this.client.db()
				return
			}
			throw err
		}
	}

	async getSketches(
		page: number,
		pageSize: number,
	): Promise<APIResponsePaginated<Sketch>> {
		const col = this.db.collection(COLLECTION)
		const docs = await col
			.find({}, { projection: { name: 1, message: 1, createdAt: 1 } })
			.sort({ createdAt: -1 })
			.skip(page * pageSize)
			.limit(pageSize + 1)
			.toArray()

		const hasMore = docs.length > pageSize
		const pageDocs = hasMore ? docs.slice(0, pageSize) : docs

		return {
			data: pageDocs.map((d) => ({
				_id: d._id.toString(),
				name: d.name,
				message: d.message,
				createdAt: d.createdAt,
			})),
			page,
			pageSize,
			nextPage: hasMore ? page + 1 : undefined,
		}
	}

	async getSketchImageBuffer(id: string): Promise<Buffer | null> {
		const col = this.db.collection(COLLECTION)
		const filter = ObjectId.isValid(id)
			? { _id: new ObjectId(id) }
			: { _id: id as any }

		const doc = await col.findOne(filter, { projection: { image: 1 } })
		if (!doc || !doc.image) return null

		if (Buffer.isBuffer(doc.image)) return doc.image
		if (doc.image instanceof Binary) return Buffer.from(doc.image.buffer)
		if (typeof (doc.image as any)?.buffer === 'object') {
			return Buffer.from((doc.image as any).buffer)
		}
		return null
	}

	async countRecentSketchesByIp(ip: string, since: Date): Promise<number> {
		const col = this.db.collection(COLLECTION)
		return await col.countDocuments({
			ip,
			createdAt: { $gte: since },
		})
	}

	async createSketch(input: InsertSketchInput): Promise<InsertSketchResult> {
		const col = this.db.collection(COLLECTION)
		const doc = {
			name: input.name,
			message: input.message,
			image: new Binary(input.image, Binary.SUBTYPE_BYTE_ARRAY),
			createdAt: new Date(),
			ip: input.ip,
		}

		const result = await col.insertOne(doc)
		return {
			_id: result.insertedId.toString(),
			name: doc.name,
			message: doc.message,
			createdAt: doc.createdAt,
			ip: doc.ip,
		}
	}

	async close(): Promise<void> {
		await this.client.close()
	}
}
