import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

describe('Tabs', () => {
	test('renders tabs and switches content on trigger click', async () => {
		const user = userEvent.setup()
		render(
			<Tabs defaultValue='t1'>
				<TabsList>
					<TabsTrigger value='t1'>Tab One</TabsTrigger>
					<TabsTrigger value='t2'>Tab Two</TabsTrigger>
				</TabsList>
				<TabsContent value='t1'>Content One</TabsContent>
				<TabsContent value='t2'>Content Two</TabsContent>
			</Tabs>
		)

		const tabTwo = screen.getByText('Tab Two')

		// initially content one should be present
		expect(screen.getByText('Content One')).toBeInTheDocument()

		// click to switch to Tab Two
		await user.click(tabTwo)

		// active content should now contain "Content Two"
		expect(screen.getByText('Content Two')).toBeInTheDocument()
		expect(screen.queryByText('Content One')).not.toBeInTheDocument()
	})
})
