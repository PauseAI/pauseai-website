<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Button from '$lib/components/Button.svelte'
	// Risks
	import Xrisk from './concerns/xrisk.svelte'
	/* import Bio from './concerns/bio.svelte' */
	import Cyber from './concerns/cyber.svelte'
	// Actions
	import Meeting from './actions/meeting.svelte'
	import Debate from './actions/debate.svelte'
	import Treaty from './actions/treaty.svelte'
	import Acknowledge from './actions/acknowledge.svelte'
	import { meta } from './meta'
	import * as clipboard from 'clipboard-polyfill'
	import toast from 'svelte-french-toast'
	import Link from '$lib/components/custom/a.svelte'
	import Card from '$lib/components/Card.svelte'
	import { type ComponentType } from 'svelte'

	const { title, description, date } = meta

	$: name = ''

	const letterId = 'letter'

	function copyHTMLWithoutStyles() {
		var element = document.getElementById(letterId)
		var clonedElement = element?.cloneNode(true) as HTMLElement
		clipboard
			.write([
				new clipboard.ClipboardItem({
					'text/html': new Blob([clonedElement?.outerHTML], { type: 'text/html' })
				})
			])
			.then(() => {
				toast.success('Letter copied to clipboard!')
			})
			.catch((err) => {
				window.alert(`Failed to copy: ${err}`)
			})
	}

	const concerns: Section[] = [
		{
			name: 'Existential risk',
			section: Xrisk
		},
		// {
		// 	name: 'Bio risk',
		// 	section: Bio
		// },
		{
			name: 'Cybersecurity risk',
			section: Cyber
		}
	]

	const actions: Section[] = [
		{
			name: 'Prepare treaty for summit',
			section: Treaty
		},
		{
			name: 'Acknowledge x-risk',
			section: Acknowledge
		},
		{
			name: 'Have a meeting with you',
			section: Meeting
		},
		{
			name: 'Organize a debate',
			section: Debate
		}
	]

	$: selectedAction = actions[0]
	$: selectedConcern = concerns[0]

	type Section = {
		name: string
		section: ComponentType
	}
</script>

<PostMeta {title} {description} {date} />

<div class="header">
	<h1>{title}</h1>
	<em>{description}</em>
</div>

<h2>Why sending an email is awesome</h2>
<ul>
	<li>
		<b>Exit your filter bubble.</b> If you're talking about AI risks or pausing in a discord server or
		twitter, you're mostly preaching to the choir. With email, you can reach people who don't read about
		this stuff all day.
	</li>
	<li>
		<b>It's the medium for the pros.</b> Politicians, journalists, lobbyists - all of them use email.
		If you want to be taken seriously, you should use email too.
	</li>
	<li>
		<b>Making AI Risk "common knowledge" is key.</b> We need to get everyone to know that everyone
		else knows about AI risk, so it becomes "common knowledge". As well as, convincing influential
		people, like politicians, journalists, and lobbyists. (E.g. See Connor's explanation as to why
		making AI Risk "common knowledge" is super important
		<Link href={'https://youtu.be/OUjnVeydhCM?t=1969'}>here</Link> and
		<Link href={'https://youtu.be/1j--6JYRLVk?t=5716'}>here</Link>.)
	</li>
	<li>
		<b>No social pressure.</b> If you post something publicly, a politician might be hesitant to respond
		to a topic they haven't made up their mind on.
	</li>
	<li>
		<b>Not many people actually do it.</b> That means that your email will stand out.
	</li>
</ul>

<h2>Who to send to</h2>
<ul>
	<li>
		<b>Ideally, someone who might visit the next Summit. </b> The next AI Safety Summit will be attended
		by many countries. Who is likely to represent your country? Maybe a minister of foreign affairs or
		science?
	</li>
	<li>
		<b>Someone who is likely to act.</b> Is there a politician who's often at the forefront of discussing
		new digital / science topics? Perhaps even someone who's already shared concerns about AI? Or someone
		who's just good at pitching new, controversial topics and convincing others?
	</li>
	<li>
		<b>Someone who politically represents you.</b> Maybe a politician in parliament from the party
		that you voted for. <Link
			href={'https://github.com/Campaign-for-AI-Safety-archive/.github/tree/main/email-templates#email-your-politician'}
			>Find their email address</Link
		>.
	</li>
	<li>
		<b>Enter their name:</b> <input bind:value={name} placeholder="Name of person" />
	</li>
</ul>

