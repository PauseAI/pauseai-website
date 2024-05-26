<script>
	import { MoveUpRight } from 'lucide-svelte'

	export let title
	export let blurb
	export let category
	export let url
</script>

<a class="article-link" href={url}>
	<article>
		<h3>{title}</h3>
		<p>{blurb}</p>
		<div class="footer small-text">
			<span>{category}</span>
			<span class="read-more">
				Lire l'article<span class="link-icon"><MoveUpRight size="1.5rem" /></span>
			</span>
		</div>
	</article>
</a>

<style>
	.footer {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}
	article {
		padding: 1.25rem 2rem;
		display: flex;
		flex-direction: column;
		height: 100%;
		gap: 1.25rem;
	}
	p {
		margin: 0;
		width: 40rem;
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
		background-color: var(--bg-subtle);
		border-radius: 0.625rem;
	}
	.article-link:hover {
		color: inherit;
	}
</style>
