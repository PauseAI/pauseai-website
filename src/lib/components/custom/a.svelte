<script lang="ts">
	import { onMount } from 'svelte'
	import ExternalLink from 'lucide-svelte/icons/external-link'
	import Mail from 'lucide-svelte/icons/mail'
	import { page } from '$app/stores'
	import { pushState } from '$app/navigation'
	import { localizeHref, locales } from '$lib/paraglide/runtime'

	enum Type {
		Internal,
		External,
		Mail
	}

	export let href: string
	export let target: string | null = null
	let className: string = ''
	export { className as class }

	const ICON_PROPS = { size: '0.8em' }

	let type = Type.Internal
	let anchor: HTMLAnchorElement

	// Localization helpers
	const localePattern = new RegExp(`^/(${locales.join('|')})(\/|$)`)
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

<a {href} {target} class={className} bind:this={anchor}>
	<slot />{#if type != Type.Internal}
		<span style="white-space: nowrap">
			<div class="icon">
				{#if type == Type.External}
					<ExternalLink {...ICON_PROPS} />
				{:else if type == Type.Mail}
					<Mail {...ICON_PROPS} />
				{/if}
			</div>
		</span>
	{/if}
</a>

<style>
	.icon {
		display: inline-flex;
		vertical-align: baseline;
		margin-left: 0.1em;
	}
</style>
