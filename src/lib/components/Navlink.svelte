<script lang="ts">
	import { page } from '$app/stores'
	import { localizeUrl, localizeHref } from '$lib/paraglide/runtime'
	export let href: string | undefined = undefined
	export let c2a = false
	export let ariaLabel: string | undefined = undefined
	export let inverted = false
	export let first = false
	export let narrow = false
	export let active = false
	export let external = false

	$: localizedHref = href && !external ? localizeHref(href) : href

	$: {
		active = localizeHref($page.url.pathname) == localizedHref
	}
</script>

<a
	href={localizedHref}
	class:first
	class:c2a
	class:inverted
	class:narrow
	class:active
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

	a.narrow {
		padding: 0;
	}
</style>
