<script lang="ts">
	export let image: string | undefined
	export let name: string | undefined
	export let title: string | undefined
</script>

<li class="person">
	{#if image}
		<div class="image" style="background-image: url({image})"></div>
	{/if}
	<div class="details">
		<div class="name-title">
			<div class="name">
				{name}
			</div>
		</div>

		{#if title}
			<div class="bio">
				{title}
			</div>
		{/if}
	</div>
</li>

<style>
    .person {
        display: flex;
        gap: 1rem;
    }
    .details {
        flex-shrink: 1;
    }
    .image {
        display: flex;
        flex-basis: 100px;
        height: 100px;
        align-items: center;
        flex-shrink: 0;
        justify-content: center;
        border-radius: 50%;
        background-size: cover;
        background-position: center;
    }
    
    .name-title {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.1rem; /* Reduced gap */
    }
    .name {
        color: var(--text);
        font-family: var(--font-heading);
        font-weight: bold;
        text-decoration: none;
        font-size: 1.4rem;
        text-transform: capitalize;
        margin: 0;
    }

    .bio {
        font-weight: normal;
        font-family: var(--font-body);
        font-size: 1rem;
        margin-top: 0.2rem;

</style>
