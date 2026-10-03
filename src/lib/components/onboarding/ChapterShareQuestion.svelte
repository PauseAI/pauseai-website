<!--
	The chapter-sharing yes/no, with no default. Once answered it posts
	`chapter_share` and the text shown as `chapter_share_wording`, unless the host
	posts them from another form (/join step 1 is client-only; step 2 posts them).
	The host keeps its submit disabled until it is answered. Rules: docs/join-form-flow.md, "Chapter sharing".
-->
<script lang="ts">
	import { chapterShareWording, type ChapterQuestion } from './chapterShare'
	import type { ChapterAnswer } from './options'

	let {
		question,
		answer = $bindable(),
		postAnswer = true,
		label = '',
		level = 3
	}: {
		question: ChapterQuestion
		answer: ChapterAnswer | null
		postAnswer?: boolean
		// Section heading above the box, where the form has section headings; it is
		// one level above the question's.
		label?: string
		// The question heading's level, to fit the host page's outline.
		level?: 2 | 3 | 4
	} = $props()

	const id = $props.id()
	const options = $derived([
		{ value: 'yes' as const, text: question.yes },
		{ value: 'no' as const, text: question.no }
	])
	let buttons: HTMLButtonElement[] = $state([])

	// Radio-group keyboard pattern: one tab stop, arrow keys move and select.
	function onKeydown(event: KeyboardEvent, index: number) {
		const steps: Record<string, number> = {
			ArrowRight: 1,
			ArrowDown: 1,
			ArrowLeft: -1,
			ArrowUp: -1
		}
		const step = steps[event.key]
		if (!step) return
		event.preventDefault()
		const next = (index + step + options.length) % options.length
		answer = options[next].value
		buttons[next]?.focus()
	}
</script>

{#if label}
	<svelte:element this={`h${level - 1}`} class="section-label">{label}</svelte:element>
{/if}
<div
	class="chapter-question"
	role="radiogroup"
	aria-required="true"
	aria-labelledby="{id}-heading"
	aria-describedby="{id}-body"
>
	<svelte:element this={`h${level}`} id="{id}-heading" class="chapter-heading"
		>{question.heading}</svelte:element
	>
	<p id="{id}-body">{question.body}</p>
	<div class="chapter-options">
		{#each options as option, index (option.value)}
			<button
				type="button"
				class="chapter-option"
				class:selected={answer === option.value}
				role="radio"
				aria-checked={answer === option.value}
				tabindex={answer === option.value || (!answer && index === 0) ? 0 : -1}
				bind:this={buttons[index]}
				onclick={() => (answer = option.value)}
				onkeydown={(event) => onKeydown(event, index)}
			>
				<span class="radio-box" aria-hidden="true"><span class="radio-dot"></span></span>
				<span>{option.text}</span>
			</button>
		{/each}
	</div>
</div>
{#if answer && postAnswer}
	<input type="hidden" name="chapter_share" value={answer} />
	<input type="hidden" name="chapter_share_wording" value={chapterShareWording(question, answer)} />
{/if}

<style>
	/* As OnboardingFlow's section labels. */
	.section-label {
		font-family: var(--font-body);
		font-weight: bold;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.7;
		margin: 0.75rem 0 0.5rem 0;
	}

	.chapter-question {
		border: 1px solid var(--brand-subtle);
		border-radius: 16px;
		padding: 1rem;
		background-color: var(--bg);
	}

	.chapter-heading {
		margin: 0 0 0.4rem;
		font-size: 1.05rem;
		line-height: 1.35;
	}

	p {
		margin: 0 0 0.75rem;
		font-size: 0.9rem;
		opacity: 0.85;
	}

	.chapter-options {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	@media (max-width: 600px) {
		.chapter-options {
			grid-template-columns: 1fr;
		}
	}

	.chapter-option {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.8rem 1rem;
		background-color: var(--bg);
		border: 2px solid var(--brand-subtle);
		border-radius: 16px;
		cursor: pointer;
		text-align: left;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 0.95rem;
		color: var(--text);
		transition: border-color 0.15s;
	}

	.chapter-option:hover {
		border-color: var(--brand);
	}

	.chapter-option.selected {
		border-color: var(--brand);
		outline: 2px solid var(--brand);
	}

	.radio-box {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 1.3rem;
		height: 1.3rem;
		border: 2px solid var(--brand-subtle);
		border-radius: 50%;
		background-color: var(--bg);
	}

	.radio-dot {
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
	}

	.selected .radio-box {
		border-color: var(--brand);
		background-color: var(--brand);
	}

	.selected .radio-dot {
		background-color: var(--bg);
	}
</style>
