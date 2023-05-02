<script lang="ts">
	import logo from '$lib/assets/logo.svg';
</script>

<nav>
	<a href="/">
		<img src={logo} alt="PauseAI logo" />
	</a>

	<div class="nav-links">
		<a href="/proposal">Proposal</a>
		<a href="/xrisk">X-risk</a>
		<a href="/urgency">Urgency</a>
		<a href="/faq">FAQ</a>
		<a href="/about">About</a>
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

	nav img {
		width: 180px;
		margin-left: -1.5rem;
	}

	.nav-links {
		display: flex;
		font-family: var(--t-font-family-heading);
		text-transform: uppercase;
	}

	.nav-links a {
		margin-left: 1rem;
		text-decoration: none;
	}

	.nav-links a:hover {
		color: var(--t-color-main);
	}

	.nav-links a:hover {
		text-decoration: underline;
	}
</style>
