<script lang="ts">
	import { goto } from '$app/navigation'
	import type { PageData } from './$types'
	import ResolvedSummary from './ResolvedSummary.svelte'

	let { data }: { data: PageData } = $props()

	let showText = $state(false)
	let previewWidth: 'desktop' | 'phone' = $state('desktop')
	let copied: 'text' | 'html' | 'failed' | '' = $state('')

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

	// srcdoc iframes are same-origin, so the frame can be sized to the email it holds
	// instead of a fixed height that leaves a long blank gap under a short one.
	let frameEl: HTMLIFrameElement | undefined = $state()
	function measure() {
		const doc = frameEl?.contentDocument
		if (!frameEl || !doc) return
		// scrollHeight can't fall below the frame's own height, so a frame left tall by a
		// longer email would keep that height forever. Collapse it first, then measure.
		frameEl.style.height = '0px'
		frameEl.style.height = `${Math.max(240, doc.documentElement.scrollHeight)}px`
	}
	function onFrameLoad() {
		measure()
		// Images land after load, hence the second measurement.
		setTimeout(measure, 500)
	}
	function remeasureAfterLayout() {
		requestAnimationFrame(measure)
	}

	async function copyEmail(kind: 'text' | 'html') {
		const payload =
			kind === 'text'
				? `Subject: ${data.rendered.subject}\n\n${data.rendered.text}`
				: data.rendered.html
		try {
			await navigator.clipboard.writeText(payload)
			copied = kind
			setTimeout(() => {
				if (copied === kind) copied = ''
			}, 2500)
		} catch {
			copied = 'failed'
		}
	}

	// One option per version of the email: Lead renders the same one as Volunteer, and
	// 'Keep informed' is gone, since no form writes it and it renders the same as None.
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

	const LANGUAGE_NAMES: Record<string, string> = {
		en: 'English',
		es: 'Spanish',
		sv: 'Swedish'
	}

	const EMAIL_FOR: Record<string, string> = {
		none: 'the general welcome email',
		'act-now': 'the welcome email for people who want to act now',
		volunteer: 'the welcome email for people who want to volunteer'
	}

	type CountryOption = (typeof data.options.countries)[number]

	function overrideNote(override: CountryOption['override']): string {
		if (!override) return ''
		if (override.scope === 'all') return `${override.name} writes its own`
		if (override.scope === 'volunteer') return `${override.name} writes its own, for volunteers`
		return `${override.name} writes its own, for non-volunteers`
	}

	const ownEmailCountries = $derived(data.options.countries.filter((c) => c.override))
	// Scope first, so a chapter covering only some signups reads last: "A, B, and C for volunteers".
	const ownEmailChapters = $derived(
		new Intl.ListFormat('en', { type: 'conjunction' }).format(
			ownEmailCountries
				.toSorted(
					(a, b) => Number(a.override?.scope !== 'all') - Number(b.override?.scope !== 'all')
				)
				.map(({ override }) =>
					override?.scope === 'all' ? override.name : `${override?.name} for ${override?.scope}s`
				)
		)
	)

	const who = $derived(data.form.firstName.trim() || 'Someone')

	const summary = $derived.by(() => {
		const { override, chapter, bucket, language } = data.resolved
		const languageName = LANGUAGE_NAMES[language] ?? language
		if (override) {
			return `${who} gets ${override}'s own email, written by the chapter, in ${languageName}.`
		}
		const opening = `${who} gets ${EMAIL_FOR[bucket]}, in ${languageName}.`
		if (chapter) {
			const count = chapter.links.length
			return `${opening} It ends with a short block about PauseAI in ${chapter.name}, listing ${count} link${count === 1 ? '' : 's'}, as shown for it on pauseai.info/communities.`
		}
		if (language === 'es') {
			return `${opening} The Spanish email points everyone to PauseAI en Español, so it carries no country chapter block.`
		}
		return `${opening} No chapter block — that's what a signup from a country without an active PauseAI chapter sees.`
	})
