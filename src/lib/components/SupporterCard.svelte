<script lang="ts">
	export let name
	export let blurb
	export let image
	export let url
</script>

<a class="article-link" href={url}>
	<article>
		<div class="supporter-image">
			<img src={image} alt={name} />
		</div>
		<div>
			<h3>{name}</h3>
			<p>{blurb}</p>
		</div>
	</article>
</a>

<style>
	article {
		height: auto;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	.supporter-image {
		width: 17.5rem;
		height: 17.5rem;
	}
	.supporter-image img {
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
	.article-link {
		text-decoration: none;
		border-radius: 0.625rem;
	}
	.article-link:hover {
		color: inherit;
	}
	@media (min-width: 768px) {
		.supporter-image {
			width: 19.5rem;
			height: 19.5rem;
		}
	}
	@media (min-width: 1024px) {
		.supporter-image {
			width: 25.5rem;
			height: 25.5rem;
		}
	}
</style>
