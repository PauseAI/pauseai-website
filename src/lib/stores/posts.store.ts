import { readable } from 'svelte/store';

export interface Post {
	title: string;
	slug: string;
	isPublished: boolean;
	datePublished: Date;
}

export const posts = readable<Post[]>([
	{
		title: 'My First Post',
		slug: 'my-first-post',
		isPublished: true,
		datePublished: new Date('2023-01-01')
	}
]);
