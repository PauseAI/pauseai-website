<script lang="ts">
	import { page } from '$app/stores'
	import { i18n } from '$lib/i18n'
	export let href: string | undefined = undefined
	export let c2a = false
	export let ariaLabel: string | undefined = undefined
	export let inverted = false
	export let first = false
</script>

<a
	{href}
	class:first
	class:c2a
	class:inverted
	class:active={i18n.route($page.url.pathname == href)}
	aria-label={ariaLabel}
>
	<slot />
</a>

<style>
	a {
		padding-left: 0.5rem;
		margin-left: 0.5rem;
		padding-right: 0.5rem;
		margin-right: -0.5rem;
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--text);
		text-decoration: none;
		font-size: 1.1rem;
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

	a.inverted:hover {
		color: black;
		text-decoration: underline;
	}
	a.inverted.active,
	a.inverted:active {
		color: black;
	}
</style>
