<script lang="ts">
	export let image: string | undefined
	export let name: string | undefined
	export let title: string | undefined
</script>

<li class="person">
	{#if image}
		<div class="image" style="background-image: url({image})"></div>
	{:else}
		<div class="image placeholder">
			<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
				<rect width="300" height="400" fill="transparent" />
				<circle cx="150" cy="140" r="70" fill="#333" />
				<ellipse cx="150" cy="300" rx="130" ry="70" fill="#333" />
			</svg>
		</div>
	{/if}
	<div class="details">
		<div class="name-title">
			<div class="name">
				{name}
			</div>
		</div>

		{#if title}
			<div class="title">
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
	.image.placeholder {
		background-color: var(--bg-subtle); /* Light background for the placeholder circle */
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0px; /* Adjust padding to make the SVG smaller within the circle */
		box-sizing: border-box; /* Include padding in the element's total width and height */
	}
	.image.placeholder svg {
		width: 100%;
		height: 100%;
		/* Ensure the SVG content fits within the padded circular area */
		object-fit: contain;
		fill: var(--text-dark); /* Ensure SVG elements use a visible color */
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

	.title {
		font-weight: normal;
		font-family: var(--font-body);
		font-size: 1rem;
		margin-top: 0.2rem;
	}
</style>
