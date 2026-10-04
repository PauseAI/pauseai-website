<script lang="ts">
	import Link from '$lib/components/Link.svelte'
	import type { CalendarResponse, Event } from '$api/calendar/+server'
	import { onMount } from 'svelte'

	const FORMAT = new Intl.DateTimeFormat('en', {
		weekday: 'short',
		day: 'numeric',
		month: 'long'
	})

	// null while loading, so an empty calendar and a calendar we have not read
	// yet do not say the same thing.
	let events: Event[] | null = $state(null)

	onMount(async () => {
		// /api/calendar merges the global calendar with every national chapter
		// calendar in national-chapters.json. The Luma embed this replaced could
		// only ever show the global one, so chapter events were fetched for the
		// map and then shown nowhere.
		try {
			const response = await fetch('/api/calendar')
			if (!response.ok) throw new Error(response.statusText)
			const data = (await response.json()) as CalendarResponse
			events = data.entries.map((entry) => entry.event)
		} catch (error) {
			console.error('Error fetching events:', error)
			events = []
		}
	})
</script>

{#if events === null}
	<p class="status">Loading events...</p>
{:else if events.length === 0}
	<p class="status">
		Nothing is listed at the moment. Our <Link href="https://lu.ma/PauseAI">calendar page</Link> has the
		latest.
	</p>
{:else}
	<ul>
		{#each events as event (event.url)}
			<li>
				<time datetime={new Date(event.start_at).toISOString()}>
					{FORMAT.format(new Date(event.start_at))}
				</time>
				<Link href={`https://lu.ma/${event.url}`}>{event.name}</Link>
			</li>
		{/each}
	</ul>
{/if}

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		border: 1px solid var(--border-luma-embed);
		border-radius: 24px;
		overflow: hidden;
	}

	li {
		display: flex;
		gap: 1rem;
		padding: 0.75rem 1.25rem;
	}

	li + li {
		border-top: 1px solid var(--border-luma-embed);
	}

	time {
		flex: 0 0 10rem;
		color: var(--text-subtle);
		font-variant-numeric: tabular-nums;
	}

	.status {
		color: var(--text-subtle);
	}

	@media (max-width: 480px) {
		li {
			flex-direction: column;
			gap: 0.25rem;
		}

		time {
			flex: none;
		}
	}
</style>
