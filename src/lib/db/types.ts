import type { APIResponsePaginated, Sketch } from '@/lib/types'

export type DbProviderName = 'postgres' | 'sqlite' | 'mysql' | 'mongodb'

export interface InsertSketchInput {
	name: string
	message: string
	image: Buffer
	ip: string
	isSensitive?: boolean
}

export interface InsertSketchResult {
	_id: string
	name: string
	message: string
	createdAt: Date
	ip: string
	isSensitive?: boolean
}

export interface DatabaseAdapter {
	readonly provider: DbProviderName
	init(): Promise<void>
	getSketches(page: number, pageSize: number): Promise<APIResponsePaginated<Sketch>>
	getSketchImageBuffer(id: string): Promise<Buffer | null>
	countRecentSketchesByIp(ip: string, since: Date): Promise<number>
	createSketch(input: InsertSketchInput): Promise<InsertSketchResult>
	close?(): Promise<void>
}
