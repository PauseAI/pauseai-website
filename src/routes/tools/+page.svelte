<script lang="ts">
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'

	interface Tool {
		href: string
		title: string
		description: string
	}

	const TOOLS: Tool[] = [
		{
			href: '/tools/qr',
			title: 'QR code generator',
			description:
				'Make a QR code for any web address, with an optional PauseAI pause symbol in the middle. Download it as a PNG or an SVG.'
		}
	]
</script>

<PostMeta
	title="Volunteer tools"
	description="Tools for PauseAI volunteers to create branded designs."
/>

<h1>Tools</h1>
<p class="lede">
	Tools for PauseAI volunteers, in any country, to make PauseAI branded designs for flyers, posts
	and event listings.
</p>

<ul class="tools" role="list">
	{#each TOOLS as tool (tool.href)}
		<li>
			<LinkWithoutIcon href={tool.href} class="card">
				<h2>{tool.title}</h2>
				<p>{tool.description}</p>
				<span class="cta">Open →</span>
			</LinkWithoutIcon>
		</li>
	{/each}
</ul>

<style>
	h1 {
		margin: 0 0 0.5rem;
	}

	.lede {
		max-width: 60ch;
		margin: 0 0 2rem;
		color: var(--text-2);
	}

	.tools {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(18rem, 100%), 1fr));
		gap: 1.5rem;
		margin: 0;
		padding: 0;
	}

	.tools :global(.card) {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		height: 100%;
		padding: 1.5rem;
		border: 1px solid var(--brand-subtle);
		border-radius: var(--radius-3);
		color: var(--text);
		text-decoration: none;
	}

	.tools :global(.card:hover) {
		background-color: var(--bg-subtle);
		color: var(--text);
	}

	.tools :global(.card h2) {
		margin: 0;
	}

	.tools :global(.card p) {
		flex: 1;
		margin: 0;
	}

	.cta {
		font-weight: 700;
		color: var(--brand);
	}
</style>
