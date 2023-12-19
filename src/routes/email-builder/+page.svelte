<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import type { Post } from '$lib/types'
	import { countries, type Country } from './countries'
	import Button from '$lib/components/Button.svelte'

	let top: HTMLHeadingElement
	let { title, description, date }: Post = {
		title: 'Email Builder',
		slug: 'email-builder',
		description: 'A web app to help you write an email to a politician. Convince them to Pause AI!',
		date: '2023-12-08',
		categories: []
	}

	const letterId = 'letter'
	let selectedCountry: Country = countries[0]

	function copyHTMLWithoutStyles() {
		var element = document.getElementById(letterId)
		var clonedElement = element?.cloneNode(true)
		navigator.clipboard
			.write([
				new ClipboardItem({
					'text/html': new Blob([clonedElement?.outerHTML], { type: 'text/html' })
				})
			])
			.then(() => {
				window.alert('Letter copied to clipboard!')
			})
			.catch((err) => {
				window.alert(`Failed to copy: ${err}`)
			})
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
		<b>Someone who might visit the next Summit. </b> The next AI Safety Summit will be attended by many
		countries. Who is likely to represent your country? Maybe a minister of foreign affairs or science?
	</li>
	<li>
		<b>Someone who is likely to listen</b>. Is there a politician who's often at the forefront of
		discussing new digital / science topics? Perhaps even someone who's already shared concerns
		about AI?
	</li>
</ul>

<div class="actionBar">
	<select bind:value={selectedCountry}>
		{#each countries as country}
			<option value={country}>{country.name}</option>
		{/each}
	</select>
	<Button on:click={() => copyHTMLWithoutStyles()}>Copy</Button>
</div>

<div class="letter" id={letterId} contenteditable="true">
	<svelte:component this={selectedCountry.mail} />
</div>

<h2>Tips for adjusting the letter</h2>
<ul>
	<li>
		<b>Know your audience.</b> Read up about the person you're sending a letter to. What are they working
		on? How do they think about AI? What has happened in their professional life the last weeks?
	</li>
	<li>
		<b>Share something about yourself.</b> Why you care about AI safety? Why did you take the time to
		send this letter?
	</li>
	<li>
		<b>Make it newsworthy.</b> The mail template is not always up-to-date. Make sure you mention recent
		AI policy advancements (especially local ones).
	</li>
	<li>
		<b>Have a clear ask.</b> What do you want the reader to do? Make this something concrete, something
		achieveable. Maybe a face to face meeting to discuss the issue. Maybe ask for a debate to be organized
		in parliament.
	</li>
</ul>

<style>
	ul {
		list-style: disc;
		margin-left: 2rem;
	}

	.letter {
		/* Edit mouse cursor, indicate editable */
		cursor: text;
		/* make it lookt like a letter! */
		background-color: var(--bg);
		padding: 1rem;
		margin: 1rem;
		/* shadow */
		box-shadow: 0 0 10px var(--text);
		font-family: 'Times New Roman', Times, serif;
	}

	.actionBar {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
		gap: 1rem;
		justify-content: end;
	}

	select {
		padding: 0.6rem;
		border-radius: 10px;
	}
</style>
