import type { Theme } from '@/lib/types'
import { atom } from 'nanostores'

export const theme = atom<Theme>(
	(typeof window !== 'undefined'
		? localStorage.getItem('theme')
		: 'dark') as Theme
)
