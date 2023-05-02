import { marked } from 'marked';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const slug = params['slug'];
	// const post = await import(`$lib/posts/${slug}.md`);
	const post = await import(`$lib/posts/kindness.md`);
	console.log('post', post);

	if (!post) throw error(404, 'Not found');

	return {
		slug,
		post: marked.parse(post)
	};
};
