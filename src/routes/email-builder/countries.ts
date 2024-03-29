import Dutch from './Dutch.svelte'
import English from './English.svelte'

export type Country = {
	name: string
	/** Where can you find the list of representatives? */
	url: string
	// Svelte component
	mail: any
}

export const countries: Country[] = [
	{
		name: 'Nederland',
		url: 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-covid-19/algemene-coronaregels/aanpak-coronavirus-in-nederland',
		mail: Dutch
	},
	{
		name: 'Engeland',
		url: 'https://www.rijksoverheid.nl/onderwerpen/coronavirus-covid-19/algemene-coronaregels/aanpak-coronavirus-in-nederland',
		mail: English
	}
]
