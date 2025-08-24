import { LinkIcon } from 'lucide-react'

export function CopyToClipboardButton({ url }: { url: string }) {
	return (
		<button
			onClick={async () => {
				try {
					await navigator.clipboard.writeText(url)
					alert('Link copied to clipboard!')
				} catch (err) {
					console.error('Failed to copy: ', err)
				}
			}}
			className='p-2 rounded-full border bg-muted hover:bg-muted/40 transition-colors'
			aria-label='Copy link to clipboard'
			title='Copy link to clipboard'
		>
			<LinkIcon className='size-5' />
		</button>
	)
}
