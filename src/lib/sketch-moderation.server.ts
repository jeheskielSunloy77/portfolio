import { getChatModel } from '@/lib/ai-provider'
import { log } from '@/lib/utils'
import { generateObject } from 'ai'
import { z } from 'zod'

const TAG = 'SketchModeration'

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

export async function moderateSketch(
	input: ModerateSketchInput,
	timeoutMs = 4000,
): Promise<ModerationResult> {
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
			`Moderation check failed or timed out: ${error instanceof Error ? error.message : String(error)}. Defaulting to safe.`,
		)
		return { isSensitive: false }
	}
}
