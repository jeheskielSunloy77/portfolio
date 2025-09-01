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
	private dimension?: number

	constructor(apiKey: string) {
		const client = new GoogleGenerativeAI(apiKey)
		this.model = client.getGenerativeModel({
			model: 'gemini-embedding-001',
		})
	}

	async embedQuery(text: string): Promise<number[]> {
		const content = typeof text === 'string' ? text : JSON.stringify(text ?? '')
		// If content is empty, probe the model once to determine embedding size and return a zero vector.
		// This avoids calling the API with empty content (which returns 400) and ensures the vector
		// length matches the model/collection dimension.
		if (!content || content.trim() === '') {
			console.warn(
				'[GeminiEmbeddings] embedQuery received empty content; probing model for dimension and returning zero-vector fallback'
			)
			if (!this.dimension) {
				try {
					const probe = await this.model.embedContent('placeholder')
					this.dimension = probe.embedding.values.length
				} catch (err) {
					console.warn(
						'[GeminiEmbeddings] probe failed, falling back to 1024 dimension',
						err
					)
					this.dimension = 1024
				}
			}
			return new Array(this.dimension).fill(0)
		}
		const result = await this.model.embedContent(content)
		this.dimension = result.embedding.values.length
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
			skipCollectionProvisioning: true,
		}
	)
}

/**
 * Use the raw Astra Data API client to work with the collection.
 */
export async function createCollection() {
	const client = new DataAPIClient(token)
	const db = client.db(endpoint)

	await db
		.createCollection(collection, {
			vector: { dimension: 3072, metric: 'cosine' },
		})
		.catch((err: any) => {
			if (err.message.includes('already exists')) {
				return db.collection(collection)
			}
			throw err
		})
}
