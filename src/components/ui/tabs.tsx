'use client'

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

function Tabs({
	className,
	orientation = 'horizontal',
	...props
}: TabsPrimitive.Root.Props) {
	return (
		<TabsPrimitive.Root
			data-slot='tabs'
			data-orientation={orientation}
			className={cn('group/tabs flex gap-2 data-[orientation=horizontal]:flex-col', className)}
			{...props}
		/>
	)
}

const tabsListVariants = cva(
	'group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none',
	{
		variants: {
			variant: {
				default: 'bg-muted',
				line: 'gap-1 bg-transparent',
				pill: 'relative inline-flex items-center rounded-lg bg-neutral-100/80 dark:bg-zinc-900/60 p-0.5 border border-neutral-200/50 dark:border-zinc-800/80 backdrop-blur-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] group-data-[orientation=horizontal]/tabs:h-auto',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
)

function TabsList({
	className,
	variant = 'default',
	...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
	return (
		<TabsPrimitive.List
			data-slot='tabs-list'
			data-variant={variant}
			className={cn(tabsListVariants({ variant }), className)}
			{...props}
		/>
	)
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
	return (
		<TabsPrimitive.Tab
			data-slot='tabs-trigger'
			className={cn(
				"relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				'group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:text-foreground dark:group-data-[variant=default]/tabs-list:data-active:border-input dark:group-data-[variant=default]/tabs-list:data-active:bg-input/30 dark:group-data-[variant=default]/tabs-list:data-active:text-foreground',
				'group-data-[variant=line]/tabs-list:data-active:shadow-none group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent',
				'after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
				'group-data-[variant=pill]/tabs-list:h-auto group-data-[variant=pill]/tabs-list:px-4 group-data-[variant=pill]/tabs-list:py-1.5 group-data-[variant=pill]/tabs-list:text-xs group-data-[variant=pill]/tabs-list:font-semibold group-data-[variant=pill]/tabs-list:cursor-pointer group-data-[variant=pill]/tabs-list:select-none',
				'group-data-[variant=pill]/tabs-list:bg-transparent group-data-[variant=pill]/tabs-list:border-transparent group-data-[variant=pill]/tabs-list:data-active:bg-transparent dark:group-data-[variant=pill]/tabs-list:data-active:bg-transparent group-data-[variant=pill]/tabs-list:data-active:border-transparent dark:group-data-[variant=pill]/tabs-list:data-active:border-transparent group-data-[variant=pill]/tabs-list:data-active:shadow-none dark:group-data-[variant=pill]/tabs-list:data-active:shadow-none',
				'group-data-[variant=pill]/tabs-list:after:hidden',
				'group-data-[variant=pill]/tabs-list:text-muted-foreground group-data-[variant=pill]/tabs-list:hover:text-foreground group-data-[variant=pill]/tabs-list:data-active:text-foreground dark:group-data-[variant=pill]/tabs-list:data-active:text-foreground',
				className,
			)}
			{...props}
		/>
	)
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
	return (
		<TabsPrimitive.Panel
			data-slot='tabs-content'
			className={cn('flex-1 text-sm outline-none', className)}
			{...props}
		/>
	)
}

interface TabsMotionPillProps {
	layoutId?: string
	className?: string
}

function TabsMotionPill({
	layoutId = 'active-tab-pill',
	className,
}: TabsMotionPillProps) {
	return (
		<motion.div
			layoutId={layoutId}
			className={cn(
				'absolute inset-0 -z-10 rounded-md bg-white dark:bg-zinc-800 shadow-[0_1.5px_4px_rgba(0,0,0,0.08)] dark:shadow-[0_1.5px_6px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.05)] border border-neutral-200/50 dark:border-zinc-700/50',
				className,
			)}
			transition={{
				type: 'spring',
				stiffness: 380,
				damping: 30,
			}}
		/>
	)
}

export { Tabs, TabsContent, TabsList, tabsListVariants, TabsTrigger, TabsMotionPill }
