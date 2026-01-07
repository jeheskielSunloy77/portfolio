// src/envSchema.test.ts
import { describe, expect, test } from 'vitest'
import { envSchema } from './env' // Import the schema definition

// --- Mock Data ---
const validEnv = {
	SMTP_USER: 'testuser@example.com',
	SMTP_PASS: 'supersecretpassword123',
	SMTP_HOST: 'smtp.mailservice.com',
	SMTP_PORT: '587', // Use string, as process.env reads strings. Zod will coerce it.
	SMTP_RECEIVER_EMAIL: 'receiver@example.com',
	APP_URL: 'https://myapp.com',
	GEMINI_API_KEY: 'sk-gemini-key-example',
	PINECONE_API_KEY: 'pinecone-key-example',
	PINECONE_INDEX: 'portfolio-index',
	PINECONE_NAMESPACE: 'portfolio',
	MONGODB_URI: 'mongodb+srv://user:pass@cluster0.mongodb.net/mydb',
	MONGODB_DB: 'my_app_database',
}

// --- Test Suite ---
describe('Environment Variable Schema Validation', () => {
	// --- Success Case ---
	test('should successfully parse valid environment variables', () => {
		// Act: Parse the valid data
		const result = envSchema.safeParse(validEnv)

		// Assert: Check for success and correct type coercion
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.SMTP_PORT).toBe(587) // Verify coercion from string '587' to number 587
			expect(result.data.SMTP_USER).toBe('testuser@example.com')
		}
	})

	// --- Failure Cases: Missing Variables ---
	test('should fail if a required string variable is missing (e.g., SMTP_PASS)', () => {
		// Arrange: Remove a required field
		const { SMTP_PASS, ...invalidEnv } = validEnv

		// Act: Parse the incomplete data
		const result = envSchema.safeParse(invalidEnv)

		// Assert: Check for failure and specific error message
		expect(result.success).toBe(false)
		if (!result.success) {
			const issues = result.error.issues
			expect(issues).toHaveLength(1)
			expect(issues[0].path).toEqual(['SMTP_PASS'])
			expect(issues[0].message).toContain('Invalid input:')
		}
	})

	test('should fail if GEMINI_API_KEY is an empty string', () => {
		// Arrange: Set required string to empty (violates .min(1))
		const invalidEnv = { ...validEnv, GEMINI_API_KEY: '' }

		// Act
		const result = envSchema.safeParse(invalidEnv)

		// Assert
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.issues[0].message).toContain(
				'Too small: expected string to have >=1 characters'
			)
		}
	})

	// --- Failure Cases: Invalid Formats ---
	test('should fail if SMTP_USER has an invalid email format', () => {
		// Arrange: Provide invalid data format
		const invalidEnv = { ...validEnv, SMTP_USER: 'not-an-email-address' }

		// Act
		const result = envSchema.safeParse(invalidEnv)

		// Assert
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.issues[0].path).toEqual(['SMTP_USER'])
			expect(result.error.issues[0].message).toContain('Invalid email')
		}
	})

	test('should fail if APP_URL has an invalid URL format', () => {
		// Arrange: Provide invalid data format
		const invalidEnv = { ...validEnv, APP_URL: 'invalid-url' }

		// Act
		const result = envSchema.safeParse(invalidEnv)

		// Assert
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.issues[0].path).toEqual(['APP_URL'])
			expect(result.error.issues[0].message).toBe('Invalid URL')
		}
	})

	// --- Failure Cases: Type Coercion and Constraints ---
	test('should fail if SMTP_PORT is not a valid number string', () => {
		// Arrange: Provide data that cannot be coerced to a number
		const invalidEnv = { ...validEnv, SMTP_PORT: 'not-a-number' }

		// Act
		const result = envSchema.safeParse(invalidEnv)

		// Assert
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.issues[0].path).toEqual(['SMTP_PORT'])
			expect(result.error.issues[0].message).toBe(
				'Invalid input: expected number, received NaN'
			)
		}
	})

	test('should fail if SMTP_PORT is zero or negative (not positive)', () => {
		// Arrange: Port number must be positive (> 0)
		const invalidEnv = { ...validEnv, SMTP_PORT: '0' }

		// Act
		const result = envSchema.safeParse(invalidEnv)

		// Assert
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.issues[0].path).toEqual(['SMTP_PORT'])
			expect(result.error.issues[0].message).toBe(
				'Too small: expected number to be >0'
			)
		}
	})
})
