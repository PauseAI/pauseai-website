<script lang="ts">
	import Link, { Type } from './LinkWithoutIcon.svelte'
	import ExternalLink from 'lucide-svelte/icons/external-link'
	import Mail from 'lucide-svelte/icons/mail'

	export let href: string
	export let target: string | null = null
	let className: string = ''
	export { className as class }
	export let rel: string | null = null

	const ICON_PROPS = { size: '0.7em' }

	// Link component determines the type
	let type: Type
</script>

<Link {href} {target} {rel} class={className} bind:type {...$$restProps}>
	<slot />{#if type != Type.Internal}
		<span style="white-space: nowrap">
			&nbsp;
			<div class="icon">
				{#if type == Type.External}
					<ExternalLink {...ICON_PROPS} />
				{:else if type == Type.Mail}
					<Mail {...ICON_PROPS} />
				{/if}
			</div>
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