<h2>Pick a concern</h2>
<ul>
	<li>
		<b>What are you most concerned about?</b> Don't be afraid of being judged for your concerns. It's
		the job of politicians to represent you - including the things that you worry about.
	</li>
	<li>
		<b>Consider the person</b> who you're writing to, and what they may already believe. If you're writing
		to someone who's already worked on IT and cybersecurity issues before, consider focsing on that particular
		issue.
	</li>
	<li>
		<b>Select one:</b>
		{#each concerns as section}
			<button
				class={selectedConcern == section ? 'tag tag--selected' : 'tag'}
				on:click={() => (selectedConcern = section)}>{section.name}</button
			>{' '}
		{/each}
	</li>
</ul>

<h2>Pick an action</h2>
<ul>
	<li>
		What do you want the recipient to do after receiving your mail? Prepare for the summit, organize
		a debate, have a meeting? As with every section, you can replace the suggested text if you have
		a better idea.
	</li>
	<li>
		<b>Select one:</b>
		{#each actions as section}
			<button
				class={selectedAction == section ? 'tag tag--selected' : 'tag'}
				on:click={() => (selectedAction = section)}>{section.name}</button
			>{' '}
		{/each}
	</li>
</ul>

<h2>Last steps</h2>
<p>
	Before sending the email you have to manually replace "__THING__" and "__COUNTRY__". It can also
	be effective to further personalize the message. Here are some tips:
</p>
<ul>
	<li>
		<b>Know your audience.</b> Read up about the person you're sending a letter to. What are they working
		on? How do they think about AI? What has happened in their professional life the last weeks?
	</li>
	<li>
		<b>Share something about yourself.</b> Why do you care about AI safety? Why did you take the time
		to send this letter?
	</li>
	<li>
		<b>Make it newsworthy.</b> The mail template is not always up-to-date. Make sure you mention recent
		AI policy advancements (especially local ones).
	</li>
</ul>
<p>
	For more information, you can take a look at our page on <Link href="/writing-a-letter"
		>how to write a letter or email to someone in power</Link
	>.
</p>

<h2>Result</h2>
<p>You can edit the message directly in the browser.</p>
<div>
	<Card className="letter">
		<div id={letterId} contenteditable="true">
			<p>Dear {name || '__ENTER_NAME__'},</p>
			<p>
				First of all, thank you very much for everything you have done for __THING__. I am emailing
				you today to bring an issue to your attention, in which I believe __COUNTRY__ and you in
				particular can play a very important role. The issue is the existential threat of artificial
				intelligence.
			</p>

			<svelte:component this={selectedConcern.section} />

			<p>
				The advancements in the AI landscape have progressed much faster than anticipated. In 2020,
				it was
				<a href="https://www.metaculus.com/questions/3479/date-weakly-general-ai-is-publicly-known"
					>estimated</a
				>
				that an AI would pass university entrance exams by 2050. This goal was achieved in March 2023
				by the system GPT-4 from OpenAI. These massive, unexpected leaps have prompted many experts to
				request a pause in AI development through an open letter to major AI companies. The
				<a href="https://futureoflife.org/open-letter/pause-giant-ai-experiments/">letter</a>
				has been signed over 33,000 times so far, including many AI researchers and tech figures.
			</p>

			<p>
				Unfortunately, it seems that companies are not willing to jeopardise their competitive
				position by voluntarily halting development. A pause would need to be imposed by a
				government. Luckily, there seems to be broad support for slowing down AI development. A
				recent
				<a
					href="https://www.vox.com/future-perfect/2023/9/19/23879648/americans-artificial-general-intelligence-ai-policy-poll"
					>poll</a
				>
				indicates that 63% of American support regulations to prevent AI companies from building superintelligent
				AI. At the national level, a pause is also challenging because countries have incentives to not
				fall behind in AI capabilities. That's why we need an international solution.
			</p>

			<p>
				The UK organised an AI Safety Summit on November 1st and 2nd at Bletchley Park. We hoped
				that during this summit, leaders will work towards sensible solutions that prevent the very
				worst of the risks that AI poses. The Summit did not lead to any international agreement or
				policy. We have seen proposals being written by the
				<a href="https://twitter.com/SenBlumenthal/status/1700147410880569475">US Senate</a>, and
				even among AI company CEOs, there is
				<a
					href="https://www.pbs.org/newshour/politics/watch-overwhelming-consensus-for-artificial-intelligence-regulation-musk-says-after-senate-tech-meeting"
					>“overwhelming consensus”</a
				>
				that regulation is needed. Unfortunately,
				<a href="https://twitter.com/DanielColson6/status/1704976418596352342">none</a>
				of the existing proposals would do anything to slow down or prevent a superintelligent AI from
				being created. We cannot expect that individual countries implement regulations that would slow
				down AI development, as the incentives to race ahead are too high. We need international coordination,
				we need politicians to initialize treaty negotiations.
			</p>

			<svelte:component this={selectedAction.section} />

			<p>Best regards,</p>

			<p>__YOUR NAME__</p>
		</div>
	</Card>
</div>

<div class="actionBar">
	<Button on:click={() => copyHTMLWithoutStyles()}>Copy</Button>
</div>

<style>
	ul {
		list-style: disc;
		margin-left: 2rem;
	}

	div :global(.letter) {
		/* Edit mouse cursor, indicate editable */
		cursor: text;
		/* make it lookt like a letter! */
		padding: 1rem;
		margin: 1rem;
		/* shadow */
		font-family: 'Times New Roman', Times, serif;
	}

	.actionBar {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
		gap: 1rem;
		justify-content: end;
	}

	.tag {
		padding: 0.3rem 0.5rem;
		border-radius: 10px;
		border: var(--brand) 2px solid;
		background-color: var(--bg);

		color: var(--brand);
		cursor: pointer;
		font-size: 0.8rem;
		margin-bottom: 0.3rem;
	}
	.tag:hover {
		color: var(--brand-dark);
		border-color: var(--brand-dark);
	}

	.tag--selected {
		color: var(--bg);
		background-color: var(--brand);
	}

	.tag--selected:hover {
		background-color: var(--brand-dark);
		color: var(--bg);
	}

	input {
		padding: 0.3rem 0.5rem;
		border: var(--brand) 2px solid;
		min-width: 8rem;
		border-radius: 10px;
		font-size: 0.8rem;
	}
</style>
