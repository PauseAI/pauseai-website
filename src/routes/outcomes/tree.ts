/** Single node / branch in the Tree. This represents one yes / no question */
export type TreeNodeType = {
	type: 'question'
	/** Yes or no question */
	text: string
	yes: TreeNodeType | outcome
	no: TreeNodeType | outcome
	/** Recommended value by PauseAI, 0 to 1 */
	probability: number
	/** Explanation of the probability */
	explanation: string
}

type outcome = {
	type: 'doom' | 'safe'
	text: string
}

const doomer_hope_str = "Luckily, you've just learn this, as if it were a message from the future! And you are still on time to make a Pause happen. Good luck John Connor, the future is not set."
const optimist_help_str = "Even if you think we'll probably not experience an AI catastrophe, it would be better to have more time, help us make sure of it."

const humanTakeOver: TreeNodeType = {
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
			text: 'In this world, AI is used to take over and the people who control it have the same goals as you do. This may just be the utopia we were promised by the AI labs!' + optimist_help_str
		},
		no: {
			type: 'doom',
			text: 'A group of humans successfully used AI to take over and can remain in power indefinitely. This group does not share your values, so some inescapable dystopia becomes reality.' + doomer_hope_str
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
			text: 'Even though we managed to escape AI doom by takeovers, we got an AI-related catastrophe.' + doomer_hope_str
		},
		no: {
			type: 'safe',
			text: 'Even though extremely powerful AI systems exist, AIs never go rogue, nobody succeeds in using AI to take over control and AI never causes large-scale catastrophes. We hope this is the universe we live in, but it seems like wishful thinking.' + optimist_help_str
		}
	}
}

export const tree: TreeNodeType = {
	type: 'question',
	text: "Will we continue to build AI without pausing?",
	probability: 0.5,
	explanation:
		"AI systems are already surpassing most humans in many tasks. We can collectively decide to stop building this technology, but AI companies are doing everything in their power to advance capabilities. \n\n We're currently on track to achieving superhuman intelligence.",
	yes: {
		type: 'question',
		text: 'Will one of these AIs try to take control?',
		probability: 0.95,
		explanation:
			"We already have examples of AIs that explicitly tried to take over (e.g. ChaosGPT), but none of them were smart enough to get far. Even for goals that sound normal (such as 'cure cancer' or 'calculate pi'), power-seeking is often a very reasonable sub-goal to have. There is even mathematical proof that optimal policies seek power. And even if power-seeking behavior itself is rare, it only has to happen once.  We're spawning millions of AI instances every day, one of these instances will eventually try to maximize its power. So we are quite certain that this will happen.",
		yes: {
			type: 'question',
			text: 'Will one of them eventually succeed?',
			probability: 0.9,
			explanation:
				"A very intelligent AI will be able to outsmart us in every way. Maybe if we have a cooperative, aligned, superintelligent AI on our side, we might be able to stop it. But we don't know how to build aligned AI, and even if we can, we still don't know what the offense / defense balance will favor. It seems unlikely that we can stop every single power-seeking AI, so we expect one AI to succeed in taking control.",
			yes: {
				type: 'question',
				text: 'Will the AI care about keeping humans alive?',
				probability: 0.01,
				explanation:
					"While it is theoretically possible to have an AI that cares about humans, we have no idea how to build one. And even if we did, we don't even agree on what type of world we'd want it to create. When an AI concludes that it needs to take over, we can expect that AI to care about self-preservation, power, and acquiring resources, but not necessarily about humans in any way.",
				yes: {
					type: 'question',
					text: 'Will the AI care about human well-being?',
					probability: 0.9,
					explanation:
						"While it is unlikely that the AI cares about humans at all, there's a good chance that if it cares about humans, it also cares about our well-being.",
					yes: {
						type: 'safe',
						text: 'The AI has taken control away from humans, but still deeply cares about human well-being. A weird utopia, but a utopia nonetheless.' + optimist_help_str
					},
					no: {
						type: 'doom',
						text: "We're ending up with an AI that does want to keep humans alive, but does not want make us happy. We can be used as slaves, to experiment on, or even to torture. Forever." + doomer_hope_str
					}
				},
				no: {
					type: 'doom',
					text: 'At some point, an AI will probably succeed in taking over control from humans. AIs have many evolutionary advantages over humans. We will be unable to stop it. The AI will become the dominant organism on earth, and will eventually outcompete all lifeforms on earth. Nothing survives.' + doomer_hope_str
				}
			},
			no: humanTakeOver
		},
		no: humanTakeOver
	},
	no: {
		type: 'safe',
		text: "If we successfully prevent dangerous AI from being developed we can prevent AI catastrophes. We hope we're living in this universe. You can help achieve this!"
	}
}
