<script>
	export let title
	export let blurb
	export let category
	export let url
</script>

<article>
	<h3>{title}</h3>
	<p>{blurb}</p>
	<div class="footer small-text">
		<span>{category}</span>
		<a class="read-more" href={url}>Lire l'article<span class="link-icon">↗</span></a>
	</div>
</article>

<style>
	.footer {
		display: flex;
		justify-content: space-between;
	}
	article {
		background-color: var(--bg-subtle);
		border-radius: 0.625rem;
		padding: 1.25rem 2rem;
		gap: 1.25rem;
		display: flex;
		flex-direction: column;
	}
	p {
		margin: 0;
		width: 40rem;
	}
	.link-icon {
		font-size: 1.5rem;
		line-height: 0;
		margin-left: 1rem;
	}
	a {
		text-decoration: none;
		color: black;
	}
	h3 {
		font-weight: 600;
	}
</style>
