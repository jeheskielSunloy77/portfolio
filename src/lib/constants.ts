import type { Experience, Project, Skill } from '@/lib/types'
import { Github, Globe, Linkedin, Mail } from 'lucide-react'

export const BIRTH_DATE = new Date('2000-12-30')
export const NICK_NAME = 'Jay'
export const FULL_NAME = 'Jeheskiel Sunloy'
export const BOT_NAME = 'J-assist'
export const EMAIL = 'jeheskielventiokysunloy@gmail.com'
export const FEATURED_PROJECTS_LIMIT = 2
export const FEATURED_POSTS_LIMIT = 3
export const APP_NAME = 'jeheskielsunloy.com'

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
export const CAREERS: Experience[] = [
	{
		name: 'PéMad International Transearch',
		href: 'https://pemad.or.id',
		title: 'Software Engineer',
		logo: '/me/work3.svg',
		start: 'Mar 2024',
		list: [
			{
				content:
					'Working as a software engineer, building and maintaining mobile and web applications.',
			},
			{
				content:
					'A part of the [digipémad](https://digipemad.com) team, a child company of PéMad that focuses on software development products and services.',
				isMarkdown: true,
			},
			{
				content:
					'Collaborating with cross-functional teams to deliver high-quality software solutions.',
			},
		],
	},
	{
		name: 'Refactory Internship',
		href: 'https://refactory.id',
		title: 'Software Engineer Intern',
		logo: '/me/work2.jpg',
		start: 'Jul 2022',
		end: 'Sep 2022',
		list: [
			{ content: 'Internship program by Refactory' },
			{
				content: 'Intensive 7-week program focused on full-stack web development.',
			},
			{
				content:
					'Learned modern web technologies including React, Node.js, and Golang.',
			},
			{ content: 'Paired with experienced professionals to enhance my skills.' },
		],
	},
	{
		name: 'KreasiX Internship',
		href: 'https://www.kreasix.com',
		title: 'Developer Intern',
		logo: '/me/work1.jpeg',
		start: 'May 2022',
		end: 'Jul 2022',
		description:
			'My first internship experience, one of the project i did during my internship was to build a backend for the company website using Node.js and Firebase',
	},
]

export const EDUCATIONS: Experience[] = [
	{
		name: 'Satya Wacana Christian University',
		href: 'https://uksw.edu',
		title: 'Bachelor of Science in Computer Science',
		logo: '/me/education1.svg',
		subtitle: 'Enroled on Aug 2017',
		list: [
			{
				content:
					'Focused on algorithms, web development, and software engineering principles.',
			},
			{ content: 'Completed a senior project on real‑time collaboration tools.' },
		],
	},
	{
		name: 'SMA 1 Ambon',
		href:
			'https://sekolah.data.kemdikbud.go.id/index.php/chome/profil/4c8c345a-8d71-4e48-b706-b9bab6fdb2aa',
		title: 'High School Diploma',
		logo: '/me/education2.webp',
		start: 'Jul 2014',
		end: 'Jul 2017',
		description:
			'Not the best student, but always tried my best. Learned a lot of things during my time in high school and developed a strong interest in programming.',
	},
]

export const SKILLS: Skill[] = [
	{
		name: 'TypeScript',
		description: 'JavaScript with trust issues',
		imageUrl: '/skills/typescript.svg',
		bgColor: 'bg-[#3178C6]/20',
	},
	{
		name: 'Golang',
		description: 'if err != nil, cry',
		imageUrl: '/skills/go.svg',
		bgColor: 'bg-[#00ACD7]/20',
	},
	{
		name: 'NextJS',
		description: '$npx create-next-app',
		imageUrl: '/skills/nextjs.svg',
		bgColor: 'bg-foreground/10',
	},
	{
		name: 'AWS',
		description: 'Cloudy with a chance of bills',
		imageUrl: '/skills/aws.svg',
		imageDarkUrl: '/skills/aws-dark.svg',
		bgColor: 'bg-[#FF9900]/20',
	},
	{
		name: 'Tailwind',
		description: '<div> soup generator',
		imageUrl: '/skills/tailwind.svg',
		bgColor: 'bg-[#0EA5E9]/20',
	},
	{
		name: 'Kotlin',
		description: 'KMP: Write once, cry twice',
		imageUrl: '/skills/kotlin.svg',
		bgColor: 'bg-[#E1725C]/20',
	},
	{
		name: 'Laravel',
		description: 'Coding, but cozy',
		imageUrl: '/skills/laravel.svg',
		bgColor: 'bg-[#FF2D20]/20',
	},
	{
		name: 'React Native',
		description: 'One codebase, twice the bugs',
		imageUrl: '/skills/react.svg',
		bgColor: 'bg-[#61DAFB]/20',
	},
	{
		name: 'Docker',
		description: 'But it works on my machine™',
		imageUrl: '/skills/docker.svg',
		bgColor: 'bg-[#099CEC]/20',
	},
	{
		name: 'MongoDB',
		description: "When you don't need schemas (until you do)",
		imageUrl: '/skills/mongodb.svg',
		bgColor: 'bg-[#599636]/30',
	},
	{
		name: 'Redis',
		description: 'SET it and forget it',
		imageUrl: '/skills/redis.svg',
		bgColor: 'bg-[#FF4438]/20',
	},
	{
		name: 'SQL',
		description: 'JOIN pain with suffering',
		imageUrl: '/skills/postgresql.svg',
		bgColor: 'bg-[#336791]/20',
	},
]

