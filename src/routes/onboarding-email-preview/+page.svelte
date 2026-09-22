<script lang="ts">
	import { goto } from '$app/navigation'
	import { navigating } from '$app/state'
	import type { PageData } from './$types'
	import { fitFrame } from './fitFrame.js'
	import ResolvedSummary from './ResolvedSummary.svelte'

	let { data }: { data: PageData } = $props()

	type Language = PageData['options']['languages'][number]
	type Resolved = PageData['resolved']
	type OverrideSummary = NonNullable<PageData['options']['countries'][number]['override']>

	let showText = $state(false)
	let previewWidth: 'desktop' | 'phone' = $state('desktop')

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

	// Until the server load returns, `data.rendered` is still the previous email.
	const updating = $derived(navigating.to !== null)

	const COPY_STATUS = {
		text: 'Text copied',
		html: 'HTML copied',
		'failed-text': "Couldn't copy: your browser blocked it. Select the text below instead.",
		'failed-html': "Couldn't copy: your browser blocked it."
	} as const
	// Tied to the render it was about, so the message goes once the email changes. Raw, so the
	// identity check against `data.rendered` isn't defeated by a state proxy.
	let copied: { status: keyof typeof COPY_STATUS; rendered: PageData['rendered'] } | null =
		$state.raw(null)
	let copyTimer: ReturnType<typeof setTimeout> | undefined

	async function copyEmail(kind: 'text' | 'html') {
		const { rendered } = data
		const payload =
			kind === 'text' ? `Subject: ${rendered.subject}\n\n${rendered.text}` : rendered.html
		clearTimeout(copyTimer)
		try {
			await navigator.clipboard.writeText(payload)
			copied = { status: kind, rendered }
			copyTimer = setTimeout(() => (copied = null), 2500)
		} catch {
			copied = { status: `failed-${kind}`, rendered }
			if (kind === 'text') showText = true
		}
	}

	const HTML_STATUSES: (keyof typeof COPY_STATUS)[] = ['html', 'failed-html']
	const currentCopy = $derived.by(() => (copied?.rendered === data.rendered ? copied.status : null))
	const status = $derived.by(() => {
		if (updating) return 'Updating preview…'
		return currentCopy && !HTML_STATUSES.includes(currentCopy) ? COPY_STATUS[currentCopy] : ''
	})
	const htmlStatus = $derived(
		currentCopy && HTML_STATUSES.includes(currentCopy) ? COPY_STATUS[currentCopy] : ''
	)

	// One option per version of the email: Lead renders the same one as Volunteer, and
	// 'Keep informed' is gone, since no form writes it and it renders the same as None.
	const INTENT_OPTIONS = [
		{ value: 'None', label: 'None' },
		{ value: 'Act now', label: 'Act now' },
		{ value: 'Volunteer', label: 'Volunteer / Lead' }
	]

	const LANGUAGE_LABELS: Record<Language, string> = {
		en: 'English',
		es: 'Español'
	}

	const STYLE_OPTIONS = [
		{ value: 'auto', label: 'As actually sent' },
		{ value: 'rich', label: 'Branded card' },
		{ value: 'plain', label: 'Plain note' }
	]

	const WIDTH_OPTIONS = [
		{ value: 'desktop', label: 'Desktop' },
		{ value: 'phone', label: 'Phone' }
	] as const

	const languageNames = new Intl.DisplayNames('en', { type: 'language' })
	const languageName = (code: string) => languageNames.of(code) ?? code

	const EMAIL_FOR: Record<Resolved['bucket'], string> = {
		none: 'the general welcome email',
		'act-now': 'the welcome email for people who want to act now',
		volunteer: 'the welcome email for people who want to volunteer'
	}

	const AUDIENCE: Record<Exclude<OverrideSummary['scope'], 'all'>, string> = {
		volunteer: 'volunteers',
		'non-volunteer': 'non-volunteers'
	}

	function overrideNote(override: OverrideSummary): string {
		return override.scope === 'all'
			? `${override.name} writes its own`
			: `${override.name} writes its own, for ${AUDIENCE[override.scope]}`
	}

	// Past this many the intro sentence turns into a list, so it names the first few and counts
	// the rest; every one is still marked in the country picker.
	const MAX_NAMED_OWN_EMAIL_CHAPTERS = 4

	const ownEmailChapters = $derived.by(() => {
		// Whole-country chapters first, so one covering only some signups reads last:
		// "A, B, and C for volunteers".
		const names = data.options.countries
			.flatMap(({ override }) => (override ? [override] : []))
			.sort((a, b) => Number(a.scope !== 'all') - Number(b.scope !== 'all'))
			.map((o) => (o.scope === 'all' ? o.name : `${o.name} for ${AUDIENCE[o.scope]}`))
		const shown =
			names.length > MAX_NAMED_OWN_EMAIL_CHAPTERS
				? [
						...names.slice(0, MAX_NAMED_OWN_EMAIL_CHAPTERS - 1),
						`${names.length - (MAX_NAMED_OWN_EMAIL_CHAPTERS - 1)} others`
					]
				: names
		return new Intl.ListFormat('en', { type: 'conjunction' }).format(shown)
	})

	// A bookmarked country, or the default one when the chapter list failed to load, still
	// needs an option, or the select shows a different country from the one being previewed.
	const countryMissing = $derived(
		data.form.country !== '' && !data.options.countries.some((c) => c.name === data.form.country)
	)

	const summary = $derived.by(() => {
		const { override, chapter, bucket, group, language } = data.resolved
		const inLanguage = `in ${languageName(language)}`
		if (override) return `This is ${override}'s own email, written by the chapter, ${inLanguage}.`

		const opening = `This is ${EMAIL_FOR[bucket]}, ${inLanguage}.`
		// The Spanish route leaves out country chapters, and only volunteers have a Spanish
		// version, so a Spanish non-volunteer is resolved as English with no chapter.
		if (data.routedLanguage === 'es') {
			return group === 'volunteer'
				? `${opening} The Spanish email points everyone to PauseAI en Español, so it has no country chapter part.`
				: `${opening} The email for non-volunteers only exists in English, and Spanish-speaking signups get no country chapter part.`
		}
		if (!chapter) {
			return `${opening} It has no chapter part, as for any signup from a country not in the list above.`
		}
		const hasLinks = chapter.links.length > 0
		const links = "the chapter's links, the same ones as on pauseai.info/national-groups"
		if (group === 'volunteer') {
			return `${opening} It says PauseAI ${chapter.name} will be in touch${hasLinks ? `, and lists ${links}` : ''}.`
		}
		return hasLinks
			? `${opening} It includes a short part about PauseAI in ${chapter.name}, with ${links}.`
			: `${opening} It has no chapter part, because PauseAI ${chapter.name} has no links on pauseai.info/national-groups yet.`
	})
