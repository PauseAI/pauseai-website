<script lang="ts">
	let visible = false
	export let href: string
	export let linkText: string
</script>

<a {href} class="block" class:fade-in={visible}>
	<div class="text">
		<h2><slot name="title" /></h2>
		<p>
			<slot />
		</p>
		<span class="c2a">{linkText} ></span>
	</div>
</a>

<style>
	.block {
		display: block;
		text-decoration: none;
		color: var(--text);
		margin-bottom: 5rem;
	}

	.c2a {
		color: var(--brand);
		text-transform: uppercase;
		text-decoration: none;
		font-size: 1.2rem;
		font-family: var(--font-heading);
	}

	.c2a:hover {
		text-decoration: underline;
	}

	.c2a:active {
		color: var(--brand-subtle);
	}

	.text {
		max-width: 30rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		grid-area: text;
	}

	p {
		font-size: 1rem;
	}

	h2 {
		font-size: 1.5rem;
		font-weight: 800;
		margin: 0;
		text-transform: uppercase;
		line-height: 1.2;
	}

	@media (min-width: 850px) {
		h2 {
			font-size: 1.5rem;
		}
	}
</style>
