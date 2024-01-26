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
				'OpenAI has publicly called for stricter regulation, but also tried to severely weaken how the EU AI Act regulates frontier models. Sam Altman went on a world tour where he emphasized the need for an international agency to regulate large training runs.',
			score: 4
		},
		deployment: {
			explanation:
				'OpenAI releasing ChatGPT to the public was an absolute shockwave. However, GPT-4 was released 7 months after it finished training, during which they did a lot of safety work like red-teaming by ARC.',
			score: 6
		},
		research: {
			explanation:
				'OpenAI has published a lot of impactful AI safety research and has dedicated a substantial amount of resources to their "superalignement" project.',
			score: 7
		}
	},
	{
		name: 'Google DeepMind',
		acknowledge: {
			explanation:
				// Hassabis calls for "Cern for AI Safety" https://www.theguardian.com/technology/2023/oct/24/ai-risk-climate-crisis-google-deepmind-chief-demis-hassabis-regulation
				"Hassabis has publicly acknowledged the existential risk from AI. They weren't as explicit about this as OpenAI.",
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
				// Satya isn't that worried about election interference: https://www.verdict.co.uk/microsoft-ceo-satya-nadella-is-sanguine-about-ai-risk-to-elections/?cf-view
				// Xrisk not true: https://www.euronews.com/my-europe/2023/06/29/microsoft-chief-says-ai-is-not-an-existential-risk-to-mankind-but-human-oversight-needed
				// Does acknowledge biases, job displacement: https://www.verdict.co.uk/microsoft-ceo-satya-nadella-is-sanguine-about-ai-risk-to-elections/?cf-view
				'Satya Nadella does not acknowledge the existential risk from AI, nor does he seem worried about election interference.',
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
				// Never released open source models.
				"Microsoft released an unfinished, sometimes even unhinged Bing (based on OpenAI's GPT-4) in April 2023. It was embarrassing and dangerous. OpenAI urged Microsoft not to do this - they did it anyway.",
			score: 4
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
				"Meta's chief scientist Yann LeCun is one of the most notorious AI risk deniers, one of the loudest voices in the field. On Twitter he often resorts to ad hominem attacks and refuses to engage honestly.",
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
				'Anthropic seems to have a policy of not deploying SOTA models. Anthropic sat on Claude - and waited with deploying it until ChatGPT came out. However, Anthropic was very optimistic about Claude 2 being "unjailbreakable", which was disproved in minutes after releasing the model.',
			score: 7
		},
		research: {
			explanation:
				'Anthropic has published very important advancements in AI safety research, especially in the field of interpretability.',
			score: 9
		}
	},
	{
		name: 'Inflection',
		acknowledge: {
			// https://forum.effectivealtruism.org/posts/JsjQRqvRc5pFmeSoj/what-do-we-know-about-mustafa-suleyman-s-position-on-ai
			// Calls existential risk a "completely bonkers distraction"
			explanation:
				'Their CEO Mustafa Suleyman has written extensively about many AI risks in his book. However, he calls existential risks a "completely bonkers distraction".',
			score: 5
		},
		lobby: {
			explanation: 'No lobbying as far as we know of yet.',
			score: 7
		},
		deployment: {
			explanation: 'Not sure tbd',
			score: 4
		},
		research: {
			explanation: 'No AI safety research published by Inflection.',
			score: 0
		}
	},
	{
		name: 'Mistral',
		acknowledge: {
			// Thinks bio risks are hypothetical, not to be concerned about : https://youtu.be/EMOFRDOMIiU?si=yN2xDshaaEMfr9mQ&t=1186
			// Say guardrails on both output and input side are needed.
			// Says users should be responsible for safety.
			// Says x-risk is "philosophical", we're not at that stage, it's very abstract. https://youtu.be/EMOFRDOMIiU?si=Zk0EUuRv90iIaFeX&t=1572
			explanation: 'They have not yet publicly acknowledged any AI risks. ',
			score: 3
		},
		lobby: {
			explanation:
				'Used an ex-minister to actively lobby against the EU AI Act, almost causing it to not include frontier model regulations.',
			score: 0
		},
		deployment: {
			explanation: 'They released their models without any safety work as torrents.',
			score: 0
		},
		research: {
			explanation: 'No AI safety research published by Mystral.',
			score: 0
		}
	}
]

export const companies: Company[] = companiesSource
	.map((company) => {
		const { name, acknowledge, lobby, deployment, research } = company
		const totalScore = (acknowledge.score + lobby.score + deployment.score + research.score) / 4
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
