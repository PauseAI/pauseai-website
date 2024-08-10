<script lang="ts">
	import { page } from '$app/stores'
	export let href: string
	export let c2a = false
	export let ariaLabel: string | undefined = undefined
</script>

<a
	{href}
	class:c2a
	class:active={$page.url.pathname == href}
	class:white={$page.url.pathname == '/'}
	aria-label={ariaLabel}
>
	<slot />
</a>

<style>
	a {
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--text);
		text-decoration: none;
		font-size: 1rem;
		/* Appropriate tap targets */
		min-width: 48px;
	}

	a.c2a {
		color: var(--brand);
	}

	a.active {
		color: var(--brand);
	}
	a.white {
		color: white;
	}
	a:hover {
		color: var(--brand);
		text-decoration: underline;
	}
	@media (min-width: 1024px) {
		a {
			font-size: 1.1rem;
		}
	}
</style>
