<script lang="ts">
	import { enhance } from '$app/forms'
	import type { SubmitFunction } from '@sveltejs/kit'
	import { toast } from 'svelte-french-toast'
	import Link from '$lib/components/Link.svelte'
	import LinkWithoutIcon from '$lib/components/LinkWithoutIcon.svelte'
	import Socials from '$lib/components/Socials.svelte'
	import ActionCards from './ActionCards.svelte'
	import Stepper from './Stepper.svelte'
	import {
		COUNTRIES,
		DISCOVERY_OPTIONS,
		DISCOVERY_SPECIFY_TRIGGERS,
		LANGUAGES,
		MOTIVATIONS,
		POPULAR_COUNTRIES,
		SKILLS,
		SUPPORT_ONLY_HOURS,
		WEEKLY_HOURS,
		type Intent
	} from './options'

	// The flow is embeddable on pages that already have their own h1 (e.g. /join),
	// so the framing heading's level is configurable.
	let { headingLevel = 1 }: { headingLevel?: 1 | 2 } = $props()
	const headingTag = $derived(`h${headingLevel}`)

	type IntentKey = 'keep-informed' | 'act-now' | 'volunteer' | 'lead'

	const INTENT_VALUES: Record<IntentKey, Intent> = {
		'keep-informed': 'Keep informed',
		'act-now': 'Act now',
		volunteer: 'Volunteer',
		lead: 'Lead'
	}

	const intentOptions: { key: IntentKey; icon: string; label: string; sub: string }[] = [
		{
			key: 'keep-informed',
			icon: '🔔',
			label: 'Keep me informed',
			sub: 'Connect me with my local PauseAI chapter and keep me updated on global campaigns.'
		},
		{
			key: 'act-now',
			icon: '✊',
			label: 'I want to take action now',
			sub: 'Show me what I can do today.'
		},
		{
			key: 'volunteer',
			icon: '🤝',
			label: 'I want to volunteer regularly',
			sub: 'Help me find a role that fits.'
		},
		{
			key: 'lead',
			icon: '🚀',
			label: 'I want to lead',
			sub: "I'm ready to organize in my country or region."
		}
	]

	let step: 1 | 2 | 3 | 4 = $state(1)
	let mode: 'contact' | 'browse' = $state('contact')
	let intent: IntentKey | null = $state(null)
	let submitting = $state(false)
	let browseSignedUp = $state(false)
	let honeypot = $state('')

	// Step 1 — basic info (shared with the browse-mode inline signup and the
	// volunteer form, which pre-fills from the same state)
	let basics = $state({
		fullName: '',
		email: '',
		country: '',
		city: '',
		newsletter: false
	})

	// Volunteer form (path C)
	let volunteer = $state({
		discordUsername: '',
		phone: '',
		languages: ['English'],
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

	// Lead form (path D)
	let chapterLeadInterest = $state(true)

	const stepperLabels = $derived(
		intent === 'volunteer'
			? ['About you', 'Intent', 'Volunteer form', 'Confirmed']
			: intent === 'lead'
				? ['About you', 'Intent', 'Apply', 'Confirmed']
				: ['About you', 'Intent', 'Confirmed']
	)

	const leadMailto = $derived(
		'mailto:Irina@pauseai.info' +
			`?subject=${encodeURIComponent('Interested in becoming a PauseAI National Group Lead')}` +
			`&body=${encodeURIComponent(
				`Hi Irina,\n\nMy name is ${basics.fullName || '[your name]'} and I live in ${basics.country || '[your country]'}.\n\nI'd like to become a PauseAI National Group Lead because:\n\n`
			)}`
	)

	const showDiscoverySpecify = $derived(DISCOVERY_SPECIFY_TRIGGERS.includes(volunteer.discovery))
	const supportOnly = $derived(volunteer.hours === SUPPORT_ONLY_HOURS)

	function startBrowse() {
		mode = 'browse'
		intent = 'act-now'
		step = 3
	}

	function continueToIntent(event: SubmitEvent) {
		event.preventDefault()
		step = 2
	}

	function submitWith(onSuccess: () => void): SubmitFunction {
		return () => {
			submitting = true
			return ({ result }) => {
				submitting = false
				if (result.type === 'success') {
					onSuccess()
				} else if (result.type === 'failure') {
					toast.error(String(result.data?.message ?? 'Something went wrong. Please try again.'))
				} else {
					toast.error('An unexpected error occurred. Please try again.')
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
	<select {id} name="country" required bind:value={basics.country}>
		<option value="" disabled>Select your country</option>
		<optgroup label="Popular">
			{#each POPULAR_COUNTRIES as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</optgroup>
		<optgroup label="All countries">
			{#each COUNTRIES as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</optgroup>
	</select>
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

{#snippet nextStepBlock()}
	<div class="next-step">
		<h3>★ Recommended next step</h3>
		<p>
			Join one of our Member Community Welcome Meetings, or a local social event, to find out more
			about PauseAI's community: <Link href="/communities#events">see upcoming events</Link>.
		</p>
		<p>
			Want to get kick-started into action straight away? Check out our
			<Link href="/action">list of actions</Link>.
		</p>
	</div>
{/snippet}

{#snippet confirmationFooter()}
	<div class="confirmation-footer">
		<p class="section-label">Join the conversation</p>
		<LinkWithoutIcon class="discord-button" href="https://discord.gg/2XXWXvErfA" target="_blank">
			Join PauseAI on Discord
		</LinkWithoutIcon>
		<p class="section-label">Follow us</p>
		<Socials />
	</div>
{/snippet}

<div class="onboarding-flow">
	<svelte:element this={headingTag} class="framing">
		Find the highest-impact way for you to help.
	</svelte:element>
	<p class="intro">
		One door into one global movement. Whether you have five minutes or five hours a week, there's a
		place for you.
	</p>

	{#if mode === 'browse' && !browseSignedUp}
		<div class="browse-banner">
			You're browsing without signing up — leave your email below so we can tell you when new
			opportunities go live.
		</div>
	{/if}

	{#if mode === 'contact'}
		<Stepper labels={stepperLabels} current={step - 1} />
	{/if}

	<div class="form-card">
		{#if step === 1}
			<!-- Step 1 — basic info -->
			<form onsubmit={continueToIntent}>
				<div class="field">
					<label class="field-label" for="ob-name">Full name *</label>
					<input
						type="text"
						id="ob-name"
						required
						placeholder="Full name"
						autocomplete="name"
						bind:value={basics.fullName}
					/>
				</div>
				{@render honeypotField('ob-nickname')}
				<div class="field">
					<label class="field-label" for="ob-email">Email *</label>
					<input
						type="email"
						id="ob-email"
						required
						placeholder="Email"
						autocomplete="email"
						bind:value={basics.email}
					/>
					<p class="helper">Preferably Gmail if you have one.</p>
					<p class="helper">
						We may contact you about critical mobilizations — see our
						<Link href="/privacy">privacy policy</Link>.
					</p>
				</div>
				<div class="field">
					<label class="field-label" for="ob-country">Country of residence *</label>
					{@render countrySelect('ob-country')}
				</div>
				<div class="field">
					<label class="field-label" for="ob-city">City / town of residence *</label>
					<input
						type="text"
						id="ob-city"
						required
						placeholder="City / town"
						autocomplete="address-level2"
						bind:value={basics.city}
					/>
				</div>
				<label class="checkbox">
					<input type="checkbox" bind:checked={basics.newsletter} />
					Subscribe me to the PauseAI newsletter (Substack)
				</label>
				<button type="submit" class="primary">Continue →</button>
				<div class="browse-option">
					<button type="button" class="secondary" onclick={startBrowse}>
						👀 I just want to take action now
					</button>
					<p class="helper centered">
						Skip ahead to see the actions you can take today, no email required.
					</p>
				</div>
			</form>
		{:else if step === 2}
			<!-- Step 2 — intent -->
			<form method="POST" action="/onboarding?/submit" use:enhance={submitWith(() => (step = 3))}>
				{@render hiddenBasics()}
				{@render honeypotField('ob-nickname-2')}
				<input type="hidden" name="mode" value="contact" />
				{#if intent}
					<input type="hidden" name="intent" value={INTENT_VALUES[intent]} />
				{/if}
				<h2>What brings you here?</h2>
				<div class="intent-grid" role="radiogroup" aria-label="What brings you here?">
					{#each intentOptions as option (option.key)}
						<button
							type="button"
							class="intent-option"
							class:selected={intent === option.key}
							role="radio"
							aria-checked={intent === option.key}
							onclick={() => (intent = option.key)}
						>
							<span class="intent-icon">{option.icon}</span>
							<span class="intent-label">{option.label}</span>
							<span class="intent-sub">{option.sub}</span>
						</button>
					{/each}
				</div>
				{#if intent === 'volunteer' || intent === 'lead'}
					<button type="button" class="primary" onclick={() => (step = 3)}>Continue →</button>
				{:else}
					<button type="submit" class="primary" disabled={!intent || submitting}>
						{submitting ? 'Submitting...' : 'Submit →'}
					</button>
				{/if}
				<button type="button" class="back" onclick={() => (step = 1)}>← Back</button>
			</form>
		{:else if step === 3 && intent === 'keep-informed'}
			<!-- Path A — confirmation -->
			<div class="confirmation">
				<div class="checkmark">✓</div>
				<h2>You're in.</h2>
				<p>
					We'll connect you with your local PauseAI chapter and keep you informed about our global
					campaigns.
				</p>
				{@render nextStepBlock()}
				{@render confirmationFooter()}
			</div>
		{:else if step === 3 && intent === 'act-now'}
			<!-- Path B — act now (contact confirmation or browse landing) -->
			{#if mode === 'contact'}
				<div class="confirmation">
					<div class="checkmark">✓</div>
					<h2>You're in — thanks for joining us.</h2>
					<p>You're all set. Here are a few ways to make a difference today.</p>
				</div>
			{:else}
				<div class="browse-header">
					<h2>Take action right now.</h2>
					<p>
						Below are some actions you can take right now. The best way to stay informed about new
						opportunities is to sign up below.
					</p>
				</div>
				{#if browseSignedUp}
					<div class="inline-confirmation">
						✓ You're signed up. We'll be in touch when new opportunities go live.
					</div>
				{:else}
					<div class="stay-in-loop">
						<h3>Stay in the loop</h3>
						<form
							method="POST"
							action="/onboarding?/submit"
							use:enhance={submitWith(() => (browseSignedUp = true))}
						>
							{@render honeypotField('ob-nickname-3')}
							<input type="hidden" name="mode" value="browse" />
							<input type="hidden" name="intent" value="Act now" />
							<div class="field">
								<label class="field-label" for="loop-name">Full name *</label>
								<input
									type="text"
									id="loop-name"
									required
									placeholder="Full name"
									autocomplete="name"
									bind:value={basics.fullName}
								/>
							</div>
							<div class="field">
								<label class="field-label" for="loop-email">Email *</label>
								<input
									type="email"
									id="loop-email"
									required
									placeholder="Email"
									autocomplete="email"
									bind:value={basics.email}
								/>
								<p class="helper">
									We may contact you about critical mobilizations — see our
									<Link href="/privacy">privacy policy</Link>.
								</p>
							</div>
							<div class="field">
								<label class="field-label" for="loop-country">Country of residence *</label>
								{@render countrySelect('loop-country')}
							</div>
							<div class="field">
								<label class="field-label" for="loop-city">City / town of residence *</label>
								<input
									type="text"
									id="loop-city"
									required
									placeholder="City / town"
									autocomplete="address-level2"
									bind:value={basics.city}
								/>
							</div>
							<label class="checkbox">
								<input type="checkbox" name="newsletter" bind:checked={basics.newsletter} />
								Subscribe me to the PauseAI newsletter (Substack)
							</label>
							<button type="submit" class="primary" disabled={submitting}>
								{submitting ? 'Signing up...' : 'Sign me up →'}
							</button>
						</form>
					</div>
				{/if}
				<p class="section-label">A few ways to help today</p>
			{/if}
			<ActionCards />
			{@render confirmationFooter()}
		{:else if step === 3 && intent === 'volunteer'}
			<!-- Path C — native volunteer form -->
			<h2>Sign up to volunteer</h2>
			<p class="path-intro">
				Tell us a bit about yourself so we can find a role that fits. Your details from the previous
				step are already filled in.
			</p>
			<form method="POST" action="/onboarding?/submit" use:enhance={submitWith(() => (step = 4))}>
				{@render honeypotField('ob-nickname-4')}
				<input type="hidden" name="mode" value="contact" />
				<input type="hidden" name="intent" value="Volunteer" />
				{#if basics.newsletter}
					<input type="hidden" name="newsletter" value="on" />
				{/if}
				<div class="field">
					<label class="field-label" for="vol-name">Full name *</label>
					<input
						type="text"
						id="vol-name"
						name="full_name"
						required
						autocomplete="name"
						bind:value={basics.fullName}
					/>
				</div>
				<div class="field">
					<label class="field-label" for="vol-email">Email *</label>
					<input
						type="email"
						id="vol-email"
						name="email"
						required
						autocomplete="email"
						bind:value={basics.email}
					/>
					<p class="helper">Preferably Gmail if you have one.</p>
				</div>
				<div class="field">
					<label class="field-label" for="vol-country">Country of residence *</label>
					{@render countrySelect('vol-country')}
				</div>
				<div class="field">
					<label class="field-label" for="vol-city">City / town of residence *</label>
					<input
						type="text"
						id="vol-city"
						name="city"
						required
						autocomplete="address-level2"
						bind:value={basics.city}
					/>
				</div>
				{#if basics.country === 'United States'}
					<div class="field">
						<label class="field-label" for="vol-zip">Zip code</label>
						<input
							type="text"
							id="vol-zip"
							name="zip_code"
							inputmode="numeric"
							maxlength="5"
							placeholder="e.g. 02134"
							bind:value={volunteer.zipCode}
						/>
						<p class="helper">Your 5-digit zip code is used to find your Local Group.</p>
					</div>
				{/if}
				<div class="field">
					<label class="field-label" for="vol-discord">Discord username</label>
					<input
						type="text"
						id="vol-discord"
						name="discord_username"
						bind:value={volunteer.discordUsername}
					/>
					<p class="helper">
						If you don't have a Discord account, we encourage you to
						<Link href="https://discord.com/register">create one here</Link>.
					</p>
				</div>
				<div class="field">
					<label class="field-label" for="vol-phone">Phone number</label>
					<input type="tel" id="vol-phone" name="phone" bind:value={volunteer.phone} />
					<p class="helper">Please use international formatting.</p>
				</div>
				<fieldset class="field">
					<legend class="field-label">What languages do you speak?</legend>
					<div class="checkbox-grid">
						{#each LANGUAGES as language (language.stored)}
							<label class="checkbox">
								<input
									type="checkbox"
									name="languages"
									value={language.stored}
									bind:group={volunteer.languages}
								/>
								{language.display}
							</label>
						{/each}
					</div>
					{#if volunteer.languages.includes('Other')}
						<input
							type="text"
							name="languages_other"
							placeholder="Please specify"
							aria-label="Other languages — please specify"
							bind:value={volunteer.languagesOther}
						/>
					{/if}
				</fieldset>
				<div class="field">
					<label class="field-label" for="vol-discovery">How did you find out about PauseAI?</label>
					<select id="vol-discovery" name="discovery" bind:value={volunteer.discovery}>
						<option value="">Select an option</option>
						{#each DISCOVERY_OPTIONS as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
					{#if showDiscoverySpecify}
						<input
							type="text"
							name="discovery_specify"
							placeholder="Please specify"
							aria-label="How you found out about PauseAI — please specify"
							bind:value={volunteer.discoverySpecify}
						/>
					{/if}
				</div>
				<fieldset class="field">
					<legend class="field-label">What motivated you to join?</legend>
					<div class="checkbox-grid">
						{#each MOTIVATIONS as motivation (motivation)}
							<label class="checkbox">
								<input
									type="checkbox"
									name="motivations"
									value={motivation}
									bind:group={volunteer.motivations}
								/>
								{motivation}
							</label>
						{/each}
					</div>
					{#if volunteer.motivations.includes('Other')}
						<input
							type="text"
							name="motivations_other"
							placeholder="Please specify"
							aria-label="Other motivation — please specify"
							bind:value={volunteer.motivationsOther}
						/>
					{/if}
				</fieldset>
				<fieldset class="field">
					<legend class="field-label">Skills & interests</legend>
					<div class="checkbox-grid">
						{#each SKILLS as skill (skill)}
							<label class="checkbox">
								<input type="checkbox" name="skills" value={skill} bind:group={volunteer.skills} />
								{skill}
							</label>
						{/each}
					</div>
					{#if volunteer.skills.includes('Other')}
						<input
							type="text"
							name="skills_other"
							placeholder="Please specify"
							aria-label="Other skills — please specify"
							bind:value={volunteer.skillsOther}
						/>
					{/if}
				</fieldset>
				<div class="field">
					<label class="field-label" for="vol-hours">How much time can you commit weekly? *</label>
					<select id="vol-hours" name="hours" required bind:value={volunteer.hours}>
						<option value="" disabled>Select an option</option>
						{#each WEEKLY_HOURS as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</div>
				<label class="checkbox">
					<input type="checkbox" name="agree_volunteer" required />
					I agree with the <Link href="/volunteer-agreement">Volunteer Agreement</Link> *
				</label>
				<label class="checkbox">
					<input type="checkbox" name="agree_privacy" required />
					I agree with the <Link href="/privacy">Privacy Policy</Link> *
				</label>
				<button type="submit" class="primary" disabled={submitting}>
					{submitting ? 'Submitting...' : 'Submit →'}
				</button>
				<button type="button" class="back" onclick={() => (step = 2)}>← Back</button>
			</form>
		{:else if step === 3 && intent === 'lead'}
			<!-- Path D — lead -->
			<h2>National Group Lead — Volunteer Description</h2>
			<p class="role-meta"><em>Part-time volunteer role · 5–15 hours/week</em></p>
			<div class="role-description">
				<p>
					PauseAI Global is looking for leaders around the world to run local organising efforts in
					their respective countries and regions. Each group leader is responsible for planning
					direct actions, mobilising volunteers, and coordinating with the Global PauseAI team.
				</p>
				<p>
					<strong>First, check that your country doesn't already have a chapter:</strong>
					<Link href="/communities">pauseai.info/communities</Link>. If you're based in the
					<strong>United States</strong>, please apply through PauseAI US:
					<Link href="https://form.asana.com/?k=RxWuTz8SYKME33V5nBvK1A&d=1208505553897008">
						PauseAI US application form
					</Link>.
				</p>
				<h3>What you'll do</h3>
				<ul>
					<li>
						Recruit and grow your local group by welcoming new volunteers and organising events
						together.
					</li>
					<li>Engage local decision makers about AI safety and gain their support.</li>
					<li>Build relationships with local activist groups and journalists.</li>
					<li>
						Meet monthly with PauseAI's Global team to swap ideas and stay coordinated with the
						Global strategy and quarterly campaigns.
					</li>
					<li>Share what your chapter is up to on social media and help promote events.</li>
				</ul>
				<h3>What we're looking for</h3>
				<ul>
					<li>Excited to bring people together for workshops, meet-ups, and public events.</li>
					<li>Comfortable having conversations with all kinds of people.</li>
					<li>Self-starter who also enjoys being part of a team.</li>
					<li>Care about making AI safe and believe that we can make a difference.</li>
					<li>Adhere to a non-violent, legal approach.</li>
				</ul>
				<p>
					You don't need any prior activism experience. We'll provide training, resources, and a
					community to lean on.
				</p>
				<h3>Support you'll get</h3>
				<p>
					A global network of organizers, monthly meetings, shared resources, and a fast-growing
					movement.
				</p>
				<h3>Next steps</h3>
				<p>
					Contact our Organizing Director at
					<Link href="mailto:Irina@pauseai.info">Irina@pauseai.info</Link> to schedule an informal exploratory
					chat. Please include your name, country of residence, and a few sentences on why you'd like
					to become a lead.
				</p>
			</div>
			<LinkWithoutIcon class="mailto-button" href={leadMailto}>
				✉️ Email our Organizing Director
			</LinkWithoutIcon>
			<form method="POST" action="/onboarding?/submit" use:enhance={submitWith(() => (step = 4))}>
				{@render hiddenBasics()}
				{@render honeypotField('ob-nickname-5')}
				<input type="hidden" name="mode" value="contact" />
				<input type="hidden" name="intent" value="Lead" />
				<label class="checkbox">
					<input type="checkbox" name="chapter_lead_interest" bind:checked={chapterLeadInterest} />
					Yes — please contact me about starting a chapter
				</label>
				<p class="helper">
					The Organizing Director will reach out to schedule an exploratory chat.
				</p>
				<button type="submit" class="primary" disabled={submitting}>
					{submitting ? 'Submitting...' : 'Submit →'}
				</button>
				<button type="button" class="back" onclick={() => (step = 2)}>← Back</button>
			</form>
		{:else if step === 4 && intent === 'volunteer'}
			<!-- Path C — confirmation -->
			<div class="confirmation">
				<div class="checkmark">✓</div>
				<h2>Welcome to the team.</h2>
				<p>You're on the volunteer list — we'll be in touch soon.</p>
				{@render nextStepBlock()}
				{#if supportOnly}
					<div class="donate-promo">
						<h3><Link href="/donate">Support PauseAI with a donation</Link></h3>
						<p>
							Since hands-on volunteering isn't your thing right now, a
							<Link href="/donate">donation</Link> is the highest-impact way to support the movement —
							or pick up some gear from our
							<Link href="https://pauseai-shop.fourthwall.com/">store</Link>.
						</p>
					</div>
				{/if}
				{@render confirmationFooter()}
			</div>
		{:else if step === 4 && intent === 'lead'}
			<!-- Path D — confirmation -->
			<div class="confirmation">
				<div class="checkmark">✓</div>
				<h2>Thanks for stepping up.</h2>
				<p>
					We've got your note about leading a chapter — our Organizing Director will be in touch
					soon.
				</p>
				<p>
					Got a project in mind? Learn more about our
					<Link href="/microgrants">Microgrants</Link>.
				</p>
				{@render nextStepBlock()}
				{@render confirmationFooter()}
			</div>
		{/if}
	</div>

	<p class="stub-note">
		🧪 Test mode: submissions are not sent to Airtable. See what would be written on the
		<Link href="/onboarding/stub">stub page</Link>.
	</p>
</div>

<style>
	.onboarding-flow {
		max-width: 800px;
		margin: 0 auto;
		padding: 0.5rem 0 2rem 0;
		color: var(--text);
	}

	.framing {
		font-family: var(--font-heading);
		font-size: 2.5rem;
		margin-top: 0;
		margin-bottom: 0.5rem;
		text-align: center;
	}

	h2 {
		font-family: var(--font-heading);
		margin-top: 0;
	}

	.intro {
		text-align: center;
		margin-bottom: 1.5rem;
		font-size: 1.1rem;
		opacity: 0.8;
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

	.checkbox {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		font-size: 0.95rem;
		cursor: pointer;
	}

	.checkbox input {
		flex-shrink: 0;
	}

	.checkbox-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 0.4rem 1rem;
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
		font-size: 1.5rem;
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

	.stay-in-loop {
		border: 2px solid var(--brand);
		border-radius: 16px;
		padding: 1.25rem;
		margin: 1rem 0 1.5rem 0;
		background-color: var(--bg);
	}

	.stay-in-loop h3 {
		margin-top: 0;
		font-family: var(--font-heading);
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

	.donate-promo {
		border: 2px solid var(--brand);
		border-radius: 16px;
		padding: 1rem 1.25rem;
		margin: 1.5rem auto;
		max-width: 32rem;
		text-align: left;
		background-color: var(--bg);
	}

	.donate-promo h3 {
		margin: 0 0 0.25rem 0;
		font-family: var(--font-heading);
		font-size: 1.1rem;
	}

	.donate-promo p {
		margin: 0;
		font-size: 0.95rem;
	}

	.stub-note {
		text-align: center;
		font-size: 0.9rem;
		opacity: 0.8;
		margin-top: 1.5rem;
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

		.intent-grid {
			grid-template-columns: 1fr;
		}

		.framing {
			font-size: 1.8rem;
		}
	}
</style>
