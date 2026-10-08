import type { dictionary } from '@/i18n/dictionary'
import type { LucideIcon } from 'lucide-react'

export type LocalizedString = (keyof typeof dictionary.en) | (string & {})

interface Link {
	icon: LucideIcon
	href: string
	label: LocalizedString
	variation?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
	isExternal?: boolean
}

export interface Experience {
	name: string
	href: string
	title: string
	logo: string
	start?: string
	end?: string
	subtitle?: string
	list?: {
		isMarkdown?: boolean
		content: LocalizedString
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

export interface Skill {
	name: string
	description: LocalizedString
	imageUrl: string
	imageDarkUrl?: string
	bgColor: string
	hide?: boolean
}

export type Theme = 'dark' | 'light'

export type Dictionary = (typeof dictionary)[keyof typeof dictionary] &
	Record<string, string | undefined>

export interface APIResponsePaginated<T> {
	data: T[]
	page: number
	pageSize: number
	total?: number
	nextPage?: number
}

export interface Sketch {
	_id: string
	name: string
	message: string
	createdAt: Date
	ip?: string
	deviceId?: string
	/** Present on optimistic cards before the server assigns a real id */
	imageWebp?: string
	isSensitive?: boolean
}
