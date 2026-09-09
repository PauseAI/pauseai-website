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

	const LANGUAGE_LABELS: Record<string, string> = {
		en: 'English',
		es: 'Español',
		fr: 'Français'
	}
</script>

<svelte:head>
	<title>Onboarding email preview (dev only)</title>
</svelte:head>

<!-- Force a light scheme: this is a QA tool with hardcoded light panel backgrounds,
	and the site's dark theme would otherwise leave light text on them. -->
<div
	style="color-scheme: light; background: #fff; color: #222; font-family: sans-serif; padding: 16px; max-width: 1100px; margin: 0 auto; min-height: 100vh;"
>
	<h1 style="font-size: 20px;">Onboarding email preview</h1>
	<div style="color: #666; font-size: 14px; max-width: 640px;">
		<p>
			Renders the welcome email that the Airtable onboarding automation sends via
			<code>/api/onboarding-email</code> (code in <code>src/lib/server/onboardingEmail</code>). Set
			each input by hand and the email re-renders on change — use it to eyeball copy, layout and
			links for any point in the matrix without creating a real signup.
		</p>
		<ul style="margin: 8px 0; padding-left: 18px;">
			<li><strong>First name / Intent</strong> — verbatim from the Members record.</li>
			<li>
				<strong>Language</strong> — forces the hand-maintained en/es/fr copy (production instead detects
				it from country + languages).
			</li>
			<li>
				<strong>Country</strong> — selects the chapter block; only active National Groups countries are
				listed, anything else takes the global fallback.
			</li>
			<li>
				<strong>Style</strong> — <em>Auto</em> shows what production sends (PauseAI UK → plain
				layout, everyone else → rich card); <em>Force</em> overrides it for comparison.
			</li>
		</ul>
		<p>
			The panel under the form shows what the inputs resolved to (intent bucket, chapter). Toggle
			HTML / plain text with the button below it. See
			<a href="/onboarding-email-compare">/onboarding-email-compare</a> to check a render against the
			pre-migration MailerSend template it replaces.
		</p>
		<p>
			Dev tool: not linked from the site, available on <code>localhost</code> and Netlify deploy previews
			only, 404s on the production domain. Chapter data shown is public National Groups info, not PII.
		</p>
	</div>

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

		<span style="font-size: 13px; padding-top: 6px;">Language</span>
		<div style="display: flex; flex-wrap: wrap; gap: 4px 16px; padding-top: 6px;">
			{#each data.options.languages as lang}
				<label style="font-size: 13px; display: flex; gap: 4px; align-items: center;">
					<input
						type="radio"
						name="language"
						value={lang}
						checked={data.form.language === lang}
						onchange={submitNow}
					/>
					{LANGUAGE_LABELS[lang]}
					<span style="color: #999;">({lang})</span>
				</label>
			{/each}
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

		<label for="country" style="font-size: 13px; padding-top: 6px;">Country</label>
		<div>
			<select
				id="country"
				name="country"
				value={data.form.country}
				onchange={submitNow}
				style="width: 100%; font-size: 13px; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px;"
			>
				<option value="">— none (global fallback) —</option>
				{#each data.options.countries as c}
					<option value={c}>{c}</option>
				{/each}
			</select>
			<span style="font-size: 12px; color: #888;">
				Active National Groups records ({data.options.countries.length}). Sets the chapter block
				only; language is chosen above. Any other country takes the global fallback.
			</span>
		</div>

		<span style="font-size: 13px; padding-top: 6px;">Style</span>
		<div style="display: flex; flex-wrap: wrap; gap: 4px 16px; padding-top: 6px;">
			{#each [['auto', 'Auto (per chapter)'], ['rich', 'Force rich'], ['plain', 'Force plain']] as [value, label]}
				<label style="font-size: 13px; display: flex; gap: 4px; align-items: center;">
					<input
						type="radio"
						name="style"
						{value}
						checked={data.form.style === value}
						onchange={submitNow}
					/>
					{label}
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
		style="font-size: 13px; background: #f0f4f8; color: #222; padding: 10px 12px; border-radius: 6px; margin-bottom: 12px;"
	>
		<strong>Resolved:</strong>
		intent bucket <code>{data.resolved.intentBucket}</code>
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
			style="white-space: pre-wrap; background: #f6f6f6; color: #222; padding: 16px; border-radius: 6px; font-size: 13px; line-height: 1.5;">{data
				.rendered.text}</pre>
	{:else}
		<iframe
			title="Email HTML preview"
			srcdoc={data.rendered.html}
			style="width: 100%; height: 1400px; border: 1px solid #ccc; border-radius: 6px;"
		></iframe>
	{/if}
</div>
