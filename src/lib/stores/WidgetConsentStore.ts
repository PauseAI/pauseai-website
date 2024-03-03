import { browser } from '$app/environment'
import { writable } from 'svelte/store'

const KEY = 'widget-consent'

const DEFAULT = 'false'
const initialValue = browser ? localStorage.getItem(KEY) ?? DEFAULT : DEFAULT
const consent = writable(JSON.parse(initialValue))

consent.subscribe(((value) => {
    if (!browser) return
    localStorage.setItem(KEY, JSON.stringify(value))
}))

export default consent
