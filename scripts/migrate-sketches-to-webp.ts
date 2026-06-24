/**
 * One-time migration: convert legacy svg/dataUrl sketches to WebP Binary in MongoDB.
 *
 * Usage:
 *   bun run migrate:sketches              # migrate and remove legacy fields
 *   bun run migrate:sketches -- --dry-run # preview without writing
 *   bun run migrate:sketches -- --keep-legacy # keep svg/dataUrl after migration
 */
import {
	rasterizeSourceToWebp,
	toImageBuffer,
} from '../src/lib/sketch-rasterize.server'
import { SKETCH_IMAGE_MIME_TYPE } from '../src/lib/sketch-constants'
import { Binary, MongoClient } from 'mongodb'
import { loadEnv } from 'vite'

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '')
const uri = env.MONGODB_URI
const dbName = env.MONGODB_DB

if (!uri || !dbName) {
	console.error('Missing MONGODB_URI or MONGODB_DB in environment')
	process.exit(1)
}

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const keepLegacy = args.has('--keep-legacy')

async function main() {
	const client = new MongoClient(uri)
	await client.connect()

	const col = client.db(dbName).collection('sketches')
	const cursor = col.find({
		$or: [
			{ svg: { $exists: true, $nin: [null, ''] } },
			{ dataUrl: { $exists: true, $nin: [null, ''] } },
		],
	})

	let scanned = 0
	let migrated = 0
	let skipped = 0
	let failed = 0

	for await (const doc of cursor) {
		scanned += 1
		const id = doc._id.toString()

		if (toImageBuffer(doc.image)) {
			skipped += 1
			console.log(`skip ${id}: already has image`)
			continue
		}

		try {
			const webp = await rasterizeSourceToWebp({
				image: doc.image,
				svg: typeof doc.svg === 'string' ? doc.svg : null,
				dataUrl: typeof doc.dataUrl === 'string' ? doc.dataUrl : null,
			})
			if (!webp) {
				failed += 1
				console.error(`fail ${id}: no convertible source`)
				continue
			}

			const beforeSvg = typeof doc.svg === 'string' ? doc.svg.length : 0
			const beforeDataUrl =
				typeof doc.dataUrl === 'string' ? doc.dataUrl.length : 0

			console.log(
				`${dryRun ? 'dry-run' : 'migrate'} ${id}: svg=${beforeSvg}B dataUrl=${beforeDataUrl}B -> webp=${webp.length}B`,
			)

			if (!dryRun) {
				const update: Record<string, unknown> = {
					$set: {
						image: new Binary(webp, Binary.SUBTYPE_BYTE_ARRAY),
						mimeType: SKETCH_IMAGE_MIME_TYPE,
					},
				}

				if (!keepLegacy) {
					update.$unset = { svg: '', dataUrl: '' }
				}

				await col.updateOne({ _id: doc._id }, update)
			}

			migrated += 1
		} catch (error) {
			failed += 1
			console.error(`fail ${id}:`, error)
		}
	}

	console.log(
		`Done. scanned=${scanned} migrated=${migrated} skipped=${skipped} failed=${failed} dryRun=${dryRun}`,
	)

	await client.close()
}

main().catch((error) => {
	console.error(error)
	process.exit(1)
})