<script lang="ts">
	export let name
	export let blurb
	export let image
	export let job
</script>

<a class="article-link">
	<article>
		<div class="supporter-image">
			<img src={image} alt={name} />
		</div>
		<div>
			<h3>{name}</h3>
			<p>{blurb}</p>
			<p class="job">{job}</p>
		</div>
	</article>
</a>

<style>
	article {
		height: auto;
		display: flex;
		flex-direction: column;
		gap: 0rem;
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
	}
	.job {
		font-weight: 300;
		font-size: 1rem;
	}
	h3 {
		margin-top: 0;
		margin-bottom: 0;
		font-weight: 700;
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
			width: 13rem;
			height: 13rem;
		}
	}
</style>
