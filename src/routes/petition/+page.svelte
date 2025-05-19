<script lang="ts">
    import PostMeta from '$lib/components/PostMeta.svelte';
    import { meta } from './meta';
    import Signatory from './signatory.svelte';
    export let data;

    const { signatories, totalCount } = data;
    const { title, description, date } = meta;

    // Variable to control how many signatories are shown
    let showLimit = 2;
    // Reactive variable to determine the list of signatories to display
    $: visibleSignatories = signatories.slice(0, showLimit);
    // Function to toggle between limited and full list
    function toggleShowAll() {
        showLimit = showLimit === 2 ? signatories.length : 2;
    }

    // Milestone goals for signatures
    const milestones = [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500];
    // Find the next milestone goal
    const nextGoal = milestones.find(goal => totalCount < goal) || milestones[milestones.length - 1];
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>

<h2>We call on the governments of the world to sign an international treaty implementing a temporary pause on the training of the most powerful general AI systems, until we know how to build them safely and keep them under democratic control.</h2>

<iframe
    class="airtable-embed"
    src="https://airtable.com/embed/appWPTGqZmUcs3NWu/pagUTBbn9qea358FB/form?hide_footer=true"
    frameborder="0"
    width="100%"
    height="800"
    style="background: transparent; border: 1px solid #ccc;"
></iframe>

<h2>Signatories</h2>

<!-- Display the total count -->
<p>{totalCount} people have already sign it. Help us reach the first {nextGoal} signatures!</p>

<section data-pagefind-ignore>
    {#if visibleSignatories.length === 0}
        <p>No signatories found</p>
    {/if}
    <ul class="signatories">
        {#each visibleSignatories as { first_name, last_name, country, bio }}
            <Signatory {first_name} {last_name} {country} {bio} />
        {/each}
    </ul>

    <!-- Button to toggle between limited and full list -->
    <button on:click={toggleShowAll}>
        {showLimit === 2 ? 'Show All Signatories' : 'Show Less'}
    </button>
</section>

<style>
    .signatories {
        display: grid;
        gap: 1rem;
    }

    button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: var(--brand);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background-color: var(--brand-dark);
    }
</style>