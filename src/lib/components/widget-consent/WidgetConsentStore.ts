import { browser } from '$app/environment'
import { writable } from 'svelte/store'

const KEY = 'widget-consent'

const DEFAULT = 'null'
const initialValue = browser ? (localStorage.getItem(KEY) ?? DEFAULT) : DEFAULT
const consent = writable<boolean | null>(JSON.parse(initialValue))

consent.subscribe((value) => {
	if (!browser) return
	localStorage.setItem(KEY, JSON.stringify(value))
})

export default consent
