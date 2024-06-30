<script lang="ts">
	import { onMount } from 'svelte'
	import MoveLeftIcon from '$lib/components/icons/move-left.svelte'
	import MoveRightIcon from '$lib/components/icons/move-right.svelte'
	export let data
	const index = data.posts.findIndex((post) => post.slug === data.url)
	const prev = data.posts[index - 1]
	const next = data.posts[index + 1]

	let y = 0
	let lastY = 0
	let navTransform = 0
	let navHeight: number
	let scrollingUp = false

	function handleScroll() {
		const scrollDiff = lastY - y
		if (scrollDiff > 0) {
			// Scrolling up
			scrollingUp = true
			navTransform = Math.min(navTransform + scrollDiff, 0)
		} else if (y > navHeight) {
			// Scrolling down (only after nav is out of view)
			scrollingUp = false
			navTransform = Math.max(navTransform + scrollDiff, -navHeight)
		}
		lastY = y
	}

	onMount(() => {
		const nav = document.querySelector('nav')
		if (nav) {
			navHeight = nav.offsetHeight
		}
	})
</script>

<svelte:window bind:scrollY={y} on:scroll={handleScroll} />

<div class="nav-container">
	<nav style="transform: translateY({navTransform}px)" class:scrolling-up={scrollingUp}>
		{#if prev}
			<a href={prev.slug} class="prev"><MoveLeftIcon />{prev.title}</a>
		{/if}
		{#if next}
			<a href={next.slug} class="next">{next.title}<MoveRightIcon /></a>
		{/if}
	</nav>
</div>

<div class="article-layout">
	<article>
		<slot />
	</article>
</div>

<style>
	.nav-container {
		position: sticky;
		top: 0;
		z-index: 100;
	}

	nav {
		display: flex;
		position: relative;
		padding: 2rem 0 3rem;
		background-color: var(--bg-subtle);
		background: linear-gradient(to bottom, var(--bg-subtle) 80%, transparent 100%);
	}

	nav.scrolling-up {
		transition: transform 0.3s ease-out;
	}

	a {
		display: flex;
		align-items: center;
		text-decoration: none;
	}

	.prev,
	.next {
		flex: 1;
	}

	.prev {
		justify-content: flex-start;
	}

	.next {
		justify-content: flex-end;
	}

	.prev :global(svg) {
		margin-right: 1rem;
	}

	.next :global(svg) {
		margin-left: 1rem;
	}

	.article-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(auto, 50rem) minmax(0, 1fr);
	}

	article {
		grid-column: 2;
		max-width: 50rem;
		margin: 0 auto;
	}
</style>
