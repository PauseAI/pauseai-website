<script context="module" lang="ts">
	export enum Type {
		Internal,
		External,
		Mail
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { pushState } from '$app/navigation'
	import { localizeHref, locales } from '$lib/paraglide/runtime'

	export let href: string
	export let target: string | null = null
	let className: string = ''
	export { className as class }
	export let rel: string | null = null

	export let type = Type.Internal
	let anchor: HTMLAnchorElement | undefined = undefined

	// Localization helpers
	const localePattern = new RegExp(`^/(${locales.join('|')})(/|$)`)
	const shouldLocalizeHref = (h: string) =>
		type === Type.Internal &&
		h.startsWith('/') &&
		!h.match(localePattern) &&
		!h.includes('#no-localize')

	const processHref = (h: string) => {
		const cleaned = h.replace('#no-localize', '')
		return shouldLocalizeHref(h) ? localizeHref(cleaned) : cleaned
	}

	// Normalize and localize href
	if (typeof href !== 'string') href = ''

	if (
		(href.startsWith('http:') || href.startsWith('https:')) &&
		!href.startsWith('https://pauseai.info/')
	)
		type = Type.External
	else if (href.startsWith('mailto:')) type = Type.Mail

	href = processHref(href)

	onMount(() => {
		if (href.startsWith('#') && anchor) {
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

<!-- eslint-disable-next-line svelte/no-restricted-html-elements - Warning is about using this component -->
<a {href} {target} {rel} class={className} bind:this={anchor}>
	<slot />
</a>
