<script lang="ts">
	import Link from './LinkWithoutIcon.svelte'
	import ExternalLink from 'lucide-svelte/icons/external-link'
	import Mail from 'lucide-svelte/icons/mail'
	import type { LinkType } from '$lib/types'

	export let href: string
	export let target: string | null = null
	let className: string = ''
	export { className as class }
	export let rel: string | null = null

	const ICON_PROPS = { size: '0.7em' }

	// Link component determines the type
	let type: LinkType
</script>

<Link {href} {target} {rel} class={className} bind:type {...$$restProps}>
	<slot></slot>{#if type != 'internal'}
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
