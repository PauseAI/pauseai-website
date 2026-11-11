<script lang="ts">
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { socials } from '$lib/socials'
	import { socialIcons } from '$lib/components/socialIcons'
	import { meta } from './meta'
</script>

<PostMeta {...meta} />

<div class="links-page">
	<h1>PauseAI</h1>
	<p class="tagline">{meta.description}</p>

	<ul>
		<li>
			<LinkWithoutIcon href="/join" class="link-button primary">Join PauseAI</LinkWithoutIcon>
		</li>
		<li>
			<LinkWithoutIcon href="/donate" class="link-button primary">Donate</LinkWithoutIcon>
		</li>
		{#each socials as social (social.name)}
			{@const Icon = socialIcons[social.name]}
			<li>
				<LinkWithoutIcon
					href={'bioHref' in social ? social.bioHref : social.href}
					target="_blank"
					rel="noopener"
					class="link-button"
				>
					<span class="icon" aria-hidden="true"><Icon /></span>
					<span class="label">{social.name}</span>
				</LinkWithoutIcon>
			</li>
		{/each}
	</ul>
</div>

<style>
	.links-page {
		max-width: 26rem;
		margin: 0 auto;
		text-align: center;
	}

	h1 {
		margin-bottom: 0.25rem;
	}

	.tagline {
		color: var(--text-2);
		margin-top: 0;
		margin-bottom: 1.5rem;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* Icon, label, and an empty column as wide as the icon, so the label sits in the centre */
	ul :global(.link-button) {
		display: grid;
		grid-template-columns: 1.25rem 1fr 1.25rem;
		align-items: center;
		gap: 0.75rem;
		padding: 0.85rem 1rem;
		border: 2px solid var(--text);
		border-radius: 10px;
		color: var(--text);
		fill: var(--text);
		text-decoration: none;
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 1.15rem;
		text-transform: uppercase;
	}

	ul :global(.link-button:hover),
	ul :global(.link-button:focus-visible) {
		border-color: var(--brand);
		color: var(--brand);
		fill: var(--brand);
	}

	/* Black on the brand orange: white on it is only about 2.3:1 */
	ul :global(.link-button.primary) {
		display: flex;
		justify-content: center;
		background-color: var(--brand);
		border-color: var(--brand);
		color: var(--black);
	}

	ul :global(.link-button.primary:hover),
	ul :global(.link-button.primary:focus-visible) {
		background-color: var(--bg);
		color: var(--brand);
	}

	.icon {
		display: flex;
		width: 1.25rem;
		height: 1.25rem;
	}
</style>
