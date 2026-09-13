import type { EmailBlock, EmailContent } from './blocks.js'
import { GLOBAL_DISCORD_URL, GLOBAL_SOCIALS, VIDEO_URL, WELCOME_CALLS_URL } from './brand.js'
import type {
	ChapterBlockData,
	ChapterLink,
	IntentGroup,
	OnboardingEmailLanguage
} from './types.js'

// Chapters that send their own email instead of the shared copy. An override supplies the
// subject, greeting, body and sign-off; composeBlocks() still adds the fixed lines, in the
// override's language, so the override cannot leave out the confirm link or what we promise
// to send. Written by us from the chapter's own text and reviewed by the chapter. Changes
// are expected to be rare: chapters editing their own text is planned for the CRM.

type ChapterOverride = {
	/** For the preview page. */
	name: string
	language: OnboardingEmailLanguage
	/** One version for everyone, or one per group. A group left out gets the shared copy.
	 *  `chapter` is the live National Groups row, so an override can use the chapter's own
	 *  links rather than repeating them here. */
	content: Partial<Record<IntentGroup, ChapterContent>>
}

type ChapterContent = (firstName: string, chapter: ChapterBlockData | null) => EmailContent

export type ResolvedOverride = {
	name: string
	language: OnboardingEmailLanguage
	content: ChapterContent
}

/** A link from the chapter's Airtable row, by the label chapter.ts gives it. */
function chapterLink(chapter: ChapterBlockData | null, label: string): string | null {
	return chapter?.links.find((link) => link.label === label)?.url ?? null
}

// Both UK emails are ported from the live PauseAI UK templates. The booking call is the only
// UK link with no National Groups field to hold it; the WhatsApp community and the events
// calendar come from the chapter's row.
const UK_INTRO_CALL = 'https://calendar.app.google/w5t7EgCFwCGKcnAS7'

