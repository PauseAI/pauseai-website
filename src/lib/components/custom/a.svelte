<script lang="ts">
	import { url as siteUrl } from '$lib/config'
	import { onMount } from 'svelte'
	import ExternalLink from 'lucide-svelte/icons/external-link'
	import Mail from 'lucide-svelte/icons/mail'
	import { page } from '$app/stores'
	import { pushState } from '$app/navigation'

	enum Type {
		Internal,
		External,
		Mail
	}

	export let href: string
	export let target: string | null = null

	const ICON_PROPS = { size: '0.8em' }

	let type = Type.Internal
	let anchor: HTMLAnchorElement

	if ((href.startsWith('http:') || href.startsWith('https:')) && !href.startsWith(siteUrl))
		type = Type.External
	else if (href.startsWith('mailto:')) type = Type.Mail

	onMount(() => {
		if (href.startsWith('#')) {
			anchor.addEventListener('click', (ev) => {
				ev.preventDefault()
				const url = $page.url
				url.hash = href
				pushState(url, $page.state)
				const target = document.querySelector<HTMLElement>(href)
				if (!target) return
				target.scrollIntoView({ behavior: 'smooth' })
				target.tabIndex = -1
				target.focus({ preventScroll: true })
			})
		}
	})
</script>

<a {href} {target} bind:this={anchor}>
	<slot />{#if type != Type.Internal}
		<span style="white-space: nowrap">
			<div class="icon">
				<!-- {#if type == Type.External}
					<ExternalLink {...ICON_PROPS} /> -->
				{#if type == Type.Mail}
					<Mail {...ICON_PROPS} />
				{/if}
			</div>
		</span>
	{/if}
</a>

<style>
	.icon {
		display: inline;
		vertical-align: text-top;
		margin-left: 0.1em;
	}
</style>
