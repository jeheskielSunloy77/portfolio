import Spline from '@splinetool/react-spline'
import { useState } from 'react'

export function HeroRobot() {
	const [isLoaded, setIsLoaded] = useState(false)

	return (
		<div className='relative h-[300px] w-full sm:h-[400px] md:h-[480px] md:w-[400px]'>
			<Spline
				scene='/bot.splinecode'
				onLoad={() => setIsLoaded(true)}
				style={{
					width: '100%',
					height: '100%',
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
