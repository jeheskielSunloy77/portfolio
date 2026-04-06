import kreasixLogo from '@/assets/companies/kreasix.jpeg'
import pemadLogo from '@/assets/companies/pemad.svg'
import refactoryLogo from '@/assets/companies/refactory.jpg'
import tbpLogo from '@/assets/companies/tbp.webp'
import education1 from '@/assets/me/education1.svg'
import education2 from '@/assets/me/education2.webp'
import projectCoffeeShopApp from '@/assets/projects/coffeeShopApp.webp'
import projectGoKickstart from '@/assets/projects/goKickstart.png'
import projectIaknKupang from '@/assets/projects/iaknKupang.webp'
import projectJobScout from '@/assets/projects/job-scout.png'
import projectKern from '@/assets/projects/kern.png'
import projectPromptu from '@/assets/projects/promptu.png'
import projectVettor from '@/assets/projects/vettor.png'
import projectVolatile from '@/assets/projects/volatile.png'
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
import type { Experience, Project, Skill } from '@/lib/types'
import { BookOpen, Download, Github, Globe, Linkedin, Mail } from 'lucide-react'

export const NICK_NAME = 'jay'
export const FULL_NAME = 'Jeheskiel Sunloy'
export const BOT_NAME = 'jassist'
export const EMAIL = 'me@jeheskielsunloy.com'
export const FEATURED_PROJECTS_LIMIT = 2
export const FEATURED_POSTS_LIMIT = 3
export const APP_NAME = 'jeheskielsunloy.com'
export const WEBSITE_URL = 'https://jeheskielsunloy.com'
export const BLOG_POSTS = [
	{
		title: 'How I Keep My Go Code Clean (Without Going Crazy)',
		summary: 'Practical Clean Architecture guidance for Go without over-engineering.',
		english: `${WEBSITE_URL}/en/blog/how-i-keep-my-go-code-clean-without-going-crazy`,
		indonesian: `${WEBSITE_URL}/id/blog/cara-saya-menjaga-kode-go-tetap-bersih-tanpa-jadi-gila`,
	},
	{
		title: 'How I Made My Portfolio Load Faster Than My Attention Span',
		summary: 'Why Jay rebuilt the portfolio from Next.js to Astro for better performance and SEO.',
		english: `${WEBSITE_URL}/en/blog/how-i-made-my-portfolio-load-faster-than-my-attention-span`,
		indonesian: `${WEBSITE_URL}/id/blog/cara-saya-membuat-portofolio-muat-lebih-cepat-daripada-rentang-perhatian-saya`,
	},
	{
		title: 'Kotlin Multiplatform vs React Native: Which Cross-Platform Framework Should You Choose?',
		summary: 'Honest comparison of Kotlin Multiplatform and React Native based on real usage.',
		english: `${WEBSITE_URL}/en/blog/kotlin-multiplatform-vs-react-native`,
		indonesian: `${WEBSITE_URL}/id/blog/kotlin-multiplatform-vs-react-native`,
	},
	{
		title: 'Redesigning My Portfolio: Making Space for What Matters',
		summary: 'Behind-the-scenes writeup on simplifying the portfolio design.',
		english: `${WEBSITE_URL}/en/blog/redesigning-my-portfolio-making-space-for-what-matters`,
		indonesian: `${WEBSITE_URL}/id/blog/mendesain-ulang-portofolio-memberi-ruang-untuk-hal-yang-penting`,
	},
] as const

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
		href: `mailto:${EMAIL}`,
		icon: Mail,
	},
]

export const CAREERS: Experience[] = [
	{
		name: 'PéMad International Transearch',
		href: 'https://pemad.or.id',
		title: 'Software Engineer',
		logo: pemadLogo.src,
		start: 'Mar 2024',
		end: 'Mar 2026',
		list: [
			{ content: "Rewrote the company’s project management system using Laravel, improving maintainability and scalability."},
			{ content: 'Led development of a Client Lifecycle & Operations platform supporting core business processes.' },
			{ content: 'Contributed to web and mobile projects, including building the ERM mobile app with React Native.' },
		],
	},
	{
		name: 'The Blue Pocket Services',
		href: 'https://thebluepocket.com.sg/',
		title: 'Freelance Developer',
		logo: tbpLogo.src,
		start: 'Feb 2025',
		list: [
			{ content: 'Developed web-based games and interactive websites for client events.' },
			{ content: 'Collaborated with clients to deliver interactive digital experiences on a near-monthly basis' },
		],
	},
	{
		name: 'Refactory Internship',
		href: 'https://refactory.id',
		title: 'Software Engineer Intern',
		logo: refactoryLogo.src,
		start: 'Jul 2022',
		end: 'Oct 2022',
		list: [
			{ content: 'Mentored closely by an experienced senior engineer, accelerating technical and professional growth.' },
			{ content: 'Designed and built a full-stack HR application for PT Indodev Niaga Internet using React.js.' },
			{ content: 'Contributed to 4 client projects in total, developing full-stack solutions using TypeScript and Go.' },
		],
	},
	{
		name: 'KreasiX Internship',
		href: 'https://www.kreasix.com',
		title: 'Developer Intern',
		logo: kreasixLogo.src,
		start: 'May 2022',
		end: 'Jul 2022',
		list: [
			{
				content: `Collaborated on backend integration using Node.js and Firebase to enhance a company's static website with dynamic features.`
			}
		]
	},
]

