<script lang="ts">
	import { page } from '$app/state'
	import { pushState } from '$app/navigation'
	import { localizeHref, locales } from '$lib/paraglide/runtime'
	import type { LinkType } from '$lib/types'
	import type { Attachment } from 'svelte/attachments'
	import { getLinkType } from '$lib/link'

	interface Props {
		href?: string | null
		target?: string | null
		class?: string
		rel?: string | null
		type?: LinkType
		onclick?: (event: MouseEvent) => void
		children?: import('svelte').Snippet
		[key: string]: unknown
	}

	let {
		href = null,
		target = null,
		class: className = '',
		rel = null,
		type,
		onclick,
		children,
		...rest
	}: Props = $props()

	let resolvedType: LinkType = $derived(type ?? getLinkType(href))

	// Localization helpers
	const localePattern = new RegExp(`^/(${locales.join('|')})(/|$)`)
	const shouldLocalizeHref = (h: string): boolean =>
		resolvedType === 'internal' &&
		h.startsWith('/') &&
		!h.match(localePattern) &&
		!h.includes('#no-localize')

	const processHref = (h: string): string => {
		const cleaned = h.replace('#no-localize', '')
		return shouldLocalizeHref(h) ? localizeHref(cleaned) : cleaned
	}

	// Automatically open petition and action-specific tools in a new tab
	let isPetitionLink = $derived(
		resolvedType === 'external' &&
			href !== null &&
			(href.includes('change.org') || href.includes('activoice.org'))
	)
	let resolvedTarget = $derived(target ?? (isPetitionLink ? '_blank' : null))
	let resolvedRel = $derived(rel ?? (isPetitionLink ? 'noopener noreferrer' : null))

	// Normalize and localize href
	let resolvedHref: string | null = $derived(href ? processHref(href) : null)

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
	target={resolvedTarget}
	rel={resolvedRel}
	class={className}
	{@attach smoothScroll(resolvedHref)}
	{onclick}
	{...rest}
>
	{@render children?.()}
</a>
