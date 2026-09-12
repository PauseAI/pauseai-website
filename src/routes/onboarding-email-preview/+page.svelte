<script lang="ts">
	import { goto } from '$app/navigation'
	import type { PageData } from './$types'
	import ResolvedSummary from './ResolvedSummary.svelte'

	let { data }: { data: PageData } = $props()

	let showText = $state(false)

	// Re-render on any control change, without a page load: goto() re-runs the server
	// load and swaps the data in, so only the email changes. Falls back to a plain GET
	// submit (full page load) when JS is off, which is why this stays a real form.
	let formEl: HTMLFormElement | undefined = $state()
	function rerender(event?: Event) {
		event?.preventDefault()
		if (!formEl) return
		const params = new URLSearchParams(new FormData(formEl) as unknown as string[][])
		void goto(`?${params}`, { replaceState: true, keepFocus: true, noScroll: true })
	}

	// One option per version of the email: Lead renders the same one as Volunteer, and
	// 'Keep informed' is gone, since no form writes it and it renders the same as None.
	// srcdoc iframes are same-origin, so the frame can be sized to the email it holds
	// instead of a fixed height that leaves a long blank gap under a short one. Images
	// land after load, hence the second measurement.
	function fitToContent(event: Event) {
		const frame = event.currentTarget as HTMLIFrameElement
		const measure = () => {
			const doc = frame.contentDocument
			if (!doc) return
			// scrollHeight can't fall below the frame's own height, so a frame left tall by a
			// longer email would keep that height forever. Collapse it first, then measure.
			frame.style.height = '0px'
			frame.style.height = `${Math.max(240, doc.documentElement.scrollHeight)}px`
		}
		measure()
		setTimeout(measure, 500)
	}

	const INTENT_OPTIONS = [
		{ value: 'None', label: 'None' },
		{ value: 'Act now', label: 'Act now' },
		{ value: 'Volunteer', label: 'Volunteer / Lead' }
	]

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
	class="qa-tool"
	style="color-scheme: light; background: var(--white); color: var(--qa-text); font-family: sans-serif; padding: 16px; max-width: 1100px; margin: 0 auto; min-height: 100vh;"
