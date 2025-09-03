import type { dictionary } from '@/i18n/dictionary'
import type { LucideIcon } from 'lucide-react'

export type LocalizedString = keyof typeof dictionary.en

interface Link {
	icon: LucideIcon
	href: string
	name: LocalizedString
}

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
	links?: Link[]
}

export interface Project {
	isFeatured?: boolean
	image?: ImageMetadata
	name: LocalizedString
	description: LocalizedString
	href?: string
	tags: string[]
	links?: Link[]
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
	description: LocalizedString
	imageUrl: string
	imageDarkUrl?: string
	bgColor: string
	hide?: boolean
}

export type Theme = 'dark' | 'light'

export type Dictionary = typeof dictionary.en

export interface APIResponsePaginated<T> {
	data: T[]
	page: number
	pageSize: number
	total: number
	nextPage?: number
}
