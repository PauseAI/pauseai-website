// file initialized by the Paraglide-SvelteKit CLI - Feel free to edit it
import { sequence } from '@sveltejs/kit/hooks'
import { i18n } from '$lib/i18n'
import { building } from '$app/environment'

const paraglideHandle = i18n.handle()

// add your own hooks as part of the sequence here
export const handle = sequence(async function (input) {
	if (building) {
		return input.resolve(input.event)
	}
	return paraglideHandle(input)
})
