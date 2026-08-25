<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	let selectedIndex = $state(0)
	let showText = $state(false)

	let selected = $derived(data.results[selectedIndex])
</script>

<svelte:head>
	<title>Onboarding email preview (dev only)</title>
</svelte:head>

<div style="font-family: sans-serif; padding: 16px; max-width: 1100px; margin: 0 auto;">
	<h1 style="font-size: 20px;">Onboarding email preview</h1>
	<p style="color: #666; font-size: 14px;">
		Dev-only QA tool for <code>src/lib/server/onboardingEmail</code>. Not linked from the site, 404s
		outside <code>pnpm dev</code>.
	</p>

	<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
		{#each data.results as result, i}
			<button
				onclick={() => (selectedIndex = i)}
				style="padding: 6px 10px; font-size: 13px; border-radius: 4px; border: 1px solid #ccc; cursor: pointer; background: {i ===
				selectedIndex
					? '#ff9416'
					: '#fff'}; color: {i === selectedIndex ? '#fff' : '#222'};"
			>
				{result.label}
			</button>
		{/each}
	</div>

	{#if selected}
		<div style="margin-bottom: 8px; font-size: 14px;">
			<strong>Subject:</strong>
			{selected.subject}
		</div>

		<div style="margin-bottom: 8px;">
			<button
				onclick={() => (showText = !showText)}
				style="font-size: 13px; padding: 4px 8px; cursor: pointer;"
			>
				{showText ? 'Show HTML preview' : 'Show plain text'}
			</button>
		</div>

		{#if showText}
			<pre
				style="white-space: pre-wrap; background: #f6f6f6; padding: 16px; border-radius: 6px; font-size: 13px; line-height: 1.5;">{selected.text}</pre>
		{:else}
			<iframe
				title="Email HTML preview"
				srcdoc={selected.html}
				style="width: 100%; height: 1400px; border: 1px solid #ccc; border-radius: 6px;"
			></iframe>
		{/if}
	{/if}
</div>
