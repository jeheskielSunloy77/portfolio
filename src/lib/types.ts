import type { LucideIcon } from 'lucide-react'

export interface Experience {
	name: string
	href: string
	title: string
	logo: string
	start?: string
	end?: string
	subtitle?: string
	description?: string
	list?: {
		isMarkdown?: boolean
		content: string
	}[]
	links?: { icon: LucideIcon; href: string; name: string }[]
}

export interface Project {
	isFeatured?: boolean
	image?: string
	name: string
	description: string
	href?: string
	tags: string[]
	links?: { icon: LucideIcon; href: string; name: string }[]
}

export type PostMetadata = {
	title?: string
	summary?: string
	image?: string
	publishedAt?: string
	slug: string
}

export interface Skill {
	name: string
	description: string
	imageUrl: string
	imageDarkUrl?: string
	bgColor: string
	hide?: boolean
}

export type Theme = 'dark' | 'light'
