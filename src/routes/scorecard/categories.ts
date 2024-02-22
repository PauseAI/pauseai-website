import type { Category } from './types'

export const categories: Category[] = [
	{
		name: 'Acknowledge',
		key: 'acknowledge',
		explanation:
			// 10: Pushing the conversation forward, making it more mainstream
			// 8: Has devoted substatial resources to public communication of AI risks
			// 7: Has made an attemt to communicate concerns to the public
			// 6: Has acknowledged xrisk, but no attempt to highlight these concerns
			// 5: E.g.no acknowledgement of risks, but also no denial.
			// 4: Active downlplaying of concerns, but in reasonable way
			// 3: Minimization of risk, dismissal, but not explicitly denying or attempt to move the conversation
			// 0: Actively denying the risks of AI, not discussing in good faith, attacking advocates on a personal level
			// How likely are they saying the risks are to happen?
			'How well does the company acknowledge the risks of AI? Do they acknowledge all the risks? How long did it take them to acknowledge the risks?'
	},
	{
		name: 'Lobby',
		key: 'lobby',
		// 10: Actively introducing draft legislations / concrete proposals that harm their internal business model but that are good for AI safety
		// 5: No lobbying, no attempt to influence regulation in any direction
		// 1: Using personal connections, money or financial incentives to influence regulation in a way that is very harmful to AI safety.
		// 0: Criminal lobbying, using illegal means to prevent meaningful AI safety regulation.
		explanation:
			'How much does the company lobby for AI regulation? Do they lobby for deregulation or for stricter regulation?'
	},
	{
		name: 'Deployment',
		key: 'deployment',
		explanation:
			// What principles drive your decisions about what (not) to deploy?
			// To what degree do you control access to your technology?
			// And do you monitor usage?
			// Are you willing to introduce new capabilities that others have not?
			// What are you open sourcing?
			// What are your plans
			// 0: Releases model weights of frontier models regardless of the risks.
			// 2: Releases frontier model weights, but only after testing for safety.
			// 3: Open model weights for models that are behind the state of the art, where comparable models have demonstrated to be (catastrophically) safe.
			// 5: No open source,
			'How long does the company wait before deploying a new model? Do they wait until they have a good understanding of the risks of the model? Are their models tested thoroughly?'
	},
	{
		name: 'Research',
		key: 'research',
		explanation:
			// 10:
			// 5:
			// 0:
			'Is the company doing research on AI safety or alignment? Are they doing research on how to mitigate the risks of AI?'
	}
	// Frontier column
	// Are you pushing capabilities forward or are you following others to provide services?
	// This is where OpenAI scores 0 points.
	// To what extent do their future plans advance the state of the art?

	// Culture column
	// To what extent do you have a culture of safety?
	// Do the employees have a good understanding of the risks of AI?
]
