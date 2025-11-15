import { dev } from '$app/environment'

export const title = 'PauseAI'
export const description =
	'Halt the development of AI models that are too dangerous to be deployed.'
export const url = dev ? 'http://localhost:37572' : 'https://pauseai.info'
export const botName = 'RogueGPT'
export const verificationParameter = 'verificationKey'
export const defaultTitle = 'Volunteer'
