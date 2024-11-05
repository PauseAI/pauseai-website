<script lang="ts">
	// Define the risks and their positions (x, y)
	type Risk = {
		name: string
		capabilities: number
		impact: number
	}

	let risks: Risk[] = [
		{ name: 'Facial Recognition', capabilities: 10, impact: 10 },
		{ name: 'Automated Disinformation', capabilities: 30, impact: 15 },
		{ name: 'Bias in AI', capabilities: 40, impact: 15 },
		{ name: 'Fully autonomous weapons', capabilities: 60, impact: 40 },
		{ name: 'AI powered cyberweapons', capabilities: 75, impact: 50 },
		{ name: 'AI powered bioweapons', capabilities: 80, impact: 60 },
		{ name: 'Loss of control', capabilities: 85, impact: 90 }
	]

	function handleClick(risk: Risk) {
		alert(`You clicked on ${risk.name}`)
	}
</script>

<svg width="500" height="500" viewBox="0 0 120 120">
	<!-- X and Y Axes -->
	<line x1="20" y1="90" x2="100" y2="90" stroke="var(--color-text)" />
	<line x1="20" y1="90" x2="20" y2="10" stroke="var(--color-text)" />
	<text x="40" y="95" font-size="4" fill="var(--color-text)">Capabilities</text>
	<text x="-30" y="5" font-size="4" transform="rotate(-90, 12, 5)" fill="var(--color-text)"
		>Potential Impact</text
	>

	<!-- "We are here" line -->
	<line
		x1="20"
		y1="90"
		x2="45"
		y2="65"
		stroke="var(--color-text)"
		stroke-width="0.5"
		stroke-dasharray="2,2"
	/>
	<text x="46" y="63" font-size="3" fill="var(--color-text)" transform="rotate(-90, 46, 63)"
		>We are here</text
	>

	<!-- Risks as clickable circles -->
	{#each risks as risk}
		<circle
			cx={risk.capabilities + 10}
			cy={100 - risk.impact}
			r="2"
			fill="var(--brand)"
			on:click={() => handleClick(risk)}
			class="cursor-pointer"
		/>
		<text
			x={risk.capabilities + 11}
			y={100 - risk.impact - 1}
			font-size="3"
			fill="var(--color-text)">{risk.name}</text
		>
	{/each}
</svg>

<style>
	circle {
		transition: r 0.2s ease-in-out;
	}

	circle:hover {
		r: 3;
	}
</style>
