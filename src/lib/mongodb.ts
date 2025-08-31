import { MongoClient } from 'mongodb'

// Cache the client to avoid creating multiple connections in dev/hot-reload
declare global {
	interface GlobalThis {
		_mongoClientPromise?: Promise<MongoClient>
	}
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

client = new MongoClient(import.meta.env.MONGODB_URI)
clientPromise = client.connect()

if (!(globalThis as any)._mongoClientPromise) {
	;(globalThis as any)._mongoClientPromise = clientPromise
}

export async function getDb() {
	const client = await (globalThis as any)._mongoClientPromise!
	return client.db(import.meta.env.MONGODB_DB)
}
