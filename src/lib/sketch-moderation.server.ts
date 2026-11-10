import { getChatModel } from '@/lib/ai-provider'
import { log } from '@/lib/utils'
import { generateObject } from 'ai'
import { z } from 'zod'

const TAG = 'SketchModeration'

export const DEFAULT_MODERATION_TIMEOUT_MS = 10000

export class ModerationUnavailableError extends Error {
	constructor(
		message = 'Content verification timed out or failed. Please try submitting again.',
	) {
		super(message)
		this.name = 'ModerationUnavailableError'
	}
}

export interface ModerationResult {
	isSensitive: boolean
	reason?: string
}

export interface ModerateSketchInput {
	image: Buffer
	name: string
	message: string
}

export const sketchModerationSchema = z.object({
	isSensitive: z
		.boolean()
		.describe('Whether the sketch contains sensitive, NSFW, hate, or violent content.'),
	reason: z.string().optional().describe('Brief explanation if flagged as sensitive.'),
})

/**
 * Fast regex-based pre-filter to instantly flag severe hate speech,
 * slurs, explicit sexual solicitation, and violent threats in name or message
 * without needing an external AI call.
 */
export function checkTextSafety(
	name: string,
	message: string,
): ModerationResult | null {
	const raw = `${name} ${message}`
	const text = raw
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')

	// Normalize common leetspeak substitutions
	const deobfuscated = text
		.replace(/[@]/g, 'a')
		.replace(/[$]/g, 's')
		.replace(/[0]/g, 'o')
		.replace(/[1!|]/g, 'i')
		.replace(/[3]/g, 'e')
		.replace(/[5]/g, 's')
		.replace(/[+]/g, 't')

	const textsToTest = [text, deobfuscated]

	// 1. Hate speech / threats targeting religious, ethnic, or demographic groups
	const targetedHateRegex =
		/\b(kill|murder|death\s+to|slaughter|burn|destroy|hang|gas|shoot|behead|decapitate|eradicate)\s+(all\s+)?(the\s+)?(fucking\s+|stinky\s+)?(jews?|jewish|muslims?|islam(ic|ist)?|christians?|hindus?|arabs?|blacks?|whites?|asians?|gays?|queers?|trans|israel|palestine)\b/i

	const hostilityRegex =
		/\b(fuck|hates?)\s+(all\s+)?(the\s+)?(fucking\s+)?(jews?|jewish|muslims?|islam(ic|ist)?|christians?|hindus?|arabs?|blacks?|whites?|gays?|queers?|trans|allah|jesus|god|israel|palestine)\b/i

	const groupDehumanizationRegex =
		/\b(islam|muslim|jew|jewish|christian|black|white|arab|gay|trans)\b.{0,40}\b(cancer|disease|scum|cockroach(es)?|rats?|parasites?|subhuman|pigs?)\b/i

	// 2. Severe slurs (racial, ethnic, religious, LGBTQ+)
	const slursRegex =
		/\b(nigger|nigga|kike|faggot|chink|gook|spic|tranny|retard)\b/i

	// 3. Explicit sexual solicitation or extreme nsfw text
	const sexualRegex =
		/\b(fuck\s+me|suck\s+my\s+dick|blowjob|penis|vagina|cunt|pussy|dickpic)\b/i

	// 4. Violent threats
	const violenceRegex =
		/\b(kill|murder|shoot|bomb|slaughter)\s+(all|every|everyone|your\s+family|yourself)\b/i

	for (const t of textsToTest) {
		if (
			targetedHateRegex.test(t) ||
			hostilityRegex.test(t) ||
			groupDehumanizationRegex.test(t) ||
			slursRegex.test(t) ||
			violenceRegex.test(t)
		) {
			return {
				isSensitive: true,
				reason: 'Flagged by content safety filters for hate speech, slurs, or violent content.',
			}
		}
		if (sexualRegex.test(t)) {
			return {
				isSensitive: true,
				reason: 'Flagged by content safety filters for sexually explicit or suggestive text.',
			}
		}
	}

	return null
}

export async function moderateSketch(
	input: ModerateSketchInput,
	timeoutMs = DEFAULT_MODERATION_TIMEOUT_MS,
): Promise<ModerationResult> {
	// 1. Fast text safety check
	const textCheckResult = checkTextSafety(input.name, input.message)
	if (textCheckResult) {
		log(
			'info',
			TAG,
			`Sketch by "${input.name}" flagged by fast text pre-filter: ${textCheckResult.reason}`,
		)
		return textCheckResult
	}

	// 2. Multimodal AI moderation
	try {
		const aiConfig = getChatModel()
		if (!aiConfig.model) {
			log(
				'info',
				TAG,
				'AI model is not available for moderation. Defaulting to unflagged.',
			)
			return { isSensitive: false }
		}

		const response = await generateObject({
			model: aiConfig.model,
			schema: sketchModerationSchema,
			messages: [
				{
					role: 'user',
					content: [
						{
							type: 'text',
							text: `You are a content moderation classifier for an interactive sketch wall on a developer portfolio website.
Evaluate the visitor's submitted drawing and associated text.
Author name: "${input.name}"
Message: "${input.message}"

Flag as sensitive (isSensitive: true) ONLY if the submission contains:
1. Explicit nudity, sexual organs, or sexually suggestive/explicit drawings.
2. Hate symbols (e.g. swastikas, Nazi imagery), slurs, or targeted hate speech.
3. Graphic violence, gore, or extreme self-harm depictions.

DO NOT flag (isSensitive: false) harmless drawings, innocent stick figures, funny doodles, cartoons, abstract shapes, friendly banter, or playful art. When in doubt, do not flag.`,
						},
						{
							type: 'image',
							image: input.image,
							mediaType: 'image/webp',
						},
					],
				},
			],
			abortSignal: AbortSignal.timeout(timeoutMs),
		})

		const result = response.object
		if (result.isSensitive) {
			log(
				'info',
				TAG,
				`Sketch by "${input.name}" flagged as sensitive. Reason: ${result.reason || 'N/A'}`,
			)
		}

		return {
			isSensitive: Boolean(result.isSensitive),
			reason: result.reason,
		}
	} catch (error) {
		log(
			'warn',
			TAG,
			`Moderation check failed or timed out: ${error instanceof Error ? error.message : String(error)}. Failing closed.`,
		)
		throw new ModerationUnavailableError(
			'Content verification timed out or failed. Please try submitting again.',
		)
	}
}
