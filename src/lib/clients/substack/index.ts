import axios, { Axios } from 'axios'
import type Post from './types/posts'

export default class SubstackClient {
	private baseUrl: string
	private client: Axios

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl
		this.client = axios.create({
			baseURL: this.baseUrl
		})
	}

	async posts(params: { limit: number; offset: number }): Promise<Post[]> {
		const res = await this.client.get<Post[]>('/posts', { params })
		return res.data
	}
}
