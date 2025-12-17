<script lang="ts">
	type Doomer = {
		name: string
		title?: string
		description?: string
		/// ISO Datetime yyyy-mm-dd
		date?: string
		probability: string
		note?: string
		number: number
		source: string
	}
	let doomers: Doomer[] = [
		{
			name: 'Yann LeCun',
			title: 'one of three godfathers of AI, works at Meta',
			note: 'less likely than an asteroid',
			number: 0.0001,
			probability: '<0.01%',
			source: 'https://twitter.com/liron/status/1736555643384025428'
		},
		{
			name: 'Forecasting Research Institute Superforecasters',
			probability: '0.38%',
			note: 'From the same study: Domain experts estimated 3% AI x-risk, and AI catastrophe at 12%',
			number: 0.0038,
			source:
				'https://static1.squarespace.com/static/635693acf15a3e2a14a56a4a/t/64f0a7838ccbf43b6b5ee40c/1693493128111/XPT.pdf'
		},
		{
			name: 'Nate Silver',
			title: 'Founder of FiveThirtyEight',
			probability: '5-10%',
			number: 0.075,
			source: 'https://www.natesilver.net/p/its-time-to-come-to-grips-with-ai'
		},
		{
			name: 'Vitalik Buterin',
			title: 'Ethereum founder',
			probability: '10%',
			number: 0.1,
			source: 'https://twitter.com/VitalikButerin/status/1729251822391447904'
		},
		{
			name: 'Machine learning researchers',
			probability: '9-19.4%',
			number: 0.142,
			note: 'Mean in 2023, depending on the question design, median values: 5-10%',
			source:
				'https://wiki.aiimpacts.org/ai_timelines/predictions_of_human-level_ai_timelines/ai_timeline_surveys/2023_expert_survey_on_progress_in_ai'
		},
		{
			name: 'Lina Khan',
			title: 'head of FTC',
			date: '2023-11-01',
			probability: '15%',
			number: 0.15,
			source: 'https://twitter.com/liron/status/1723458202090774949'
		},
		{
			name: 'Elon Musk',
			title: 'CEO of Tesla, SpaceX, X',
			probability: '10-20%',
			number: 0.15,
			source: 'https://www.youtube.com/watch?v=akXMYvKjUxM'
		},
		{
			name: 'Dario Amodei',
			title: 'CEO of Anthropic',
			probability: '10-25%',
			number: 0.175,
			source: 'https://twitter.com/liron/status/1710520914444718459'
		},
		{
			name: 'Reid Hoffman',
			title: 'Co-founder of LinkedIn',
			date: '2024-08-23',
			probability: '20%',
			number: 0.2,
			source: 'https://www.pbs.org/video/future-of-ai-1724451272/'
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
			name: 'Emmett Shear',
			title: 'Co-founder of Twitch, former interim CEO of OpenAI',
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
			name: 'Geoff Hinton',
			title: 'one of three godfathers of AI',
			probability: '10-50%',
			number: 0.3,
			note: 'Recently said "Kinda 50-50" on good outcomes for humanity. Earlier he mentioned 10%.',
			source: 'https://x.com/liron/status/1803435675527815302'
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
			title: 'Top competitive forecaster',
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
			name: 'Joep Meindertsma',
			title: 'Founder of PauseAI',
			probability: '40%',
			note: 'The remaining 60% consists largely of "we can pause".',
			number: 0.4,
			source:
				'https://www.nrc.nl/nieuws/2024/02/16/ai-doomers-zijn-doodsbang-voor-de-computer-ai-zal-proberen-de-macht-over-te-nemen-a4190130'
		},
		{
			name: 'Paul Christiano',
			title: 'Head of AI safety, US AI Safety Institute, formerly OpenAI, founded ARC',
			probability: '46%',
			number: 0.46,
			source: 'https://www.lesswrong.com/posts/xWMqsvHapP3nwdSW8/my-views-on-doom'
		},
		{
			name: 'Holden Karnofsky',
			title: 'Co-founder of Open Philanthropy',
			probability: '10-90%',
			number: 0.5,
			source:
				'https://www.alignmentforum.org/posts/rCJQAkPTEypGjSJ8X/how-might-we-align-transformative-ai-if-it-s-developed-very#So__would_civilization_survive_'
		},
		{
			name: 'Emad Mostaque',
			title: 'Founder of Stability AI',
			probability: '50%',
			number: 0.5,
			source: 'https://x.com/EMostaque/status/1864266899170767105'
		},
		{
			name: 'Jan Leike',
			title: 'Former alignment lead at OpenAI',
			date: '2023-08-01',
			probability: '10-90%',
			number: 0.5,
			source: 'https://www.youtube.com/watch?v=ZP_N4q5U3eE&t=1h16m'
		},
		{
			name: 'Zvi Mowshowitz',
			title: 'Independent AI safety journalist',
			probability: '60%',
			number: 0.6,
			source: 'https://x.com/liron/status/1729274710670893262?s=20'
		},
		{
			name: 'Daniel Kokotajlo',
			title: 'Forecaster & former OpenAI researcher',
			probability: '70%',
			number: 0.7,
			source:
				'https://www.lesswrong.com/posts/xDkdR6JcQsCdnFpaQ/adumbrations-on-agi-from-an-outsider?commentId=sHnfPe5pHJhjJuCWW'
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
			probability: '>95%',
			number: 0.95,
			source:
				'https://www.fastcompany.com/90994526/pdoom-explained-how-to-calculate-your-score-on-ai-apocalypse-metric'
		},
		{
			name: 'Roman Yampolskiy',
			title: 'AI safety scientist',
			probability: '99.99%',
			number: 0.99999999,
			source: 'https://twitter.com/romanyam/status/1767575356155027503'
		}
	]
	doomers = doomers.sort((a, b) => b.number - a.number)
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

	@media (max-width: 850px) {
		.name {
			flex-direction: column;
		}

		.title {
			margin-left: 0;
		}
	}

	.pdoom {
		text-align: center;
		flex-basis: 6rem;
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
