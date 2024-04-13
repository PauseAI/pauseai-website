<script lang="ts">
	import { onMount } from 'svelte'
	import ExternalLink from 'lucide-svelte/icons/external-link'
	import { page } from '$app/stores'
	import { pushState } from '$app/navigation'

	export let href: string
	export let target: string | null = null

	let isExternal = false
	let anchor: HTMLAnchorElement

	onMount(() => {
		isExternal = href.startsWith('http:') || href.startsWith('https:') || href.startsWith('mailto:')
		if (href.startsWith('#')) {
			anchor.addEventListener('click', (ev) => {
				ev.preventDefault()
				const url = $page.url
				url.hash = href
				pushState(url, $page.state)
				const target = document.querySelector(href) as HTMLElement | null
				if (!target) return
				target.scrollIntoView({ behavior: 'smooth' })
				target.tabIndex = -1
				target.focus({ preventScroll: true })
			})
		}
	})
</script>

<a {href} {target} bind:this={anchor}>
	<slot />{#if isExternal}
		<span style="white-space: nowrap">
			<div class="icon">
				<ExternalLink size="0.8em" />
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
