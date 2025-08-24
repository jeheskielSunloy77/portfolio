import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
	host: import.meta.env.SMTP_HOST,
	port: +import.meta.env.SMTP_PORT,
	secure: true,
	auth: {
		user: import.meta.env.SMTP_USER,
		pass: import.meta.env.SMTP_PASS,
	},
})

export const server = {
	sendEmail: defineAction({
		accept: 'json',
		input: z.object({
			name: z.string().min(2),
			email: z.string().email(),
			message: z.string().min(5),
		}),
		handler: async ({ name, email, message }) => {
			try {
				await transporter.sendMail({
					from: `"${name}" <${email}>`,
					to: import.meta.env.SMTP_RECEIVER_EMAIL,
					subject: `New Contact Form Submission from ${name}`,
					text: message,
					html: `<p><b>From:</b> ${name} (${email})</p>
                 <p><b>Message:</b></p>
                 <p>${message}</p>`,
				})

				return { success: true }
			} catch (err) {
				console.error('Email sending failed:', err)
				throw new Error('Failed to send email.')
			}
		},
	}),
}
