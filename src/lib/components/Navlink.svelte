<script lang="ts">
	import { page } from '$app/stores'
	export let href: string
	export let c2a = false
</script>

<a {href} class={`${c2a ? 'c2a' : ''} ${$page.url.pathname == href ? 'active' : ''}`}>
	<slot />
</a>

<style>
	a {
		margin-left: 1rem;
		font-family: var(--font-heading);
		color: var(--text);
		text-decoration: none;
		font-size: 1.1rem;
	}

	a.c2a {
		color: var(--brand);
	}

	a:hover {
		color: var(--brand);
		text-decoration: underline;
	}
	a.active,
	a:active {
		color: var(--brand-subtle);
	}
</style>
