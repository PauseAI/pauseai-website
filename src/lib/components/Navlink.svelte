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
		padding: 1rem;
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--text);
		text-decoration: none;
		font-size: 1.1rem;
	}

	a.c2a {
		color: var(--brand);
	}

	a:hover {
		color: var(--brand);
		text-decoration: underline;
	}
	a.active,
	a:active {
		color: var(--brand-light);
	}
	a.white {
		color: white;
	}
</style>
