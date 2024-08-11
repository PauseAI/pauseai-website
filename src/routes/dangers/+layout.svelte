<script lang="ts">
	import { onMount } from 'svelte'
	import MoveLeftIcon from '$components/icons/move-left.svelte'
	import MoveRightIcon from '$components/icons/move-right.svelte'
	export let data
	const index = data.posts.findIndex((post) => post.slug === data.slug)
	const prev = data.posts[index - 1]
	const next = data.posts[index + 1]

	let y = 0
	let lastY = 0
	let navTransform = 0
	let navHeight: number
	let scrollingUp = false
	let sideNavInitialTop: number

	function handleScroll() {
		const scrollDiff = lastY - y
		if (scrollDiff > 0) {
			scrollingUp = true
			navTransform = Math.min(navTransform + scrollDiff, 0)
		} else if (y > navHeight) {
			scrollingUp = false
			navTransform = Math.max(navTransform + scrollDiff, -navHeight)
		}
		lastY = y
	}

	function calculateSideNavPosition() {
		const sideNav = document.querySelector<HTMLElement>('.side-nav')
		if (sideNav) {
			const rect = sideNav.getBoundingClientRect()
			sideNavInitialTop = rect.top / window.innerHeight
		}
	}

	onMount(() => {
		y = 0
		const topNav = document.querySelector<HTMLElement>('.top-nav')
		if (topNav) {
			navHeight = topNav.offsetHeight
		}
		calculateSideNavPosition()
		window.addEventListener('resize', calculateSideNavPosition)
		window.addEventListener('orientationchange', calculateSideNavPosition)
		return () => {
			window.removeEventListener('resize', calculateSideNavPosition)
			window.removeEventListener('orientationchange', calculateSideNavPosition)
		}
	})
</script>

<svelte:window bind:scrollY={y} on:scroll={handleScroll} />

<div class="nav-container">
	<nav
		class="top-nav"
		style="transform: translateY({navTransform}px)"
		class:scrolling-up={scrollingUp}
	>
		{#if prev}
			<a href={`/${prev.slug}`} class="prev"><MoveLeftIcon />{prev.title}</a>
		{/if}
		{#if next}
			<a href={`/${next.slug}`} class="next">{next.title}<MoveRightIcon /></a>
		{/if}
	</nav>
</div>

<div class="layout">
	<nav class="side-nav" style="top: {sideNavInitialTop * 100}%;">
		<ul>
			{#each data.posts as post}
				<li class:current={post.slug === data.slug}>
					<a href={`/${post.slug}`}>{post.title}</a>
				</li>
			{/each}
		</ul>
	</nav>
	<article>
		<slot />
	</article>
</div>

<style>
	.nav-container {
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.top-nav {
		display: flex;
		position: relative;
		padding: 2rem 0 3.5rem;
		background-color: var(--bg-subtle);
		background: linear-gradient(to bottom, var(--bg-subtle) 80%, transparent 100%);
		flex-direction: column;
		justify-content: space-between;
	}

	.top-nav.scrolling-up {
		transition: transform 0.3s ease-out;
	}

	a {
		display: flex;
		align-items: center;
		text-decoration: none;
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

	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(auto, 50rem) minmax(0, 1fr);
	}

	article {
		grid-column: 2;
		max-width: 50rem;
		margin: 0 auto;
	}

	.side-nav {
		display: none;
	}

	.side-nav ul {
		padding-left: 0;
	}

	@media (min-width: 640px) {
		.top-nav {
			flex-direction: row;
		}
	}

	@media (min-width: 1024px) {
		.layout {
			grid-template-columns: minmax(15rem, 1fr) minmax(auto, 50rem) minmax(0, 1fr);
			gap: 2rem;
		}
		.side-nav {
			display: block;
			grid-column: 1;
			position: sticky;
			/* top: 8rem;  */
			align-self: start;
		}

		.side-nav ul {
			list-style-type: none;
		}

		.side-nav li {
			margin-bottom: 1rem;
		}

		.side-nav li.current a {
			font-weight: bold;
		}
	}
</style>
