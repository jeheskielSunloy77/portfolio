import Spline from '@splinetool/react-spline'
import type { Application } from '@splinetool/runtime'
import { useEffect, useRef, useState } from 'react'

type RotationBaseline = {
	x: number
	y: number
}

const HEAD_NAME = 'Head'
const TOP_PART_NAME = 'Top part'
const MAX_HEAD_YAW = 0.55
const MAX_HEAD_PITCH = 0.28
const MAX_TOP_PART_YAW = 0.18
const SMOOTHING = 0.12

export function HeroRobot() {
	const [isLoaded, setIsLoaded] = useState(false)
	const appRef = useRef<Application | null>(null)
	const animationFrameRef = useRef<number | null>(null)
	const targetRef = useRef({ x: 0, y: 0 })
	const currentRef = useRef({ x: 0, y: 0 })
	const baselinesRef = useRef<{
		head: RotationBaseline | null
		topPart: RotationBaseline | null
	}>({
		head: null,
		topPart: null,
	})

	useEffect(() => {
		const updateTarget = (event: PointerEvent) => {
			const normalizedX = event.clientX / window.innerWidth
			const normalizedY = event.clientY / window.innerHeight

			targetRef.current = {
				x: normalizedX * 2 - 1,
				y: normalizedY * 2 - 1,
			}
		}

		const animate = () => {
			const app = appRef.current
			const head = app?.findObjectByName(HEAD_NAME)
			const topPart = app?.findObjectByName(TOP_PART_NAME)
			const headBaseline = baselinesRef.current.head
			const topPartBaseline = baselinesRef.current.topPart

			currentRef.current.x +=
				(targetRef.current.x - currentRef.current.x) * SMOOTHING
			currentRef.current.y +=
				(targetRef.current.y - currentRef.current.y) * SMOOTHING

			if (head && headBaseline) {
				head.rotation.y = headBaseline.y + currentRef.current.x * MAX_HEAD_YAW
				head.rotation.x = headBaseline.x + currentRef.current.y * MAX_HEAD_PITCH
			}

			if (topPart && topPartBaseline) {
				topPart.rotation.y =
					topPartBaseline.y + currentRef.current.x * MAX_TOP_PART_YAW
			}

			animationFrameRef.current = window.requestAnimationFrame(animate)
		}

		window.addEventListener('pointermove', updateTarget, { passive: true })
		animationFrameRef.current = window.requestAnimationFrame(animate)

		return () => {
			window.removeEventListener('pointermove', updateTarget)

			if (animationFrameRef.current !== null) {
				window.cancelAnimationFrame(animationFrameRef.current)
			}
		}
	}, [])

	const handleLoad = (app: Application) => {
		appRef.current = app
		const head = app.findObjectByName(HEAD_NAME)
		const topPart = app.findObjectByName(TOP_PART_NAME)

		if (head) {
			baselinesRef.current.head = {
				x: head.rotation.x,
				y: head.rotation.y,
			}
		}

		if (topPart) {
			baselinesRef.current.topPart = {
				x: topPart.rotation.x,
				y: topPart.rotation.y,
			}
		}

		setIsLoaded(true)
	}

	return (
		<div className='relative h-[300px] w-full sm:h-[400px] md:h-[480px] md:w-[450px]'>
			<Spline
				scene='/bot.splinecode'
				onLoad={handleLoad}
				style={{
					width: '100%',
					height: '100%',
					pointerEvents: 'none',
				}}
			/>
			{!isLoaded && (
				<div className='absolute inset-0 flex items-center justify-center'>
					<div className='h-8 w-8 animate-spin rounded-full border-4 border-solid border-muted-foreground border-t-transparent'></div>
				</div>
			)}
		</div>
	)
}
