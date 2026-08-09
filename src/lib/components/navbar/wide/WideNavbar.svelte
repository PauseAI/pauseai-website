<script lang="ts">
	import UniversalNavbar from '../universal/UniversalNavbar.svelte'
	import Navlink from '../Navlink.svelte'
	import NavDropdown from '../NavDropdown.svelte'
	import MailIcon from '@lucide/svelte/icons/mail'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
	import type { NavItem } from '../navItems'

	interface Props {
		items: NavItem[]
		inverted?: boolean
		extras?: import('svelte').Snippet
	}

	let { items, inverted = false, extras }: Props = $props()
</script>

<UniversalNavbar {inverted}>
	{#each items as item, i (item.label)}
		{#if item.children}
			<NavDropdown {item} {inverted} />
		{:else if item.mail}
			<LinkWithoutIcon href={item.href} class={inverted ? 'get-updates inverted' : 'get-updates'}>
				<MailIcon size="0.85em" />
				<span>{item.label}</span>
			</LinkWithoutIcon>
		{:else}
			<Navlink {inverted} first={i === 0} href={item.href} c2a={item.c2a} external={item.external}>
				{item.label}
			</Navlink>
		{/if}
	{/each}
	{@render extras?.()}
</UniversalNavbar>
