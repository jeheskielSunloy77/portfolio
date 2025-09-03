import education1 from '@/assets/me/education1.svg'
import education2 from '@/assets/me/education2.webp'
import work1 from '@/assets/me/work1.jpeg'
import work2 from '@/assets/me/work2.jpg'
import work3 from '@/assets/me/work3.svg'

import skillAwsDark from '@/assets/skills/aws-dark.svg'
import skillAws from '@/assets/skills/aws.svg'
import skillDocker from '@/assets/skills/docker.svg'
import skillGo from '@/assets/skills/go.svg'
import skillKotlin from '@/assets/skills/kotlin.svg'
import skillLaravel from '@/assets/skills/laravel.svg'
import skillMongodb from '@/assets/skills/mongodb.svg'
import skillNextjs from '@/assets/skills/nextjs.svg'
import skillPostgresql from '@/assets/skills/postgresql.svg'
import skillReact from '@/assets/skills/react.svg'
import skillRedis from '@/assets/skills/redis.svg'
import skillTailwind from '@/assets/skills/tailwind.svg'
import skillTypescript from '@/assets/skills/typescript.svg'

import projectCoffeeShop from '@/assets/projects/coffeeShopApp.webp'
import projectCrud from '@/assets/projects/crudApp.webp'
import projectEcommerce from '@/assets/projects/ecommerce.webp'
import projectIaknKupang from '@/assets/projects/iaknKupang.webp'
import projectIaknProfile from '@/assets/projects/iaknProfile.webp'
import projectOldPortfolio from '@/assets/projects/oldPortfolio.webp'
import projectWeather from '@/assets/projects/weatherApp.webp'
import projectWebscraper from '@/assets/projects/webscraper.webp'

import { dictionary } from '@/i18n/dictionary'
import { DEFAULT_LANGUAGE } from '@/i18n/i18n'
import type { Experience, Project, Skill } from '@/lib/types'
import { Github, Globe, Linkedin, Mail, Rss } from 'lucide-react'

const t = dictionary[DEFAULT_LANGUAGE]

export const BIRTH_DATE = new Date('2000-12-30')
export const NICK_NAME = 'jay'
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
		logo: work3.src,
		start: 'Mar 2024',
		list: [
			{
				content:
					t[
						'Working as a software engineer, building and maintaining mobile and web applications.'
					],
			},
			{
				content:
					t[
						'A part of the [digipémad](https://digipemad.com) team, a child company of PéMad that focuses on software development products and services.'
					],
				isMarkdown: true,
			},
			{
				content:
					t[
						'Collaborating with cross-functional teams to deliver high-quality software solutions.'
					],
			},
		],
	},
	{
		name: 'Refactory Internship',
		href: 'https://refactory.id',
		title: 'Software Engineer Intern',
		logo: work2.src,
		start: 'Jul 2022',
		end: 'Sep 2022',
		list: [
			{ content: t['Internship program by Refactory'] },
			{
				content:
					t['Intensive 7-week program focused on full-stack web development.'],
			},
			{
				content:
					t['Learned modern web technologies including React, Node.js, and Golang.'],
			},
			{
				content: t['Paired with experienced professionals to enhance my skills.'],
			},
		],
	},
	{
		name: 'KreasiX Internship',
		href: 'https://www.kreasix.com',
		title: 'Developer Intern',
		logo: work1.src,
		start: 'May 2022',
		end: 'Jul 2022',
		description:
			t[
				'My first internship experience, one of the project i did during my internship was to build a backend for the company website using Node.js and Firebase'
			],
	},
]

