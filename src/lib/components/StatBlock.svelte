<script lang="ts">
	export let percentage: string | number
	export let text: string
	export let link: string
</script>

<div class="stat-block">
	<div class="percentage">
		<a href={link} class="number">{percentage}%</a>
	</div>
	<p class="text">{text}</p>
</div>

<style>
	.stat-block {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.percentage {
		font-size: clamp(2rem, 7vw, 3rem);
		font-weight: bold;
		font-family: var(--font-heading);
		color: var(--brand);
		display: flex;
		align-items: center;
		line-height: 1em;
	}

	a {
		color: var(--brand);
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	.text {
		line-height: 1.4;
		margin: 0;
		opacity: 0.9;
	}
</style>
