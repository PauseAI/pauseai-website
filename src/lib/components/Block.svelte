<script lang="ts">
	import Link from '$lib/components/custom/a.svelte'

	let visible = false
	export let href: string
	export let linkText: string
</script>

<div class="block-wrapper" class:fade-in={visible}>
	<Link {href}>
		<div class="text">
			<h2 class="title"><slot name="title" /></h2>
			<p>
				<slot />
			</p>
			<span class="c2a">{linkText} ></span>
		</div>
	</Link>
</div>

<style>
	.block-wrapper {
		margin-bottom: 5rem;
	}

	.block-wrapper :global(a) {
		display: block;
		text-decoration: none;
		color: var(--text);
	}

	.c2a {
		color: var(--brand);
		text-transform: uppercase;
		text-decoration: none;
		font-size: 1.2rem;
		font-family: var(--font-heading);
		font-weight: 700;
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

	.title :global(u) {
		text-decoration-color: var(--brand);
		text-decoration-thickness: 4px;
		text-underline-offset: 2.5px;
	}
</style>
