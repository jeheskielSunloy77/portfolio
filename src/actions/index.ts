import { EMAIL } from '@/site.config'
import { log } from '@/lib/utils'
import { defineAction } from 'astro:actions'
import { SMTP_URL } from 'astro:env/server'
import nodemailer from 'nodemailer'
import { z } from 'zod'

function getTransporter() {
	if (SMTP_URL?.trim()) {
		return nodemailer.createTransport(SMTP_URL.trim())
	}

	return null
}

export const server = {
	sendEmail: defineAction({
		accept: 'json',
		input: z.object({
			name: z.string().min(2),
			email: z.email(),
			message: z.string().min(5),
		}),
		handler: async ({ name, email, message }) => {
			const TAG = 'SendEmailAction'
			try {
				const transporter = getTransporter()

				if (!transporter) {
					log(
						'info',
						TAG,
						`[SIMULATION] SMTP not configured. Contact submission from ${name} <${email}>:\n${message}`,
					)
					return { success: true }
				}

				const payload = {
					from: `"${name}" <${email}>`,
					to: EMAIL,
					subject: `New Contact Form Submission from ${name}`,
					text: message,
					html: `<p><b>From:</b> ${name} (${email})</p>
                 <p><b>Message:</b></p>
                 <p>${message}</p>`,
				}

				await transporter.sendMail(payload)

				log('info', TAG, `Email sent successfully from ${name} <${email}>`)

				return { success: true }
			} catch (err) {
				log('error', TAG, 'Email sending failed:', err)
				throw new Error('Failed to send email.')
			}
		},
	}),
}
