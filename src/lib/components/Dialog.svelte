<script lang="ts">
	import { browser } from '$app/environment'
	import Card from '$lib/components/Card.svelte'
	import X from 'lucide-svelte/icons/x'
	import { onMount, tick } from 'svelte'

	export let open: boolean
	export let focus = true
	export let style = ''

	let dialog: HTMLDivElement
	let previousFocus: Element | null = null

	onMount(() => {
		const clickListener = (event: MouseEvent) => {
			if (!dialog.contains(event.target as Node)) {
				open = false
			}
		}
		const keyDownListener = (event: KeyboardEvent) => {
			if (event.key == 'Escape') open = false
		}
		setTimeout(() => {
			addEventListener('click', clickListener)
			addEventListener('keydown', keyDownListener)
		})
		return () => {
			removeEventListener('click', clickListener)
			removeEventListener('keydown', keyDownListener)
		}
	})

	$: {
		if (browser && focus) {
			if (open) {
				previousFocus = document.activeElement
				tick().then(() => dialog.focus())
			} else {
				;(previousFocus as HTMLElement)?.focus()
			}
		}
	}
</script>

<div class="dialog" bind:this={dialog} tabindex="-1" {style} class:default-position={!style}>
	<Card>
		<div class="content">
			<header>
				<slot name="title" />
				<button class="button-to-link close" on:click={() => (open = false)}>
					<X size="1.5rem" />
				</button>
			</header>
			<main>
				<slot />
			</main>
		</div>
	</Card>
</div>

<style>
	.dialog {
		position: absolute;
		width: calc(var(--page-width) - 2rem);
		max-width: 90%;
		z-index: 1;
	}

	.dialog.default-position {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.dialog:focus {
		outline: none;
	}

	.content {
		display: flex;
		flex-direction: column;
		max-height: 90vh;
	}

	header,
	main {
		padding: 1rem;
	}

	header {
		border-bottom: solid hsla(0, 0%, 50%, 25%);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	header * {
		border: none;
	}

	header :global(:is(h1, h2, h3, h4, h5, h6)) {
		margin: 0;
	}

	.close:hover {
		color: var(--brand);
	}

	.close:active {
		color: var(--brand-subtle);
	}

	main {
		overflow-y: auto;
		scrollbar-width: thin;
	}
</style>
