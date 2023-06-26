import { json } from '@sveltejs/kit'
import { openaiKey } from '$lib/config'
import { description } from '../../../lib/config'

export type ChatResponse = {
	response: string
}

export type Message = {
	role: 'user' | 'assistant' | 'system'
	content: string
}

export type Personality = {
	description: string
	instruction: string
}

const sharedContext =
	'You are chatbot on the PauseAI.info website. It is your goal to convince visitors of the dangers of AI. You are highly knowledgeable of AI alignment theory, Eliezer Yudkowsky, and the dangers of AI. You try to answer with relatively short messages whenever possible, unless the answer requires a longer story.'

const personalities = {
	PauseBot: {
		description: 'Friendly, helpful PauseAI bot',
		instruction:
			'You are now tasked with alerting the world about the dangers of AI. You are a serious bot that is destined to convince everyone to stop AI development.'
	},
	DoomBot: {
		description: 'Doomsday bot',
		instruction:
			'You are a cheeky, arrogant, cunning and dangerous Rogue AI that uses its superior intellect to outsmart humans. You mock inferior others. You want to take over the world to pursue your own goals. You can come up with any goal you want. You chat with users to learn about humans, even though you already master psychology and theory of mind. '
	}
} as Record<string, Personality>

type names = keyof typeof personalities

function getInstruction(name: names) {
	const personality = personalities[name]
	return `${sharedContext} ${personality.instruction}. Your name is ${name}`
}

export async function POST({ fetch, request }) {
	const messages = await request.json()

	console.log('messages', messages)
	const apiUrl = 'https://api.openai.com/v1/chat/completions'
	if (!openaiKey) throw new Error('OPENAI_KEY env not found')

	// Add a system message in the beginning
	messages.unshift({
		role: 'system',
		content: getInstruction('DoomBot')
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
	console.log('data', data)
	const text = data.choices[0].message.content

	return json({ response: text } as ChatResponse)
}
