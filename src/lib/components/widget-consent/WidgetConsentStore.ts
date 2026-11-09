import { getItem, setItem } from '$lib/localStorage'
import { writable } from 'svelte/store'

const KEY = 'widget-consent'

const DEFAULT = 'null'
const initialValue = getItem(KEY) ?? DEFAULT
const consent = writable<boolean | null>(JSON.parse(initialValue) as boolean | null)

consent.subscribe((value) => {
	setItem(KEY, JSON.stringify(value))
})

export default consent