export const PROJECTS: Project[] = [
	{
		isFeatured: true,
		name: 'Academic Information System',
		href: 'https://nextjs-iakn-kupang.vercel.app/',
		description:
			'A full featured academic information system for IAKN Kupang University. It includes features like student registration, course management, academic records, LMS, and more.',
		tags: ['nextjs', 'postgresql', 'tailwindcss', 'typescript'],
		image: '/projects/iaknKupang.webp',
		links: [
			{
				name: 'Demo',
				href: 'https://nextjs-iakn-kupang.vercel.app/',
				icon: Globe,
			},
		],
	},
	{
		isFeatured: true,
		name: 'Cross Platform Coffee Shop App',
		href: 'https://github.com/jeheskielSunloy77/react-native-coffee-shop',
		description:
			'A cross-platform mobile application for ordering coffee from local shops.',
		tags: ['react-native', 'expo', 'supabase', 'typescript', 'tailwindcss'],
		image: '/projects/coffeeShopApp.webp',
		links: [
			{
				name: 'Source',
				href: 'https://github.com/jeheskielSunloy77/react-native-coffee-shop',
				icon: Github,
			},
		],
	},
	{
		name: 'Ecommerce App',
		href: 'https://github.com/jeheskielSunloy77/laravel-ecommerce',
		description:
			'The Ecommerce App is a full-stack web application built using PHP, Laravel, and Tailwindcss. The app is designed to provide users with a seamless shopping experience, from browsing products to placing orders.',
		tags: ['php', 'laravel', 'tailwindcss'],
		image: '/projects/ecommerce.webp',
		links: [
			{
				name: 'Source',
				href: 'https://github.com/jeheskielSunloy77/laravel-ecommerce',
				icon: Github,
			},
		],
	},
	{
		name: 'Ecommerce Web Scraper',
		href: 'https://go-ecommerce-scraper.vercel.app/',
		description:
			'A webscraper build with GO using serverless functions technology, that can scrape the web looking for any product from the user.',
		tags: ['go', 'colly'],
		image: '/projects/webscraper.webp',
		links: [
			{
				name: 'Demo',
				href: 'https://go-ecommerce-scraper.vercel.app/',
				icon: Globe,
			},
			{
				name: 'Source',
				href: 'https://github.com/jeheskielSunloy77/go-ecommerce-scraper',
				icon: Github,
			},
		],
	},
	{
		name: 'CRUD App',
		href: 'https://dataon-project.vercel.app/',
		description:
			'A simple CRUD application with Antd on the frontend and using mockapi.io to handle the resources.',
		tags: ['react', 'antd', 'tailwindcss'],
		image: '/projects/crudApp.webp',
		links: [
			{
				name: 'Demo',
				href: 'https://dataon-project.vercel.app/',
				icon: Globe,
			},
			{
				name: 'Source',
				href: 'https://github.com/jeheskielSunloy77/dataon-project',
				icon: Github,
			},
		],
	},
	{
		name: 'PWA Weather App',
		href: 'https://nextjs-weather-app-lemon.vercel.app/',
		description:
			'A progressive web application that can be installed on any device that can provide an accurate weather report from all around the world.',
		tags: ['nextjs', 'tailwindcss', 'typescript'],
		image: '/projects/weatherApp.webp',
		links: [
			{
				name: 'Demo',
				href: 'https://nextjs-weather-app-lemon.vercel.app/',
				icon: Globe,
			},
			{
				name: 'Source',
				href: 'https://github.com/jeheskielSunloy77/nextjs-weather-app',
				icon: Github,
			},
		],
	},
	{
		name: 'IAKN Kupang Profile Website',
		href: 'https://iakn-kupang-profile.vercel.app/',
		description:
			'A Fullstack web app for IAKN Kupang University build with Astro, Tailwindcss and Postgresql.',
		tags: ['nextjs', 'tailwindcss', 'postgresql', 'typescript'],
		image: '/projects/iaknProfile.webp',
		links: [
			{
				name: 'Demo',
				href: 'https://iakn-kupang-profile.vercel.app/',
				icon: Globe,
			},
		],
	},
]
