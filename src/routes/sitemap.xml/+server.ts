import * as config from '$lib/config'
import type { Post } from '$lib/types'

export const prerender = true

export async function GET({ fetch }) {
	const response = await fetch('api/posts')
	const posts: Post[] = await response.json()
	const website = config.url

	const headers = { 'Content-Type': 'application/xml' }

	const xml = `
<?xml version="1.0" encoding="UTF-8" ?>
    <urlset
      xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
      xmlns:xhtml="https://www.w3.org/1999/xhtml"
      xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
      xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
      xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
    >
		<url>
			<loc>${website}/en</loc>
			<changefreq>daily</changefreq>
			<priority>0.7</priority>
		</url>
		  ${posts
				.map(
					(post) =>
						`<url>
							<loc>${website}/en/${post.slug}</loc>
							<changefreq>daily</changefreq>
							<priority>0.7</priority>
						</url>`
				)
				.join('')}
	</urlset>
	`.trim()

	return new Response(xml, { headers })
}
