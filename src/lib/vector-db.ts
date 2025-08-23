import { DataAPIClient } from '@datastax/astra-db-ts'
import { AstraDBVectorStore } from '@langchain/community/vectorstores/astradb'
import { OpenAIEmbeddings } from '@langchain/openai'

const endpoint = import.meta.env.ASTRA_DB_API_ENDPOINT
const token = import.meta.env.ASTRA_DB_APPLICATION_TOKEN
const collection = import.meta.env.ASTRA_DB_COLLECTION

export async function getVectorStore() {
	return AstraDBVectorStore.fromExistingIndex(
		new OpenAIEmbeddings({ model: 'text-embedding-3' }),
		{
			token,
			endpoint,
			collection,
			collectionOptions: {
				vector: { dimension: 1536, metric: 'cosine' },
			},
		}
	)
}

export async function getEmbeddingsCollection() {
	const client = new DataAPIClient(token)
	const db = client.db(endpoint)

	return db.collection(collection)
}
