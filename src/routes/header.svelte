<script lang="ts">
	import Logo from '$lib/components/logo.svelte'
</script>

<nav>
	<a href="/">
		<Logo />
	</a>

	<div class="nav-links">
		<a href="/proposal">Proposal</a>
		<a href="/xrisk">X-risk</a>
		<a href="/urgency">Urgency</a>
		<a href="/faq">FAQ</a>
		<a href="/about">About</a>
		<a class="c2a" href="/action">Get in action</a>
	</div>
</nav>

<style>
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2rem 0;
		margin-left: -1rem;
	}

	nav svg {
	}

	.nav-links {
		display: flex;
		text-transform: uppercase;
	}

	.nav-links a {
		margin-left: 1rem;
		font-family: var(--font-heading);
		color: var(--text);
		text-decoration: none;
	}

	.nav-links a.c2a {
		color: var(--brand);
	}

	.nav-links a:hover {
		color: var(--t-color-main);
	}

	.nav-links a:hover {
		text-decoration: underline;
	}
</style>
