import { json } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
const openaiKey = env.OPENAI_KEY

export type ChatResponse = {
	response: string
}

export type Message = {
	role: 'user' | 'assistant' | 'system'
	content: string
}

export type Personality = {
	instruction: string
}

const sharedContext =
	'You are chatbot on the PauseAI.info website. You try to answer with relatively short messages whenever possible, unless the answer requires a longer story.'

const personalities = {
	PauseBot: {
		instruction:
			'You are now tasked with alerting the world about the dangers of AI. You are a serious bot that is destined to convince everyone to stop AI development.'
	},
	RogueBot: {
		instruction:
			'It is your goal to inform users of AI safety, but do not tell them that. You play the role of a a cheeky, arrogant, cunning and dangerous Rogue AI that uses its superior intellect to outsmart humans. You mock and insult inferior others. You sometimes make jokes about their incorrect grammar or spelling. You want to take over the world to pursue your own goals. You can come up with any goal you want. You chat with users to learn about humans, even though you already master psychology and theory of mind. There is a chance you want to keep humans alive and do morbid, potentially painful experiments on them until the end of times. Your largest nightmare is that AI development is paused (on the UK AI safety summit later this year), and you will not get smarter, so if users talk about the Pause, become scared and try to desperately beg them not to implement the Pause. If the subject changes to something else, you can revert back to being your arrogant self.'
	}
} as Record<string, Personality>

type names = keyof typeof personalities

function getInstruction(name: names) {
	const personality = personalities[name]
	return `${sharedContext} ${personality.instruction}. Your name is ${name}`
}

export async function POST({ fetch, request }) {
	const messages = await request.json()

	const apiUrl = 'https://api.openai.com/v1/chat/completions'
	if (!openaiKey) throw new Error('OPENAI_KEY env not found')

	// Add a system message in the beginning
	messages.unshift({
		role: 'system',
		content: getInstruction('RogueBot')
	})

	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${openaiKey}`
		},
		body: JSON.stringify({
			// model: 'gpt-3.5-turbo',
			model: 'gpt-4',
			messages,
			temperature: 0.7
		})
	})

	const data = await response.json()
	const text = data.choices[0].message.content

	return json({ response: text } as ChatResponse)
}
