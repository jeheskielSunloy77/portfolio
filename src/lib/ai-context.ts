import { BLOG_POSTS, CAREERS, EDUCATIONS, EMAIL, FULL_NAME, NICK_NAME, PROJECTS, SKILLS, WEBSITE_URL } from '@/lib/constants'
import type { Experience, Project } from '@/lib/types'

const LOCATION = 'Sleman, Yogyakarta, Indonesia'
const ORIGIN = 'Ambon, Maluku, Indonesia'
const LANGUAGES = ['English (fluent)', 'Indonesian (native)'] as const
const PROFESSIONAL_SUMMARY =
	'Jay is a software engineer focused on web and mobile development. His core stack includes TypeScript, Go, React, Next.js, Node.js, Kotlin Multiplatform, Laravel, Tailwind CSS, PostgreSQL, MongoDB, Redis, AWS, and Docker. He builds full-stack products across frontend, backend, and mobile, and regularly shares what he learns through his blog.'
const OTHER_STRENGTHS = [
	'Clean Architecture',
	'Design Patterns',
	'Agile Methodologies',
	'Git and GitHub',
] as const
const OPEN_SOURCE = [
	{
		name: 'LangChain JS contributor',
		href: 'https://github.com/langchain-ai/langchainjs',
		summary: 'Fixed bugs discovered while using the library.',
	},
] as const
const INTERESTS = [
	'Reading technical blogs, articles, and books',
	'Contributing to open source',
	'Building side projects',
	'Badminton and running',
] as const
const RESUME_LINKS = {
	english: `${WEBSITE_URL}/resume-en.pdf`,
	indonesian: `${WEBSITE_URL}/resume-id.pdf`,
} as const
const IMPORTANT_ROUTES = {
	home: WEBSITE_URL,
	contact: `${WEBSITE_URL}/en/contact`,
	privacy: `${WEBSITE_URL}/en/privacy`,
	projects: `${WEBSITE_URL}/en/projects`,
	visitors: `${WEBSITE_URL}/en/visitors`,
	blog: `${WEBSITE_URL}/en/blog`,
} as const
const HOME_PAGE_SECTIONS = ['Hero', 'Experience', 'Skills', 'Projects', 'Posts'] as const

function formatList(items: readonly string[]) {
	return items.map((item) => `- ${item}`).join('\n')
}

function formatExperienceSection(title: string, experiences: Experience[]) {
	const body = experiences
		.map((experience) => {
			const duration =
				experience.start && experience.end
					? `${experience.start} to ${experience.end}`
					: experience.start
						? `${experience.start} to Present`
						: experience.subtitle

			const list = experience.list?.map((item) => `- ${item.content}`).join('\n') ?? ''

			return [
				`### ${experience.title} at ${experience.name}`,
				duration ? `- Duration: ${duration}` : undefined,
				experience.href ? `- Link: ${experience.href}` : undefined,
				list,
			]
				.filter(Boolean)
				.join('\n')
		})
		.join('\n\n')

	return `## ${title}\n\n${body}`
}

function formatProjectsSection(projects: Project[]) {
	const body = projects
		.map((project) => {
			const links =
				project.links?.length
					? ['- Links:', ...project.links.map((link) => `  - ${link.label}: ${link.href}`)].join('\n')
					: project.href
						? `- Link: ${project.href}`
						: ''

			return [
				`### ${project.name}`,
				`- Description: ${project.description}`,
				`- Tech: ${project.tags.join(', ')}`,
				links,
			]
				.filter(Boolean)
				.join('\n')
		})
		.join('\n\n')

	return `## Projects\n\n${body}`
}

function formatBlogPostsSection() {
	return `## Blog Posts\n\n${BLOG_POSTS.map((post) => {
		return [
			`### ${post.title}`,
			`- Summary: ${post.summary}`,
			`- English: ${post.english}`,
			`- Indonesian: ${post.indonesian}`,
		].join('\n')
	}).join('\n\n')}`
}

export function buildPortfolioAssistantContext() {
	return [
		'# Jay Portfolio Assistant Context',
		'',
		'## Identity',
		'',
		`- Full name: ${FULL_NAME}`,
		`- Nickname: ${NICK_NAME}`,
		`- Website: ${WEBSITE_URL}`,
		`- Location: ${LOCATION}`,
		`- Origin: ${ORIGIN}`,
		`- Email: ${EMAIL}`,
		`- Languages: ${LANGUAGES.join(', ')}`,
		'',
		'## Professional Summary',
		'',
		PROFESSIONAL_SUMMARY,
		'',
		formatExperienceSection('Work Experience', CAREERS),
		'',
		formatExperienceSection('Education', EDUCATIONS),
		'',
		'## Skills',
		'',
		'### Programming Languages and Frameworks',
		'',
		formatList(SKILLS.map((skill) => skill.name)),
		'',
		'### Other Strengths',
		'',
		formatList(OTHER_STRENGTHS),
		'',
		formatProjectsSection(PROJECTS),
		'',
		'## Portfolio Website',
		'',
		'- Description: Personal portfolio built with Astro, React, and Tailwind CSS.',
		'- Launch date: January 2025',
		'- Supported languages: English and Indonesian',
		'- Resume links:',
		`  - English: ${RESUME_LINKS.english}`,
		`  - Indonesian: ${RESUME_LINKS.indonesian}`,
		'',
		'### Important Routes',
		'',
		`- Home: ${IMPORTANT_ROUTES.home}`,
		`- Contact: ${IMPORTANT_ROUTES.contact}`,
		`- Privacy: ${IMPORTANT_ROUTES.privacy}`,
		`- Projects: ${IMPORTANT_ROUTES.projects}`,
		`- Visitors: ${IMPORTANT_ROUTES.visitors}`,
		`- Blog index: ${IMPORTANT_ROUTES.blog}`,
		'',
		'### Home Page Sections',
		'',
		formatList(HOME_PAGE_SECTIONS),
		'',
		formatBlogPostsSection(),
		'',
		'## Open Source',
		'',
		OPEN_SOURCE.map((item) => `- ${item.name}: ${item.href}\n- Contribution summary: ${item.summary}`).join('\n'),
		'',
		'## Personal Interests',
		'',
		formatList(INTERESTS),
		'',
		'## Response Rules',
		'',
		'- Answer only using facts found in this document.',
		'- If something is not covered here, say you do not know instead of guessing.',
		'- When useful, include the most relevant explicit link from this document.',
	].join('\n')
}
