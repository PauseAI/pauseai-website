<script lang="ts">
	type Option = { label: string; value: string }

	let {
		id,
		name,
		options,
		multiple = false,
		required = false,
		placeholder = 'Select an option',
		value = $bindable()
	}: {
		id: string
		name: string
		/** Plain strings, or { label, value } pairs when the displayed text differs from the submitted value. */
		options: (string | Option)[]
		multiple?: boolean
		required?: boolean
		placeholder?: string
		/** Bind a string for single select, a string[] for multi select. Holds option values. */
		value?: string | string[]
	} = $props()

	const items: Option[] = $derived(
		options.map((o) => (typeof o === 'string' ? { label: o, value: o } : o))
	)

	const selected: string[] = $derived(
		multiple ? ((value as string[]) ?? []) : value ? [value as string] : []
	)
	const single = $derived(multiple ? '' : ((value as string) ?? ''))

	function labelFor(v: string) {
		return items.find((i) => i.value === v)?.label ?? v
	}

	let query = $state('')
	let open = $state(false)
	let highlighted = $state(0)
	let inputEl: HTMLInputElement | undefined = $state()

	// Initial text for single select with a prefilled value.
	$effect.pre(() => {
		if (!multiple && single && !query) query = labelFor(single)
	})

	// Unmatched free text must not pass native validation — the committed
	// value is what actually submits.
	$effect(() => {
		const text = query.trim()
		let message = ''
		if (!multiple && !single && text) {
			message = 'Please select an option from the list'
		} else if (multiple && required && !selected.length && text) {
			message = 'Please select at least one option from the list'
		}
		inputEl?.setCustomValidity(message)
	})

	const flat: Option[] = $derived.by(() => {
		const q = query.trim().toLowerCase()
		// Empty query, or the query is just the current selection (user
		// reopened the list): show the full list.
		if (!q || (!multiple && query === labelFor(single))) return items
		const starts = items.filter((i) => i.label.toLowerCase().startsWith(q))
		const contains = items.filter(
			(i) => !i.label.toLowerCase().startsWith(q) && i.label.toLowerCase().includes(q)
		)
		return [...starts, ...contains]
	})

	$effect(() => {
		if (open) {
			document.getElementById(`${id}-opt-${highlighted}`)?.scrollIntoView({ block: 'nearest' })
		}
	})

	function exactMatch(text: string) {
		const t = text.trim().toLowerCase()
		return items.find((i) => i.label.toLowerCase() === t || i.value.toLowerCase() === t)
	}

	function openList() {
		open = true
		const current = multiple ? -1 : flat.findIndex((i) => i.value === single)
		highlighted = current >= 0 ? current : 0
	}

	function pick(option: Option) {
		if (multiple) {
			value = selected.includes(option.value)
				? selected.filter((s) => s !== option.value)
				: [...selected, option.value]
			query = ''
			highlighted = Math.min(highlighted, flat.length - 1)
			inputEl?.focus()
		} else {
			value = option.value
			query = option.label
			open = false
		}
	}

	function remove(optionValue: string) {
		value = selected.filter((s) => s !== optionValue)
	}

	function handleInput() {
		open = true
		highlighted = 0
		if (!multiple) {
			// Typing invalidates the previous selection until it matches again.
			value = exactMatch(query)?.value ?? ''
		}
	}

	function handleBlur() {
		open = false
		if (multiple) {
			query = ''
			return
		}
		const match = exactMatch(query)
		if (match) {
			value = match.value
		}
		query = single ? labelFor(single) : ''
	}

	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault()
				if (!open) openList()
				else highlighted = Math.min(highlighted + 1, flat.length - 1)
				break
			case 'ArrowUp':
				event.preventDefault()
				if (!open) openList()
				else highlighted = Math.max(highlighted - 1, 0)
				break
			case 'Enter':
				if (open && flat[highlighted]) {
					event.preventDefault()
					pick(flat[highlighted])
				}
				break
			case 'Escape':
				if (open) {
					event.stopPropagation()
					open = false
					query = multiple ? '' : single ? labelFor(single) : ''
				}
				break
			case 'Backspace':
				if (multiple && !query && selected.length) {
					remove(selected[selected.length - 1])
				}
				break
			case 'Tab':
				open = false
				break
		}
	}
