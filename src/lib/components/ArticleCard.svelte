<script>
	import { MoveUpRight } from 'lucide-svelte'

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
		<a class="read-more" href={url}
			>Lire l'article<span class="link-icon"><MoveUpRight size="1.5rem" /></span></a
		>
	</div>
</article>

<style>
	.footer {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}
	article {
		--link-padding: 1rem;
		background-color: var(--bg-subtle);
		border-radius: 0.625rem;
		padding: 1.25rem calc(2rem - var(--link-padding)) calc(1.25rem - var(--link-padding)) 2rem;
		display: flex;
		flex-direction: column;
	}
	p {
		margin: 0;
		width: 40rem;
		margin-bottom: calc(1.25rem - var(--link-padding));
	}
	.link-icon {
		font-size: 1.5rem;
		line-height: 0;
		margin-left: 1rem;
	}
	a {
		text-decoration: none;
		color: black;
		padding: 1rem;
	}
	h3 {
		/* font-weight: 600; */
		margin-bottom: 1.25rem;
	}
	.read-more {
		display: flex;
		align-items: end;
	}
</style>
