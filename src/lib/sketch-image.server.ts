import { getDb } from '@/lib/mongodb'
import {
	rasterizeSourceToWebp,
	toImageBuffer,
} from '@/lib/sketch-rasterize.server'
import { Binary, ObjectId } from 'mongodb'

export {
	rasterizeSourceToWebp,
	rasterizeSvgToWebp,
	toImageBuffer,
} from '@/lib/sketch-rasterize.server'

const COLLECTION = 'sketches'

export function webpBase64ToBinary(base64: string) {
	const buffer = Buffer.from(base64, 'base64')
	return new Binary(buffer, Binary.SUBTYPE_BYTE_ARRAY)
}

export async function getSketchImageBuffer(id: string): Promise<Buffer | null> {
	if (!ObjectId.isValid(id)) return null

	const db = await getDb()
	const doc = await db.collection(COLLECTION).findOne(
		{ _id: new ObjectId(id) },
		{ projection: { image: 1, svg: 1, dataUrl: 1 } },
	)

	if (!doc) return null
	return rasterizeSourceToWebp({
		image: doc.image,
		svg: typeof doc.svg === 'string' ? doc.svg : null,
		dataUrl: typeof doc.dataUrl === 'string' ? doc.dataUrl : null,
	})
}