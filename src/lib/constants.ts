import type { Experience, Project } from '@/lib/types'
import { Github, Globe, Linkedin, Mail } from 'lucide-react'

export const BIRTH_DATE = new Date('2000-12-30')
export const NICK_NAME = 'Jay'
export const FULL_NAME = 'Jeheskiel Sunloy'
export const BOT_NAME = 'jBot'
export const SOCIALS = [
	{
		name: 'LinkedIn',
		href: 'https://www.linkedin.com/in/jeheskiel-ventioky-sunloy',
		icon: Linkedin,
	},
	{
		name: 'GitHub',
		href: 'https://github.com/jeheskielSunloy77',
		icon: Github,
	},
	{
		name: 'Email',
		href: 'mailto:jeheskielventiokysunloy@gmail.com',
		icon: Mail,
	},
]
export const APP_NAME = 'jeheskielsunloy.com'
export const CAREERS: Experience[] = [
	{
		name: 'Singapore Institute of Technology',
		href: 'https://www.singaporetech.edu.sg',
		title: 'Software Developer (Contract)',
		logo: '/sit.png',
		start: 'Apr 2023',
		end: 'Jun 2023',
		description: [
			'Built NFTVue, an NFT gallery website that allows students to connect their crypto wallets to view and verify school event–issued NFTs.',
			'Worked on DemoConstruct, a full‑stack web application (React + Python) that uses Meshroom to reconstruct 3D models from captured images.',
		],
		links: [
			{
				name: 'NFTVue',
				href: 'https://nftvue.vercel.app',
				icon: Globe,
			},
		],
	},
	{
		name: 'Acme Webworks',
		href: 'https://acme-webworks.example',
		title: 'Frontend Engineer',
		logo: '/acme.png',
		start: 'Jun 2022',
		end: 'Present',
		description: [
			'Worked on responsive, accessible web applications using modern frontend tooling.',
			'Collaborated with design and backend teams to deliver features end‑to‑end.',
		],
	},
	{
		name: 'Bright Labs',
		href: 'https://bright-labs.example',
		title: 'Software Engineer Intern',
		logo: '/bright.png',
		start: 'Jun 2021',
		end: 'Dec 2021',
		description: [
			'Implemented UI components and integration tests.',
			'Participated in sprint planning and code reviews.',
		],
	},
]

export const EDUCATIONS: Experience[] = [
	{
		name: 'University of Example',
		href: 'https://university-of-example.example',
		title: 'Bachelor of Science in Computer Science',
		logo: '/university.png',
		start: 'Aug 2018',
		end: 'May 2022',
		description: [
			'Focused on algorithms, web development, and software engineering principles.',
			'Completed a senior project on real‑time collaboration tools.',
		],
	},
	{
		name: 'Online Academy',
		href: 'https://online-academy.example',
		title: 'Full‑Stack Web Development Certificate',
		logo: '/online-academy.png',
		start: 'Mar 2021',
		end: 'Sep 2021',
		description: [
			'Immersive program covering modern frontend and backend technologies with project‑based assessments.',
		],
	},
]

export const PROJECTS: Project[] = [
	{
		isFeatured: true,
		image: '/screenshots/nftvue.png',
		name: 'NFTVue',
		description:
			'An **NFT gallery** that lets students connect crypto wallets to view and verify event‑issued NFTs.\n\nBuilt with Next.js and React.',
		href: 'https://nftvue.vercel.app',
		tags: ['react', 'web3', 'nextjs'],
		links: [
			{ name: 'Live Demo', href: 'https://nftvue.vercel.app', icon: Globe },
			{
				name: 'Source',
				href: 'https://github.com/jeheskielSunloy77/nftvue',
				icon: Github,
			},
		],
	},
	{
		isFeatured: true,
		image: '/screenshots/democonstruct.png',
		name: 'DemoConstruct',
		description:
			'Full‑stack app that reconstructs 3D models from images using **Meshroom** and a React frontend.\n\nFeatures:\n- Image preprocessing\n- 3D reconstruction pipeline\n- Interactive model viewer',
		tags: ['react', 'python', '3d'],
		links: [
			{
				name: 'Project Page',
				href: 'https://demo-construct.example',
				icon: Globe,
			},
		],
	},
	{
		image: '/screenshots/portfolio.png',
		name: 'Personal Portfolio',
		description:
			'This website: built with **TypeScript**, **React**, and **Tailwind** — responsive and accessible.\n\nSee the [source on GitHub](https://github.com/jeheskielSunloy77/portfolio).',
		href: 'https://jeheskielsunloy.com',
		tags: ['typescript', 'react', 'tailwind'],
		links: [
			{ name: 'Live', href: 'https://jeheskielsunloy.com', icon: Globe },
			{
				name: 'Source',
				href: 'https://github.com/jeheskielSunloy77/portfolio',
				icon: Github,
			},
		],
	},
	{
		name: 'Open Source CLI Tool',
		description:
			'Small CLI utility to scaffold and lint projects quickly.\n\nWritten in Node.js — see the [repository](https://github.com/jeheskielSunloy77/cli-tool) for usage and examples.',
		tags: ['node', 'cli'],
		links: [
			{
				name: 'Source',
				href: 'https://github.com/jeheskielSunloy77/cli-tool',
				icon: Github,
			},
		],
	},
]

export const FEATURED_PROJECTS_LIMIT = 2
export const FEATURED_POSTS_LIMIT = 3
