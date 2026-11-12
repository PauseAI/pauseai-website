<script lang="ts">
	import { tick } from 'svelte'
	import { url } from '#lib/config.ts'
	import JoinInvite from '../statement/JoinInvite.svelte'

	const STATEMENT_URL = `${url}/statement`

	let heading: HTMLHeadingElement
	let copied = $state(false)
	// Shown when the clipboard can't be written (an old browser, or permission refused).
	let copyFailed = $state(false)
	let urlField: HTMLInputElement | undefined

	// Replaces the confirm button the person just pressed, so move focus here or it is lost.
	$effect(() => heading.focus())

	async function copyLink() {
		// Cleared first, so a second copy is announced again.
		copied = false
		try {
			await navigator.clipboard.writeText(STATEMENT_URL)
			copied = true
		} catch {
			copyFailed = true
			// Selected, so copying it by hand takes one shortcut.
			await tick()
			urlField?.focus()
			urlField?.select()
		}
	}
</script>

<h1 tabindex="-1" bind:this={heading}>Your signature is confirmed</h1>
<p>
	Thank you for signing the PauseAI statement. It will be added to the public list of signatures.
</p>

<div class="tiles">
	<section class="tile" aria-labelledby="tile-involved">
		<h2 id="tile-involved" class="toc-exclude">Get involved</h2>
		<p>Volunteer, come to events and hear from your local group.</p>
		<JoinInvite />
	</section>
	<section class="tile" aria-labelledby="tile-spread">
		<h2 id="tile-spread" class="toc-exclude">Spread the word</h2>
		<p>Ask a friend to sign: send them the statement.</p>
		{#if copyFailed}
			<label class="copy-fallback">
				<span>Copy this link:</span>
				<input type="text" readonly value={STATEMENT_URL} bind:this={urlField} />
			</label>
		{:else}
			<button type="button" class="copy" onclick={copyLink}
				>{copied ? 'Link copied' : 'Copy link'}</button
			>
		{/if}
		<p class="visually-hidden" aria-live="polite">{copied ? 'Link copied' : ''}</p>
	</section>
</div>

<style>
	h1:focus {
		outline: none;
	}

	.tiles {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	@media (max-width: 640px) {
		.tiles {
			grid-template-columns: 1fr;
		}
	}

	.tile {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 1.25rem 1.4rem;
		background-color: var(--bg-subtle);
		border-radius: 20px;
	}

	.tile h2 {
		margin: 0 0 0.3rem;
		font-size: 1.4rem;
	}

	.tile p {
		margin: 0 0 1rem;
		/* Pushes the buttons to the same height in both tiles. */
		flex-grow: 1;
	}

	.copy {
		/* JoinInvite's padding less this border, so the two tiles' buttons match in height. */
		padding: calc(0.55rem - 2px) 1.4rem;
		color: var(--text);
		font-family: var(--font-body);
		font-size: inherit;
		font-weight: bold;
		background: transparent;
		border: 2px solid var(--brand);
		border-radius: 50px;
		cursor: pointer;
	}

	.copy:hover {
		background-color: var(--bg);
	}

	.copy-fallback {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		width: 100%;
	}

	.copy-fallback input {
		box-sizing: border-box;
		width: 100%;
		padding: 0.5rem 0.8rem;
		color: var(--text);
		font: inherit;
		background-color: var(--bg);
		border: 1px solid var(--brand-subtle);
		border-radius: 12px;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