export const EDUCATIONS: Experience[] = [
	{
		name: 'Satya Wacana Christian University',
		href: 'https://uksw.edu',
		title: 'Bachelor of Science in Computer Science',
		logo: education1.src,
		subtitle: 'Jan 2024',
		list: [
			{
				content: 'Completed a senior project on real‑time collaboration tools.',
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
		list: [
			{
				content: 'Not the best student, but always tried my best. Learned a lot of things during my time in high school and developed a strong interest in programming.'
			}
		]
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
		name: 'Vettor, End-to-End Automated Job Hunting Suite',
		description:
		'AI-powered job hunting platform that discovers and ranks relevant roles, auto-generates tailored resumes and automatic job application whilst collecting and analyzing job seeking insights for the user.',
		tags: ['AI', 'typescript', 'automation', 'scraping', 'saas'],
		image: projectVettor,
		links: [
			{
				label: 'Visit',
				href: 'https://vettor.cloud/',
				icon: Globe,
				isExternal: true,
			},
		],
	},
				{
				isFeatured: true,
				name: 'Promptu, AI Data Concierge for Organizations',
				href: 'https://promptuapp.vercel.app/',
				description:
					'An industrial scale RAG system that collects, compile and store any kind of digital data and then make it searchable with natural language using a LLM.',
				tags: ['RAG', 'typescript','go', 'saas'],
				image: projectPromptu,
				links: [
					{
						label: 'Visit',
						href: 'https://promptuapp.vercel.app/',
						icon: Globe,
						isExternal: true,
					},
				],
			},
	{
		name: 'Job Scout, Developer-First Engine for Job Board Aggregation',
		href: 'https://github.com/jeheskielSunloy77/job-scout',
			description:
				'A modular scraping engine powered by Crawlee that supports batch collection and event streaming, making it easy to build job feeds, alerts, and hiring intelligence products.',
			tags: ['typescript', 'library', 'scraping', 'nodejs'],
			image: projectJobScout,
			links: [
			{
				label: 'Source',
				href: 'https://github.com/jeheskielSunloy77/job-scout',
				icon: Github,
				isExternal: true,
			},
			{
				label: 'NPM Registry',
				href: 'https://www.npmjs.com/package/job-scout',
				icon: Globe,
				variation: 'secondary',
				isExternal: true,
			},
		],
	},
	{
		name: 'SIA, The Digital Backbone for Modern Campuses',
		href: 'https://nextjs-iakn-kupang.vercel.app/',
		description:
			'Built to streamline university operations, SIA unifies student registration, class administration, learning management, and academic reporting in a single web platform.',
		tags: ['nextjs', 'postgresql', 'tailwindcss', 'typescript'],
		image: projectIaknKupang,
		links: [
			{
				label: 'Visit',
				href: 'https://nextjs-iakn-kupang.vercel.app/',
				icon: Globe,
				isExternal: true,
			},
		],
	},
	{
		name: 'Go Kickstart, Launch Full-Stack Go with Structure',
		href: 'https://github.com/jeheskielSunloy77/go-kickstart',
			description:
				'An interactive and scriptable scaffolder that creates a clean architecture codebase with auth, PostgreSQL, Redis jobs, email templating, and optional frontend support in one guided flow.',
			tags: ['go', 'cli', 'dev-tools', 'turborepo','clean-architecture'],
			image: projectGoKickstart,
			links: [
			{
				label: 'Source',
				href: 'https://github.com/jeheskielSunloy77/go-kickstart',
				icon: Github,
				variation: 'default',
				isExternal: true,
			},
			{
				label: 'Blog',
				href: '/en/blog/how-i-keep-my-go-code-clean-without-going-crazy',
				icon: BookOpen,
				variation: 'secondary',
				isExternal: false,
			},
		],
	},
	{
		name: 'Kern, Read Anywhere on Any Screen',
		href: 'https://github.com/jeheskielSunloy77/kern',
			description:
				'A cross-platform reading platform with a Go-powered TUI CLI, modern web app, and native-feeling iOS and Android apps built with React Native Expo, all backed by a shared backend core.',
			tags: ['go', 'tui', 'bun', 'turborepo', 'typescript', 'postgresql'],
			image: projectKern,
			links: [
			{
				label: 'Source',
				href: 'https://github.com/jeheskielSunloy77/kern',
				icon: Github,
				isExternal: true,
			},
		],
	},
	{
		name: 'Volatile, The Ops Studio for Stateful Caching Systems',
		href: 'https://github.com/jeheskielSunloy77/volatile',
		description:
			'A modern desktop platform for cache operations that combines observability dashboards, workflow orchestration, and governance controls across Redis and Memcached connections.',
			tags: ['electron', 'typescript', 'redis', 'memcached', 'desktop'],
			image: projectVolatile,
			links: [
			{
				label: 'Source',
				href: 'https://github.com/jeheskielSunloy77/volatile',
				icon: Github,
				isExternal: true,
			},
			{
				label: 'Download',
				href: 'https://github.com/jeheskielSunloy77/volatile/releases/latest',
				icon: Download,
				variation: 'secondary',
				isExternal: true,
			},
		],
	},
		{
		name: 'Roasty, Your Daily Brew, Streamlined',
		description:
			'A cross-platform coffee ordering app built with React Native, Expo, Supabase, TypeScript, and Tailwind CSS for fast menu browsing, seamless checkout, and smooth pickup experiences.',
		tags: ['react-native', 'expo', 'supabase', 'typescript', 'tailwindcss'],
		image: projectCoffeeShopApp,
		links: [
			{
				label: 'Source',
				href: 'https://github.com/jeheskielSunloy77/react-native-coffee-shop',
				icon: Github,
				isExternal: true,
			},
		]
	},
]
