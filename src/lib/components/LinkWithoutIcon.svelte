<script lang="ts">
	import { page } from '$app/stores'
	import { pushState } from '$app/navigation'
	import { localizeHref, locales } from '$lib/paraglide/runtime'
	import type { LinkType } from '$lib/types'
	import type { Action } from 'svelte/action'

	export let href: string | null = null
	export let target: string | null = null
	let className: string = ''
	export { className as class }
	export let rel: string | null = null

	export let type: LinkType = 'internal'

	// Localization helpers
	const localePattern = new RegExp(`^/(${locales.join('|')})(/|$)`)
	const shouldLocalizeHref = (h: string): boolean =>
		type === 'internal' &&
		h.startsWith('/') &&
		!h.match(localePattern) &&
		!h.includes('#no-localize')

	const processHref = (h: string): string => {
		const cleaned = h.replace('#no-localize', '')
		return shouldLocalizeHref(h) ? localizeHref(cleaned) : cleaned
	}

	// Normalize and localize href
	let resolvedHref: string | null = null
	$: {
		if (href) {
			if (
				(href.startsWith('http:') || href.startsWith('https:')) &&
				!href.startsWith('https://pauseai.info/') &&
				!(href.includes('s3.amazonaws') && href.includes('/pauseai-'))
			) {
				type = 'external'
				// Automatically open petition and action-specific tools in a new tab
				if (!target && (href.includes('change.org') || href.includes('activoice.org'))) {
					target = '_blank'
					if (!rel) rel = 'noopener noreferrer'
				}
			} else if (href.startsWith('mailto:')) {
				type = 'mail'
			}

			resolvedHref = processHref(href)
		}
	}

	/** Action for smooth scrolling to anchor links */
	const smoothScroll: Action<HTMLAnchorElement, string | null> = (
		node: HTMLAnchorElement,
		h: string | null
	) => {
		const handleClick = (ev: MouseEvent) => {
			if (h && h.startsWith('#')) {
				ev.preventDefault()
				const url = $page.url
				url.hash = h
				pushState(url, $page.state)
				const targetEl = document.querySelector<HTMLElement>(h)
				if (!targetEl) return
				targetEl.scrollIntoView({ behavior: 'smooth' })
				targetEl.tabIndex = -1
				targetEl.focus({ preventScroll: true })
			}
		}

		node.addEventListener('click', handleClick)
		return {
			update(newHref: string | null) {
				h = newHref
			},
			destroy() {
				node.removeEventListener('click', handleClick)
			}
		}
	}
</script>

<!-- eslint-disable-next-line svelte/no-restricted-html-elements - Warning is about using this component -->
<a
	href={resolvedHref}
	{target}
	{rel}
	class={className}
	use:smoothScroll={resolvedHref}
	{...$$restProps}
>
	<slot></slot>
</a>
