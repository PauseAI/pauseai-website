<script lang="ts">
	import { goto } from '$app/navigation'
	import type { PageData } from './$types'
	import ResolvedSummary from '../onboarding-email-preview/ResolvedSummary.svelte'

	let { data }: { data: PageData } = $props()

	let showText = $state(false)

	let formEl: HTMLFormElement | undefined = $state()

	function rerender(event?: Event, drop?: string) {
		event?.preventDefault()
		if (!formEl) return
		const entries = [...new FormData(formEl)] as [string, string][]
		const params = new URLSearchParams(entries.filter(([key]) => key !== drop))
		void goto(`?${params}`, { replaceState: true, keepFocus: true, noScroll: true })
	}

	// Each template was sent for one intent, so switching template drops the intent
	// override and the server applies that template's own. Changing intent alone keeps it.
	function onTemplateChange() {
		rerender(undefined, 'intent')
	}
	function resubmit() {
		rerender()
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

	// Each template was sent to one audience, so offering an intent from the other one would
	// pair a non-volunteer template with the volunteer email. Only the non-volunteer templates
	// have a choice at all: the no-intent version or the Act now one.
	const NON_VOLUNTEER_CHOICES = [
		{ value: 'None', label: 'None' },
		{ value: 'Act now', label: 'Act now' }
	]
	const intentChoices = $derived(data.newInputs.intent === 'Volunteer' ? [] : NON_VOLUNTEER_CHOICES)

	const LANGUAGE_LABELS: Record<string, string> = {
		en: 'English',
		es: 'Español'
	}
</script>

<svelte:head>
	<title>Onboarding email compare (dev only)</title>
</svelte:head>

<!-- Force a light scheme: QA tool with hardcoded light panel backgrounds; the
	site's dark theme would otherwise leave light text on them. -->
<div
	class="qa-tool"
	style="color-scheme: light; background: var(--white); color: var(--qa-text); font-family: sans-serif; padding: 16px; box-sizing: border-box; width: 94vw; max-width: 94vw; position: relative; left: 50%; margin-left: -47vw; min-height: 100vh;"
>
	<h1 style="font-size: 20px;">Onboarding email compare</h1>
	<div style="color: var(--grey-500); font-size: 14px; max-width: 900px;">
		<p>
			Side-by-side check of the new render against the email it replaces. <strong>Left</strong> is
			one of the seven pre-migration MailerSend templates (raw exports in
			<code>/email-templates</code>), picked from the dropdown. <strong>Right</strong> is the new
			<code>src/lib/server/onboardingEmail</code> render for that template's canonical signup — the
			country / language / intent combo the old routing (see
			<code>email-templates/ROUTING.md</code>) sent it for. Use it to confirm nothing in tone,
			content or links was lost in the migration. Treat the left pane as indicative: the exports are
			a 2026-07-15 snapshot, and at least the UK volunteer one has since drifted from what
			MailerSend actually sends.
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
			See
			<!-- eslint-disable-next-line svelte/no-restricted-html-elements -- dev-only QA page, not site chrome -->
			<a href="/onboarding-email-preview">/onboarding-email-preview</a> to drive the new render off
			arbitrary inputs instead. Dev tool: not linked from the site, available on
			<code>localhost</code> and Netlify deploy previews only, 404s on the production domain. Template
			and chapter data are public, not PII.
		</p>
	</div>

	<form
		bind:this={formEl}
		method="GET"
		onsubmit={rerender}
		style="display: grid; grid-template-columns: 130px 1fr; gap: 8px 12px; align-items: start; margin-bottom: 12px; padding: 12px; border: 1px solid var(--grey-150); border-radius: 6px; max-width: 720px;"
	>
		<label for="firstName" style="font-size: 13px; padding-top: 6px;">First name</label>
		<input
			id="firstName"
			name="firstName"
			value={data.form.firstName}
			onchange={resubmit}
			style="font-size: 13px; padding: 6px 8px; border: 1px solid var(--grey-100); border-radius: 4px;"
		/>

		<label for="template" style="font-size: 13px; padding-top: 6px;">Previous template</label>
		<select
			id="template"
			name="template"
			value={data.form.templateKey}
			onchange={onTemplateChange}
			style="font-size: 13px; padding: 6px 8px; border: 1px solid var(--grey-100); border-radius: 4px;"
		>
			{#each data.options.templates as t}
				<option value={t.key}>
					{t.canonical.country || 'Global'} / {LANGUAGE_LABELS[t.canonical.language]} / {t.canonical
						.intent}
				</option>
			{/each}
		</select>

		{#if intentChoices.length > 1}
			<label for="intent" style="font-size: 13px; padding-top: 6px;">Intent (new render)</label>
			<div>
				<select
					id="intent"
					name="intent"
					value={data.form.intent}
					onchange={resubmit}
					style="font-size: 13px; padding: 6px 8px; border: 1px solid var(--grey-100); border-radius: 4px;"
				>
					{#each intentChoices as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
				<span
					style="font-size: 12px; color: var(--qa-text-muted); display: block; margin-top: 4px;"
				>
					This template served both, and the new render tells them apart. Only the right side
					changes; the old body is fixed.
				</span>
			</div>
		{/if}

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
		style="font-size: 13px; background: var(--qa-panel-bg); color: var(--qa-text); padding: 10px 12px; border-radius: 6px; margin-bottom: 12px;"
	>
		<strong>New render inputs:</strong>
		country <code>{data.newInputs.country || '—'}</code>
		· intent <code>{data.newInputs.intent || '(empty)'}</code>
		→ <ResolvedSummary resolved={data.resolved} />
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
				<span style="font-weight: normal; color: var(--qa-text-muted);">
					<!-- eslint-disable-next-line svelte/no-restricted-html-elements -- dev-only QA page, not site chrome -->
					<a
						href="https://app.mailersend.com/templates/{data.legacy.id}/edit"
						target="_blank"
						rel="noreferrer"
					>
						{data.legacy.name}
					</a>
					— what it sends today, which the export beside it may no longer match
				</span>
			</div>
			<div style="font-size: 13px; margin-bottom: 8px;">
				<strong>Subject:</strong>
				{data.legacy.subject}
			</div>
			{#if showText}
				<pre
					style="white-space: pre-wrap; background: var(--qa-code-bg); color: var(--qa-text); padding: 16px; border-radius: 6px; font-size: 13px; line-height: 1.5;">{data
						.legacy.text}</pre>
			{:else}
				<iframe
					title="Previous MailerSend email"
					srcdoc={data.legacy.html}
					onload={fitToContent}
					style="display: block; width: 100%; height: 600px; border: 1px solid var(--grey-100); border-radius: 6px;"
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
					style="white-space: pre-wrap; background: var(--qa-code-bg); color: var(--qa-text); padding: 16px; border-radius: 6px; font-size: 13px; line-height: 1.5;">{data
						.rendered.text}</pre>
			{:else}
				<iframe
					title="New email HTML preview"
					srcdoc={data.rendered.html}
					onload={fitToContent}
					style="display: block; width: 100%; height: 600px; border: 1px solid var(--grey-100); border-radius: 6px;"
				></iframe>
			{/if}
		</div>
	</div>
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

	.qa-tool a {
		color: var(--qa-link) !important;
		text-decoration: underline;
	}
</style>
