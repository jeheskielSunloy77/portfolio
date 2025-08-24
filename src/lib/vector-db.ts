import { DataAPIClient } from '@datastax/astra-db-ts'
import { AstraDBVectorStore } from '@langchain/community/vectorstores/astradb'

const endpoint = import.meta.env.ASTRA_DB_API_ENDPOINT
const token = import.meta.env.ASTRA_DB_APPLICATION_TOKEN
const collection = import.meta.env.ASTRA_DB_COLLECTION

import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Wrapper to use Gemini for embeddings in LangChain-style.
 */
export class GeminiEmbeddings {
	private model: GenerativeModel

	constructor(apiKey: string) {
		const client = new GoogleGenerativeAI(apiKey)
		this.model = client.getGenerativeModel({
			model: 'gemini-embedding-001',
		})
	}

	async embedQuery(text: string): Promise<number[]> {
		const result = await this.model.embedContent(text)
		return result.embedding.values
	}

	async embedDocuments(texts: string[]): Promise<number[][]> {
		return Promise.all(texts.map((t) => this.embedQuery(t)))
	}
}

export async function getVectorStore() {
	return AstraDBVectorStore.fromExistingIndex(
		new GeminiEmbeddings(import.meta.env.GEMINI_API_KEY),
		{
			token,
			endpoint,
			collection,
		}
	)
}

/**
 * Use the raw Astra Data API client to work with the collection.
 */
export async function getEmbeddingsCollection() {
	const client = new DataAPIClient(token)
	const db = client.db(endpoint)

	// Ensure the collection exists with the right vector options
	const col = await db
		.createCollection(collection, {
			vector: { dimension: 1536, metric: 'cosine' },
		})
		.catch((err: any) => {
			if (err.message.includes('already exists')) {
				return db.collection(collection)
			}
			throw err
		})

	return col
}
