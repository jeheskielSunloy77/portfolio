import { LANGUAGE_MAP, LANGUAGES } from '@/i18n/i18n'
import { FileDownIcon } from 'lucide-react'
import { RainbowButton } from './magicui/rainbow-button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'

export function ResumeButton() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<RainbowButton variant='outline' />}>
				Resume
				<FileDownIcon />
			</DropdownMenuTrigger>
			<DropdownMenuContent className='min-w-44'>
				{LANGUAGES.map((language) => (
					<DropdownMenuItem
						key={language}
						render={
							<a
								href={`/resume-${language}.pdf`}
								target='_blank'
								rel='noopener noreferrer'
							/>
						}
					>
						{LANGUAGE_MAP[language].emoji} {LANGUAGE_MAP[language].name}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
