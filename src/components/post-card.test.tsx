import { render, screen } from '@testing-library/react'
import { PostCard } from './post-card'

describe('PostCard', () => {
	test('renders title, description and links to post', () => {
		const post: any = {
			id: 'en/my-slug',
			title: 'My Title',
			description: 'A short description',
			publishedAt: new Date('2020-01-01'),
		}

		// PostCard expects "post" prop to be { ...post.data, id: post.id }
		const wrapped = { ...post, id: post.id }

		render(<PostCard post={wrapped} useSeparator={false} />)

		// title and description visible
		expect(screen.getByText('My Title')).toBeInTheDocument()
		expect(screen.getByText('A short description')).toBeInTheDocument()

		// link uses id split to form href -> /en/blog/my-slug
		const link = document.querySelector('a') as HTMLAnchorElement
		expect(link).toBeInTheDocument()
		expect(link.getAttribute('href')).toBe('/en/blog/my-slug')
	})
})
