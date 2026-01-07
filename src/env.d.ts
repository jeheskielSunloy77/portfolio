/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly SMTP_USER: string
	readonly SMTP_PASS: string
	readonly SMTP_HOST: string
	readonly SMTP_PORT: string
	readonly SMTP_RECEIVER_EMAIL: string
	readonly APP_URL: string
	readonly GEMINI_API_KEY: string
	readonly PINECONE_API_KEY: string
	readonly PINECONE_INDEX: string
	readonly PINECONE_NAMESPACE?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