const UK_SOCIALS: ChapterLink[] = [
	{ label: 'YouTube', url: 'https://www.youtube.com/@PauseAI-UK' },
	{ label: 'Discord', url: 'https://discord.gg/2XXWXvErfA' },
	{ label: 'Instagram', url: 'https://www.instagram.com/pauseai_uk' },
	{ label: 'X', url: 'https://x.com/pauseai_uk' },
	{ label: 'Bluesky', url: 'https://bsky.app/profile/pauseai.bsky.social' },
	{ label: 'TikTok', url: 'https://www.tiktok.com/@pauseai_uk' },
	{ label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61587358827177' }
]

/** The UK's WhatsApp sentences, dropped when the chapter's row has no WhatsApp link. */
function whatsappLine(
	chapter: ChapterBlockData | null,
	sentence: (whatsapp: string) => string
): EmailBlock[] {
	const whatsapp = chapterLink(chapter, 'WhatsApp')
	return whatsapp ? [{ type: 'paragraph', text: sentence(whatsapp) }] : []
}

/** "Join the community" step, naming whichever of the two links the row has. */
function ukCommunityStep(chapter: ChapterBlockData | null): string {
	const whatsapp = chapterLink(chapter, 'WhatsApp')
	const calendar = chapterLink(chapter, 'Events')
	const parts = [
		whatsapp && `Join the [PauseAI UK WhatsApp community](${whatsapp})`,
		calendar && `subscribe to our [UK events calendar](${calendar})`
	].filter(Boolean)
	return parts.length ? `${parts.join(' and ')}.` : ''
}

const uk: ChapterOverride = {
	name: 'PauseAI UK',
	language: 'en',
	content: {
		// From version 1 of jy7zpl97rdrg5vx6, which runs a MailerSend split test: version 2 is
		// the short note below, so UK volunteers currently get one or the other at random. The
		// composed path sends one email, so this reproduces version 1 until PauseAI UK says which
		// of the two they want.
		volunteer: (firstName, chapter) => ({
			subject: `Welcome to PauseAI UK ${firstName}!`,
			greeting: [
				{ type: 'heading', level: 1, text: `Welcome to PauseAI UK, ${firstName}.` },
				{
					type: 'paragraph',
					text: "**Let's work together to stop the development of dangerous AI**"
				}
			],
			body: [
				{
					type: 'paragraph',
					text: "We're thrilled to have you join our growing volunteer network. We are committed to ensuring that artificial intelligence is developed slowly and safely in a way that benefits all of humanity. And that it isn't left to the whims of companies in a reckless race to build AI that can replace humans. Watch our video below for a summary of the Pause position:"
				},
				{ type: 'button', text: 'Video Introduction', url: VIDEO_URL },
				{ type: 'heading', text: 'Connect With Your Community' },
				...whatsappLine(
					chapter,
					(whatsapp) =>
						`Join the [PauseAI UK WhatsApp community](${whatsapp}) to keep up with our events.`
				),
				{
					type: 'paragraph',
					text: `You can also join the PauseAI Global [Discord server](${GLOBAL_DISCORD_URL}) to meet the international PauseAI community.`
				},
				{ type: 'heading', text: 'Next steps' },
				{
					type: 'paragraph',
					text: `Please [book a 10 minute call](${UK_INTRO_CALL}) with Joseph, the Director of PauseAI UK, so he can say hi and introduce you to the community. Or reply to this email if you have a question.`
				},
				...whatsappLine(
					chapter,
					(whatsapp) => `New events will be announced in the [WhatsApp community](${whatsapp}).`
				)
			],
			signoff: [
				{
					type: 'paragraph',
					text: 'Welcome aboard! At PauseAI, we believe in the power of collective action. Together, we can take action to prevent the catastrophic impacts of the development of Artificial Intelligence.'
				},
				{
					type: 'signoff',
					lines: [
						'Best wishes,',
						'[Joseph](mailto:joseph@pauseai.info) and [Matilda](mailto:matilda@pauseai.info), The PauseAI UK Team'
					]
				}
			],
			socials: UK_SOCIALS
		}),
		// From zr6ke4nyyomgon12, minus its first step, which was the confirm link.
		'non-volunteer': (firstName, chapter) => ({
			subject: `Welcome to PauseAI UK ${firstName}!`,
			htmlStyle: 'plain',
			greeting: [
				{ type: 'paragraph', text: `Hey ${firstName},` },
				{ type: 'paragraph', text: 'Welcome to our community!' }
			],
			body: [
				{ type: 'paragraph', text: "Here's how you can get involved in PauseAI UK:" },
				{
					type: 'list',
					ordered: true,
					items: [
						ukCommunityStep(chapter),
						`If you'd like, [book a short call](${UK_INTRO_CALL}) with Joseph, PauseAI UK's director, so he can say hi and introduce you to the community.`
					].filter((item) => item.length > 0)
				}
			],
			signoff: [
				{
					type: 'signoff',
					lines: [
						'Looking forward to meeting you,',
						'[Joseph](mailto:joseph@pauseai.uk) and [Matilda](mailto:matilda@pauseai.uk), the PauseAI UK Team'
					]
				},
				{ type: 'paragraph', text: 'PS: if you have questions, just hit reply.' }
			]
		})
	}
}

// From the live PauseAI Canada volunteer template (x2p0347j3r94zdrn), confirmed current.
// Canada has no email of its own for non-volunteers, who get the shared copy, as today.
// The Montréal call is the only Canadian link with no field of its own; the national call
// and the chapter's site come from the row.
const CANADA_MONTREAL_CALL = 'https://luma.com/pauseaimtl'

/** The call times, dropped when the row has lost the national calendar. */
function canadianCalls(chapter: ChapterBlockData | null): EmailBlock[] {
	const national = chapterLink(chapter, 'Events')
	if (!national) return []
	return [
		{
			type: 'paragraph',
			text: `We have a monthly video call at 9pm ET / 8pm CT / 6pm PT on the second Wednesday. [Register here](${national}) (Canada). If you are in Montréal, [register for the Montréal call](${CANADA_MONTREAL_CALL}) (every third Wednesday at 7pm).`
		}
	]
}

const canada: ChapterOverride = {
	name: 'PauseAI Canada',
	language: 'en',
	content: {
		volunteer: (firstName, chapter) => ({
			subject: `Welcome to PauseAI Canada ${firstName}!`,
			greeting: [
				{ type: 'heading', level: 1, text: `Welcome to PauseAI Canada ${firstName}` },
				{
					type: 'paragraph',
					text: "**Let's Work Together to Stop the Development of Dangerous AI**"
				}
			],
			body: [
				{ type: 'paragraph', text: 'Thank you for registering with PauseAI Canada!' },
				{
					type: 'paragraph',
					text: "PauseAI is an international, decentralized, grassroots movement, dedicated to pausing frontier AI development until we can prove it's safe and keep it under democratic control."
				},
				{
					type: 'paragraph',
					text: `You can find out more about PauseAI Canada [here](${chapterLink(chapter, 'Website') ?? 'https://pauseai.ca/en/'}) and PauseAI Global [here](https://pauseai.info/). Watch the video below for a summary of the Pause position:`
				},
				{ type: 'button', text: 'Video Introduction', url: VIDEO_URL },
				{ type: 'heading', text: 'First Steps to Get Involved:' },
				{ type: 'paragraph', text: '**1. Connect With Your Community**' },
				{
					type: 'paragraph',
					text: "PauseAI Canada was founded in May of 2025 so we're still quite a young organization, but we're growing and eagerly seeking individuals who want to get involved. Although we don't yet have this for the PauseAI Canada website, the Global site does have a page that can guide you through ways to get involved."
				},
				...canadianCalls(chapter),
				{ type: 'paragraph', text: '**2. Sign Our Digital Public Statement**' },
				{
					type: 'paragraph',
					text: "Haven't signed yet? [This statement](https://pauseai.info/statement) sums up what PauseAI Global is advocating for. Sign it to take your first step pushing for the responsible development of artificial intelligence."
				},
				{ type: 'heading', text: 'How We Create Change' },
				{ type: 'paragraph', text: 'At PauseAI, we believe in the power of collective action.' },
				{
					type: 'paragraph',
					text: 'By coming together as concerned citizens to protest, persuade the public, and write to our decision-makers we can influence the necessary change to advocate for a pause on the most advanced AI development.'
				},
				{ type: 'paragraph', text: "As a volunteer, you'll have opportunities to participate in:" },
				{
					type: 'list',
					items: [
						'Online actions (petitions, social media campaigns, letter-writing to officials)',
						'Offline activities (local protests, community meetings, awareness events)',
						'Local chapter initiatives.'
					]
				},
				{
					type: 'paragraph',
					text: 'Your participation, whether big or small, matters greatly in our collective effort to ensure AI development proceeds safely and ethically.'
				},
				{ type: 'heading', text: "What's Next" },
				{
					type: 'paragraph',
					text: "After meeting with the community via our Welcome meetings or through your National Chapter, you'll be informed of the next action, but if you're looking for a step to take right now, check out our [Action page](https://pauseai.info/action)."
				}
			],
			signoff: [
				{
					type: 'paragraph',
					text: 'Welcome aboard! Together, we can take action to prevent the catastrophic impacts of the development of Artificial Intelligence.'
				},
				{
					type: 'signoff',
					lines: [
						"We're glad to have you on board!",
						'Jeremy Eliosoff',
						'National Leader',
						'PauseAI Canada'
					]
				}
			],
			socials: GLOBAL_SOCIALS
		})
	}
}

// Adapted from the welcome email PauseAI Sverige's chapter lead sends by hand, with the
// fixed lines added in Swedish. The wording is the chapter lead's own. Its links come from
// the chapter's Airtable row where a field exists, so keeping them current is an Airtable
// edit, and a sentence is dropped when its link is missing rather than shipping a dead one.
//
// The chapter's own words. The two lines the skeleton adds around them are our Swedish and
// nobody fluent has read them yet, which beats the alternative for these readers: the
// English email. Flip this back if the chapter would rather it waited.
const SWEDISH_COPY_APPROVED = true

// The two links the chapter's email uses that no National Groups field holds: an external
// petition, and the action page rather than the site root the `website` field points at.
const SWEDEN_PETITION = 'https://www.mittskifte.org/petitions/ta-riskerna-med-ai-pa-allvar'
const SWEDEN_ACTION_PAGE = 'https://pauseai.se/action'

const swedenContent: ChapterContent = (firstName, chapter) => {
	const calendar = chapterLink(chapter, 'Events')
	const whatsapp = chapterLink(chapter, 'WhatsApp')
	const facebook = chapterLink(chapter, 'Facebook')

	const body: EmailBlock[] = []
	if (calendar) {
		body.push({
			type: 'paragraph',
			text: `I [vår kalender](${calendar}) kan du hitta nästa intromöte.`
		})
	}
	const channels = [
		whatsapp && `Övrig kommunikation sker främst via [WhatsApp](${whatsapp}).`,
		facebook && `Vi har även en [Facebook-grupp](${facebook}).`
	].filter(Boolean)
	if (channels.length) body.push({ type: 'paragraph', text: channels.join(' ') })
	body.push({
		type: 'paragraph',
		text: `Skriv gärna på [vår namninsamling](${SWEDEN_PETITION}) och kika på [vår hemsida](${SWEDEN_ACTION_PAGE}) för att få fler tips på vad du kan göra.`
	})
	// A chapter's own email replaces the shared next steps, so its readers hear about PauseAI
	// Global only if the chapter says so. Theirs to keep or drop, like the rest of this copy.
	body.push({
		type: 'paragraph',
		text: `Du är också välkommen till PauseAI Globals [välkomstmöten](${WELCOME_CALLS_URL}) för nya volontärer och till deras [Discord-server](${GLOBAL_DISCORD_URL}). Båda är på engelska.`
	})

	return {
		subject: `Välkommen till PauseAI Sverige, ${firstName}!`,
		greeting: [
			{ type: 'heading', level: 1, text: `Hej ${firstName} och välkommen till PauseAI Sverige!` }
		],
		body,
		signoff: [{ type: 'signoff', lines: ['Mvh', 'Carl, PauseAI Sverige'] }]
	}
}

const sweden: ChapterOverride = {
	name: 'PauseAI Sverige',
	language: 'sv',
	content: { volunteer: swedenContent, 'non-volunteer': swedenContent }
}

/** The override for a Members `country` value and group, or null for the shared copy.
 *  Countries are matched as the live script matches them, with `includes`. */
export function getChapterOverride(
	country: string | undefined,
	group: IntentGroup
): ResolvedOverride | null {
	const override = country?.includes('United Kingdom')
		? uk
		: country?.includes('Canada')
			? canada
			: country?.includes('Sweden') && SWEDISH_COPY_APPROVED
				? sweden
				: null
	const content = override?.content[group]
	return override && content ? { name: override.name, language: override.language, content } : null
}

/** How a country's own email is described in the preview picker, or null when it gets the
 *  shared copy. */
export function describeChapterOverride(country: string): string | null {
	const volunteer = getChapterOverride(country, 'volunteer')
	const nonVolunteer = getChapterOverride(country, 'non-volunteer')
	if (volunteer && nonVolunteer) return 'own email'
	if (volunteer) return 'own email for volunteers'
	if (nonVolunteer) return 'own email for non-volunteers'
	return null
}
