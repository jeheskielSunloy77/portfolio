import type { LucideIcon } from 'lucide-react'

export interface Experience {
	name: string
	href: string
	title: string
	logo: string
	start?: string
	end?: string
	subtitle?: string
	description?: string[]
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
