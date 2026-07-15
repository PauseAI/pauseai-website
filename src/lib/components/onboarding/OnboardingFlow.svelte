<!--
	OnboardingFlow — multi-step join form.

	Flow documentation (step machine, validation, live/stub mode):
	docs/join-form-flow.md

	When changing steps, intents, hidden fields, or the submit contract,
	update that document so it stays in sync with the code.
-->
<script lang="ts">
	import { onMount } from 'svelte'
	import { enhance } from '$app/forms'
	import type { SubmitFunction } from '@sveltejs/kit'
	import type { NationalGroupsApiResponse } from '$api/national-groups/+server.js'
	import type { OnboardingModeApiResponse } from '$api/onboarding-mode/+server.js'
	import { toast } from 'svelte-french-toast'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
	import Socials from '$lib/components/Socials.svelte'
	import Combobox from '$lib/components/Combobox.svelte'
	import ActionCards from './ActionCards.svelte'
	import Stepper from './Stepper.svelte'
	import { getMessages } from './i18n.svelte'
	import {
		COUNTRIES,
		COUNTRY_DIAL_CODES,
		DISCOVERY_SPECIFY_TRIGGERS,
		LANGUAGES,
		getDiscoveryOptions,
		getMotivations,
		getSkills,
		getWeeklyHours,
		getIntentOptions,
		type Intent,
		type IntentKey
	} from './options'

	const INTENT_VALUES: Record<IntentKey, Intent> = {
		'act-now': 'Act now',
		volunteer: 'Volunteer',
		lead: 'Lead'
	}

	const msgs = $derived(getMessages())
	const intentOptions = $derived(getIntentOptions(msgs))

	let {
		initialCountry = '',
		initialCity = '',
		initialLanguages = [] as string[]
	}: {
		initialCountry?: string
		initialCity?: string
		initialLanguages?: string[]
	} = $props()

	// Surface stub/live mode in the browser console when the form loads. The
	// pages embedding the form can be prerendered (e.g. /join), so the runtime
	// env isn't available at render time, ask the server instead.
	onMount(async () => {
		try {
			const response = await fetch('/api/onboarding-mode')
			if (!response.ok) return
			const { live } = (await response.json()) as OnboardingModeApiResponse
			console.log(
				live
					? 'Onboarding form: LIVE mode. Submissions write to Airtable.'
					: '🧪 Onboarding form: STUB mode. Submissions are captured at /embed/onboarding-form/stub, no Airtable write or Substack subscription. Set ONBOARDING_LIVE=true to go live.'
			)
		} catch {
			// Mode logging is best-effort; never break the form over it.
		}
	})

	let step: 1 | 2 | 3 | 4 = $state(1)
	let flowEl: HTMLDivElement | undefined = $state()

	// Scroll back to the top of the flow on step changes. The volunteer form
	// is long enough that the next screen would otherwise start mid-page.
	// Skipped when the top is already in view, so short steps don't jump.
	let previousStep: 1 | 2 | 3 | 4 = step
	$effect(() => {
		if (step !== previousStep) {
			previousStep = step
			if (flowEl && flowEl.getBoundingClientRect().top < 0) {
				flowEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
			}
		}
	})
	let mode: 'contact' | 'browse' = $state('contact')
	let intent: IntentKey | null = $state(null)
	// Airtable record id from the step-2 submission; later submissions send it
	// back so the server updates the record instead of creating another.
	let recordId = $state('')
	let keepInformed = $state(false)
	let submitting = $state(false)
	let browseSignedUp = $state(false)
	let honeypot = $state('')

	// Step 1: basic info (shared with the browse-mode inline signup and the
	// volunteer form, which pre-fills from the same state)
	let basics = $state({
		fullName: '',
		email: '',
		country: initialCountry,
		city: initialCity,
		newsletter: false
	})

	const validLanguageStored = new Set(LANGUAGES.map((l) => l.stored))
	const filteredInitialLanguages = initialLanguages.filter((l) => validLanguageStored.has(l))
	const defaultLanguages =
		filteredInitialLanguages.length > 0 ? filteredInitialLanguages : ['English']

	// Volunteer form (path C)
	let volunteer = $state({
		discordUsername: '',
		phone: '',
		languages: defaultLanguages,
		languagesOther: '',
		discovery: '',
		discoverySpecify: '',
		motivations: [] as string[],
		motivationsOther: '',
		skills: [] as string[],
		skillsOther: '',
		hours: '',
		zipCode: ''
	})

	let agreements = $state({ volunteer: false, conduct: false })

	// Stripe payment link used when a volunteer opts in to becoming a paying
	// member on the volunteer step. Same link as /submitted uses.
	const STRIPE_PAYMENT_LINK = 'https://donate.stripe.com/6oU14n1RD0So1oGftCd7q01'

	// Volunteer step: optional opt-in to become a paying member. When checked,
	// the success handler opens Stripe in a new tab (prefilled with the email
	// and the Airtable record id as client_reference_id, mirroring the legacy
	// Tally form's query params) and advances to the confirmation step so the
	// user stays in the flow.
	let becomePayingMember = $state(false)

	// GDPR data-processing consent gating every record-creating submission
	// (step 2 + browse). Chapter-sharing consent is not bundled here: it lives
	// in the optional "Keep me informed" opt-in, since we only share details
	// with a local chapter when the person asks to be connected to one.
	let gdprConsent = $state(false)

	// Phone: dial code prefilled from country of residence, editable in case
	// their phone is from elsewhere. Submitted combined via a hidden input.
	let dialCode = $state('')
	let dialCodeEdited = false

	$effect(() => {
		const code = COUNTRY_DIAL_CODES[basics.country]
		if (!dialCodeEdited && code) dialCode = code
	})

	const fullPhone = $derived.by(() => {
		const raw = volunteer.phone.trim()
		if (!raw) return ''
		// Already international, pass through as-is (minus separators).
		if (raw.startsWith('+')) return raw.replace(/[\s().-]/g, '')
		// National number: drop separators and the leading trunk 0.
		const digits = raw.replace(/\D/g, '').replace(/^0+/, '')
		if (!digits) return ''
		return `${dialCode.trim()}${digits}`
	})

	const volunteerFormComplete = $derived(
		volunteer.languages.length > 0 &&
			!!volunteer.hours &&
			agreements.volunteer &&
			agreements.conduct
	)

	const stepperLabels = $derived(
		intent === 'volunteer'
			? [
					msgs.onboarding_step_about,
					msgs.onboarding_step_intent,
					msgs.onboarding_step_volunteer_form,
					msgs.onboarding_step_confirmed
				]
			: intent === 'lead'
				? [msgs.onboarding_step_about, msgs.onboarding_step_intent, msgs.onboarding_step_next_steps]
				: [msgs.onboarding_step_about, msgs.onboarding_step_intent, msgs.onboarding_step_confirmed]
	)

	// Lead path: if the country already has a chapter, offer regional/city
	// leadership instead of founding a national group. Fetched lazily when the
	// lead intent is picked; on failure we fall back to the national copy.
	let nationalGroupNames: string[] | null = $state(null)

	$effect(() => {
		if (intent === 'lead' && nationalGroupNames === null) {
			nationalGroupNames = []
			fetch('/api/national-groups')
				.then((response) =>
					response.ok ? (response.json() as Promise<NationalGroupsApiResponse>) : []
				)
				.then((groups) => {
					nationalGroupNames = groups.map((group) => group.name)
				})
				.catch(() => {})
		}
	})

	const countryHasChapter = $derived(
		(nationalGroupNames ?? ([] as string[])).some(
			(name) => name.toLowerCase() === basics.country.trim().toLowerCase()
		)
	)

	const leadRole = $derived(countryHasChapter ? 'Regional Group Lead' : 'National Group Lead')

	const leadMailto = $derived(
		'mailto:Irina@pauseai.info' +
			`?subject=${encodeURIComponent(`Interested in becoming a PauseAI ${leadRole}`)}` +
			`&body=${encodeURIComponent(
				`Hi Irina,\n\nMy name is ${basics.fullName || '[your name]'} and I live in ${basics.country || '[your country]'}.\n\nI'd like to become a PauseAI ${leadRole} because:\n\n`
			)}`
	)

	const languageOptions = LANGUAGES.map((l) => ({ label: l.display, value: l.stored }))

	const showDiscoverySpecify = $derived(DISCOVERY_SPECIFY_TRIGGERS.includes(volunteer.discovery))

	function startBrowse() {
		mode = 'browse'
		intent = 'act-now'
		step = 3
	}

	function toggleIn(list: string[], value: string) {
		const index = list.indexOf(value)
		if (index >= 0) list.splice(index, 1)
		else list.push(value)
	}

	function continueToIntent(event: SubmitEvent) {
		event.preventDefault()
		step = 2
	}

	function submitWith(onSuccess: (data?: Record<string, unknown>) => void): SubmitFunction {
		return () => {
			submitting = true
			return ({ result }) => {
				submitting = false
				if (result.type === 'success') {
					// Remember the created record so later submissions in the
					// same flow update it rather than create a duplicate.
					if (typeof result.data?.recordId === 'string') {
						recordId = result.data.recordId
					}
					onSuccess(result.data)
				} else if (result.type === 'failure') {
					toast.error(String(result.data?.message ?? msgs.onboarding_error_generic))
				} else {
					toast.error(msgs.onboarding_error_unexpected)
				}
			}
		}
	}
</script>

{#snippet honeypotField(id: string)}
	<div class="field honey">
		<label for={id}>Nickname</label>
		<input
			type="text"
			{id}
			name="nickname"
			tabindex="-1"
			autocomplete="off"
			bind:value={honeypot}
		/>
	</div>
{/snippet}

{#snippet countrySelect(id: string)}
	<Combobox
		{id}
		name="country"
		options={COUNTRIES}
		required
		placeholder={msgs.onboarding_placeholder_country}
		bind:value={basics.country}
	/>
{/snippet}

{#snippet hiddenBasics()}
	<input type="hidden" name="full_name" value={basics.fullName} />
	<input type="hidden" name="email" value={basics.email} />
	<input type="hidden" name="country" value={basics.country} />
	<input type="hidden" name="city" value={basics.city} />
	{#if basics.newsletter}
		<input type="hidden" name="newsletter" value="on" />
	{/if}
{/snippet}

{#snippet selectCards(
	name: string,
	options: { value: string; label: string }[],
	selectedList: string[]
)}
	<div class="select-card-grid">
		{#each options as option (option.value)}
			<button
				type="button"
				class="select-card"
				class:selected={selectedList.includes(option.value)}
				role="checkbox"
				aria-checked={selectedList.includes(option.value)}
				onclick={() => toggleIn(selectedList, option.value)}
			>
				<span class="checkbox-box" aria-hidden="true">
					{selectedList.includes(option.value) ? '✓' : ''}
				</span>
				{option.label}
			</button>
		{/each}
	</div>
	{#each selectedList as selectedValue (selectedValue)}
		<input type="hidden" {name} value={selectedValue} />
	{/each}
{/snippet}

{#snippet checkboxConfirmations()}
	{#if keepInformed || basics.newsletter}
		<ul class="signup-confirmations">
			{#if keepInformed}
				<li>
					<span class="confirm-tick" aria-hidden="true">✓</span>
					{msgs.onboarding_confirm_keep_informed}
				</li>
			{/if}
			{#if basics.newsletter}
				<li>
					<span class="confirm-tick" aria-hidden="true">✓</span>
					{msgs.onboarding_confirm_newsletter}
				</li>
			{/if}
		</ul>
	{/if}
{/snippet}

{#snippet gdprConsentField()}
	<label class="agreement">
		<input type="checkbox" name="agree_gdpr" required bind:checked={gdprConsent} />
		<span class="checkbox-box" aria-hidden="true"></span>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<span>{@html msgs.onboarding_gdpr_consent}</span>
	</label>
{/snippet}

{#snippet nextStepBlock()}
	<div class="next-step">
		<h3>{msgs.onboarding_next_step_title}</h3>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<p>{@html msgs.onboarding_next_step_p1}</p>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<p>{@html msgs.onboarding_next_step_p2}</p>
	</div>
{/snippet}

{#snippet confirmationFooter()}
	<div class="confirmation-footer">
		<p class="section-label">{msgs.onboarding_footer_join_conversation}</p>
		<LinkWithoutIcon class="discord-button" href="https://discord.gg/2XXWXvErfA" target="_blank">
			{msgs.onboarding_footer_discord_btn}
		</LinkWithoutIcon>
		<p class="section-label">{msgs.onboarding_footer_follow_us}</p>
		<Socials />
	</div>
{/snippet}

<div class="onboarding-flow" bind:this={flowEl}>
	{#if mode === 'browse' && !browseSignedUp}
		<div class="browse-banner">
			{msgs.onboarding_browse_banner}
		</div>
	{/if}

	{#if mode === 'contact'}
		<Stepper labels={stepperLabels} current={step - 1} />
	{/if}

	<div class="form-card">
		{#if step === 1}
			<!-- Step 1: basic info -->
			<form onsubmit={continueToIntent}>
				<div class="field">
					<label class="field-label" for="ob-name">{msgs.onboarding_field_full_name}</label>
					<input
						type="text"
						id="ob-name"
						required
						placeholder={msgs.onboarding_placeholder_full_name}
						autocomplete="name"
						bind:value={basics.fullName}
					/>
				</div>
				{@render honeypotField('ob-nickname')}
				<div class="field">
					<label class="field-label" for="ob-email">{msgs.onboarding_field_email}</label>
					<input
						type="email"
						id="ob-email"
						required
						placeholder={msgs.onboarding_placeholder_email}
						autocomplete="email"
						bind:value={basics.email}
					/>
					<p class="helper">{msgs.onboarding_helper_email_gmail}</p>
					<!-- <p class="helper">
						We may contact you about critical mobilizations, see our
						<Link href="/privacy">privacy policy</Link>.
					</p> -->
				</div>
				<div class="field">
					<label class="field-label" for="ob-country">{msgs.onboarding_field_country}</label>
					{@render countrySelect('ob-country')}
				</div>
				<div class="field">
					<label class="field-label" for="ob-city">{msgs.onboarding_field_city}</label>
					<input
						type="text"
						id="ob-city"
						required
						placeholder={msgs.onboarding_placeholder_city}
						autocomplete="address-level2"
						bind:value={basics.city}
					/>
				</div>
				<button type="submit" class="primary">{msgs.onboarding_btn_continue}</button>
				<div class="browse-option">
					<button type="button" class="secondary" onclick={startBrowse}>
						{msgs.onboarding_btn_browse}
					</button>
					<p class="helper centered">
						{msgs.onboarding_browse_helper}
					</p>
				</div>
			</form>
		{:else if step === 2}
			<!-- Step 2: intent -->
			<form
				method="POST"
				action="/embed/onboarding-form?/submit"
				use:enhance={submitWith(() => (step = 3))}
			>
				{@render hiddenBasics()}
				{@render honeypotField('ob-nickname-2')}
				<input type="hidden" name="mode" value="contact" />
				{#if recordId}
					<input type="hidden" name="record_id" value={recordId} />
				{/if}
				<input
					type="hidden"
					name="intent"
					value={intent ? INTENT_VALUES[intent] : 'Keep informed'}
				/>
				{#if keepInformed}
					<input type="hidden" name="keep_informed" value="on" />
				{/if}
				<h2>{msgs.onboarding_step2_heading}</h2>
				<div class="intent-grid">
					<button
						type="button"
						class="intent-option"
						class:selected={keepInformed}
						role="checkbox"
						aria-checked={keepInformed}
						onclick={() => (keepInformed = !keepInformed)}
					>
						<span class="intent-icon">
							<span class="checkbox-box" aria-hidden="true">
								{keepInformed ? '✓' : ''}
							</span>
							🔔
						</span>
						<span class="intent-label">{msgs.onboarding_intent_keep_informed_label}</span>
						<span class="intent-sub">
							{msgs.onboarding_intent_keep_informed_sub}
						</span>
					</button>
					<button
						type="button"
						class="intent-option"
						class:selected={basics.newsletter}
						role="checkbox"
						aria-checked={basics.newsletter}
						onclick={() => (basics.newsletter = !basics.newsletter)}
					>
						<span class="intent-icon">
							<span class="checkbox-box" aria-hidden="true">
								{basics.newsletter ? '✓' : ''}
							</span>
							📰
						</span>
						<span class="intent-label">{msgs.onboarding_intent_newsletter_label}</span>
						<span class="intent-sub">
							{msgs.onboarding_intent_newsletter_sub}
						</span>
					</button>
				</div>
				<p class="section-label">{msgs.onboarding_intent_more_optional}</p>
				<div class="intent-stack" role="radiogroup" aria-label="Want to do more?">
					{#each intentOptions as option (option.key)}
						<button
							type="button"
							class="intent-option"
							class:selected={intent === option.key}
							role="radio"
							aria-checked={intent === option.key}
							onclick={() => (intent = intent === option.key ? null : option.key)}
						>
							<span class="intent-icon">
								<span class="radio-box" aria-hidden="true">
									<span class="radio-dot"></span>
								</span>
								{option.icon}
							</span>
							<span class="intent-label">{option.label}</span>
							<span class="intent-sub">{option.sub}</span>
						</button>
					{/each}
				</div>
				{@render gdprConsentField()}
				<button
					type="submit"
					class="primary"
					disabled={(!intent && !keepInformed && !basics.newsletter) || !gdprConsent || submitting}
				>
					{submitting
						? msgs.onboarding_btn_submitting
						: intent === 'volunteer' || intent === 'lead'
							? msgs.onboarding_btn_continue
							: msgs.onboarding_btn_submit}
				</button>
				<button type="button" class="back" onclick={() => (step = 1)}
					>{msgs.onboarding_btn_back}</button
				>
			</form>
		{:else if step === 3 && !intent}
			<!-- Path A: confirmation -->
			<div class="confirmation">
				<div class="checkmark">✓</div>
				<h2>{msgs.onboarding_confirm_a_title}</h2>
				{@render checkboxConfirmations()}
				{@render nextStepBlock()}
				{@render confirmationFooter()}
			</div>
		{:else if step === 3 && intent === 'act-now'}
			<!-- Path B: act now (contact confirmation or browse landing) -->
			{#if mode === 'contact'}
				<div class="confirmation">
					<div class="checkmark">✓</div>
					<h2>{msgs.onboarding_confirm_b_title}</h2>
					<p>{msgs.onboarding_confirm_b_sub}</p>
					{@render checkboxConfirmations()}
				</div>
			{:else}
				<div class="browse-header">
					<h2>{msgs.onboarding_browse_header_title}</h2>
					<p>
						{msgs.onboarding_browse_header_sub}
					</p>
				</div>
				{#if browseSignedUp}
					<div class="inline-confirmation">
						{msgs.onboarding_browse_signed_up}
					</div>
				{:else}
					<div class="keep-informed">
						<h3>{msgs.onboarding_browse_keep_informed_title}</h3>
						<p>{msgs.onboarding_browse_keep_informed_sub}</p>
						<form
							method="POST"
							action="/embed/onboarding-form?/submit"
							use:enhance={submitWith(() => (browseSignedUp = true))}
						>
							{@render honeypotField('ob-nickname-3')}
							<input type="hidden" name="mode" value="browse" />
							<input type="hidden" name="intent" value="Act now" />
							<input type="hidden" name="keep_informed" value="on" />
							<div class="field">
								<label class="field-label" for="loop-name">{msgs.onboarding_field_full_name}</label>
								<input
									type="text"
									id="loop-name"
									required
									placeholder={msgs.onboarding_placeholder_full_name}
									autocomplete="name"
									bind:value={basics.fullName}
								/>
							</div>
							<div class="field">
								<label class="field-label" for="loop-email">{msgs.onboarding_field_email}</label>
								<input
									type="email"
									id="loop-email"
									required
									placeholder={msgs.onboarding_placeholder_email}
									autocomplete="email"
									bind:value={basics.email}
								/>
								<!-- <p class="helper">
									We may contact you about critical mobilizations, see our
									<Link href="/privacy">privacy policy</Link>.
								</p> -->
							</div>
							<div class="field">
								<label class="field-label" for="loop-country">{msgs.onboarding_field_country}</label
								>
								{@render countrySelect('loop-country')}
							</div>
							<div class="field">
								<label class="field-label" for="loop-city">{msgs.onboarding_field_city}</label>
								<input
									type="text"
									id="loop-city"
									required
									placeholder={msgs.onboarding_placeholder_city}
									autocomplete="address-level2"
									bind:value={basics.city}
								/>
							</div>
							{@render gdprConsentField()}
							<button type="submit" class="primary" disabled={!gdprConsent || submitting}>
								{submitting ? msgs.onboarding_btn_signing_up : msgs.onboarding_btn_sign_me_up}
							</button>
						</form>
					</div>
				{/if}
				<p class="section-label">{msgs.onboarding_section_ways_to_help}</p>
			{/if}
			<ActionCards />
			{@render confirmationFooter()}
		{:else if step === 3 && intent === 'volunteer'}
			<!-- Path C: native volunteer form -->
			<h2>{msgs.onboarding_volunteer_title}</h2>
			<p class="path-intro">{msgs.onboarding_volunteer_intro}</p>
			{@render checkboxConfirmations()}
			<form
				method="POST"
				action="/embed/onboarding-form?/submit"
				use:enhance={submitWith(() => {
					if (becomePayingMember) {
						const params = new URLSearchParams({
							prefilled_email: basics.email,
							client_reference_id: recordId
						})
						window.open(`${STRIPE_PAYMENT_LINK}?${params.toString()}`, '_blank')
					}
					step = 4
				})}
			>
				{@render honeypotField('ob-nickname-4')}
				<input type="hidden" name="mode" value="contact" />
				<input type="hidden" name="intent" value="Volunteer" />
				<input type="hidden" name="volunteer_details" value="on" />
				{#if recordId}
					<input type="hidden" name="record_id" value={recordId} />
				{/if}
				{#if keepInformed}
					<input type="hidden" name="keep_informed" value="on" />
				{/if}
				{@render hiddenBasics()}
				{#if basics.country === 'United States'}
					<div class="field">
						<label class="field-label" for="vol-zip">{msgs.onboarding_field_zip}</label>
						<input
							type="text"
							id="vol-zip"
							name="zip_code"
							inputmode="numeric"
							maxlength="5"
							placeholder={msgs.onboarding_placeholder_zip}
							bind:value={volunteer.zipCode}
						/>
						<p class="helper">{msgs.onboarding_helper_zip}</p>
					</div>
				{/if}
				<div class="field">
					<label class="field-label" for="vol-discord">{msgs.onboarding_field_discord}</label>
					<input
						type="text"
						id="vol-discord"
						name="discord_username"
						bind:value={volunteer.discordUsername}
					/>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<p class="helper">{@html msgs.onboarding_helper_discord}</p>
				</div>
				<div class="field">
					<label class="field-label" for="vol-phone">{msgs.onboarding_field_phone}</label>
					<div class="phone-row">
						<input
							type="text"
							class="dial-code"
							aria-label="International dialing code"
							placeholder={msgs.onboarding_placeholder_dial_code}
							bind:value={dialCode}
							oninput={() => (dialCodeEdited = true)}
						/>
						<input
							type="tel"
							id="vol-phone"
							class="phone-number"
							placeholder={msgs.onboarding_placeholder_phone}
							bind:value={volunteer.phone}
						/>
					</div>
					<input type="hidden" name="phone" value={fullPhone} />
				</div>
				<div class="field">
					<label class="field-label" for="vol-languages">{msgs.onboarding_field_languages}</label>
					<Combobox
						id="vol-languages"
						name="languages"
						options={languageOptions}
						multiple
						required
						placeholder={msgs.onboarding_placeholder_languages}
						bind:value={volunteer.languages}
					/>
					{#if volunteer.languages.includes('Other')}
						<input
							type="text"
							name="languages_other"
							placeholder={msgs.onboarding_placeholder_specify}
							aria-label={msgs.onboarding_placeholder_specify}
							bind:value={volunteer.languagesOther}
						/>
					{/if}
				</div>
				<div class="field">
					<label class="field-label" for="vol-discovery">{msgs.onboarding_field_discovery}</label>
					<select id="vol-discovery" name="discovery" bind:value={volunteer.discovery}>
						<option value="">{msgs.onboarding_placeholder_discovery}</option>
						{#each getDiscoveryOptions(msgs) as option (option.value)}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
					{#if showDiscoverySpecify}
						<input
							type="text"
							name="discovery_specify"
							placeholder={msgs.onboarding_placeholder_specify}
							aria-label="How you found out about PauseAI, please specify"
							bind:value={volunteer.discoverySpecify}
						/>
					{/if}
				</div>
				<div class="field">
					<span class="field-label" id="vol-motivations-label"
						>{msgs.onboarding_field_motivations}</span
					>
					<div role="group" aria-labelledby="vol-motivations-label">
						{@render selectCards('motivations', getMotivations(msgs), volunteer.motivations)}
					</div>
					{#if volunteer.motivations.includes('Other')}
						<input
							type="text"
							name="motivations_other"
							placeholder={msgs.onboarding_placeholder_specify}
							aria-label="Other motivation, please specify"
							bind:value={volunteer.motivationsOther}
						/>
					{/if}
				</div>
				<div class="field">
					<span class="field-label" id="vol-skills-label">{msgs.onboarding_field_skills}</span>
					<div role="group" aria-labelledby="vol-skills-label">
						{@render selectCards('skills', getSkills(msgs), volunteer.skills)}
					</div>
					{#if volunteer.skills.includes('Other')}
						<input
							type="text"
							name="skills_other"
							placeholder={msgs.onboarding_placeholder_specify}
							aria-label="Other skills, please specify"
							bind:value={volunteer.skillsOther}
						/>
					{/if}
				</div>
				<div class="field">
					<span class="field-label" id="vol-hours-label">{msgs.onboarding_field_hours}</span>
					<div class="select-card-grid" role="radiogroup" aria-labelledby="vol-hours-label">
						{#each getWeeklyHours(msgs) as option (option.value)}
							<button
								type="button"
								class="select-card"
								class:selected={volunteer.hours === option.value}
								role="radio"
								aria-checked={volunteer.hours === option.value}
								onclick={() => (volunteer.hours = option.value)}
							>
								<span class="checkbox-box" aria-hidden="true">
									{volunteer.hours === option.value ? '✓' : ''}
								</span>
								{option.label}
							</button>
						{/each}
					</div>
					<input type="hidden" name="hours" value={volunteer.hours} />
				</div>
				<label class="agreement">
					<input
						type="checkbox"
						name="agree_volunteer"
						required
						bind:checked={agreements.volunteer}
					/>
					<span class="checkbox-box" aria-hidden="true"></span>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<span>{@html msgs.onboarding_agree_volunteer}</span>
				</label>
				<label class="agreement">
					<input type="checkbox" name="agree_conduct" required bind:checked={agreements.conduct} />
					<span class="checkbox-box" aria-hidden="true"></span>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<span>{@html msgs.onboarding_agree_conduct}</span>
				</label>
				<label class="agreement">
					<input type="checkbox" name="become_paying_member" bind:checked={becomePayingMember} />
					<span class="checkbox-box" aria-hidden="true"></span>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<span>{@html msgs.onboarding_become_paying_member}</span>
				</label>
				<button type="submit" class="primary" disabled={!volunteerFormComplete || submitting}>
					{submitting ? msgs.onboarding_btn_submitting : msgs.onboarding_btn_submit}
				</button>
				<button type="button" class="back" onclick={() => (step = 2)}
					>{msgs.onboarding_btn_back}</button
				>
			</form>
		{:else if step === 3 && intent === 'lead'}
			<!-- Path D: lead -->
			<h2>{msgs.onboarding_lead_title(leadRole)}</h2>
			<p class="role-meta"><em>{msgs.onboarding_lead_meta}</em></p>
			{@render checkboxConfirmations()}
			<div class="role-description">
				<p>{msgs.onboarding_lead_intro}</p>
				{#if basics.country === 'United States'}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<p>{@html msgs.onboarding_lead_us_branch}</p>
				{:else if countryHasChapter}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<p>{@html msgs.onboarding_lead_has_chapter(basics.country)}</p>
				{:else}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<p>{@html msgs.onboarding_lead_check_chapter}</p>
				{/if}
				<h3>{msgs.onboarding_lead_what_you_do_title}</h3>
				<ul>
					<li>{msgs.onboarding_lead_do_1}</li>
					<li>{msgs.onboarding_lead_do_2}</li>
					<li>{msgs.onboarding_lead_do_3}</li>
					<li>{msgs.onboarding_lead_do_4}</li>
				</ul>
				<h3>{msgs.onboarding_lead_looking_for_title}</h3>
				<ul>
					<li>{msgs.onboarding_lead_looking_1}</li>
					<li>{msgs.onboarding_lead_looking_2}</li>
					<li>{msgs.onboarding_lead_looking_3}</li>
					<li>{msgs.onboarding_lead_looking_4}</li>
					<li>{msgs.onboarding_lead_looking_5}</li>
					<li>{msgs.onboarding_lead_looking_6}</li>
				</ul>
				<h3>{msgs.onboarding_lead_nice_to_have_title}</h3>
				<ul>
					<li>{msgs.onboarding_lead_nice_1}</li>
					<li>{msgs.onboarding_lead_nice_2}</li>
					<li>{msgs.onboarding_lead_nice_3}</li>
				</ul>
				<p>{msgs.onboarding_lead_imperfect}</p>
				<h3>{msgs.onboarding_lead_support_title}</h3>
				<p>{msgs.onboarding_lead_support}</p>
				<h3>{msgs.onboarding_lead_next_steps_title}</h3>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<p>{@html msgs.onboarding_lead_next_steps}</p>
			</div>
			<LinkWithoutIcon class="mailto-button" href={leadMailto}>
				{msgs.onboarding_lead_email_btn}
			</LinkWithoutIcon>
			<p>{msgs.onboarding_lead_please_mention}</p>
			<ul class="bulleted">
				<li>{msgs.onboarding_lead_mention_1}</li>
				<li>{msgs.onboarding_lead_mention_2}</li>
				<li>{msgs.onboarding_lead_mention_3}</li>
			</ul>
			{@render confirmationFooter()}
		{:else if step === 4 && intent === 'volunteer'}
			<!-- Path C: confirmation -->
			<div class="confirmation">
				<div class="checkmark">✓</div>
				<h2>{msgs.onboarding_confirm_volunteer_title}</h2>
				<p>{msgs.onboarding_confirm_volunteer_sub}</p>
				{@render checkboxConfirmations()}
				{@render nextStepBlock()}
				{@render confirmationFooter()}
			</div>
		{/if}
	</div>
</div>

<style>
	.onboarding-flow {
		max-width: 800px;
		margin: 0 auto;
		padding: 0.5rem 0 2rem 0;
		color: var(--text);
	}

	h2 {
		font-family: var(--font-heading);
		margin-top: 0;
	}

	.browse-banner {
		background-color: var(--bg-subtle);
		border: 2px solid var(--brand);
		border-radius: 12px;
		padding: 0.75rem 1.25rem;
		margin-bottom: 1.5rem;
		font-weight: 500;
	}

	.form-card {
		background-color: var(--bg-subtle);
		padding: 2rem;
		border-radius: 32px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		width: 100%;
		box-sizing: border-box;
	}

	form {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 1rem;
		width: 100%;
		max-width: none;
	}

	.field {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.35rem;
		border: none;
		padding: 0;
		margin: 0;
	}

	.field-label {
		margin-left: 0.5rem;
		font-size: 0.9rem;
		font-weight: 500;
		opacity: 0.9;
	}

	input[type='text'],
	input[type='email'],
	input[type='tel'],
	select {
		width: 100%;
		padding: 0.8rem 1.2rem;
		border: 1px solid var(--brand-subtle);
		border-radius: 20px;
		background-color: var(--bg);
		color: var(--text);
		font-family: var(--font-body);
		font-size: 1rem;
		box-sizing: border-box;
	}

	input:focus,
	select:focus {
		outline: 2px solid var(--brand);
		border-color: transparent;
	}

	select {
		appearance: none;
		background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
		background-repeat: no-repeat;
		background-position: right 1rem center;
		background-size: 1em;
	}

	.helper {
		margin: 0 0 0 0.5rem;
		font-size: 0.85rem;
		opacity: 0.75;
	}

	.helper.centered {
		margin: 0.25rem 0 0 0;
		text-align: center;
	}

	button.primary {
		background-color: var(--brand);
		color: white;
		border: none;
		padding: 0.8rem 3rem;
		border-radius: 50px;
		font-weight: bold;
		font-size: 1.1rem;
		font-family: var(--font-body);
		cursor: pointer;
		transition: opacity 0.2s;
		width: fit-content;
		align-self: center;
		margin-top: 0.5rem;
	}

	button.primary:hover:not(:disabled) {
		opacity: 0.9;
	}

	button.primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.browse-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 0.5rem;
	}

	button.secondary {
		background: none;
		border: 2px solid var(--brand);
		color: var(--brand);
		padding: 0.6rem 2rem;
		border-radius: 50px;
		font-weight: bold;
		font-size: 1rem;
		font-family: var(--font-body);
		cursor: pointer;
	}

	button.secondary:hover {
		background-color: var(--bg);
	}

	button.back {
		background: none;
		border: none;
		color: var(--text);
		opacity: 0.7;
		font-family: var(--font-body);
		font-size: 0.95rem;
		cursor: pointer;
		align-self: center;
	}

	button.back:hover {
		opacity: 1;
		text-decoration: underline;
	}

	.intent-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.intent-stack {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.intent-option {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 1.25rem;
		background-color: var(--bg);
		border: 2px solid var(--brand-subtle);
		border-radius: 16px;
		cursor: pointer;
		text-align: left;
		font-family: var(--font-body);
		color: var(--text);
		transition: border-color 0.15s;
	}

	.intent-option:hover {
		border-color: var(--brand);
	}

	.intent-option.selected {
		border-color: var(--brand);
		outline: 2px solid var(--brand);
	}

	.intent-icon {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 1.5rem;
	}

	.checkbox-box {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.3rem;
		height: 1.3rem;
		border: 2px solid var(--brand-subtle);
		border-radius: 6px;
		background-color: var(--bg);
		color: var(--bg);
		font-size: 0.95rem;
		font-weight: 700;
		line-height: 1;
	}

	/* Radio variant: circular, with a filled inner dot for the selected
	   option. Used for single-choice groups (e.g. "Want to do more?").
	   The dot is a centered element rather than a glyph so it stays
	   perfectly centered across fonts. */
	.radio-box {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.3rem;
		height: 1.3rem;
		border: 2px solid var(--brand-subtle);
		border-radius: 50%;
		background-color: var(--bg);
		line-height: 1;
	}

	.radio-dot {
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		background-color: transparent;
		transition: background-color 0.15s;
	}

	.intent-option.selected .radio-box {
		border-color: var(--brand);
		background-color: var(--brand);
	}

	.intent-option.selected .radio-dot {
		background-color: var(--bg);
	}

	.intent-option.selected .checkbox-box,
	.select-card.selected .checkbox-box {
		border-color: var(--brand);
		background-color: var(--brand);
	}

	.select-card-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.select-card {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background-color: var(--bg);
		border: 2px solid var(--brand-subtle);
		border-radius: 12px;
		cursor: pointer;
		text-align: left;
		font-family: var(--font-body);
		font-size: 0.9rem;
		color: var(--text);
		transition: border-color 0.15s;
	}

	.select-card:hover {
		border-color: var(--brand);
	}

	.select-card.selected {
		border-color: var(--brand);
	}

	.select-card .checkbox-box {
		flex-shrink: 0;
		width: 1.1rem;
		height: 1.1rem;
		font-size: 0.8rem;
	}

	.phone-row {
		display: flex;
		gap: 0.5rem;
	}

	.phone-row .dial-code {
		width: 5.5rem;
		flex-shrink: 0;
		text-align: center;
	}

	.phone-row .phone-number {
		flex: 1;
	}

	.agreement {
		position: relative;
		display: flex;
		/* global styles.css sets form label to flex-direction: column */
		flex-direction: row;
		align-items: center;
		gap: 0.6rem;
		cursor: pointer;
		font-size: 0.95rem;
	}

	.agreement input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}

	.agreement .checkbox-box {
		flex-shrink: 0;
		width: 1.1rem;
		height: 1.1rem;
		font-size: 0.8rem;
	}

	.agreement input:checked + .checkbox-box {
		border-color: var(--brand);
		background-color: var(--brand);
	}

	.agreement input:checked + .checkbox-box::after {
		content: '✓';
	}

	.agreement input:focus-visible + .checkbox-box {
		outline: 2px solid var(--brand);
		outline-offset: 1px;
	}

	.intent-label {
		font-weight: bold;
		font-size: 1.05rem;
	}

	.intent-sub {
		font-size: 0.9rem;
		opacity: 0.8;
	}

	.path-intro {
		opacity: 0.85;
	}

	.confirmation {
		text-align: center;
	}

	.confirmation p {
		max-width: 32rem;
		margin-left: auto;
		margin-right: auto;
	}

	.checkmark {
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 50%;
		background-color: var(--brand);
		color: var(--bg);
		font-size: 2rem;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1rem auto;
	}

	.confirmation-footer {
		margin-top: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.section-label {
		font-weight: bold;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.7;
		margin: 1.5rem 0 0.5rem 0;
	}

	.confirmation-footer :global(.discord-button) {
		display: inline-block;
		background-color: #5865f2;
		color: white;
		font-weight: bold;
		padding: 0.8rem 2rem;
		border-radius: 50px;
		text-decoration: none;
	}

	.confirmation-footer :global(.discord-button):hover {
		opacity: 0.9;
	}

	.form-card :global(.mailto-button) {
		display: block;
		width: fit-content;
		margin: 1.5rem auto;
		background-color: var(--brand);
		color: white;
		font-weight: bold;
		padding: 0.8rem 2rem;
		border-radius: 50px;
		text-decoration: none;
	}

	.form-card :global(.mailto-button):hover {
		opacity: 0.9;
	}

	.browse-header h2 {
		margin-bottom: 0.25rem;
	}

	.keep-informed {
		border: 2px solid var(--brand);
		border-radius: 16px;
		padding: 1.25rem;
		margin: 1rem 0 1.5rem 0;
		background-color: var(--bg);
	}

	.keep-informed h3 {
		margin-top: 0;
		font-family: var(--font-heading);
	}

	.signup-confirmations {
		margin: 1rem auto;
		padding: 0;
		max-width: 480px;
		list-style: none;
		text-align: left;
	}

	.signup-confirmations li {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		padding: 0.4rem 0;
	}

	.confirm-tick {
		flex-shrink: 0;
		color: var(--brand);
		font-weight: 700;
	}

	.inline-confirmation {
		border: 2px solid var(--brand);
		border-radius: 16px;
		padding: 1rem 1.25rem;
		margin: 1rem 0 1.5rem 0;
		background-color: var(--bg);
		font-weight: 500;
	}

	.role-meta {
		margin-top: -0.5rem;
	}

	.role-description h3 {
		font-size: 1.1rem;
		margin-bottom: 0.25rem;
	}

	/* global reset strips list-style; restore bullets for content lists */
	.role-description ul,
	ul.bulleted {
		list-style: disc;
		padding-left: 1.5rem;
		margin: 0.5rem 0 1rem;
	}

	.role-description li,
	ul.bulleted li {
		margin: 0.25rem 0;
	}

	.next-step {
		border: 2px solid var(--brand);
		border-radius: 16px;
		padding: 1rem 1.25rem;
		margin: 1.5rem auto;
		max-width: 32rem;
		text-align: left;
		background-color: var(--bg);
	}

	.next-step h3 {
		margin: 0 0 0.25rem 0;
		font-family: var(--font-heading);
		font-size: 1.1rem;
	}

	.next-step p {
		margin: 0 0 0.5rem 0;
		font-size: 0.95rem;
	}

	.next-step p:last-child {
		margin-bottom: 0;
	}

	.honey {
		display: none;
		opacity: 0;
		position: absolute;
		left: -9999px;
		height: 0;
		width: 0;
		overflow: hidden;
		z-index: -1;
	}

	@media (max-width: 600px) {
		.form-card {
			padding: 1.5rem;
		}

		.intent-grid,
		.select-card-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
