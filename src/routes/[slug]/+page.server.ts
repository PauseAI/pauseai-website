import { posts } from '$lib/data/posts';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { slug } = params;

	// get post with metadata
	const post = posts.find((post) => slug === post.slug);
	console.log('posts!', posts);

	if (!post) {
		throw error(404, 'Post not found');
	}

	return {
		post
	};
}
