import { getDbAdapter } from '@/lib/db'

export function toImageBuffer(value: unknown): Buffer | null {
	if (!value) return null
	if (Buffer.isBuffer(value)) return value
	if (value instanceof Uint8Array) return Buffer.from(value)
	if (value instanceof ArrayBuffer) return Buffer.from(value)
	if (typeof (value as any)?.buffer === 'object') {
		return Buffer.from((value as any).buffer)
	}
	return null
}

export function webpBase64ToBinary(base64: string): Buffer {
	return Buffer.from(base64, 'base64')
}

export async function getSketchImageBuffer(id: string): Promise<Buffer | null> {
	if (!id || typeof id !== 'string' || id.trim().length === 0) {
		return null
	}

	const adapter = await getDbAdapter()
	if (!adapter) {
		return null
	}

	return await adapter.getSketchImageBuffer(id.trim())
}