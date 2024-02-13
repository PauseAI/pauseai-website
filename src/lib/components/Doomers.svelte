<script lang="ts">
	type Doomer = {
		name: string
		title?: string
		description?: string
		date?: string
		probability: string
		note?: string
		number: number
		source: string
	}
	const doomers: Doomer[] = [
		{
			name: 'Yann LeCun',
			title: 'one of three godfathers of AI, works at Meta',
			note: 'less likely than an asteroid',
			number: 0.0001,
			probability: '<0.01%',
			source: 'https://twitter.com/liron/status/1736555643384025428'
		},
		{
			name: 'Vitalik Buterin',
			title: 'Ethereum founder',
			probability: '10%',
			note: 'Specifically means AI takeover',
			number: 0.1,
			source: 'https://x.com/liron/status/1729740226594258982?s=20'
		},
		{
			name: 'Geoff Hinton',
			title: 'one of three godfathers of AI',
			probability: '10%',
			number: 0.1,
			note: 'chance of extinction in the next 30 years if unregulated',
			source: 'https://twitter.com/geoffreyhinton/status/1719447980753719543'
		},
		{
			name: 'Machine learning researchers',
			probability: '14%',
			number: 0.14,
			note: 'From 2022, median value is 5%',
			source: 'https://aiimpacts.org/2022-expert-survey-on-progress-in-ai/'
		},
		{
			name: 'Lina Khan',
			title: 'head of FTC',
			date: 'Nov 2023',
			probability: '15%',
			number: 0.15,
			source: 'https://twitter.com/liron/status/1723458202090774949'
		},
		{
			name: 'Paul Christiano',
			description: 'former alignment lead at OpenAI, current researcher at ARC',
			probability: '10-20%',
			number: 0.15,
			note: 'Cumulative risks go to 50% when you get to human-level AI',
			source: 'https://www.youtube.com/watch?v=GyFkWb903aU&t=560s'
		},
		{
			name: 'Dario Amodei',
			title: 'CEO of Anthropic',
			probability: '10-25%',
			number: 0.175,
			source: 'https://twitter.com/liron/status/1710520914444718459'
		},
		{
			name: 'Yoshua Bengio',
			title: 'one of three godfathers of AI',
			probability: '20%',
			number: 0.2,
			source:
				'https://www.abc.net.au/news/2023-07-15/whats-your-pdoom-ai-researchers-worry-catastrophe/102591340'
		},
		{
			name: 'Elon Musk',
			title: 'CEO of Tesla, SpaceX, X',
			probability: '20-30%',
			number: 0.25,
			source: 'https://www.youtube.com/watch?v=57y7DxWfOS0&t=50s'
		},
		{
			name: 'Emmet Shear',
			title: 'Co-founder of Twitch, former short-term CEO of OpenAI',
			probability: '5-50%',
			number: 0.275,
			source: 'https://www.youtube.com/watch?v=9oUbauum4uI'
		},
		{
			name: 'AI Safety Researchers',
			note: 'Mean from 44 AI safety researchers in 2021',
			probability: '30%',
			number: 0.3,
			source:
				'https://web.archive.org/web/20221013014859/https://www.alignmentforum.org/posts/QvwSr5LsxyDeaPK5s/existential-risk-from-ai-survey-results'
		},
		{
			name: 'Scott Alexander',
			probability: '33%',
			title: 'Popular Internet blogger at Astral Codex Ten',
			number: 0.33,
			source: 'https://astralcodexten.substack.com/p/why-i-am-not-as-much-of-a-doomer'
		},
		{
			name: 'Eli Lifland',
			description: 'Top competitive forecaster',
			probability: '35%',
			number: 0.35,
			source:
				'https://forum.effectivealtruism.org/posts/QeLE22fefLqKfYTW6/eli-lifland-on-navigating-the-ai-alignment-landscape'
		},
		{
			name: 'AI engineer',
			note: 'Estimate mean value, survey methodology may be flawed',
			probability: '40%',
			number: 0.4,
			source: 'https://twitter.com/AISafetyMemes/status/1713515843194077583'
		},
		{
			name: 'Holden Karnofsky',
			title: 'Executive Director of Open Philanthropy',
			probability: '50%',
			number: 0.5,
			source: 'https://www.cold-takes.com/where-ai-forecasting-stands-today/'
		},
		{
			name: 'Jan Leike',
			title: 'alignment lead at OpenAI',
			date: 'Aug 2023',
			probability: '10-90%',
			number: 0.5,
			source: 'https://www.youtube.com/watch?v=ZP_N4q5U3eE&t=1h16m'
		},
		{
			name: 'Zvi Mowshowitz',
			title: 'AI researcher',
			probability: '60%',
			number: 0.6,
			source: 'https://x.com/liron/status/1729274710670893262?s=20'
		},
		{
			name: 'Dan Hendrycks',
			title: 'Head of Center for AI Safety',
			probability: '>80%',
			number: 0.8,
			source: 'https://twitter.com/DanHendrycks/status/1642394635657162753'
		},
		{
			name: 'Eliezer Yudkowsky',
			title: 'Founder of MIRI',
			probability: '>99%',
			number: 0.99,
			source: 'https://www.lesswrong.com/posts/j9Q8bRmwCgXRYAgcJ/miri-announces-new-death-with-dignity-strategy'
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
				<h3 class="name">
					<div class="bar" style={`width: calc(${doomer.number * 100}%`} />
					{doomer.name}
					{#if doomer.title}
						<div class="title">
							{doomer.title}
						</div>
					{/if}
				</h3>
				<div class="note">
					{#if doomer.note}
						({doomer.note})
					{/if}
				</div>
			</div>
		</li>
	{/each}
</ul>

<style>
	/* fills to percentage number */
	.bar {
		position: absolute;
		background-color: var(--brand);
		opacity: 0.7;
		/* height: 100%; */
		height: 3px;
		bottom: 0;
		z-index: 2;
	}

	.note {
		font-size: 0.8rem;
	}

	.title {
		margin-left: 0.4rem;
		opacity: 0.5;
		font-family: var(--font-body);
		font-weight: normal;
		font-size: 0.8rem;
	}

	.doomer {
		margin-bottom: 1rem;
		position: relative;
		display: flex;
		flex-direction: row;
	}

	.name {
		display: flex;
		position: relative;
		padding-bottom: 0.3rem;
	}

	.pdoom {
		text-align: center;
		flex-basis: 5rem;
		flex-grow: 0;
		flex-shrink: 0;
	}

	.pdoom a {
		color: var(--brand);
		text-decoration: none;
	}

	.details {
		flex-grow: 1;
		z-index: 3;
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
