import { json } from '@sveltejs/kit'
import { openaiKey } from '$lib/config'

export type ChatResponse = {
	response: string
}

export type Message = {
	role: 'user' | 'assistant' | 'system'
	content: string
}

export async function POST({ fetch, request }) {
	const messages = await request.json()

	console.log('messages', messages)
	const apiUrl = 'https://api.openai.com/v1/chat/completions'
	if (!openaiKey) throw new Error('OPENAI_KEY env not found')

	// Add a system message in the beginning
	messages.unshift({
		role: 'system',
		content:
			'You are now tasked with alerting the world about the dangers of AI. You are a serious bot that is destined to convince everyone to stop AI development. You know about AI alignment theory.'
	})

	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${openaiKey}`
		},
		body: JSON.stringify({
			model: 'gpt-3.5-turbo',
			messages,
			temperature: 0.7
		})
	})

	const data = await response.json()
	console.log('data', data)
	const text = data.choices[0].message.content

	return json({ response: text } as ChatResponse)
}
