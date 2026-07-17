<script lang="ts">
	import { page } from '$app/state'
	import { afterNavigate } from '$app/navigation'
	import Link from '$lib/components/Link.svelte'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
	import Logo from '$lib/components/logo.svelte'
	import { localizeHref } from '$lib/paraglide/runtime'
	import Menu from '@lucide/svelte/icons/menu'
	import X from '@lucide/svelte/icons/x'
	import ChevronDown from '@lucide/svelte/icons/chevron-down'
	import { onMount } from 'svelte'
	import type { NavItem } from '../navItems'

	interface Props {
		items: NavItem[]
		inverted?: boolean
		panelExtras?: import('svelte').Snippet<[() => void]>
	}

	let { items, inverted = false, panelExtras }: Props = $props()

	let open = $state(false)

	let logoAnimate = $derived(localizeHref(page.url.pathname) != '/')

	// Close the panel after any navigation (link tap, back/forward, etc.).
	afterNavigate(() => {
		open = false
	})

	function isCurrent(item: NavItem): boolean {
		return Boolean(
			item.href && !item.external && localizeHref(item.href) === localizeHref(page.url.pathname)
		)
	}

	onMount(() => {
		const onKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') open = false
		}
		addEventListener('keydown', onKeydown)
		return () => removeEventListener('keydown', onKeydown)
	})
</script>

<nav class:inverted-header={inverted}>
	<div class="bar">
		<Link href="/" class="logo">
			<Logo animate={logoAnimate} {inverted} />
		</Link>
		<button
			type="button"
			class="reset-button hamburger"
			aria-label="Menu"
			aria-expanded={open}
			onclick={() => (open = !open)}
		>
			{#if open}<X size="1.6rem" />{:else}<Menu size="1.6rem" />{/if}
		</button>
	</div>

	{#if open}
		<div class="panel">
			{#each items as item (item.label)}
				{#if item.children}
					<details class="group">
						<summary>
							<span>{item.label}</span>
							<ChevronDown size="1rem" class="chevron" />
						</summary>
						<div class="children">
							{#each item.children as child (child.label)}
								<LinkWithoutIcon
									href={child.href}
									target={child.external ? '_blank' : null}
									rel={child.external ? 'noopener noreferrer' : null}
									class="panel-link child"
									aria-current={isCurrent(child) ? 'page' : undefined}
								>
									{child.label}
								</LinkWithoutIcon>
							{/each}
						</div>
					</details>
				{:else}
					<LinkWithoutIcon
						href={item.href}
						class={item.c2a ? 'panel-link c2a' : 'panel-link'}
						aria-current={isCurrent(item) ? 'page' : undefined}
					>
						{item.label}
					</LinkWithoutIcon>
				{/if}
			{/each}

			{#if panelExtras}
				<div class="extras">
					{@render panelExtras(() => (open = false))}
				</div>
			{/if}
		</div>
	{/if}
</nav>

<style>
	nav {
		padding: 1rem 0;
	}

	.inverted-header {
		color: white;
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.bar :global(.logo) {
		display: inline-flex;
		width: 9rem;
	}

	.hamburger {
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		color: inherit;
		padding: 0.25rem;
	}

	.panel {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		background-color: var(--bg-secondary);
		border-radius: 5px;
		box-shadow: 0px 5px 20px 0px rgb(0, 0, 0, 0.1);
		padding: 0.5rem;
		/* Always readable, regardless of an inverted (transparent) header. */
		color: var(--text);
		font-family: var(--font-heading);
		font-weight: 700;
		text-transform: uppercase;
	}

	.panel :global(.panel-link) {
		display: block;
		padding: 0.75rem 0.75rem;
		color: var(--text);
		text-decoration: none;
		border-radius: 4px;
	}

	.panel :global(.panel-link.c2a) {
		color: var(--brand);
	}

	.panel :global(.panel-link:hover) {
		background: var(--bg);
		color: var(--brand);
	}

	.panel :global(.panel-link[aria-current='page']) {
		color: var(--brand-subtle);
	}

	.group summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.75rem;
		cursor: pointer;
		list-style: none;
	}

	.group summary::-webkit-details-marker {
		display: none;
	}

	.group summary :global(.chevron) {
		transition: transform 0.15s ease;
		flex-shrink: 0;
	}

	.group[open] summary :global(.chevron) {
		transform: rotate(180deg);
	}

	.children {
		display: flex;
		flex-direction: column;
		text-transform: none;
		font-weight: 600;
		padding-bottom: 0.25rem;
	}

	.children :global(.panel-link.child) {
		padding-left: 1.5rem;
		font-size: 0.95rem;
	}

	.extras {
		/* Anchor for the language switcher's absolutely-positioned dropdown. */
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		margin-top: 0.25rem;
		padding-top: 0.25rem;
		border-top: 1px solid var(--bg);
		text-transform: none;
	}
</style>
