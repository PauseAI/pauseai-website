import * as m from '$lib/paraglide/messages.js'

export interface NavItem {
	label: string
	href?: string
	/** Link points outside the site; skip locale rewriting and open in a new tab. */
	external?: boolean
	/** Render as a call-to-action (brand-coloured) link. */
	c2a?: boolean
	/** Sub-items shown in a dropdown (desktop) / accordion (mobile). */
	children?: NavItem[]
}

/**
 * The top navigation menu, built from localized message getters.
 *
 * Call this inside a component's reactive scope (e.g. `$derived(getNavItems())`)
 * so the labels track the active locale.
 */
export function getNavItems(): NavItem[] {
	return [
		{ label: m.header_about(), href: '/about' },
		{
			label: m.header_learn(),
			children: [
				{ label: m.header_why(), href: '/learn' },
				{ label: m.header_proposal(), href: '/proposal' },
				{ label: m.header_our_strategy(), href: '/theory-of-change' },
				{ label: m.header_faq(), href: '/faq' }
			]
		},
		{
			label: m.header_community(),
			children: [
				{ label: m.header_find_group(), href: '/communities' },
				{ label: m.header_join_event(), href: 'https://luma.com/PauseAI', external: true }
			]
		},
		{
			label: m.header_get_involved(),
			children: [
				{ label: m.header_take_action(), href: '/join' },
				{ label: m.header_start_group(), href: '/national-groups' }
			]
		},
		{ label: m.header_donate(), href: '/donate', c2a: true }
	]
}
