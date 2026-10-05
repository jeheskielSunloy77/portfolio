import { DATABASE_URL, DB_PROVIDER } from 'astro:env/server'
import type { DatabaseAdapter, DbProviderName } from './types'
import { MongoDatabaseAdapter } from './mongodb'
import { MysqlDatabaseAdapter } from './mysql'
import { PostgresDatabaseAdapter } from './postgres'
import { SqliteDatabaseAdapter } from './sqlite'
import { log } from '@/lib/utils'

export type { DatabaseAdapter, DbProviderName }
export * from './types'

const TAG = 'Database'

declare global {
	var _dbAdapterPromise: Promise<DatabaseAdapter | null> | undefined
}

export function resolveDbProvider(
	url?: string,
	explicitProvider?: string,
): DbProviderName | null {
	const rawProvider = explicitProvider?.trim().toLowerCase()
	if (
		rawProvider === 'postgres' ||
		rawProvider === 'postgresql' ||
		rawProvider === 'pg'
	) {
		return 'postgres'
	}
	if (rawProvider === 'sqlite' || rawProvider === 'libsql') {
		return 'sqlite'
	}
	if (rawProvider === 'mysql' || rawProvider === 'mariadb') {
		return 'mysql'
	}
	if (rawProvider === 'mongodb' || rawProvider === 'mongo') {
		return 'mongodb'
	}

	if (!url) return null
	const trimmedUrl = url.trim().toLowerCase()
	if (
		trimmedUrl.startsWith('postgres://') ||
		trimmedUrl.startsWith('postgresql://')
	) {
		return 'postgres'
	}
	if (trimmedUrl.startsWith('mysql://')) {
		return 'mysql'
	}
	if (
		trimmedUrl.startsWith('sqlite:') ||
		trimmedUrl.startsWith('file:') ||
		trimmedUrl.startsWith('libsql://')
	) {
		return 'sqlite'
	}
	if (
		trimmedUrl.startsWith('mongodb://') ||
		trimmedUrl.startsWith('mongodb+srv://')
	) {
		return 'mongodb'
	}

	return null
}

function createAdapter(
	provider: DbProviderName,
	url: string,
): DatabaseAdapter {
	switch (provider) {
		case 'postgres':
			return new PostgresDatabaseAdapter(url)
		case 'sqlite':
			return new SqliteDatabaseAdapter(url)
		case 'mysql':
			return new MysqlDatabaseAdapter(url)
		case 'mongodb':
			return new MongoDatabaseAdapter(url)
	}
}

export async function getDbAdapter(): Promise<DatabaseAdapter | null> {
	const url = DATABASE_URL?.trim()
	if (!url) {
		return null
	}

	const provider = resolveDbProvider(url, DB_PROVIDER)
	if (!provider) {
		log(
			'error',
			TAG,
			`Could not determine database provider for URL "${url}". Set DB_PROVIDER to "postgres", "sqlite", "mysql", or "mongodb".`,
		)
		return null
	}

	if (!globalThis._dbAdapterPromise) {
		globalThis._dbAdapterPromise = (async () => {
			try {
				const adapter = createAdapter(provider, url)
				await adapter.init()
				log('info', TAG, `Database connected with provider "${provider}"`)
				return adapter
			} catch (e: any) {
				log('error', TAG, `Failed to initialize database: ${e.message}`)
				globalThis._dbAdapterPromise = undefined
				return null
			}
		})()
	}

	return globalThis._dbAdapterPromise
}