</script>

<svelte:head>
	<title>PauseAI welcome email preview</title>
</svelte:head>

<!-- Force a light scheme: this page paints its own light panels, and the site's dark theme
	would otherwise leave light text on them. -->
<div class="qa-tool">
	<h1>PauseAI welcome email preview</h1>
	<p class="lead">
		This is the email a new supporter receives the moment they sign up on pauseai.info. Set the
		supporter's name, country and intent below to see exactly what they would receive.
	</p>

	<div class="intro">
		<p>
			Most countries get one <strong>shared email</strong>, written centrally in English or Spanish,
			ending with a short block about the local chapter. A few chapters
			<strong>write their own email</strong>
			instead{ownEmailChapters ? ` (${ownEmailChapters})` : ''}, and it replaces the shared text
			entirely.
		</p>
		<p class="muted">
			Nothing here is sent to anyone, and no signup is created — it is a preview of the real
			wording, rendered by the same code that sends the live emails.
		</p>
	</div>

	<form bind:this={formEl} method="GET" onsubmit={rerender} class="controls">
		<label for="firstName">Their first name</label>
		<div>
			<input id="firstName" name="firstName" value={data.form.firstName} onchange={rerender} />
		</div>

		<label for="country">Their country</label>
		<div>
			<select id="country" name="country" value={data.form.country} onchange={rerender}>
				<option value="">— no chapter in their country —</option>
				{#each data.options.countries as c}
					<option value={c.name}
						>{c.name}{c.override ? ` — ${overrideNote(c.override)}` : ''}</option
					>
				{/each}
			</select>
			<span class="hint muted">
				{#if data.options.countries.length}
					The {data.options.countries.length} countries with an active PauseAI chapter. Signups from anywhere
					else get the email without a chapter block.
				{:else}
					The list of chapters couldn't be loaded, so only the email without a chapter block can be
					shown. Try reloading the page.
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
			>
				{#each INTENT_OPTIONS as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
			<span class="hint muted"
				>What they picked on the sign-up form. Each gets its own wording.</span
			>
		</div>

		<span class="field-label">Language</span>
		<div>
			<div class="radios">
				{#each data.options.languages as lang}
					<label class="radio">
						<input
							type="radio"
							name="language"
							value={lang}
							checked={data.form.language === lang}
							onchange={rerender}
						/>
						{LANGUAGE_LABELS[lang]}
					</label>
				{/each}
			</div>
			<span class="hint muted">
				Which language the shared email is written in. A chapter that writes its own email always
				sends it in that chapter's language, so this makes no difference there.
			</span>
		</div>

		<span class="field-label">Layout</span>
		<div>
			<div class="radios">
				{#each [['auto', 'As actually sent'], ['rich', 'Branded card'], ['plain', 'Plain note']] as [value, label]}
					<label class="radio">
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
			<span class="hint muted">
				Each chapter gets one or the other; switch to compare the same words in both.
			</span>
		</div>
	</form>

	<div class="summary">{summary}</div>

	<div class="preview-bar">
		<div class="subject"><span class="muted">Subject</span> {data.rendered.subject}</div>
		<div class="preview-actions">
			<button type="button" onclick={() => (showText = !showText)}>
				{showText ? 'Show the email' : 'Show plain text'}
			</button>
			{#if !showText}
				<div class="radios">
					{#each [['desktop', 'Desktop'], ['phone', 'Phone']] as [value, label]}
						<label class="radio">
							<input
								type="radio"
								name="previewWidth"
								{value}
								bind:group={previewWidth}
								onchange={remeasureAfterLayout}
							/>
							{label}
						</label>
					{/each}
				</div>
			{/if}
			<button type="button" onclick={() => copyEmail('text')}>Copy text</button>
			<button type="button" onclick={() => copyEmail('html')}>Copy HTML</button>
			{#if copied === 'text'}
				<span class="copied">Text copied</span>
			{:else if copied === 'html'}
				<span class="copied">HTML copied</span>
			{:else if copied === 'failed'}
				<span class="copied">Couldn't copy — select the text instead</span>
			{/if}
		</div>
	</div>

	{#if showText}
		<pre class="plain-text">{data.rendered.text}</pre>
	{:else}
		<div class="frame-wrap" class:phone={previewWidth === 'phone'}>
			<iframe
				bind:this={frameEl}
				title="Email preview"
				srcdoc={data.rendered.html}
				onload={onFrameLoad}
			></iframe>
		</div>
	{/if}

	<details class="panel">
		<summary>Writing or translating your chapter's own email</summary>
		<p>
			Pick your country above, set Intent to the version you want to adapt, and use
			<strong>Copy text</strong> to take it as your base. Then translate it, or rewrite it in your chapter's
			voice.
		</p>
		<p>
			You can write one email for everyone, or two. For a volunteer email, start from
			<em>Volunteer / Lead</em>. For everyone else, start from <em>None</em>: <em>Act now</em>
			differs only in its subject, first line and closing, and your chapter's email would go to both.
			To see a finished chapter email, pick one of the countries named at the top of this page.
		</p>
		<p>You supply the subject line, the opening, the body, the sign-off and your social links.</p>
		<p>
			Two lines are always added for you, in your language, wherever your text goes: the line asking
			the reader to confirm their email address, and a one-line promise about what we will send
			them. Please don't write your own versions of those — a welcome email that loses the
			confirmation link leaves the reader unconfirmed.
		</p>
		<p>
			Your chapter's links can either be pulled from the details listed for your chapter on
			pauseai.info/communities, so that keeping those current keeps the email current, or written
			into the email text, if your chapter would rather control them itself. PauseAI UK does the
			latter, PauseAI Canada the former.
		</p>
		<p>
			Please also point new volunteers to PauseAI Global: its
			<!-- eslint-disable-next-line svelte/no-restricted-html-elements -- dev-only QA page, not site chrome -->
			<a href={data.globalLinks.welcomeCalls}>welcome calls</a> for new volunteers and the
			<!-- eslint-disable-next-line svelte/no-restricted-html-elements -- dev-only QA page, not site chrome -->
			<a href={data.globalLinks.discord}>global Discord</a>. If your email isn't in English, mention
			that both are. PauseAI Sverige's email does this in one sentence; pick Sweden above to see it.
		</p>
		<p>
			Chapters can't edit this text themselves yet: send your version to PauseAI global and we will
			put it in.
		</p>
	</details>

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
		<p>
			<!-- eslint-disable-next-line svelte/no-restricted-html-elements -- dev-only QA page, not site chrome -->
			<a href="/onboarding-email-compare">/onboarding-email-compare</a> checks a render against the pre-migration
			MailerSend template it replaces.
		</p>
	</details>
</div>

<style>
	/* This tool paints its own light panels, so it has to set every colour itself:
	   otherwise a browser that forces a dark scheme on pages (Zen, high-contrast mode,
	   reader-style extensions) leaves light text on them. `!important` and
	   forced-color-adjust are what survive those, and are safe here because nothing else
	   styles this page. */
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
	.qa-tool :is(p, label, span, div, code, pre, input, select, option, button, summary, details) {
		font-weight: 400 !important;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
	}

	.qa-tool,
	.qa-tool :is(p, label, h1, span, code, strong, div, pre, summary) {
		color: var(--qa-text) !important;
	}

	/* Wins over the blanket colour above, which is `!important` for the reason given there. */
	.qa-tool :is(.muted, .muted span, .hint, .copied) {
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

	.controls :is(label, .field-label) {
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

	.radio {
		font-size: 13px;
		display: flex;
		gap: 4px;
		align-items: center;
		padding-top: 0;
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
</style>
