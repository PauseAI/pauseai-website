<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from './meta'
	import Signatory from './signatory.svelte'
	export let data

	const { signatories, totalCount } = data
	const { title, description, date } = meta

	// Variable to control how many signatories are shown
	const shortListN = 5
    let showAll = false
	// Reactive variable to determine the list of signatories to display
    $: visibleSignatories = showAll ? signatories : signatories.slice(0, shortListN)
	// Function to toggle between limited and full list
	function toggleShowAll() {
        showAll = !showAll	
    }

	// Milestone goals for signatures
	const milestones = [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500]
	// Find the next milestone goal
	const nextGoal = milestones.find((goal) => totalCount < goal) || milestones[milestones.length - 1]

    var d=document,
        w="https://tally.so/widgets/embed.js",
        v=function(){
            "undefined"!=typeof Tally
            ?Tally.loadEmbeds()
            :d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){
                e.src=e.dataset.tallySrc
            }))
        };
    if("undefined"!=typeof Tally) v();
    else if(d.querySelector('script[src="'+w+'"]')==null){
        var s=d.createElement("script");
        s.src=w,
        s.onload=v,
        s.onerror=v,
        d.body.appendChild(s);
    }
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>

<blockquote class="statement">
	<p>
		<em
			>"We call on the governments of the world to sign an international treaty implementing a
			temporary pause on the training of the most powerful general AI systems, until we know how to
			build them safely and keep them under democratic control."</em
		>
	</p>
</blockquote>

<!-- Signatories Counter and Goal -->
<div class="signatories-counter">
	<p>{totalCount} people have already signed it!</p>
	<p>
		Only {nextGoal && totalCount ? nextGoal - totalCount : 0} to get to our first {nextGoal} signatures!
	</p>
</div>

<iframe 
    data-tally-src="https://tally.so/embed/315xdg?alignLeft=1&transparentBackground=1&dynamicHeight=1" 
    loading="lazy" 
    width="100%" 
    height="509" 
    frameborder="0" 
    marginheight="0" 
    marginwidth="0" 
    title="Sign the statement">
</iframe>

<h2>Signatories</h2>

<section data-pagefind-ignore>
	{#if visibleSignatories.length === 0}
		<p>No signatories found</p>
	{/if}
	<ul class="signatories">
		{#each visibleSignatories as { name, country, bio }}
			<Signatory {name} {country} {bio} />
		{/each}
	</ul>

	<!-- Button to toggle between limited and full list -->
	<button on:click={toggleShowAll}>
        {showAll ? 'Show Less' : 'Show All Signatories'}
	</button>
</section>

<style>
	/* Style for the statement */
	.statement {
		font-family: 'Georgia', serif;
		margin: 2rem 0;
		padding: 1rem;
		background-color: #f9f9f9;
		border-left: 4px solid var(--brand);
		font-style: italic;
		font-size: 1.5rem;
		line-height: 1.8;
		color: #333;
	}

	.statement p {
		font-weight: 400; /* Normal weight */
		font-style: italic; /* Keep the italics from <em> */
		font-size: 1.8rem; /* Adjust size if needed */
		color: #333; /* Optional: Adjust color */
	}

	/* Style for the signatories counter */
	.signatories-counter {
		font-family: 'Arial', sans-serif;
		margin: 2rem 0;
		padding: 1rem;
		background-color: #fff;
		border: 1px solid #ccc;
		border-radius: 8px;
		text-align: center;
		font-size: 1.2rem;
		color: #444;
	}

	.signatories-counter p {
		margin: 0;
		font-weight: bold;
	}
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
