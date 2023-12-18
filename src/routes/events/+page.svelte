<script lang="ts"></script>
  import { onMount } from 'svelte';

  let events = [];

  onMount(async () => {
    try {
      const response = await fetch('https://api.example.com/discord/events');
      events = await response.json();
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  });
</script>

<main>
  <h1>Discord Events</h1>
  {#if events.length > 0}
    <ul>
      {#each events as event}
        <li>{event.name}</li>
      {/each}
    </ul>
  {:else}
    <p>No events available.</p>
  {/if}
</main>

<style>
  main {
    padding: 20px;
  }
</style>
