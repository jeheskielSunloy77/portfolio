import { CAREERS, EDUCATIONS } from '@/lib/constants'
import type { Experience } from '@/lib/types'
import { AvatarFallback } from '@radix-ui/react-avatar'
import Markdown from 'react-markdown'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

export function ExperienceSection() {
	return (
		<Tabs defaultValue='work'>
			<TabsList className='mb-2 grid w-full grid-cols-2'>
				<TabsTrigger value='work'>Work</TabsTrigger>
				<TabsTrigger value='education'>Education</TabsTrigger>
			</TabsList>
			<TabsContent value='work'>
				<Timeline experiences={CAREERS} />
			</TabsContent>
			<TabsContent value='education'>
				<Timeline experiences={EDUCATIONS} />
			</TabsContent>
		</Tabs>
	)
}

function Timeline(props: { experiences: Experience[] }) {
	return (
		<Card>
			<CardContent className='p-0'>
				<ul className='ml-10 border-l'>
					{props.experiences.map((exp, id) => (
						<li key={id} className='relative ml-10 py-4'>
							<a
								href={exp.href}
								target='_blank'
								className='absolute -left-16 top-4 flex items-center justify-center rounded-full bg-muted'
							>
								<Avatar className='size-12 border'>
									<AvatarImage
										src={exp.logo}
										alt={exp.name}
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
												<span>{exp.end ? exp.end : 'Present'}</span>
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
											<Badge title={link.name} className='flex gap-2'>
												<link.icon aria-hidden='true' className='size-3' />
												{link.name}
											</Badge>
										</a>
									))}
								</div>
							)}
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	)
}