</script>

<div class="combobox">
	<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
	<div class="control" onclick={() => inputEl?.focus()}>
		{#if multiple}
			{#each selected as item (item)}
				<span class="chip">
					{labelFor(item)}
					<button
						type="button"
						class="chip-remove"
						aria-label="Remove {labelFor(item)}"
						onclick={() => remove(item)}
					>
						&times;
					</button>
				</span>
			{/each}
		{/if}
		<input
			{id}
			bind:this={inputEl}
			type="text"
			role="combobox"
			autocomplete="off"
			spellcheck="false"
			required={required && !selected.length}
			placeholder={multiple && selected.length ? '' : placeholder}
			aria-expanded={open}
			aria-controls="{id}-listbox"
			aria-activedescendant={open && flat[highlighted] ? `${id}-opt-${highlighted}` : undefined}
			bind:value={query}
			oninput={handleInput}
			onfocus={openList}
			onclick={openList}
			onblur={handleBlur}
			onkeydown={handleKeydown}
		/>
	</div>
	{#if multiple}
		{#each selected as item (item)}
			<input type="hidden" {name} value={item} />
		{/each}
	{:else}
		<input type="hidden" {name} value={single} />
	{/if}
	{#if open}
		<ul
			id="{id}-listbox"
			class="panel"
			role="listbox"
			aria-multiselectable={multiple || undefined}
			onmousedown={(e) => e.preventDefault()}
		>
			{#each flat as option, index (option.value)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<li
					id="{id}-opt-{index}"
					class="option"
					class:highlighted={index === highlighted}
					class:selected={selected.includes(option.value)}
					role="option"
					aria-selected={selected.includes(option.value)}
					onmouseenter={() => (highlighted = index)}
					onclick={() => pick(option)}
				>
					{option.label}
					{#if selected.includes(option.value)}
						<span class="check" aria-hidden="true">✓</span>
					{/if}
				</li>
			{/each}
			{#if !flat.length}
				<li class="empty" role="presentation">No matching options</li>
			{/if}
		</ul>
	{/if}
</div>

<style>
	.combobox {
		position: relative;
	}

	.control {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem;
		padding: 0.45rem 2.6rem 0.45rem 1.2rem;
		border: 1px solid var(--brand-subtle);
		border-radius: 20px;
		background-color: var(--bg);
		cursor: text;
		box-sizing: border-box;
		background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
		background-repeat: no-repeat;
		background-position: right 1rem center;
		background-size: 1em;
	}

	.control:focus-within {
		outline: 2px solid var(--brand);
		border-color: transparent;
	}

	input[type='text'] {
		flex: 1;
		min-width: 8ch;
		padding: 0.35rem 0;
		border: none;
		outline: none;
		background: transparent;
		color: var(--text);
		font-family: var(--font-body);
		font-size: 1rem;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.2rem 0.35rem 0.2rem 0.7rem;
		border: 1px solid var(--brand-subtle);
		border-radius: 14px;
		background-color: var(--bg-subtle);
		font-size: 0.9rem;
		white-space: nowrap;
	}

	.chip-remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.2rem;
		height: 1.2rem;
		padding: 0;
		border: none;
		border-radius: 50%;
		background: none;
		color: inherit;
		font-size: 1rem;
		line-height: 1;
		cursor: pointer;
	}

	.chip-remove:hover {
		background-color: var(--brand-subtle);
	}

	.panel {
		position: absolute;
		z-index: 10;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		max-height: 16rem;
		overflow-y: auto;
		margin: 0;
		padding: 0.3rem;
		list-style: none;
		background-color: var(--bg);
		border: 1px solid var(--brand-subtle);
		border-radius: 12px;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
	}

	.option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.5rem 0.9rem;
		border-radius: 8px;
		cursor: pointer;
	}

	.option.highlighted {
		background-color: var(--brand-subtle);
		color: var(--bg);
	}

	.check {
		color: var(--brand);
		font-weight: 600;
	}

	.option.highlighted .check {
		color: var(--bg);
	}

	.empty {
		padding: 0.5rem 0.9rem;
		opacity: 0.7;
	}
</style>
