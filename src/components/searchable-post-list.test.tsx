import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchablePostList } from './searchable-post-list'

const makePost = (id: string, title: string) => ({
	id,
	data: {
		title,
		description: `${title} description`,
		publishedAt: new Date(),
		// minimal extra fields to satisfy potential runtime usage
		tags: [],
		keywords: '',
		lang: 'en',
		readTime: 1,
	},
})

describe('SearchablePostList', () => {
	test('filters posts case-insensitively and shows results', async () => {
		const posts: any[] = [
			makePost('en/one', 'Hello World'),
			makePost('en/two', 'Testing Library'),
			makePost('en/three', 'Another Post'),
		]

		render(<SearchablePostList posts={posts} placeholder='Search posts' />)

		const input = screen.getByPlaceholderText('Search posts')
		const clearBtn = screen.getByRole('button', { name: /Clear/i })

		// initially clear button is disabled
		expect(clearBtn).toBeDisabled()

		await userEvent.type(input, 'hello')

		// clear button enabled after query
		expect(clearBtn).toBeEnabled()

		// only the matching post should be rendered
		expect(screen.getByText('Hello World')).toBeInTheDocument()
		expect(screen.queryByText('Testing Library')).not.toBeInTheDocument()

		// reset the filter
		await userEvent.click(clearBtn)
		expect(input).toHaveValue('')
		// now all posts are shown again
		expect(screen.getByText('Testing Library')).toBeInTheDocument()
		expect(screen.getByText('Another Post')).toBeInTheDocument()
	})

	test('no results when query does not match', async () => {
		const posts: any[] = [makePost('en/one', 'Alpha'), makePost('en/two', 'Beta')]
		render(<SearchablePostList posts={posts} placeholder='Search' />)

		const input = screen.getByPlaceholderText('Search')
		await userEvent.type(input, 'gamma')

		// nothing from the list should match
		expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
		expect(screen.queryByText('Beta')).not.toBeInTheDocument()
	})
})
