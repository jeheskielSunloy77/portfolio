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
			<DropdownMenuTrigger asChild>
				<RainbowButton variant='outline'>
					Resume
					<FileDownIcon />
				</RainbowButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{LANGUAGES.map((language) => (
					<DropdownMenuItem asChild key={language}>
						<a
							href={`/resume-${language}.pdf`}
							target='_blank'
							rel='noopener noreferrer'
						>
							{LANGUAGE_MAP[language].emoji} {LANGUAGE_MAP[language].name}
						</a>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
