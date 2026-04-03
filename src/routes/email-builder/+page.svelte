<script lang="ts">
	import { onMount } from 'svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Link from '$lib/components/Link.svelte'
	import { meta } from './meta'

	const { title, description, date } = meta

	interface Activoice {
		init: (options: {
			container: string
			campaignId: string
			embedOptions: {
				spinnerColor: string
			}
		}) => void
	}

	onMount(() => {
		const initActivoice = () => {
			const activoice = (window as Window & { Activoice?: Activoice }).Activoice
			if (activoice) {
				activoice.init({
					container: '#av-embed-container',
					campaignId: 'c6f322b3-a310-4ecb-a8e0-3f86392512df',
					embedOptions: {
						spinnerColor: '#ff9416'
					}
				})
			} else {
				setTimeout(initActivoice, 100)
			}
		}
		initActivoice()
	})
</script>

<svelte:head>
	<script src="https://beta.app.activoice.org/embed/v1/loader.js"></script>
</svelte:head>

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
		<Link href="https://youtu.be/OUjnVeydhCM?t=1969">here</Link> and
		<Link href="https://youtu.be/1j--6JYRLVk?t=5716">here</Link>.)
	</li>
	<li>
		<b>No social pressure.</b> If you post something publicly, a politician might be hesitant to respond
		to a topic they haven't made up their mind on.
	</li>
	<li>
		<b>Not many people actually do it.</b> That means that your email will stand out.
	</li>
</ul>

<div id="av-embed-container" style="width: 100%; margin-top: 2rem;"></div>