export const EDUCATIONS: Experience[] = [
	{
		name: 'Satya Wacana Christian University',
		href: 'https://uksw.edu',
		title: 'Bachelor of Science in Computer Science',
		logo: education1.src,
		subtitle: 'Enroled on Aug 2017',
		list: [
			{
				content: t['Completed a senior project on real‑time collaboration tools.'],
			},
			{
				content: t['Completed a senior project on real‑time collaboration tools.'],
			},
		],
	},
	{
		name: 'SMA 1 Ambon',
		href:
			'https://sekolah.data.kemdikbud.go.id/index.php/chome/profil/4c8c345a-8d71-4e48-b706-b9bab6fdb2aa',
		title: 'High School Diploma',
		logo: education2.src,
		start: 'Jul 2014',
		end: 'Jul 2017',
		description:
			t[
				'Not the best student, but always tried my best. Learned a lot of things during my time in high school and developed a strong interest in programming.'
			],
	},
]

export const SKILLS: Skill[] = [
	{
		name: 'TypeScript',
		description: 'JavaScript with trust issues',
		imageUrl: skillTypescript.src,
		bgColor: 'bg-[#3178C6]/20',
	},
	{
		name: 'Golang',
		description: 'if err != nil, cry',
		imageUrl: skillGo.src,
		bgColor: 'bg-[#00ACD7]/20',
	},
	{
		name: 'NextJS',
		description: '$npx create-next-app',
		imageUrl: skillNextjs.src,
		bgColor: 'bg-foreground/10',
	},
	{
		name: 'AWS',
		description: 'Cloudy with a chance of bills',
		imageUrl: skillAws.src,
		imageDarkUrl: skillAwsDark.src,
		bgColor: 'bg-[#FF9900]/20',
	},
	{
		name: 'Tailwind',
		description: '<div> soup generator',
		imageUrl: skillTailwind.src,
		bgColor: 'bg-[#0EA5E9]/20',
	},
	{
		name: 'Kotlin',
		description: 'KMP: Write once, cry twice',
		imageUrl: skillKotlin.src,
		bgColor: 'bg-[#E1725C]/20',
	},
	{
		name: 'Laravel',
		description: 'Coding, but cozy',
		imageUrl: skillLaravel.src,
		bgColor: 'bg-[#FF2D20]/20',
	},
	{
		name: 'React Native',
		description: 'One codebase, twice the bugs',
		imageUrl: skillReact.src,
		bgColor: 'bg-[#61DAFB]/20',
	},
	{
		name: 'Docker',
		description: 'But it works on my machine™',
		imageUrl: skillDocker.src,
		bgColor: 'bg-[#099CEC]/20',
	},
	{
		name: 'MongoDB',
		description: 'SQL, but feral',
		imageUrl: skillMongodb.src,
		bgColor: 'bg-[#599636]/30',
	},
	{
		name: 'Redis',
		description: 'SET it and forget it',
		imageUrl: skillRedis.src,
		bgColor: 'bg-[#FF4438]/20',
	},
	{
		name: 'SQL',
		description: 'JOIN pain ON suffering',
		imageUrl: skillPostgresql.src,
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
		image: projectIaknKupang,
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
		image: projectCoffeeShop,
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
		image: projectEcommerce,
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
		image: projectWebscraper,
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
		image: projectCrud,
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
		image: projectWeather,
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
		image: projectIaknProfile,
		links: [
			{
				name: 'Demo',
				href: 'https://iakn-kupang-profile.vercel.app/',
				icon: Globe,
			},
		],
	},
	{
		name: 'Old Portfolio Website',
		href: 'https://jeheskielSunloy77.github.io',
		description:
			'My old portfolio website, read more about it on my blog post below.',
		tags: ['react', 'tailwindcss'],
		image: projectOldPortfolio,
		links: [
			{
				name: 'Demo',
				href: 'https://jeheskielsunloy.netlify.app',
				icon: Globe,
			},
			{
				name: 'Source',
				href: 'https://github.com/jeheskielSunloy77/old-portfolio',
				icon: Github,
			},
			{
				name: 'Blog Post',
				href: '/en/blog/redesigning-my-portfolio-making-space-for-what-matters',
				icon: Rss,
			},
		],
	},
]
