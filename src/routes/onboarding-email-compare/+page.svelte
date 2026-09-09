<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	let showText = $state(false)

	let formEl: HTMLFormElement | undefined = $state()
	let intentEl: HTMLSelectElement | undefined = $state()

	// Changing the template picks a different canonical country/language/intent, so
	// drop the current intent override and let the server apply the new template's
	// default (a disabled control isn't submitted). Changing intent alone keeps it.
	function onTemplateChange() {
		if (intentEl) intentEl.disabled = true
		formEl?.requestSubmit()
	}
	function resubmit() {
		formEl?.requestSubmit()
	}

	const LANGUAGE_LABELS: Record<string, string> = {
		en: 'English',
		es: 'Español',
		fr: 'Français'
	}
</script>

<svelte:head>
	<title>Onboarding email compare (dev only)</title>
</svelte:head>

<!-- Force a light scheme: QA tool with hardcoded light panel backgrounds; the
	site's dark theme would otherwise leave light text on them. -->
<div
	style="color-scheme: light; background: #fff; color: #222; font-family: sans-serif; padding: 16px; box-sizing: border-box; width: 94vw; max-width: 94vw; position: relative; left: 50%; margin-left: -47vw; min-height: 100vh;"
>
	<h1 style="font-size: 20px;">Onboarding email compare</h1>
	<div style="color: #666; font-size: 14px; max-width: 900px;">
		<p>
			Side-by-side check of the new render against the email it replaces. <strong>Left</strong> is
			one of the seven pre-migration MailerSend templates (raw exports in
			<code>/email-templates</code>), picked from the dropdown. <strong>Right</strong> is the new
			<code>src/lib/server/onboardingEmail</code> render for that template's canonical signup — the
			country / language / intent combo the old routing (see
			<code>email-templates/ROUTING.md</code>) sent it for. Use it to confirm nothing in tone,
			content or links was lost in the migration.
		</p>
		<ul style="margin: 8px 0; padding-left: 18px;">
			<li>
				The left template is fixed once chosen — its body never varied by intent. Only the right
				render responds to the <strong>Intent</strong> control, so you can see how that axis shifts the
				new copy against a stable baseline. Switching template resets intent to that template's canonical
				value.
			</li>
			<li>
				<strong>New render style</strong>: <em>Auto</em> is what production sends (PauseAI UK →
				plain layout, everyone else → rich card); <em>Force rich / plain</em> overrides it.
			</li>
			<li>
				The "New render inputs" panel shows the resolved bucket and chapter for the right side.
			</li>
		</ul>
		<p>
			See <a href="/onboarding-email-preview">/onboarding-email-preview</a> to drive the new render
			off arbitrary inputs instead. Dev tool: not linked from the site, available on
			<code>localhost</code> and Netlify deploy previews only, 404s on the production domain. Template
			and chapter data are public, not PII.
		</p>
	</div>

	<form
		bind:this={formEl}
		method="GET"
		style="display: grid; grid-template-columns: 130px 1fr; gap: 8px 12px; align-items: start; margin-bottom: 12px; padding: 12px; border: 1px solid #ddd; border-radius: 6px; max-width: 720px;"
	>
		<label for="firstName" style="font-size: 13px; padding-top: 6px;">First name</label>
		<input
			id="firstName"
			name="firstName"
			value={data.form.firstName}
			onchange={resubmit}
			style="font-size: 13px; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px;"
		/>

		<label for="template" style="font-size: 13px; padding-top: 6px;">Previous template</label>
		<select
			id="template"
			name="template"
			value={data.form.templateKey}
			onchange={onTemplateChange}
			style="font-size: 13px; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px;"
		>
			{#each data.options.templates as t}
				<option value={t.key}>
					{t.name} — {t.canonical.country || 'Global'} / {LANGUAGE_LABELS[t.canonical.language]} / {t
						.canonical.intent}
				</option>
			{/each}
		</select>

		<label for="intent" style="font-size: 13px; padding-top: 6px;">Intent (new render)</label>
		<div>
			<select
				bind:this={intentEl}
				id="intent"
				name="intent"
				value={data.form.intent}
				onchange={resubmit}
				style="font-size: 13px; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px;"
			>
				<option value="">(empty / unrecognised)</option>
				{#each data.options.intents as i}
					<option value={i}>{i}</option>
				{/each}
			</select>
			<span style="font-size: 12px; color: #888; display: block; margin-top: 4px;">
				Resets to the template's canonical intent when you switch template. Only the new render
				varies with this — the old template's body is fixed.
			</span>
		</div>

		<span style="font-size: 13px; padding-top: 6px;">New render style</span>
		<div style="display: flex; flex-wrap: wrap; gap: 4px 16px; padding-top: 6px;">
			{#each [['auto', 'Auto (per chapter — UK plain, rest rich)'], ['rich', 'Force rich'], ['plain', 'Force plain']] as [value, label]}
				<label style="font-size: 13px; display: flex; gap: 4px; align-items: center;">
					<input
						type="radio"
						name="style"
						{value}
						checked={data.form.style === value}
						onchange={resubmit}
					/>
					{label}
				</label>
			{/each}
		</div>
	</form>

	<div
		style="font-size: 13px; background: #f0f4f8; color: #222; padding: 10px 12px; border-radius: 6px; margin-bottom: 12px;"
	>
		<strong>New render inputs:</strong>
		country <code>{data.newInputs.country || '—'}</code>
		· language <code>{data.newInputs.language}</code>
		· intent <code>{data.newInputs.intent || '(empty)'}</code>
		→ bucket <code>{data.newInputs.intentBucket}</code>
		· chapter
		{#if data.newInputs.chapterIsGlobalFallback}
			<code>Global fallback</code>
		{:else}
			<code>{data.newInputs.chapterName}</code> — leader {data.newInputs.chapterLeader},
			{data.newInputs.chapterLinkCount} link{data.newInputs.chapterLinkCount === 1 ? '' : 's'}
		{/if}
	</div>

	<div style="margin-bottom: 8px;">
		<button
			onclick={() => (showText = !showText)}
			style="font-size: 13px; padding: 4px 8px; cursor: pointer;"
		>
			{showText ? 'Show HTML preview' : 'Show plain text'}
		</button>
	</div>

	<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start;">
		<div>
			<div style="font-size: 13px; font-weight: bold; margin-bottom: 4px;">
				Previous — MailerSend template
				<span style="font-weight: normal; color: #888;">
					{data.legacy.name} ({data.legacy.id})
				</span>
			</div>
			<div style="font-size: 13px; margin-bottom: 8px;">
				<strong>Subject:</strong>
				{data.legacy.subject}
			</div>
			{#if showText}
				<pre
					style="white-space: pre-wrap; background: #f6f6f6; color: #222; padding: 16px; border-radius: 6px; font-size: 13px; line-height: 1.5;">{data
						.legacy.text}</pre>
			{:else}
				<iframe
					title="Previous MailerSend email"
					srcdoc={data.legacy.html}
					style="width: 100%; height: 1400px; border: 1px solid #ccc; border-radius: 6px;"
				></iframe>
			{/if}
		</div>

		<div>
			<div style="font-size: 13px; font-weight: bold; margin-bottom: 4px;">
				New — repo render endpoint
			</div>
			<div style="font-size: 13px; margin-bottom: 8px;">
				<strong>Subject:</strong>
				{data.rendered.subject}
			</div>
			{#if showText}
				<pre
					style="white-space: pre-wrap; background: #f6f6f6; color: #222; padding: 16px; border-radius: 6px; font-size: 13px; line-height: 1.5;">{data
						.rendered.text}</pre>
			{:else}
				<iframe
					title="New email HTML preview"
					srcdoc={data.rendered.html}
					style="width: 100%; height: 1400px; border: 1px solid #ccc; border-radius: 6px;"
				></iframe>
			{/if}
		</div>
	</div>
</div>
