import { dev } from '$app/environment'
import { env } from '$env/dynamic/private'

export const title = 'PauseAI'
export const description =
	'Halt the development of AI models that are too dangerous to be deployed.'
export const url = dev ? 'http://localhost:5173' : 'https://pauseai.info'
export const openaiKey = env.OPENAI_KEY
