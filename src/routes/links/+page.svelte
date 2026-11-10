<script lang="ts">
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { socials } from '$lib/socials'
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
		{#each socials as { name, href, bioHref, icon: Icon } (name)}
			<li>
				<LinkWithoutIcon href={bioHref ?? href} target="_blank" class="link-button">
					<span class="icon" aria-hidden="true"><Icon /></span>
					<span class="label">{name}</span>
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

	ul :global(.link-button) {
		display: flex;
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

	ul :global(.link-button.primary) {
		justify-content: center;
		background-color: var(--brand);
		border-color: var(--brand);
		color: var(--bg);
	}

	ul :global(.link-button.primary:hover),
	ul :global(.link-button.primary:focus-visible) {
		background-color: var(--brand-subtle);
		border-color: var(--brand-subtle);
		color: var(--bg);
	}

	.icon {
		display: flex;
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
	}

	.label {
		flex: 1;
		/* Offset the icon so the label sits in the centre of the button */
		margin-right: 2rem;
	}
</style>
