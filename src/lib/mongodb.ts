import { MONGODB_DB, MONGODB_URI } from 'astro:env/server'
import { MongoClient } from 'mongodb'

// Cache the client to avoid creating multiple connections in dev/hot-reload
declare global {
	interface GlobalThis {
		_mongoClientPromise?: Promise<MongoClient>
	}
}

export function isMongoConfigured(): boolean {
	return Boolean(MONGODB_URI && MONGODB_URI.trim().length > 0)
}

export async function getMongoClient(): Promise<MongoClient | null> {
	if (!isMongoConfigured()) {
		return null
	}

	if (!(globalThis as any)._mongoClientPromise) {
		const client = new MongoClient(MONGODB_URI!)
		;(globalThis as any)._mongoClientPromise = client.connect()
	}

	return (globalThis as any)._mongoClientPromise
}

export async function getDb() {
	const client = await getMongoClient()
	if (!client) {
		return null
	}
	return client.db(MONGODB_DB || 'portfolio')
}
