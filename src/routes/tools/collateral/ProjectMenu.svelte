<script lang="ts">
	interface Props {
		/** What a saved file is called here: "project". */
		noun: string
		onSave: () => void
		onOpen: (file: File | undefined) => void
		onReset: () => void
		saveDisabled?: boolean
	}

	let { noun, onSave, onOpen, onReset, saveDisabled = false }: Props = $props()

	let open = $state(false)
	let root: HTMLDivElement
	let fileInput: HTMLInputElement

	// Closes on a click elsewhere or Escape, like other menus.
	$effect(() => {
		if (!open) return
		const onPointer = (e: PointerEvent) => {
			if (!root.contains(e.target as Node)) open = false
		}
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') open = false
		}
		document.addEventListener('pointerdown', onPointer)
		document.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('pointerdown', onPointer)
			document.removeEventListener('keydown', onKey)
		}
	})

	function run(action: () => void) {
		open = false
		action()
	}
</script>

<!-- Save, open and start again, behind a small ⋯ button beside Download. Work autosaves in the browser, so these are
     only for moving a design to another device or volunteer, or starting over. -->
<div class="menu" bind:this={root}>
	<button
		type="button"
		class="toggle"
		aria-label="More options"
		aria-expanded={open}
		onclick={() => (open = !open)}>⋯</button
	>
	{#if open}
		<div class="list">
			<button type="button" onclick={() => run(onSave)} disabled={saveDisabled}>
				Save {noun} file
			</button>
			<button type="button" onclick={() => run(() => fileInput.click())}>Open {noun} file</button>
			<button type="button" onclick={() => run(onReset)}>Start again</button>
		</div>
	{/if}
	<input
		bind:this={fileInput}
		type="file"
		accept=".json,application/json"
		hidden
		aria-label={`Open a saved ${noun}`}
		onchange={(e) => {
			// No file when the person cancels the picker.
			const file = e.currentTarget.files?.[0]
			e.currentTarget.value = ''
			onOpen(file)
		}}
	/>
</div>

<style>
	.menu {
		position: relative;
	}

	.toggle {
		height: 100%;
		min-height: 2.6rem;
		padding: 0 0.9rem;
		border: 2px solid var(--brand);
		border-radius: 10px;
		background-color: transparent;
		color: var(--text);
		font-size: 1.2rem;
		font-weight: 700;
		cursor: pointer;
	}

	.list {
		position: absolute;
		right: 0;
		bottom: calc(100% + 0.25rem);
		z-index: 10;
		display: grid;
		min-width: 12rem;
		padding: 0.25rem;
		border: 1px solid var(--grey-150);
		border-radius: 8px;
		background-color: var(--bg);
		box-shadow: 0 4px 16px rgba(var(--black-rgb), 0.15);
	}

	.list button {
		padding: 0.5rem 0.75rem;
		border: none;
		border-radius: 6px;
		background: none;
		color: var(--text);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.list button:hover:not(:disabled) {
		background-color: var(--bg-subtle);
	}

	.list button:disabled {
		opacity: 0.5;
		cursor: default;
	}
</style>
