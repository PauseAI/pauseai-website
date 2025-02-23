<script lang="ts">
	import { page } from '$app/stores'
	export let href: string | null = null
	export let c2a = false
	export let ariaLabel: string | undefined = undefined
	export let inverted = false
	export let first = false
	export let narrow = false
</script>

<a
	{href}
	class:first
	class:c2a
	class:inverted
	class:narrow
	class:active={$page.url.pathname == href}
	aria-label={ariaLabel}
>
	<slot />
</a>

<style>
	a:not(.narrow) {
		padding-left: 0.5rem;
		padding-right: 0.5rem;
	}

	a {
		margin-left: 0.5rem;
		margin-right: -0.5rem;
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--text);
		text-decoration: none;
		font-size: 1.1rem;
		text-transform: uppercase;
	}

	a.first {
		margin-left: -0.5rem;
	}

	a.c2a {
		color: var(--brand);
	}
	a.c2a.inverted {
		color: black;
	}

	a:hover {
		color: var(--brand);
		text-decoration: underline;
	}
	a.active,
	a:active {
		color: var(--brand-subtle);
	}

	a.inverted {
		color: white;
	}
	a.inverted:hover {
		color: black;
		text-decoration: underline;
	}
	a.inverted.active,
	a.inverted:active {
		color: black;
	}
</style>
