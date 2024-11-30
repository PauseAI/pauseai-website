<script lang="ts" context="module">
	import { writable, type Writable } from 'svelte/store'

	let isIos: Writable<boolean | null> = writable(null)
</script>

<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import Logo from '$lib/components/logo.svelte'
	import Link from '$lib/components/custom/a.svelte'
	import { toPng } from 'html-to-image'
	import GithubSlugger from 'github-slugger'
	import { onMount } from 'svelte'
	import UAParser from 'ua-parser-js'

	const DOWNLOAD_WIDTH = 2000 // also in import query

	export let background = ''
	export let text = ''
	export let author = ''
	export let author_description = ''
	export let source: string | null = null
	export let notice: string | null = null
	export let color: string | null = null
	export let padding: string | null = null

	const imageModules = import.meta.glob('../../assets/quote-bg/*.jpg', {
		eager: true,
		query: {
			enhanced: true,
			w: 2000 // = DOWNLOAD_WIDTH
		}
	})
	// @ts-expect-error type not exposed
	const enhancedBackground = imageModules[`../../assets/quote-bg/${background}.jpg`].default

	$: color_style = color ? `color: ${color}` : ''
	$: content_style = padding
		? `padding: calc(var(--zoom) * ${padding}) 0 0 calc(var(--zoom) * ${padding});`
		: ''

	let containerElement: HTMLDivElement
	let quoteElement: HTMLDivElement

	async function downloadQuote(e: MouseEvent) {
		const target = e.target as HTMLAnchorElement
		const ratio = quoteElement.scrollWidth / quoteElement.scrollHeight
		const png = await toPng(quoteElement, {
			canvasWidth: DOWNLOAD_WIDTH,
			canvasHeight: DOWNLOAD_WIDTH / ratio
		})
		const fileName = `${author} on AI risks.png`
		download(png, fileName)
	}

	function download(url: string, fileName: string) {
		const anchor: HTMLAnchorElement = document.createElement('a')
		anchor.setAttribute('download', fileName)
		anchor.href = url
		anchor.click()
	}

	onMount(() => {
		if ($isIos == null) {
			const uaParser = new UAParser(navigator.userAgent)
			$isIos = uaParser.getOS().name == 'iOS'
		}

		let element: HTMLElement = quoteElement
		let maxWidthString
		do {
			element = element.parentElement!
			maxWidthString = getComputedStyle(element).maxWidth
		} while (maxWidthString == 'none')
		const maxWidth = parseFloat(maxWidthString)
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const width = entry.contentRect.width
				const ratio = width / maxWidth
				quoteElement.style.setProperty('--zoom', ratio + '')
			}
		})
		resizeObserver.observe(containerElement)
		return () => resizeObserver.disconnect()
	})
</script>

<div class="quote-container" bind:this={containerElement}>
	<div class="quote" style={color_style} bind:this={quoteElement}>
		<div class="quote-background">
			<enhanced:img class="quote-image" src={enhancedBackground} />
		</div>

		<div class="quote-foreground">
			<div class="quote-content" style={content_style}>
				<div class="quote-text-container">
					<div class="quote-text">{@html text}</div>
				</div>
				<div class="quote-author">
					<p>{author}</p>
					<p>{author_description}</p>
				</div>
			</div>
			<div class="quote-logo">
				<Logo width={100} fill={color ? color : 'black'} />
			</div>
		</div>
	</div>
	<div class="quote-below">
		{#if !$isIos}
			<Button subtle on:click={downloadQuote}>Download</Button>
		{/if}
		{#if source}
			<div class="reset-anchors">
				<Button subtle>
					<Link href={source}>Source</Link>
				</Button>
			</div>
		{/if}
		{#if notice}
			<div class="reset-anchors">
				<Button subtle>
					<Link href={'#credits-' + new GithubSlugger().slug(author)}>Credits</Link>
				</Button>
			</div>
		{/if}
	</div>
</div>

<style>
	.quote-container {
		margin-bottom: 1rem;
	}

	.quote {
		display: grid;
		grid-template-columns: 1fr;

		/* dynamically overwritten styles can't go in .quote-foreground because of precedence */
		--zoom: 1;
		color: hsl(0, 0%, 15%);
	}

	.quote-background {
		grid-row-start: 1;
		grid-column-start: 1;
		height: 100%;
	}

	.quote-image {
		display: block;
		object-fit: cover;
		width: 100%;
		height: 100%;
	}

	.quote-foreground {
		grid-row-start: 1;
		grid-column-start: 1;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		box-sizing: border-box;
	}

	.quote-content {
		display: flex;
		flex-direction: column;
		grid-column: 1 / span 2;
		font-size: calc(var(--zoom) * 0.86rem);
		padding-left: calc(var(--zoom) * 4rem);
		padding-top: calc(var(--zoom) * 4rem);
		width: 58%;
		box-sizing: border-box;
	}
	.quote-text-container {
		position: relative;
		z-index: 9;

		&::before {
			content: '"';
			position: absolute;
			top: calc(var(--zoom) * -2.2rem);
			left: calc(var(--zoom) * -1.2rem);
			font-size: calc(var(--zoom) * 5rem);
			font-weight: bold;
			opacity: 0.2;
		}
	}

	.quote-text {
		position: relative;
		z-index: 10;
	}

	.quote-author {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		text-align: right;
		font-family: var(--font-heading);
	}

	.quote-author p {
		margin: 0;
	}

	.quote-author p:first-of-type {
		margin-top: calc(var(--zoom) * 1.2rem);
		font-size: calc(var(--zoom) * 1.6rem);
		font-weight: bold;
		line-height: 1.2;
	}

	.quote-logo {
		display: flex;
		grid-row: 2;
		width: calc(var(--zoom) * 100px);
		height: fit-content;
		margin: calc(var(--zoom) * 1rem);
	}

	.quote-logo > :global(svg) {
		height: unset;
	}

	.quote-below {
		display: flex;
	}

	.reset-anchors :global(a) {
		color: inherit;
		text-decoration: inherit;
	}
</style>
