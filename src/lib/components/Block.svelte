<script lang="ts">
	let visible = false
	export let href: string
	export let linkText: string
</script>

<div class="block" class:fade-in={visible}>
	<div class="text">
		<h2><slot name="title" /></h2>
		<p>
			<slot />
		</p>
		<a class="c2a" {href}>{linkText} ></a>
	</div>
</div>

<style>
	.block {
		margin-bottom: 2rem;
	}

	.c2a {
		margin-top: 1rem;
		color: var(--brand);
		text-transform: uppercase;
		text-decoration: none;
		font-size: 1.2rem;
		font-family: var(--font-heading);
	}

	.text {
		max-width: 30rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		grid-area: text;
	}

	.text :global(a) {
		color: var(--brand);
		text-decoration: underline;
	}

	p {
		font-size: 1rem;
	}

	h2 {
		font-size: 2rem;
		font-weight: 800;
		margin: 0;
		text-transform: uppercase;
		line-height: 1.2;
	}
</style>
