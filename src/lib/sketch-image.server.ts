import { getDb } from '@/lib/mongodb'
import { Binary, ObjectId } from 'mongodb'

const COLLECTION = 'sketches'

export function toImageBuffer(value: unknown): Buffer | null {
	if (!value) return null
	if (Buffer.isBuffer(value)) return value
	if (value instanceof Binary) return Buffer.from(value.buffer)
	return null
}

export function webpBase64ToBinary(base64: string) {
	const buffer = Buffer.from(base64, 'base64')
	return new Binary(buffer, Binary.SUBTYPE_BYTE_ARRAY)
}

export async function getSketchImageBuffer(id: string): Promise<Buffer | null> {
	if (!ObjectId.isValid(id)) return null

	const db = await getDb()
	const doc = await db.collection(COLLECTION).findOne(
		{ _id: new ObjectId(id) },
		{ projection: { image: 1 } },
	)

	if (!doc) return null
	return toImageBuffer(doc.image)
}