<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Link from '$lib/components/custom/a.svelte'
	import EasyWebWorker from 'easy-web-worker'
	import UploadIcon from 'lucide-svelte/icons/upload'
	import { onMount, tick } from 'svelte'
	import Dropzone from 'svelte-file-dropzone'
	import toast from 'svelte-french-toast'
	import { Circle } from 'svelte-loading-spinners'
	import exampleUrl from '$assets/pfp/2025-feb-example.png?enhanced'
	import overlayUrl from '$assets/pfp/2025-feb-overlay.png?url'
	import { meta } from './meta'
	import type { PfpRequest, PfpResponse } from './shared'
	import PfpWorker from './worker?worker'

	const RELATIVE_INNER_DIAMETER = 0.772
	const OUTPUT_FILE_NAME = 'PauseAI Global Protest PFP'

	let overlayData: Uint8Array
	let loading = false
	let inputFileName: string
	let result: HTMLImageElement
	let ready = false

	onMount(async () => {
		;[overlayData] = await Promise.all([loadImage(overlayUrl)])
	})

	async function loadImage(url: string) {
		const response = await fetch(url)
		const arrayBuffer = await response.arrayBuffer()
		return new Uint8Array(arrayBuffer)
	}

	async function dropAccepted(event: any) {
		loading = true
		const file: File = event.detail.acceptedFiles[0]
		inputFileName = clipFileName(file.name)
		const buffer = await file.arrayBuffer()
		const originalData = new Uint8Array(buffer)
		const worker = new EasyWebWorker<PfpRequest, PfpResponse>(new PfpWorker())
		const url = await worker.send({
			originalData,
			overlayData,
			relativeInnerDiameter: RELATIVE_INNER_DIAMETER
		})
		ready = true
		await tick()
		result.src = url
		loading = false
	}

	function clipFileName(fileName: string) {
		const split = fileName.split('.')
		const withoutExtension = split.slice(0, split.length - 1).join('.')
		if (withoutExtension.length < 15) return fileName
		return withoutExtension.substring(0, 15) + '[...].' + split[split.length - 1]
	}

	function dropRejected() {
		toast.error('Invalid file type')
	}

	function download() {
		if (!ready) return
		const anchor: HTMLAnchorElement = document.createElement('a')
		anchor.setAttribute('download', OUTPUT_FILE_NAME)
		anchor.href = result.src
		anchor.click()
	}
</script>

<PostMeta {...meta} />

<h1>Profile picture generator</h1>
<p>
	Upload your profile picture to generate an image with the date of our <Link href="/2025-february"
		>global protest</Link
	> and the address of the corresponding website. Your profile picture doesn't leave your device.
</p>

<div class="pfpgen">
	<div>
		<h2>Your profile picture</h2>
		<Dropzone
			accept={['image/*']}
			multiple={false}
			on:dropaccepted={dropAccepted}
			on:droprejected={dropRejected}
		>
			<div class="dropzone-labels">
				<UploadIcon />
				{#if inputFileName}
					<div>
						{inputFileName}
					</div>
				{:else}
					<div>
						<b>Click to upload</b> or drag and drop
					</div>
				{/if}
			</div>
		</Dropzone>
	</div>
	<div>
		<h2>Result</h2>
		<div class="result-container">
			{#if ready}
				<img class="result" class:loading bind:this={result} alt="Result" />
			{:else}
				<enhanced:img
					class="result example"
					class:loading
					src={exampleUrl}
					alt="Example"
					sizes="min(40rem, 100vw)"
				/>
			{/if}
			<div class="spinner-container">
				{#if loading}
					<Circle color="var(--brand)" />
				{/if}
			</div>
		</div>
		<Button disabled={!ready} on:click={download}>Download</Button>
	</div>
</div>

<style>
	.pfpgen {
		display: flex;
		gap: 1rem;
	}

	.pfpgen > * {
		flex-grow: 1;
		flex-basis: 0;
	}

	@media (max-width: 800px) {
		.pfpgen {
			flex-direction: column;
		}
	}

	:global(.dropzone) {
		padding: 2rem !important;
		cursor: pointer;
		background-color: rgba(128, 128, 128, 0.1) !important;
		border-color: rgba(128, 128, 128, 0.2) !important;
		color: rgb(128, 128, 128) !important;
	}

	:global(.dropzone):hover {
		background-color: rgba(128, 128, 128, 0.2) !important;
	}

	.dropzone-labels {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.7rem;
	}

	.result-container {
		position: relative;
	}

	.result {
		width: 100%;
		height: unset;
	}

	.result.loading {
		opacity: 80%;
	}

	.spinner-container {
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	}
</style>
