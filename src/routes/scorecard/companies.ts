import type { Company } from './types'

const companiesSource: Company[] = [
	{
		name: 'OpenAI',
		acknowledge: {
			explanation:
				"Has now publicly acknowledged most of the AI risks, including existential risk. However, it took them many years to do so. Sam Altman wasn't honest about his 'worst nightmare' during the Senate hearing in May 2023.",
			score: 7
		},
		lobby: {
			explanation:
				'OpenAI has publicly called for stricter regulation, but also tried to severely weaken how the EU AI Act regulates frontier models.',
			score: 4
		},
		deployment: {
			explanation:
				'GPT-4 was released 7 months after it finished training, during which they did a lot of safety work like red-teaming by ARC.',
			score: 8
		},
		research: {
			explanation:
				'OpenAI has published a lot of impactful AI safety research and has dedicated a substantial amount of resources to their "superalignement" project.',
			score: 8
		}
	},
	{
		name: 'Google DeepMind',
		acknowledge: {
			explanation:
				"Hassabis has now publicly acknowledged the existential risk from AI. They weren't as quick with this as OpenAI",
			score: 6
		},
		lobby: {
			// https://corporateeurope.org/en/2023/11/byte-byte
			explanation:
				'They have lobbied to shift the burden of responsibility onto users of AI instead of the ones building the AI.',
			score: 3
		},
		deployment: {
			explanation:
				'Google used to be very careful with releasing models, but that changed in 2023. When releasing Palm 2 in 2023, Google skipped any mention of safety in their release paper. However, with the release of Gemini in december 2023, they have written more extensively on this.',
			score: 5
		},
		research: {
			explanation: 'Google DeepMind has published quite a few impactful AI safety papers',
			score: 5
		}
	},
	{
		name: 'Microsoft',
		acknowledge: {
			explanation:
				// https://www.euronews.com/my-europe/2023/06/29/microsoft-chief-says-ai-is-not-an-existential-risk-to-mankind-but-human-oversight-needed
				'Microsoft does not acknowledge the existential risk from AI.',
			score: 2
		},
		lobby: {
			explanation:
				// https://corporateeurope.org/en/2023/11/byte-byte
				'Microsoft has lobbied to shift the burden of responsibility onto users of AI instead of the ones building the AI.',
			score: 3
		},
		deployment: {
			explanation:
				"Microsoft released an unfinished, sometimes even unhinged Bing (based on OpenAI's GPT-4) in April 2023. It was embarrassing and dangerous. OpenAI urged Microsoft not to do this - they did it anyway.",
			score: 0
		},
		research: {
			explanation:
				// https://www.theverge.com/2023/3/13/23638823/microsoft-ethics-society-team-responsible-ai-layoffs
				"Microsoft has published almost no safety research and recently laid off their 'ethics and society' team.",
			score: 1
		}
	},
	{
		name: 'Meta',
		acknowledge: {
			explanation:
				"Meta's chief scientist Yann LeCun is one of the most notories AI risk deniers, one of the loudest voices in the field. On Twitter he often resorts to ad hominem attacks and refuses to engage honestly.",
			score: 0
		},
		lobby: {
			explanation:
				"Meta doesn't seem to be as active lobbying politicians through backchannels as other companies. They are quite publicly calling for less regulation, though.",
			score: 3
		},
		deployment: {
			explanation:
				'Meta has leaked and released the weights of powerful AI models. They get some points for improving how much they worked on safety in their latest LLAMA 2 release.',
			score: 2
		},
		research: {
			explanation:
				'Meta has published almost no safety research. They have a few papers on adversarial examples, but nothing on existential risk.',
			score: 1
		}
	},
	{
		name: 'Anthropic',
		acknowledge: {
			explanation:
				'Anthropic has publicly acknowledged and brought attention to many AI risks, including the existential risk. Their CEO Dario Amodei has been one of the most vocal proponents of AI safety.',
			score: 9
		},
		lobby: {
			// https://pitchbook.com/news/articles/generative-AI-Capitol-Hill-VC
			explanation:
				"Anthropic has spent (a little) money lobbying, but it's unclear what they are pushing for.",
			score: 7
		},
		deployment: {
			explanation:
				'Anthropic was very optimistic about Claude 2 being "unjailbreakable", which was disproved in minutes after releasing the model.',
			score: 5
		},
		research: {
			explanation:
				'Anthropic has published very important advancements in AI safety research, especially in the field of interpretability.',
			score: 9
		}
	}
]

export const companies: Company[] = companiesSource
	.map((company) => {
		const { name, acknowledge, lobby, deployment, research } = company
		const totalScore = acknowledge.score + lobby.score + deployment.score + research.score
		return {
			name,
			acknowledge,
			lobby,
			deployment,
			research,
			totalScore
		}
	})
	.sort((a, b) => b.totalScore - a.totalScore)
