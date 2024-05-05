<script lang="ts">
	import { onMount } from 'svelte'
	import ImageScript from 'imagescript'
	import canvasUrl from '../../assets/pfpgen/2024-may-canvas.png'
	import overlayUrl from '../../assets/pfpgen/2024-may-overlay.png'
	import toast from 'svelte-french-toast'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from './meta'
	import Dropzone from 'svelte-file-dropzone'
	import UploadIcon from 'lucide-svelte/icons/upload'
	import Button from '$lib/components/Button.svelte'

	const RELATIVE_INNER_DIAMETER = 0.772
	const OUTPUT_FILE_NAME = 'PauseAI Global Protest PFP'

	let canvas: ImageScript.Image
	let overlay: ImageScript.Image
	let inputFileName: string
	let result: HTMLImageElement
	let downloadDisabled = true

	onMount(async () => {
		canvas = await loadImage(canvasUrl)
		overlay = await loadImage(overlayUrl)
	})

	async function loadImage(url: string) {
		const response = await fetch(url)
		const buffer = await response.arrayBuffer()
		//@ts-ignore
		return ImageScript.Image.decode(buffer)
	}

	async function dropAccepted(event: any) {
		const file = event.detail.acceptedFiles[0]
		inputFileName = file.name
		const arrayBuffer = await file.arrayBuffer()
		const image = await ImageScript.Image.decode(arrayBuffer)

		// crop to square
		const minDimension = Math.min(image.width, image.height)
		const cropLeft = (image.width - minDimension) / 2
		const cropTop = (image.height - minDimension) / 2
		image.crop(cropLeft, cropTop, minDimension, minDimension)

		// resize to transparent portion of overlay
		image.resize(RELATIVE_INNER_DIAMETER * canvas.width, RELATIVE_INNER_DIAMETER * canvas.height)

		// composite
		canvas.composite(image, (canvas.width - image.width) / 2, (canvas.height - image.height) / 2)
		canvas.composite(overlay)

		const encoded = await canvas.encode()
		const blob = new Blob([encoded], { type: 'image/png' })
		result.src = URL.createObjectURL(blob)
		downloadDisabled = false
	}

	function dropRejected() {
		toast.error('Invalid file type')
	}

	function download() {
		if (downloadDisabled) return
		const anchor: HTMLAnchorElement = document.createElement('a')
		anchor.setAttribute('download', OUTPUT_FILE_NAME)
		anchor.href = result.src
		anchor.click()
	}
</script>

<PostMeta {...meta} />

<h1>Profile picture generator</h1>
<p>
	Upload your profile picture to generate an image with the date of our <a href="/2024-may"
		>global protest</a
	> and the address of the corresponding website. Your profile picture doesn't leave your device.
</p>

<div class="pfpgen">
	<div>
		<h2>Your profile picture</h2>
		<Dropzone
			accept={['image/png', 'image/jpeg', 'image/tiff']}
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
					<div class="formats">PNG, JPEG or TIFF</div>
				{/if}
			</div>
		</Dropzone>
	</div>
	<div>
		<h2>Result</h2>
		<img class="result" bind:this={result} />
		<Button disabled={downloadDisabled} on:click={download}>Download</Button>
	</div>
</div>

<style>
	.pfpgen {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(19.5rem, 1fr));
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

	.formats {
		font-size: 0.7em;
	}

	.result {
		width: 100%;
	}
</style>
