<script lang="ts">
	import { page } from '$app/stores'
	import { i18n } from '$lib/i18n'
	export let href: string | undefined = undefined
	export let c2a = false
	export let ariaLabel: string | undefined = undefined
</script>

<a {href} class:c2a class:active={i18n.route($page.url.pathname) == href} aria-label={ariaLabel}>
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

	a.c2a {
		color: var(--brand);
	}

	a:hover {
		color: var(--brand);
		text-decoration: underline;
	}
	a.active,
	a:active {
		color: var(--brand-subtle);
	}
</style>
