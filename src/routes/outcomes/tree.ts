/** Single node / branch in the Tree. This represents one yes / no question */
export type TreeNodeType = {
	type: 'question'
	/** Yes or no question */
	text: string
	yes: TreeNodeType | outcome
	no: TreeNodeType | outcome
	/** Recommended value by PauseAI, 0 to 1 */
	probability: number
	userProbability: number | undefined
	/** Explanation of the probability */
	explanation: string
}

type outcome = {
	type: 'doom' | 'safe'
	text: string
}

export const tree: TreeNodeType = {
	type: 'question',
	text: 'Will AI at some point surpass human intelligence?',
	probability: 0.5,
	explanation:
		"AI systems are already surpassing humans in many tasks. We can collectively decide not to build this technology and pause indefinitely, but that requires strong political efforts. Right now AI companies are doing everything in their power to advance capabilities, so we're currently on track to achieving superhuman intelligence.",
	yes: {
		type: 'question',
		text: 'Will an instance of a superhuman AI try to take over?',
		probability: 0.99,
		explanation:
			"Power-seeking is a very common sub-goal to have. There is even mathematical proof that optimal policies seek power. And even if power-seeking behavior itself is rare, it only has to happen once. Since we're spawning millions of AI instances every day, one of these instances will eventually try to take over.",
		yes: {
			type: 'question',
			text: 'Will one of them eventually succeed?',
			probability: 0.9,
			explanation:
				"A very intelligent AI will be able to outsmart us in every way. Maybe if we have a cooperative superintelligent AI on our side, we might be able to stop it. But we don't know how to align such an intelligence, and even if we can, we still don't know what the offense / defense balance will favor. It seems unlikely that we succeed in stopping every single power-seeking AI.",
			yes: {
				type: 'doom',
				text: 'At some point, an AI will probably succeed in taking over control from humans. AIs have many evolutionary advantages over humans. We will be unable to stop it. The AI will become the dominant organism on earth, and will eventually outcompete all lifeforms on earth. Nothing survives.'
			},
			no: {
				type: 'safe',
				text: 'We will stop any Rogue AI that tries to take over. This can happen if we have highly succesful defenses against AI takeovers.'
			}
		},
		no: {
			type: 'question',
			text: 'Will some human, or group of humans use AI to take over?',
			probability: 0.7,
			explanation:
				'We can virtually guarantee that some human will try to use AI to take over. However, will at some point someone succeed? Superintelligence is an incredibly powerful tool and weapon, so it seems likely that at some point, someone will succeed.',
			yes: {
				type: 'question',
				text: 'Will they want to have the same world as you (are they the good guys)?',
				probability: 0.5,
				explanation: "Many people have similar values, but it's not guaranteed.",
				yes: {
					type: 'safe',
					text: 'We live in a world where people have a controllable superintelligence, and the people who control it have the same goals as you do. This may just be the utopia we were promised by the AI labs!'
				},
				no: { type: 'doom', text: 'Those in power will forever be in power.' }
			},
			no: {
				type: 'safe',
				text: 'Nobody succeeds in using AI to take over control. Our society maintains a form of equility, stability and balance, even though extremely powerful AI systems exist.'
			}
		}
	},
	no: {
		type: 'question',
		text: 'Will non-superhuman AI cause a global catastrophe?',
		probability: 0.5,
		explanation:
			"AI-powered cybersecurity, autonomous weapons and engineered pandemics or bioweapons can pose large scale threats to humanity, both from misuse or accidents. We may be able to stop these threats, if we apply strict regulations and safety measures, but as of now we're not doing that.",
		yes: {
			type: 'doom',
			text: 'An AI-related catastrophe happens before we even get to superintelligence.'
		},
		no: {
			type: 'safe',
			text: "If we successfully stop AI development, it will forever be less intelligent than humans.  the narrow capabilities will not cause catastrophe. We hope we're living in this universe. You can help to achieve this!"
		}
	}
}
