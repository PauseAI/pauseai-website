<script lang="ts">
	import NavLink from '$lib/components/Navlink.svelte'
	import Logo from '$lib/components/logo.svelte'
	import { botName } from '$lib/config'
	import { page } from '$app/stores'
	import SearchIcon from 'lucide-svelte/icons/search'
	import { t } from '$lib/translations'

	const enableBot = false

	$: logo_animate = $page.url.pathname != '/'
</script>

<nav>
	<NavLink href="/" customClass="logo">
		<Logo animate={logo_animate} />
	</NavLink>

	<div class="nav-right">
		<div class="nav-links">
			<NavLink href="/risks">{$t('common.nav.risks')}</NavLink>
			<NavLink href="/proposal">{$t('common.nav.proposal')}</NavLink>
			<NavLink href="/protests">{$t('common.nav.protests')}</NavLink>
			<NavLink href="/faq">{$t('common.nav.faq')}</NavLink>
			<NavLink href="/action">{$t('common.nav.act')}</NavLink>
			<NavLink href="/donate">{$t('common.nav.donate')}</NavLink>
			{#if enableBot}
				<NavLink href="/chat">{botName}</NavLink>
			{/if}
			<!-- <NavLink href="/about">About</NavLink> -->
			<NavLink c2a href="/join">{$t('common.nav.join')}</NavLink>
			<NavLink href="/search" ariaLabel={$t('common.nav.search')}
				><SearchIcon size="0.8em" /></NavLink
			>
		</div>
	</div>
</nav>

<style>
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-direction: column;
		padding: 2rem 0;
		margin-left: -1rem;
		flex-wrap: wrap;
	}

	:global(.logo) {
		margin-bottom: 1rem;
		margin-left: 1rem;
	}

	.nav-links {
		display: flex;
		text-transform: uppercase;
		flex-wrap: wrap;
		justify-content: center;
	}

	@media (min-width: 900px) {
		nav {
			flex-direction: row;
			margin-left: 1rem;
		}

		:global(.logo) {
			margin-left: -1.75rem;
			margin-bottom: -0.2rem;
		}

		.nav-links {
			margin-left: 2rem;
		}
	}

	:global(.nav-links a) {
		padding-left: 0.5rem;
		margin-left: 0.5rem;
		padding-right: 0.5rem;
		margin-right: -0.5rem;
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--text);
		text-decoration: none;
		font-size: 1.1rem;
	}

	:global(.nav-links a.c2a) {
		color: var(--brand);
	}

	:global(.nav-links a:hover) {
		color: var(--brand);
		text-decoration: underline;
	}

	:global(.nav-links a.active),
	:global(.nav-links a:active) {
		color: var(--brand-subtle);
	}
</style>
