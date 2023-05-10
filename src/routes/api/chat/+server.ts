import { json } from '@sveltejs/kit'

export async function GET({ fetch }) {
	const prompt = 'Hello, OpenAI!'
	const apiKey = 'YOUR_API_KEY_HERE'
	const apiUrl = 'https://api.openai.com/v1/engines/davinci-codex/completions'

	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			prompt: prompt,
			max_tokens: 50,
			n: 1,
			stop: '\n',
			temperature: 0.7
		})
	})

	const data = await response.json()
	const text = data.choices[0].text.trim()

	return json({ response: text })
}
