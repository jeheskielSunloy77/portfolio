import type { Experience, Project } from '@/lib/types'
import { Github, Globe, Linkedin, Mail } from 'lucide-react'

export const BIRTH_DATE = new Date('2000-12-30')
export const NICK_NAME = 'Jay'
export const FULL_NAME = 'Jeheskiel Sunloy'
export const BOT_NAME = 'jBot'
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
		name: 'digipémad',
		href: 'https://digipemad.com',
		title: 'Software Engineer',
		logo: '/me/work3.webp',
		start: 'Mar 2024',
		description: [
			'The child company of PéMad International Transearch, focusing on software development and IT solutions.',
			'Working as a software engineer, focusing on full-stack development using Next.js and Node.js.',
			'Building and maintaining web applications for various clients.',
		],
	},
	{
		name: 'PéMad International Transearch',
		href: 'https://pemad.or.id',
		title: 'Software Engineer',
		logo: '/me/work2.svg',
		start: 'Mar 2024',
		description: [
			'Working as a software engineer, building and maintaining internal applications.',
			'Collaborating with cross-functional teams to deliver high-quality software solutions.',
		],
	},
	{
		name: 'KreasiX Internship',
		href: 'https://www.kreasix.com',
		title: 'Developer Intern',
		logo: '/me/work1.jpeg',
		start: 'May 2022',
		end: 'Jul 2022',
		description: [
			'My first internship experience, one of the project i did during my internship was to build a backend for the company website using Node.js and Firebase',
		],
	},
]

export const EDUCATIONS: Experience[] = [
	{
		name: 'Refactory Bootcamp',
		href: 'https://refactory.id',
		title: 'Software Engineer Intern',
		logo: '/me/education2.jpg',
		start: 'Jul 2022',
		end: 'Sep 2022',
		description: [
			'Bootcamp + Internship program by Refactory',
			'Intensive 7-week program focused on full-stack web development.',
			'Learned modern web technologies including React, Node.js, and Golang.',
			'Worked on team projects to build real-world applications.',
		],
	},
	{
		name: 'Satya Wacana Christian University',
		href: 'https://uksw.edu',
		title: 'Bachelor of Science in Computer Science',
		logo: '/me/education1.svg',
		subtitle: 'Enroled on Aug 2017',
		description: [
			'Focused on algorithms, web development, and software engineering principles.',
			'Completed a senior project on real‑time collaboration tools.',
		],
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
		image: '/projects/coffeeShopApp.png',
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
		href: 'https://ecommerce-app.example',
		description:
			'The Ecommerce App is a full-stack web application built using PHP, Laravel, and Tailwindcss. The app is designed to provide users with a seamless shopping experience, from browsing products to placing orders.',
		tags: ['php', 'laravel', 'tailwindcss'],
		image: '/projects/ecommerce.webp',
		links: [
			{
				name: 'Demo',
				href: 'https://ecommerce-app.example',
				icon: Globe,
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
