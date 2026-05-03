<script lang="ts">
	import Link from './LinkWithoutIcon.svelte'
	import ExternalLink from 'lucide-svelte/icons/external-link'
	import Mail from 'lucide-svelte/icons/mail'
	import type { LinkType } from '$lib/types'

	interface Props {
		href: string
		target?: string | null
		class?: string
		rel?: string | null
		children?: import('svelte').Snippet
		[key: string]: unknown
	}

	let {
		href,
		target = null,
		class: className = '',
		rel = null,
		children,
		...rest
	}: Props = $props()

	const ICON_PROPS = { size: '0.7em' }

	// Link component determines the type
	let type: LinkType = 'internal'
</script>

<Link {href} {target} {rel} class={className} bind:type {...rest}>
	{@render children?.()}{#if type != 'internal'}
		<span style="white-space: nowrap">
			&nbsp;
			<span class="icon">
				{#if type == 'external'}
					<ExternalLink {...ICON_PROPS} />
				{:else if type == 'mail'}
					<Mail {...ICON_PROPS} />
				{/if}
			</span>
		</span>
	{/if}
</Link>

<style>
	.icon {
		display: inline-flex;
		vertical-align: baseline;
		margin-left: -0.4em;
	}
</style>
