import { describe, expect, it } from 'vitest'
import SubstackClient from '.'

const SUBSTACK_SUBSTACK = 'https://on.substack.com/api/v1'

describe('posts', () => {
	it('returns posts with a title', async () => {
		const client = new SubstackClient(SUBSTACK_SUBSTACK)
		const posts = await client.posts({
			limit: 8,
			offset: 0
		})
		expect(posts[0].title).toBeTruthy()
	})
})
