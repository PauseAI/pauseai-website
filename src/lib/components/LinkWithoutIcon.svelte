<script lang="ts">
	import { page } from '$app/state'
	import { pushState } from '$app/navigation'
	import { localizeHref, locales } from '$lib/paraglide/runtime'
	import type { LinkType } from '$lib/types'
	import type { Attachment } from 'svelte/attachments'

	interface Props {
		href?: string
		target?: string | null
		class?: string
		rel?: string | null
		type?: LinkType
		onclick?: (event: MouseEvent) => void
		children?: import('svelte').Snippet
		[key: string]: unknown
	}

	let {
		href = $bindable(),
		target = $bindable(null),
		class: className = '',
		rel = $bindable(null),
		type = $bindable('internal'),
		onclick,
		children,
		...rest
	}: Props = $props()

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
	let resolvedHref: string | null = $derived.by(() => {
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

			return processHref(href)
		} else {
			return null
		}
	})

	/** Action for smooth scrolling to anchor links */
	const smoothScroll: (h: string | null) => Attachment<HTMLAnchorElement> = (h: string | null) => {
		return (node: HTMLAnchorElement) => {
			const handleClick = (ev: MouseEvent) => {
				if (h && h.startsWith('#')) {
					ev.preventDefault()
					const url = page.url
					url.hash = h
					pushState(url, page.state)
					const targetEl = document.querySelector<HTMLElement>(h)
					if (!targetEl) return
					targetEl.scrollIntoView({ behavior: 'smooth' })
					targetEl.tabIndex = -1
					targetEl.focus({ preventScroll: true })
				}
			}

			node.addEventListener('click', handleClick)

			return () => node.removeEventListener('click', handleClick)
		}
	}
</script>

<!-- eslint-disable-next-line svelte/no-restricted-html-elements - Warning is about using this component -->
<a
	href={resolvedHref}
	{target}
	{rel}
	class={className}
	{@attach smoothScroll(resolvedHref)}
	{onclick}
	{...rest}
>
	{@render children?.()}
</a>
