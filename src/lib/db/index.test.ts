// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

let mockEnv: Record<string, string | undefined> = {}

vi.mock('astro:env/server', () => ({
	get DB_PROVIDER() {
		return mockEnv.DB_PROVIDER
	},
	get DATABASE_URL() {
		return mockEnv.DATABASE_URL
	},
}))

const mockInit = vi.fn().mockResolvedValue(undefined)

vi.mock('./postgres', () => ({
	PostgresDatabaseAdapter: vi.fn().mockImplementation(() => ({
		provider: 'postgres',
		init: mockInit,
	})),
}))

vi.mock('./sqlite', () => ({
	SqliteDatabaseAdapter: vi.fn().mockImplementation(() => ({
		provider: 'sqlite',
		init: mockInit,
	})),
}))

vi.mock('./mysql', () => ({
	MysqlDatabaseAdapter: vi.fn().mockImplementation(() => ({
		provider: 'mysql',
		init: mockInit,
	})),
}))

vi.mock('./mongodb', () => ({
	MongoDatabaseAdapter: vi.fn().mockImplementation(() => ({
		provider: 'mongodb',
		init: mockInit,
	})),
}))

import { getDbAdapter, resolveDbProvider } from './index'

describe('db adapter resolver and factory', () => {
	beforeEach(() => {
		mockEnv = {}
		vi.clearAllMocks()
		delete (globalThis as any)._dbAdapterPromise
	})

	describe('resolveDbProvider', () => {
		it('resolves explicit provider names and aliases', () => {
			expect(resolveDbProvider(undefined, 'postgres')).toBe('postgres')
			expect(resolveDbProvider(undefined, 'postgresql')).toBe('postgres')
			expect(resolveDbProvider(undefined, 'pg')).toBe('postgres')
			expect(resolveDbProvider(undefined, 'sqlite')).toBe('sqlite')
			expect(resolveDbProvider(undefined, 'libsql')).toBe('sqlite')
			expect(resolveDbProvider(undefined, 'mysql')).toBe('mysql')
			expect(resolveDbProvider(undefined, 'mariadb')).toBe('mysql')
			expect(resolveDbProvider(undefined, 'mongodb')).toBe('mongodb')
			expect(resolveDbProvider(undefined, 'mongo')).toBe('mongodb')
		})

		it('auto-detects provider from connection URL prefix', () => {
			expect(resolveDbProvider('postgres://user:pass@localhost:5432/db')).toBe('postgres')
			expect(resolveDbProvider('postgresql://user:pass@localhost:5432/db')).toBe('postgres')
			expect(resolveDbProvider('mysql://user:pass@localhost:3306/db')).toBe('mysql')
			expect(resolveDbProvider('file:./local.db')).toBe('sqlite')
			expect(resolveDbProvider('sqlite:./local.db')).toBe('sqlite')
			expect(resolveDbProvider('libsql://my-turso-db.turso.io')).toBe('sqlite')
			expect(resolveDbProvider('mongodb://localhost:27017/portfolio')).toBe('mongodb')
			expect(resolveDbProvider('mongodb+srv://user:pass@cluster.mongodb.net')).toBe('mongodb')
		})

		it('returns null when provider cannot be identified', () => {
			expect(resolveDbProvider()).toBeNull()
			expect(resolveDbProvider('redis://localhost:6379')).toBeNull()
			expect(resolveDbProvider(undefined, 'unknown')).toBeNull()
		})
	})

	describe('getDbAdapter', () => {
		it('returns null when DATABASE_URL is not configured', async () => {
			mockEnv = {}
			const adapter = await getDbAdapter()
			expect(adapter).toBeNull()
		})

		it('returns null when provider is invalid', async () => {
			mockEnv = {
				DATABASE_URL: 'redis://localhost:6379',
			}
			const adapter = await getDbAdapter()
			expect(adapter).toBeNull()
		})

		it('initializes and caches postgres adapter', async () => {
			mockEnv = {
				DATABASE_URL: 'postgres://user:pass@localhost/db',
			}
			const adapter1 = await getDbAdapter()
			expect(adapter1?.provider).toBe('postgres')
			expect(mockInit).toHaveBeenCalledTimes(1)

			const adapter2 = await getDbAdapter()
			expect(adapter2).toBe(adapter1)
			expect(mockInit).toHaveBeenCalledTimes(1)
		})

		it('initializes sqlite adapter from file: path', async () => {
			mockEnv = {
				DATABASE_URL: 'file:./local.db',
			}
			const adapter = await getDbAdapter()
			expect(adapter?.provider).toBe('sqlite')
			expect(mockInit).toHaveBeenCalledTimes(1)
		})

		it('initializes mysql adapter from mysql: url', async () => {
			mockEnv = {
				DATABASE_URL: 'mysql://user:pass@localhost/db',
			}
			const adapter = await getDbAdapter()
			expect(adapter?.provider).toBe('mysql')
			expect(mockInit).toHaveBeenCalledTimes(1)
		})

		it('initializes mongodb adapter from mongodb: url', async () => {
			mockEnv = {
				DATABASE_URL: 'mongodb://localhost:27017/db',
			}
			const adapter = await getDbAdapter()
			expect(adapter?.provider).toBe('mongodb')
			expect(mockInit).toHaveBeenCalledTimes(1)
		})
	})
})
