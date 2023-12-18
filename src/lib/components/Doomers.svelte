<script lang="ts">
	type Doomer = {
		name: string
		title?: string
		description?: string
		date?: string
		probability: string
		note?: string
		source: string
	}
	const doomers: Doomer[] = [
		{
			name: 'Yann LeCun',
			title: 'Meta Chief Scientist',
			probability: '<0.01%',
			source: 'https://twitter.com/liron/status/1736555643384025428'
		},
		{
			name: 'Vitalik Buterin',
			probability: '10%',
			source: 'https://x.com/liron/status/1729740226594258982?s=20'
		},
		{
			name: 'Geoff Hinton',
			title: 'one of three godfathers of AI',
			probability: '10%',
			note: 'chance of extinction in the next 30 years if unregulated',
			source: 'https://twitter.com/geoffreyhinton/status/1719447980753719543'
		},
		{
			name: 'Machine learning researcher in 2022',
			probability: '14%',
			note: 'median value is 5%',
			source: 'https://aiimpacts.org/2022-expert-survey-on-progress-in-ai/'
		},
		{
			name: 'Lina Khan',
			title: 'head of FTC',
			date: 'Nov 2023',
			probability: '15%',
			source: 'https://twitter.com/liron/status/1723458202090774949'
		},
		{
			name: 'Paul Christiano',
			description: 'former alignment lead at OpenAI, current researcher at ARC',
			probability: '10-20%',
			note: 'chance of AI takeover, many/most humans dead. Cumulative risks go to 50% when you get to human-level AI',
			source: 'https://www.youtube.com/watch?v=GyFkWb903aU&t=560s'
		},
		{
			name: 'Dario Amodei',
			title: 'CEO of Anthropic',
			probability: '10-25%',
			source: 'https://twitter.com/liron/status/1710520914444718459'
		},
		{
			name: 'Elon Musk',
			probability: '20-30%',
			source: 'https://www.youtube.com/watch?v=57y7DxWfOS0&t=50s'
		},
		{
			name: 'Emmet Shear',
			probability: '5-50%',
			source: 'https://www.youtube.com/watch?v=9oUbauum4uI'
		},
		{
			name: 'AI Safety Researchers',
			probability: '30%',
			source:
				'https://web.archive.org/web/20221013014859/https://www.alignmentforum.org/posts/QvwSr5LsxyDeaPK5s/existential-risk-from-ai-survey-results'
		},
		{
			name: 'Scott Alexander',
			probability: '33%',
			source: 'https://astralcodexten.substack.com/p/why-i-am-not-as-much-of-a-doomer'
		},
		{
			name: 'Eli Lifland',
			description: 'Top competitive forecaster',
			probability: '35%',
			source:
				'https://forum.effectivealtruism.org/posts/QeLE22fefLqKfYTW6/eli-lifland-on-navigating-the-ai-alignment-landscape'
		},
		{
			name: 'Average AI engineer',
			note: 'Survey methodology may be flawed',
			probability: '40%',
			source: 'https://twitter.com/AISafetyMemes/status/1713515843194077583'
		},
		{
			name: 'Holden Karnofsky',
			probability: '50%',
			source: 'https://www.cold-takes.com/where-ai-forecasting-stands-today/'
		},
		{
			name: 'Jan Leike',
			title: 'alignment lead at OpenAI',
			date: 'Aug 2023',
			probability: '10-90%',
			source: 'https://www.youtube.com/watch?v=ZP_N4q5U3eE&t=1h16m'
		},
		{
			name: 'Zvi Mowshowitz',
			probability: '60%',
			source: 'https://x.com/liron/status/1729274710670893262?s=20'
		},
		{
			name: 'Dan Hendrycks',
			probability: '>80%',
			source: 'https://twitter.com/DanHendrycks/status/1642394635657162753'
		},
		{
			name: 'Eliezer Yudkowski',
			probability: '>80%',
			source: 'https://twitter.com/ESYudkowsky/status/1662247373014286337'
		}
	]
</script>

<ul>
	{#each doomers as doomer (doomer.name)}
		<li class="doomer">
			<div class="pdoom">
				<a href={doomer.source}>
					<b>
						{doomer.probability}
					</b>
				</a>
			</div>
			<div class="details">
				<h3>
					{doomer.name}
					{#if doomer.title}
						({doomer.title})
					{/if}
				</h3>
				{#if doomer.note}
					({doomer.note})
				{/if}
			</div>
		</li>
	{/each}
</ul>

<style>
	.doomer {
		display: flex;
		flex-direction: row;
		margin-bottom: 10px;
	}

	.pdoom {
		text-align: center;
		flex-basis: 5rem;
		flex-grow: 0;
		flex-shrink: 0;
	}

	.details {
		flex-grow: 1;
	}

	.doomer h3 {
		margin: 0;
	}

	.doomer a {
		text-decoration: none;
	}

	.doomer a:hover {
		text-decoration: underline;
	}
</style>
