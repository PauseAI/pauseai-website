<script lang="ts">
	type Company = {
		name: string
		title?: string
		acknowledge: Score
	}
	type Score = {
		explanation: string
		/** 0 - 10*/
		score: number
	}
	const companies: Company[] = [
		{
			name: 'OpenAI',
			acknowledge: {
				explanation:
					"Has now publicly acknowledged most of the AI risks, including existential risk. However, it took them many years to do so. Sam Altman wasn't honest about his 'worst nightmare' during the Senate hearing in May 2023.",
				score: 7
			}
		}
	]
</script>

<ul>
	{#each companies as company (company.name)}
		<li class="company">
			<div class="company__name">{company.name}</div>
			<div class="company__acknowledge">
				<div class="company__acknowledge__explanation">
					{company.acknowledge.explanation}
				</div>
				<div class="company__acknowledge__score">{company.acknowledge.score}</div>
			</div>
		</li>
	{/each}
</ul>

<style>
	.company {
		display: flex;
		flex-direction: column;
	}
	.company__name {
		font-weight: bold;
	}
	.company__acknowledge {
		display: flex;
		flex-direction: column;
	}
	.company__acknowledge__explanation {
		font-size: 0.8rem;
	}
	.company__acknowledge__score {
		font-size: 0.8rem;
	}
</style>
