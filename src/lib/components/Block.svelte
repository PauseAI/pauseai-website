<script lang="ts">
	import Link from '$lib/components/Link.svelte'
	import SvelteIntersectionObserver from '$lib/components/SvelteIntersectionObserver.svelte'

	let isIntersecting: boolean

	export let href: string
	export let linkText: string
</script>

<SvelteIntersectionObserver
	bind:isIntersecting
	rootMargin="-10%"
	defaultToIntersecting
	disconnectOnIntersect
>
	<div class="block-wrapper">
		<Link {href}>
			<div class="text">
				<h2 class="title" class:underline={isIntersecting}><slot name="title" /></h2>
				<p>
					<slot />
				</p>
				<span class="c2a">{linkText} ></span>
			</div>
		</Link>
	</div>
</SvelteIntersectionObserver>

<style>
	.block-wrapper {
		margin-bottom: 2.5rem;
		padding: 1.5rem;
		border-left: 3px solid var(--brand);
		background: linear-gradient(90deg, rgba(255, 148, 22, 0.05) 0%, transparent 100%);
		transition: all 0.2s ease;
	}

	.block-wrapper:hover {
		border-left-width: 5px;
		background: linear-gradient(90deg, rgba(255, 148, 22, 0.08) 0%, transparent 100%);
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
		font-size: 0.9rem;
		font-family: var(--font-heading);
		font-weight: 700;
		letter-spacing: 0.05em;
		margin-top: 0.75rem;
		display: inline-block;
	}

	.block-wrapper:hover .c2a {
		text-decoration: underline;
	}

	.c2a:active {
		color: var(--brand-subtle);
	}

	.text {
		max-width: 40rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		grid-area: text;
	}

	p {
		font-size: 1rem;
		line-height: 1.6;
		color: var(--text);
		opacity: 0.85;
		margin: 0.5rem 0 0 0;
	}

	h2 {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0;
		text-transform: uppercase;
		line-height: 1.3;
		letter-spacing: 0.02em;
	}

	@media (min-width: 850px) {
		h2 {
			font-size: 1.35rem;
		}

		.block-wrapper {
			padding: 1.75rem 2rem;
		}
	}

	.title :global(u) {
		text-decoration: none;
		background: linear-gradient(var(--brand) 0%);
		background-size: 0 0.15em;
		background-position: 0 90%;
		background-repeat: no-repeat;
		transition: background-size 400ms;
	}

	.title.underline :global(u) {
		background-size: 100% 0.15em;
	}
</style>
