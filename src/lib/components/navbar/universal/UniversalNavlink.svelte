<script lang="ts">
	import { page } from '$app/state'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
	import { localizeHref } from '$lib/paraglide/runtime'
	import clsx from 'clsx'

	interface Props {
		href?: string | undefined
		c2a?: boolean
		ariaLabel?: string | undefined
		inverted?: boolean
		first?: boolean
		narrow?: boolean
		active?: boolean
		external?: boolean
		children?: import('svelte').Snippet
	}

	let {
		href = undefined,
		c2a = false,
		ariaLabel = undefined,
		inverted = false,
		first = false,
		narrow = false,
		active = $bindable(false),
		external = false,
		children
	}: Props = $props()

	let localizedHref = $derived(href && !external ? localizeHref(href) : href)
	let resolvedHref = $derived(localizedHref ?? '')

	$effect(() => {
		active = localizeHref(page.url.pathname) == localizedHref
	})

	let classes = $derived(clsx('navlink', { first, c2a, inverted, narrow, active }))
</script>

<span>
	{#if href}
		<LinkWithoutIcon href={resolvedHref} class={classes} aria-label={ariaLabel}>
			{@render children?.()}
		</LinkWithoutIcon>
	{:else}
		<span class={classes} aria-label={ariaLabel}>
			{@render children?.()}
		</span>
	{/if}
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
