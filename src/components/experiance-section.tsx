import { CAREERS, EDUCATIONS } from '@/lib/constants'
import type { Dictionary, Experience } from '@/lib/types'
import { BriefcaseBusiness, GraduationCap } from 'lucide-react'
import { motion } from 'motion/react'
import Markdown from 'react-markdown'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

export function ExperienceSection({ t }: { t: Dictionary }) {
	return (
		<motion.section
			id='experiences'
			className='mx-auto w-full max-w-3xl px-4 sm:px-8'
			initial={{ opacity: 0, y: 18 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
		>
			<Tabs defaultValue='work' className='flex flex-col gap-2'>
				<TabsList variant='default'>
					<TabsTrigger value='work'>
						<BriefcaseBusiness />
						{t['Work']}
					</TabsTrigger>
					<TabsTrigger value='education'>
						<GraduationCap />
						{t['Education']}
					</TabsTrigger>
				</TabsList>
				<TabsContent value='work'>
					<Timeline experiences={CAREERS} t={t} />
				</TabsContent>
				<TabsContent value='education'>
					<Timeline experiences={EDUCATIONS} t={t} />
				</TabsContent>
			</Tabs>
		</motion.section>
	)
}

function Timeline({
	t,
	experiences,
}: {
	experiences: Experience[]
	t: Dictionary
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
		>
			<Card className='motion-card border border-border/80 bg-card/90'>
				<CardContent className='p-0'>
					<ul className='ml-10 border-l'>
						{experiences.map((exp, id) => (
							<motion.li
								key={id}
								className='relative ml-10 py-4'
								initial={{ opacity: 0, x: -12 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{
									delay: id * 0.07,
									duration: 0.35,
									ease: [0.22, 1, 0.36, 1],
								}}
							>
								<a
									href={exp.href}
									target='_blank'
									className='absolute -left-16 top-4 flex items-center justify-center rounded-full bg-muted'
								>
									<Avatar className='size-12 border'>
										<AvatarImage
											src={exp.logo}
											alt={exp.name}
											loading='lazy'
											width={48}
											height={48}
											className='bg-background object-contain'
										/>
										<AvatarFallback>{exp.name[0]}</AvatarFallback>
									</Avatar>
								</a>
								<div className='flex flex-1 flex-col justify-start gap-1'>
									<time className='text-xs text-muted-foreground'>
										{exp.subtitle ||
											(exp.start && (
												<>
													<span>{exp.start}</span>
													<span>{' - '}</span>
													<span>{exp.end ? exp.end : t['Present']}</span>
												</>
											))}
									</time>
									<h2 className='font-semibold leading-none'>{exp.name}</h2>
									{exp.title && (
										<p className='text-sm text-muted-foreground'>{exp.title}</p>
									)}
									{exp.list && (
										<ul className='ml-4 list-outside list-disc'>
											{exp.list.map((l, i) => (
												<li key={i} className='prose pr-8 text-sm dark:prose-invert'>
													{l.isMarkdown ? <Markdown>{l.content}</Markdown> : l.content}
												</li>
											))}
										</ul>
									)}
									{exp.description && (
										<p className='prose pr-8 text-sm dark:prose-invert'>
											{exp.description}
										</p>
									)}
								</div>
								{!!exp.links?.length && (
									<div className='mt-2 flex flex-row flex-wrap items-start gap-2'>
										{exp.links.map((link, i) => (
											<a href={link.href} key={i}>
												<Badge
													title={link.name}
													className='motion-pill flex gap-2'
												>
													<link.icon aria-hidden='true' className='size-3' />
													{link.name}
												</Badge>
											</a>
										))}
									</div>
								)}
							</motion.li>
						))}
					</ul>
				</CardContent>
			</Card>
		</motion.div>
	)
}
