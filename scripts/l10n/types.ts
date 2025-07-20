import type { AxiosResponse } from 'axios'

export type Completion = {
	choices: {
		message: {
			content: string
		}
	}[]
}

export type CompletionPayload = {
	messages: Message[]
	temperature?: number
	model?: string
	provider?: {
		order: string[]
	}
}

export type CompletionResponse = AxiosResponse<Completion, CompletionPayload>

export type Message = {
	role: 'system' | 'user' | 'assistant'
	content: string
}

export type PartialCompletionPayload = Omit<CompletionPayload, 'model' | 'provider'>
