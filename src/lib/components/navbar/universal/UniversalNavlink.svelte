<script lang="ts">
	import { page } from '$app/stores'
	import { localizeHref } from '$lib/paraglide/runtime'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
	export let href: string | undefined = undefined
	export let c2a = false
	export let ariaLabel: string | undefined = undefined
	export let inverted = false
	export let first = false
	export let narrow = false
	export let active = false
	export let external = false

	$: localizedHref = href && !external ? localizeHref(href) : href
	$: resolvedHref = localizedHref ?? ''
	$: className = Object.entries({
		navlink: true,
		first,
		c2a,
		inverted,
		narrow,
		active
	})
		.filter(([, enabled]) => enabled)
		.map(([name]) => name)
		.join(' ')

	$: {
		active = localizeHref($page.url.pathname) == localizedHref
	}
</script>

<span>
	<LinkWithoutIcon href={resolvedHref} class={className} aria-label={ariaLabel}>
		<slot />
	</LinkWithoutIcon>
</span>

<style>
	* :global(.navlink) {
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

	* :global(.navlink.first) {
		margin-left: -0.5rem;
	}

	* :global(.navlink.c2a) {
		color: var(--brand);
	}
	* :global(.navlink.c2a.inverted) {
		color: black;
	}

	* :global(.navlink:hover) {
		color: var(--brand);
		text-decoration: underline;
	}
	* :global(.navlink.active),
	* :global(.navlink:active) {
		color: var(--brand-subtle);
	}

	* :global(.navlink.inverted) {
		color: white;
	}

	* :global(.navlink.inverted:hover) {
		color: black;
		text-decoration: underline;
	}
	* :global(.navlink.inverted.active),
	* :global(.navlink.inverted:active) {
		color: black;
	}

	* :global(.navlink.narrow) {
		padding: 0;
	}
</style>
