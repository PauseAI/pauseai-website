<script lang="ts">
	import type { Campaign } from '$lib/types'

	export let campaign: Campaign

	const { title, description, image, url } = campaign
</script>

<a href={url} class="card">
	<img src={image} alt={title} />
	<div class="card-content">
		<h2>{title}</h2>
		<p>{description}</p>
		<div class="cta-button">Visit Campaign</div>
	</div>
</a>

<style>
	.card {
		background-color: var(--bg-secondary);
		border-radius: 16px;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.1s ease-in-out,
			outline-color 0.1s ease-in-out;
		display: flex;
		flex-direction: column;
		height: 100%;
		max-width: 400px;
		margin: 0 auto;
		text-decoration: none;
		outline: 2px solid transparent;
	}

	.card:hover {
		outline-color: var(--brand);
	}

	img {
		width: 100%;
		height: 220px;
		object-fit: cover;
		border-top-left-radius: 16px;
		border-top-right-radius: 16px;
	}

	.card-content {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		flex-grow: 1;
	}

	h2 {
		font-family: var(--font-heading);
		/*font-size: 1.8rem;*/
		margin: 0 0 1rem 0;
		color: var(--text);
	}

	p {
		font-family: var(--font-body);
		/*font-size: 1.1rem;*/
		/*line-height: 1.6;*/
		margin: 0 0 2rem 0;
		color: var(--text-subtle);
		flex-grow: 1;
	}

	.cta-button {
		display: inline-block;
		background-color: var(--brand);
		color: var(--bg);
		padding: 1rem 2rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: bold;
		transition: background-color 0.2s;
		text-align: center;
		font-size: 1.1rem;
	}

	.cta-button:hover {
		background-color: var(--brand-dark);
	}
</style>
