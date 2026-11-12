import { dev } from '$app/env';

export const title = 'PauseAI'
export const description =
	'Halt the development of AI models that are too dangerous to be deployed.'
export const url = dev ? 'http://localhost:37572' : 'https://pauseai.info'
export const botName = 'RogueGPT'
export const verificationParameter = 'verificationKey'
/** Sent by /verify once someone has clicked to confirm a link that needs it. */
export const verificationConfirmedParameter = 'confirmed';

export const defaultTitle = 'Volunteer';
export const layoutWidth = '768px'; /** 40rem in px, required for "sizes" attribute **/

/**
 * Whether a /verify link only takes effect after a click. Statement links publish a name,
 * and carry no token or expiry, so a mail scanner opening one must not be enough. Member
 * links only tick a box the row's owner can see, and are checked server-side, so they
 * confirm on load as they always have.
 */
export const verificationNeedsClick = (linkParameters: string | URLSearchParams) =>
	new URLSearchParams(linkParameters).get('table') === 'statement'
