<script lang="ts">
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
	import { socials } from '$lib/socials'
</script>

<div class="social">
	{#each socials as { name, href, icon: Icon } (name)}
		<LinkWithoutIcon {href} target="_blank" title={name} class="social-link">
			<Icon />
		</LinkWithoutIcon>
	{/each}
</div>

<style>
	.social {
		display: flex;
		margin-left: -0.5rem;
		margin-right: -0.5rem;
		flex-wrap: wrap;
	}

	.social :global(.social-link) {
		padding: 0.5rem;
		width: 1rem;
		height: 1rem;
		display: flex;
		fill: var(--text);
	}

	.social :global(.social-link):hover {
		fill: var(--brand);
	}
</style>
