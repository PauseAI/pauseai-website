<script>
	import { MoveUpRight } from 'lucide-svelte'

	export let name
	export let blurb
	export let image
	export let url
</script>

<a class="article-link" href={url}>
	<article>
		<div class="supporterImage">
			<img src={image} />
		</div>
		<div>
			<h3>{name}</h3>
			<p>{blurb}</p>
		</div>
	</article>
</a>

<style>
	.footer {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}
	article {
		width: 25.5rem;
		height: auto;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	.supporterImage {
		height: 25.5rem;
	}
	.supporterImage img {
		width: 100%;
		height: 100%;
		border-radius: 0.3125rem;
	}
	p {
		margin: 0;
		/* ça pose un problème overflow sur les écrans qui ne sont pas larges
		width: 40rem;
		*/
		flex-grow: 1;
	}
	.link-icon {
		line-height: 0;
		margin-left: 1rem;
	}
	.read-more {
		display: flex;
		align-items: end;
		text-decoration: none;
		color: black;
	}
	.article-link {
		text-decoration: none;
		border-radius: 0.625rem;
	}
	.article-link:hover {
		color: inherit;
	}
</style>
