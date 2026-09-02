<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	let showText = $state(false)

	// Auto-submit the GET form on any control change so the preview updates without a
	// manual button press. Falls back to the visible submit button when JS is off.
	let formEl: HTMLFormElement | undefined = $state()
	function submitNow() {
		formEl?.requestSubmit()
	}

	let selectedLanguages = $derived(new Set(data.form.languages))
</script>

<svelte:head>
	<title>Onboarding email preview (dev only)</title>
</svelte:head>

<div style="font-family: sans-serif; padding: 16px; max-width: 1100px; margin: 0 auto;">
	<h1 style="font-size: 20px;">Onboarding email preview</h1>
	<p style="color: #666; font-size: 14px;">
		Dev-only QA tool for <code>src/lib/server/onboardingEmail</code>. Not linked from the site, 404s
		on the production domain. Adjust any input to re-render.
	</p>

	<form
		bind:this={formEl}
		method="GET"
		style="display: grid; grid-template-columns: 120px 1fr; gap: 8px 12px; align-items: start; margin-bottom: 16px; padding: 12px; border: 1px solid #ddd; border-radius: 6px; max-width: 640px;"
	>
		<label for="firstName" style="font-size: 13px; padding-top: 6px;">First name</label>
		<input
			id="firstName"
			name="firstName"
			value={data.form.firstName}
			onchange={submitNow}
			style="font-size: 13px; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px;"
		/>

		<label for="country" style="font-size: 13px; padding-top: 6px;">Country</label>
		<div>
			<input
				id="country"
				name="country"
				list="country-list"
				value={data.form.country}
				placeholder="(empty → global fallback)"
				onchange={submitNow}
				style="width: 100%; font-size: 13px; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px;"
			/>
			<datalist id="country-list">
				{#each data.options.countries as c}
					<option value={c}></option>
				{/each}
			</datalist>
			<span style="font-size: 12px; color: #888;">
				Free text — matches a National Groups record by exact (case-insensitive) name.
			</span>
		</div>

		<label for="intent" style="font-size: 13px; padding-top: 6px;">Intent</label>
		<select
			id="intent"
			name="intent"
			value={data.form.intent}
			onchange={submitNow}
			style="font-size: 13px; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px;"
		>
			<option value="">(empty / unrecognised)</option>
			{#each data.options.intents as i}
				<option value={i}>{i}</option>
			{/each}
		</select>

		<span style="font-size: 13px; padding-top: 6px;">Languages</span>
		<div style="display: flex; flex-wrap: wrap; gap: 4px 12px;">
			{#each data.options.languages as l}
				<label style="font-size: 13px; display: flex; gap: 4px; align-items: center;">
					<input
						type="checkbox"
						name="languages"
						value={l.stored}
						checked={selectedLanguages.has(l.stored)}
						onchange={submitNow}
					/>
					{l.display}
					<span style="color: #999;">({l.stored})</span>
				</label>
			{/each}
		</div>

		<span></span>
		<button
			type="submit"
			style="justify-self: start; font-size: 13px; padding: 6px 14px; border-radius: 4px; border: 1px solid #ccc; cursor: pointer; background: #ff9416; color: #fff;"
		>
			Render
		</button>
	</form>

	<div
		style="font-size: 13px; background: #f0f4f8; padding: 10px 12px; border-radius: 6px; margin-bottom: 12px;"
	>
		<strong>Resolved:</strong>
		language <code>{data.resolved.language}</code>
		· intent bucket <code>{data.resolved.intentBucket}</code>
		· chapter
		{#if data.resolved.chapterIsGlobalFallback}
			<code>Global fallback</code> (no National Groups match)
		{:else}
			<code>{data.resolved.chapterName}</code> — leader {data.resolved.chapterLeader},
			{data.resolved.chapterLinkCount} link{data.resolved.chapterLinkCount === 1 ? '' : 's'}
		{/if}
	</div>

	<div style="margin-bottom: 8px; font-size: 14px;">
		<strong>Subject:</strong>
		{data.rendered.subject}
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
			style="white-space: pre-wrap; background: #f6f6f6; padding: 16px; border-radius: 6px; font-size: 13px; line-height: 1.5;">{data
				.rendered.text}</pre>
	{:else}
		<iframe
			title="Email HTML preview"
			srcdoc={data.rendered.html}
			style="width: 100%; height: 1400px; border: 1px solid #ccc; border-radius: 6px;"
		></iframe>
	{/if}
</div>
