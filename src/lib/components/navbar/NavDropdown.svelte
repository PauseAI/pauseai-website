<script lang="ts">
	import { page } from '$app/state'
	import Card from '$lib/components/Card.svelte'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
	import { localizeHref } from '$lib/paraglide/runtime'
	import ChevronDown from '@lucide/svelte/icons/chevron-down'
	import { onMount } from 'svelte'
	import type { NavItem } from './navItems'

	interface Props {
		item: NavItem
		inverted?: boolean
	}

	let { item, inverted = false }: Props = $props()

	let open = $state(false)
	let root: HTMLDivElement | undefined = $state()

	let children = $derived(item.children ?? [])

	// Highlight the trigger when the current page is one of the dropdown's links.
	let isActive = $derived(
		children.some(
			(c) => c.href && !c.external && localizeHref(c.href) === localizeHref(page.url.pathname)
		)
	)

	onMount(() => {
		const onClick = (event: MouseEvent) => {
			if (open && root && !root.contains(event.target as Node)) open = false
		}
		const onKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') open = false
		}
		addEventListener('click', onClick)
		addEventListener('keydown', onKeydown)
		return () => {
			removeEventListener('click', onClick)
			removeEventListener('keydown', onKeydown)
		}
	})
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="nav-dropdown"
	bind:this={root}
	onmouseenter={() => (open = true)}
	onmouseleave={() => (open = false)}
>
	<button
		type="button"
		class="navlink reset-button trigger"
		class:inverted
		class:active={isActive}
		aria-haspopup="true"
		aria-expanded={open}
		onclick={(event) => {
			event.preventDefault()
			open = !open
		}}
	>
		{item.label}<ChevronDown size="0.9em" class="chevron" />
	</button>

	{#if open}
		<div class="dropdown">
			<Card>
				<div class="list">
					{#each children as child (child.label)}
						<LinkWithoutIcon
							href={child.href}
							target={child.external ? '_blank' : null}
							rel={child.external ? 'noopener noreferrer' : null}
							class="dropdown-link"
							aria-current={child.href &&
							!child.external &&
							localizeHref(child.href) === localizeHref(page.url.pathname)
								? 'page'
								: undefined}
							onclick={() => (open = false)}
						>
							{child.label}
						</LinkWithoutIcon>
					{/each}
				</div>
			</Card>
		</div>
	{/if}
</div>

<style>
	.nav-dropdown {
		position: relative;
		display: inline-flex;
		/* Match the horizontal rhythm of the sibling navlinks (see UniversalNavlink). */
		margin-left: 0.5rem;
		margin-right: -0.5rem;
	}

	.trigger {
		display: inline-flex;
		align-items: center;
		gap: 0.15rem;
		cursor: pointer;
		padding: 0 0.5rem;
		/* The global button reset strips these; restore them to match sibling navlinks. */
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 1.1rem;
		text-transform: uppercase;
		/* Base colour is inherited from the navbar (handles light/dark/inverted). */
	}

	/* The global .navlink hover/active colours are scoped to UniversalNavlink's
	   subtree, so they don't reach this button — restate them here. */
	.trigger:hover {
		color: var(--brand);
	}

	.trigger.active {
		color: var(--brand-subtle);
	}

	.trigger.inverted:hover,
	.trigger.inverted.active {
		color: black;
	}

	.trigger :global(.chevron) {
		transition: transform 0.15s ease;
	}

	.trigger[aria-expanded='true'] :global(.chevron) {
		transform: rotate(180deg);
	}

	.dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		z-index: 10;
		/* Bridge the gap so the menu doesn't close while moving the cursor onto it. */
		padding-top: 0.5rem;
		min-width: max-content;
	}

	.list {
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		color: var(--text);
		font-family: var(--font-heading);
		text-transform: none;
	}

	.list :global(.dropdown-link) {
		color: var(--text);
		text-decoration: none;
		padding: 0.35rem 0.5rem;
		border-radius: 4px;
		white-space: nowrap;
	}

	.list :global(.dropdown-link:hover) {
		color: var(--brand);
		background: var(--bg);
	}

	.list :global(.dropdown-link[aria-current='page']) {
		color: var(--brand-subtle);
	}
</style>
