import { SKETCHES_PAGE_SIZE } from '@/lib/sketch-constants'
import { webpBase64ToBinary } from '@/lib/sketch-image.server'
import { moderateSketch } from '@/lib/sketch-moderation.server'
import { getSketches } from '@/lib/sketches'
import { getDbAdapter } from '@/lib/db'
import { log } from '@/lib/utils'
import z from 'zod'

function jsonResponse(
	data: unknown,
	status = 200,
	extraHeaders?: Record<string, string>,
) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...extraHeaders,
		},
	})
}

function errResponse(tag: string, message: string, status = 500) {
	log('error', tag, message)
	return jsonResponse({ error: message }, status)
}

export async function GET(request: Request) {
	const TAG = 'SketchesApiGet'

	try {
		const url = new URL(request.url)
		const page = Math.max(0, Number(url.searchParams.get('page') ?? '0'))
		const pageSize = Math.max(
			1,
			Number(url.searchParams.get('pageSize') ?? String(SKETCHES_PAGE_SIZE)),
		)

		const result = await getSketches(page, pageSize)

		return jsonResponse(result, 200, {
			'Cache-Control': 'private, no-store',
		})
	} catch (e: any) {
		return errResponse(TAG, 'Failed to fetch sketches')
	}
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
	if (!cookieHeader) return {}
	const cookies: Record<string, string> = {}
	cookieHeader.split(';').forEach((cookie) => {
		const parts = cookie.trim().split('=')
		if (parts.length >= 2) {
			const key = parts[0]?.trim()
			const val = parts.slice(1).join('=').trim()
			if (key) {
				cookies[key] = decodeURIComponent(val)
			}
		}
	})
	return cookies
}

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
const DEVICE_RATE_LIMIT_PER_HOUR = 3
const IP_RATE_LIMIT_PER_HOUR = 15

export async function POST({ request }: { request: Request }) {
	const TAG = 'SketchesApiPOST'

	try {
		const body = await request.json()

		const parsed = sketchInsertSchema.safeParse(body)
		if (!parsed.success) return errResponse(TAG, 'Invalid request body', 400)

		const adapter = await getDbAdapter()
		if (!adapter) {
			return errResponse(
				TAG,
				'Visitor wall is currently disabled (database unconfigured).',
				503,
			)
		}

		const ip =
			request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
			request.headers.get('x-real-ip') ||
			request.headers.get('cf-connecting-ip') ||
			'unknown'

		const cookieHeader = request.headers.get('cookie')
		const cookies = parseCookies(cookieHeader)
		const existingDeviceId = cookies['visitor_token']?.trim()
		const deviceId = existingDeviceId || crypto.randomUUID()
		const setCookieHeader = `visitor_token=${deviceId}; Path=/; Max-Age=31536000; SameSite=Lax; HttpOnly`

		const ninetyDaysAgo = new Date(Date.now() - NINETY_DAYS_MS)
		const latestSensitive = await adapter.getLatestSensitiveSketchByDevice(
			deviceId,
			ninetyDaysAgo,
		)
		if (latestSensitive) {
			const cooldownUntil = new Date(
				new Date(latestSensitive.createdAt).getTime() + NINETY_DAYS_MS,
			)
			if (cooldownUntil.getTime() > Date.now()) {
				return jsonResponse(
					{
						error: 'Device in cooldown',
						cooldownUntil: cooldownUntil.toISOString(),
					},
					403,
					{ 'Set-Cookie': setCookieHeader },
				)
			}
		}

		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
		const recentDeviceCount = await adapter.countRecentSketchesByDevice(
			deviceId,
			oneHourAgo,
		)
		if (recentDeviceCount >= DEVICE_RATE_LIMIT_PER_HOUR) {
			return jsonResponse({ error: 'Rate limit exceeded' }, 429, {
				'Set-Cookie': setCookieHeader,
			})
		}

		const recentIpCount = await adapter.countRecentSketchesByIp(ip, oneHourAgo)
		if (recentIpCount >= IP_RATE_LIMIT_PER_HOUR) {
			return jsonResponse({ error: 'Rate limit exceeded' }, 429, {
				'Set-Cookie': setCookieHeader,
			})
		}

		const image = webpBase64ToBinary(parsed.data.imageWebp)
		const moderation = await moderateSketch({
			image,
			name: parsed.data.name,
			message: parsed.data.message,
		})

		const result = await adapter.createSketch({
			name: parsed.data.name,
			message: parsed.data.message,
			image,
			ip,
			deviceId,
			isSensitive: moderation.isSensitive,
		})

		log(
			'info',
			TAG,
			`New sketch submitted from IP ${ip} (device: ${deviceId}) with id ${result._id} (isSensitive: ${result.isSensitive})`,
		)
		return jsonResponse(result, 201, {
			'Set-Cookie': setCookieHeader,
		})
	} catch (e: any) {
		return errResponse(TAG, 'Failed to save sketch')
	}
}

const sketchInsertSchema = z.object({
	name: z.string(),
	message: z.string(),
	imageWebp: z.string().min(1),
})