>
	<h1 style="font-size: 20px;">Onboarding email preview</h1>
	<div style="color: var(--grey-500); font-size: 14px; max-width: 640px;">
		<p>
			Renders the welcome email that the Airtable onboarding automation sends via
			<code>/api/onboarding-email</code> (code in <code>src/lib/server/onboardingEmail</code>). Set
			each input by hand and the email re-renders on change — use it to eyeball copy, layout and
			links for any point in the matrix without creating a real signup.
		</p>
		<ul style="margin: 8px 0; padding-left: 18px;">
			<li><strong>First name / Intent</strong> — verbatim from the Members record.</li>
			<li>
				<strong>Language</strong> — forces the shared copy's language, en or es (production instead detects
				it from country + languages). Non-volunteers get English either way, and a chapter override is
				always in its own language.
			</li>
			<li>
				<strong>Country</strong> — selects the chapter block; only active National Groups countries are
				listed, anything else gets no chapter block. A chapter that writes its own email replaces the
				shared copy entirely: PauseAI UK for everyone, PauseAI Canada for volunteers. The panel under
				the form says which one a given combination resolved to.
			</li>
			<li>
				<strong>Style</strong> — <em>Auto</em> shows what production sends (PauseAI UK → plain
				layout, everyone else → rich card); <em>Force</em> overrides it for comparison.
			</li>
		</ul>
		<p>
			The panel under the form shows what the inputs resolved to (intent bucket, chapter). Toggle
			HTML / plain text with the button below it. See
			<!-- eslint-disable-next-line svelte/no-restricted-html-elements -- dev-only QA page, not site chrome -->
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
		onsubmit={rerender}
		style="display: grid; grid-template-columns: 120px 1fr; gap: 8px 12px; align-items: start; margin-bottom: 16px; padding: 12px; border: 1px solid var(--grey-150); border-radius: 6px; max-width: 640px;"
	>
		<label for="firstName" style="font-size: 13px; padding-top: 6px;">First name</label>
		<input
			id="firstName"
			name="firstName"
			value={data.form.firstName}
			onchange={rerender}
			style="font-size: 13px; padding: 6px 8px; border: 1px solid var(--grey-100); border-radius: 4px;"
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
						onchange={rerender}
					/>
					{LANGUAGE_LABELS[lang]}
					<span style="color: var(--grey-400);">({lang})</span>
				</label>
			{/each}
		</div>

		<label for="intent" style="font-size: 13px; padding-top: 6px;">Intent</label>
		<select
			id="intent"
			name="intent"
			value={data.form.intent === 'Lead' ? 'Volunteer' : data.form.intent}
			onchange={rerender}
			style="font-size: 13px; padding: 6px 8px; border: 1px solid var(--grey-100); border-radius: 4px;"
		>
			{#each INTENT_OPTIONS as option}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>

		<label for="country" style="font-size: 13px; padding-top: 6px;">Country</label>
		<div>
			<select
				id="country"
				name="country"
				value={data.form.country}
				onchange={rerender}
				style="width: 100%; font-size: 13px; padding: 6px 8px; border: 1px solid var(--grey-100); border-radius: 4px;"
			>
				<option value="">— none (no chapter) —</option>
				{#each data.options.countries as c}
					<option value={c.name}>{c.name}{c.override ? ` — ${c.override}` : ''}</option>
				{/each}
			</select>
			<span style="font-size: 12px; color: var(--qa-text-muted);">
				Active National Groups records ({data.options.countries.length}). Sets the chapter block
				only; language is chosen above. Any other country gets no chapter block.
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
						onchange={rerender}
					/>
					{label}
				</label>
			{/each}
		</div>

		<span></span>
		<button
			class="primary"
			type="submit"
			style="justify-self: start; font-size: 13px; padding: 6px 14px; border-radius: 4px; border: 1px solid var(--grey-100); cursor: pointer; background: var(--hero-orange); color: var(--white);"
		>
			Render
		</button>
	</form>

	<div
		style="font-size: 13px; background: var(--qa-panel-bg); color: var(--qa-text); padding: 10px 12px; border-radius: 6px; margin-bottom: 12px;"
	>
		<strong>Resolved:</strong>
		<ResolvedSummary resolved={data.resolved} />
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
			style="white-space: pre-wrap; background: var(--qa-code-bg); color: var(--qa-text); padding: 16px; border-radius: 6px; font-size: 13px; line-height: 1.5;">{data
				.rendered.text}</pre>
	{:else}
		<iframe
			title="Email HTML preview"
			srcdoc={data.rendered.html}
			onload={fitToContent}
			style="display: block; width: 100%; height: 600px; border: 1px solid var(--grey-100); border-radius: 6px;"
		></iframe>
	{/if}
</div>

<style>
	/* This tool paints its own light panels, so it has to set every colour itself:
	   otherwise a browser that forces a dark scheme on pages (Zen, high-contrast mode,
	   reader-style extensions) leaves light text on them. `!important` and
	   forced-color-adjust are what survive those, and are safe here because nothing else
	   styles this page. */
	.qa-tool {
		forced-color-adjust: none;
	}

	/* The site's body font is light-weight, which reads as thin grey text on these panels,
	   and thinner still in browsers that render their own way. */
	.qa-tool,
	.qa-tool :is(p, li, ul, label, span, div, code, pre, input, select, option, button) {
		font-weight: 400 !important;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
	}

	.qa-tool,
	.qa-tool :is(p, li, ul, label, h1, span, code, strong, em, div, pre) {
		color: var(--qa-text) !important;
	}

	.qa-tool :is(input, select, option, button) {
		color: var(--qa-text) !important;
		background: var(--white) !important;
		border: 1px solid var(--grey-100);
	}

	.qa-tool button.primary {
		color: var(--white) !important;
		background: var(--hero-orange) !important;
		border-color: var(--hero-orange);
	}

	.qa-tool a {
		color: var(--qa-link) !important;
		text-decoration: underline;
	}
</style>