</script>

<svelte:head>
	<title>PauseAI welcome email preview</title>
</svelte:head>

{#snippet radioGroup(
	name: string,
	options: readonly { value: string; label: string }[],
	current: string
)}
	<div
		class="radios"
		role="radiogroup"
		aria-labelledby="{name}-label"
		aria-describedby="{name}-hint"
	>
		{#each options as option}
			<label class="radio">
				<input
					type="radio"
					{name}
					value={option.value}
					checked={current === option.value}
					onchange={rerender}
				/>
				{option.label}
			</label>
		{/each}
	</div>
{/snippet}

<!-- eslint-disable svelte/no-restricted-html-elements -- standalone preview tool with its own light styling; the site's Link component adds site chrome it doesn't want -->
<div class="qa-tool">
	<h1>PauseAI welcome email preview</h1>
	<p class="lead">
		This is the email a new supporter receives the moment they sign up on pauseai.info. Set the
		supporter's name, country and intent below to see what they would receive.
	</p>

	<div class="intro">
		<p>
			Most countries get one <strong>shared email</strong>, written centrally in English or Spanish,
			with a short part about the local chapter. A few chapters
			<strong>write their own email</strong>
			instead{ownEmailChapters ? ` (${ownEmailChapters})` : ''}, and it replaces the shared text.
		</p>
		<p>
			The chapter part lists your chapter's links, the same ones as on pauseai.info/national-groups.
			To change them, send the new ones to PauseAI Global.
		</p>
		<p class="muted">
			Nothing here is sent to anyone, and no signup is created. It is a preview of the real wording,
			rendered by the same code that sends the live emails.
		</p>
	</div>

	<section class="guide">
		<h2>Writing your chapter's own email</h2>
		<p>
			You can translate the shared email (<strong>Copy text</strong> below copies the version on screen),
			or write your own from scratch, as some chapters have: pick a country marked &ldquo;writes its own&rdquo;
			below to read theirs. One email for everyone is fine, or one for volunteers and one for non-volunteers.
		</p>
		<p>
			Every chapter's own email also includes these two lines. If you are writing in another
			language, please include your translation of them too:
		</p>
		<ul class="fixed-lines">
			<li>{data.fixedLines.confirm}</li>
			<li>{data.fixedLines.newsletter}</li>
		</ul>
		<p>
			Please mention PauseAI Global's
			<a href={data.globalLinks.welcomeCalls}>welcome calls</a> for new volunteers and its
			<a href={data.globalLinks.discord}>Discord</a>, and that both are in English.
		</p>
		<p>
			Your email goes out in the branded card layout unless you ask for the plain note instead; use
			<strong>Layout</strong> below to compare the two.
		</p>
		<p>Send your text and your chapter's social links to PauseAI Global, and we will put it in.</p>
	</section>

	<form bind:this={formEl} method="GET" onsubmit={rerender} class="controls">
		<label for="firstName">Their first name</label>
		<input id="firstName" name="firstName" value={data.form.firstName} onchange={rerender} />

		<label for="country">Their country</label>
		<div>
			<select
				id="country"
				name="country"
				value={data.form.country}
				onchange={rerender}
				aria-describedby="country-hint"
			>
				<option value="">— no chapter in their country —</option>
				{#if countryMissing}
					<option value={data.form.country}>{data.form.country}</option>
				{/if}
				{#each data.options.countries as c}
					<option value={c.name}
						>{c.name}{c.override ? ` — ${overrideNote(c.override)}` : ''}</option
					>
				{/each}
			</select>
			<span class="hint" id="country-hint">
				{#if data.options.countries.length}
					The {data.options.countries.length} countries whose chapter PauseAI Global points new signups
					to. Signups from anywhere else get the email without a chapter part, including the US: PauseAI
					US welcomes its own members.
				{:else}
					The list of chapters couldn't be loaded, so you can't pick another country right now. Try
					reloading the page.
				{/if}
			</span>
		</div>

		<label for="intent">Intent</label>
		<div>
			<select
				id="intent"
				name="intent"
				value={data.form.intent === 'Lead' ? 'Volunteer' : data.form.intent}
				onchange={rerender}
				aria-describedby="intent-hint"
			>
				{#each INTENT_OPTIONS as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
			<span class="hint" id="intent-hint">
				What they picked on the sign-up form. Volunteer and Lead get the same email, and a chapter's
				own email can be the same whatever they picked.
			</span>
		</div>

		<span class="field-label" id="language-label">Language</span>
		<div>
			{#if data.form.languageLock}
				<span class="locked-value" aria-describedby="language-hint"
					>{languageName(data.form.language)}</span
				>
			{:else}
				{@render radioGroup(
					'language',
					data.options.languages.map((lang) => ({ value: lang, label: LANGUAGE_LABELS[lang] })),
					data.form.language
				)}
			{/if}
			<span class="hint" id="language-hint">
				{#if data.form.languageLock === 'own-email'}
					{data.resolved.override} writes its own email, in {languageName(data.resolved.language)}.
				{:else if data.form.languageLock === 'english-only'}
					Only the &ldquo;Volunteer / Lead&rdquo; email has a Spanish version, so this one is always
					in English.
				{:else if data.form.languageLock === 'spanish-country'}
					Volunteers from {data.form.country} always get the Spanish version, whatever languages they
					listed.
				{:else}
					Which language the shared email is written in. Signups from Spanish-speaking countries
					always get Spanish; anyone else gets it if they listed Spanish among their languages.
				{/if}
			</span>
		</div>

		<span class="field-label" id="style-label">Layout</span>
		<div>
			{@render radioGroup('style', STYLE_OPTIONS, data.form.style)}
			<span class="hint" id="style-hint">
				The shared email always uses the branded card; a chapter's own email can use either. Switch
				to compare the same words in both.
			</span>
		</div>
	</form>

	<div class="summary">{summary}</div>

	<div class="preview-bar">
		<div class="subject"><span class="muted">Subject</span> {data.rendered.subject}</div>
		<div class="preview-actions">
			<button type="button" onclick={() => (showText = !showText)}>
				{showText ? 'Show as email' : 'Show as text'}
			</button>
			{#if !showText}
				<div class="radios" role="radiogroup" aria-label="Preview width">
					{#each WIDTH_OPTIONS as option}
						<label class="radio">
							<input
								type="radio"
								name="previewWidth"
								value={option.value}
								bind:group={previewWidth}
							/>
							{option.label}
						</label>
					{/each}
				</div>
			{/if}
			<button type="button" disabled={updating} onclick={() => copyEmail('text')}>Copy text</button>
			<span class="copied" role="status">{status}</span>
		</div>
	</div>

	{#if showText}
		<pre class="plain-text">{data.rendered.text}</pre>
	{:else}
		<div class="frame-wrap" class:phone={previewWidth === 'phone'}>
			<iframe title="Email preview" srcdoc={data.rendered.html} use:fitFrame></iframe>
		</div>
	{/if}

	<details class="panel">
		<summary>For developers</summary>
		<p>
			Rendered by <code>/api/onboarding-email</code>, which the Airtable onboarding automation
			calls; the copy and layout live in <code>src/lib/server/onboardingEmail</code>. This page is
			not linked from the site: it runs on <code>localhost</code> and Netlify deploy previews, and 404s
			on the production domain. Chapter data shown is public National Groups info, not PII.
		</p>
		<p>
			Resolved: <ResolvedSummary resolved={data.resolved} />
		</p>
		<p class="dev-copy">
			<button type="button" disabled={updating} onclick={() => copyEmail('html')}>Copy HTML</button>
			<span class="copied" role="status">{htmlStatus}</span>
		</p>
		<p>
			<a href="/onboarding-email-compare">/onboarding-email-compare</a> checks a render against the pre-migration
			MailerSend template it replaces.
		</p>
	</details>
</div>

<style>
	/* This tool paints its own light panels, so it has to set every colour itself, and forces
	   color-scheme: light: otherwise the site's dark theme, or a browser that forces a dark
	   scheme on pages (Zen, high-contrast mode, reader-style extensions), leaves light text on
	   them. `!important` and forced-color-adjust are what survive those, and are safe here
	   because nothing else styles this page. */
	.qa-tool {
		forced-color-adjust: none;
		color-scheme: light;
		background: var(--white);
		padding: 16px;
		max-width: 1100px;
		margin: 0 auto;
		min-height: 100vh;
		font-size: 14px;
		line-height: 1.5;
	}

	/* The site's body font is light-weight, which reads as thin grey text on these panels,
	   and thinner still in browsers that render their own way. */
	.qa-tool,
	.qa-tool
		:is(p, li, label, span, div, code, pre, input, select, option, button, summary, details) {
		font-weight: 400 !important;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
	}

	.qa-tool,
	.qa-tool :is(p, li, label, h1, h2, span, code, strong, div, pre, summary) {
		color: var(--qa-text) !important;
	}

	/* Wins over the blanket colour above, which is `!important` for the reason given there. */
	.qa-tool :is(.muted, .hint, .copied) {
		color: var(--qa-text-muted) !important;
	}

	.qa-tool :is(input, select, option, button) {
		color: var(--qa-text) !important;
		background: var(--white) !important;
		border: 1px solid var(--grey-100);
	}

	.qa-tool a {
		color: var(--qa-link) !important;
		text-decoration: underline;
	}

	h1 {
		font-size: 22px;
		margin: 0 0 4px;
	}

	.lead {
		font-size: 15px;
		max-width: 640px;
		margin: 0 0 12px;
	}

	.intro {
		max-width: 640px;
		margin-bottom: 20px;
		border-left: 3px solid var(--hero-orange);
		padding: 2px 0 2px 12px;
	}

	.intro p {
		margin: 6px 0;
	}

	.guide {
		max-width: 680px;
		margin-bottom: 20px;
		padding: 12px 14px;
		background: var(--qa-panel-bg);
		border-radius: 6px;
	}

	.guide h2 {
		font-size: 15px;
		margin: 0 0 6px;
	}

	.guide p {
		margin: 8px 0;
	}

	.controls {
		display: grid;
		grid-template-columns: 150px minmax(0, 1fr);
		gap: 10px 12px;
		align-items: start;
		margin-bottom: 16px;
		padding: 12px;
		border: 1px solid var(--grey-150);
		border-radius: 6px;
		max-width: 680px;
	}

	.controls :is(label:not(.radio), .field-label) {
		font-size: 13px;
		padding-top: 7px;
	}

	.controls :is(input:not([type]), select) {
		font-size: 13px;
		padding: 6px 8px;
		border-radius: 4px;
		width: 100%;
		max-width: 420px;
	}

	.hint {
		display: block;
		font-size: 12px;
		margin-top: 3px;
		max-width: 420px;
	}

	.radios {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 16px;
		padding-top: 6px;
	}

	.locked-value {
		display: inline-block;
		font-size: 13px;
		padding-top: 7px;
	}

	.radio {
		font-size: 13px;
		display: flex;
		gap: 4px;
		align-items: center;
	}

	.summary {
		font-size: 14px;
		background: var(--qa-panel-bg);
		padding: 10px 12px;
		border-radius: 6px;
		margin-bottom: 12px;
		max-width: 780px;
	}

	.preview-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 16px;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	.subject {
		font-size: 14px;
	}

	.subject .muted {
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin-right: 4px;
	}

	.preview-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 12px;
		align-items: center;
	}

	.preview-actions button {
		font-size: 13px;
		padding: 4px 10px;
		border-radius: 4px;
		cursor: pointer;
	}

	.preview-actions button:disabled {
		cursor: default;
		opacity: 0.5;
	}

	.preview-actions .radios {
		padding-top: 0;
	}

	.copied {
		font-size: 12px;
	}

	.frame-wrap {
		margin: 0 auto;
	}

	.frame-wrap.phone {
		max-width: 390px;
	}

	.frame-wrap iframe {
		display: block;
		width: 100%;
		height: 600px;
		border: 1px solid var(--grey-100);
		border-radius: 6px;
	}

	.plain-text {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		background: var(--qa-code-bg);
		padding: 16px;
		border-radius: 6px;
		font-size: 13px;
		line-height: 1.5;
	}

	.panel {
		margin-top: 16px;
		border: 1px solid var(--grey-150);
		border-radius: 6px;
		padding: 10px 12px;
		max-width: 680px;
	}

	.panel summary {
		cursor: pointer;
		font-size: 14px;
	}

	.panel p {
		font-size: 13px;
		margin: 10px 0;
	}

	.dev-copy {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.dev-copy button {
		font-size: 13px;
		padding: 4px 10px;
		border-radius: 4px;
		cursor: pointer;
	}

	.dev-copy button:disabled {
		cursor: default;
		opacity: 0.5;
	}

	.fixed-lines {
		margin: 6px 0;
		padding-left: 20px;
	}

	.fixed-lines li {
		margin: 4px 0;
	}

	/* One column on phones: beside a 150px label column the controls get about 100px. */
	@media (max-width: 600px) {
		.controls {
			grid-template-columns: minmax(0, 1fr);
			gap: 4px;
		}

		.controls :is(label:not(.radio), .field-label) {
			padding-top: 10px;
		}

		/* Below 16px, iOS Safari zooms the page when a field gets focus. */
		.controls :is(input:not([type]), select) {
			font-size: 16px;
			max-width: none;
		}
	}
</style>
