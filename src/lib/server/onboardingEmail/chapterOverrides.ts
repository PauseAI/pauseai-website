import type { EmailBlock, EmailContent } from './blocks.js'
import { GLOBAL_DISCORD_URL, GLOBAL_SOCIALS, VIDEO_URL, WELCOME_CALLS_URL } from './brand.js'
import type {
	ChapterBlockData,
	ChapterLink,
	IntentBucket,
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
	/** A version per intent bucket. A bucket left out gets the shared copy.
	 *  `chapter` is the live National Groups row, so an override can use the chapter's own
	 *  links rather than repeating them here. */
	content: Partial<Record<IntentBucket, ChapterContent>>
}

type ChapterContent = (firstName: string, chapter: ChapterBlockData | null) => EmailContent

export type ChapterOverrideSummary = {
	name: string
	/** Who in that country gets the chapter's own email rather than the shared copy. */
	scope: IntentBucket[] | 'all'
}

export type ResolvedOverride = {
	name: string
	language: OnboardingEmailLanguage
	content: ChapterContent
}

/** A link from the chapter's Airtable row, by the label chapter.ts gives it. */
function chapterLink(chapter: ChapterBlockData | null, label: string): string | null {
	return chapter?.links.find((link) => link.label === label)?.url ?? null
}

// Both UK emails are ported from the welcome emails PauseAI UK's director sent as MailerSend
// tests on 2026-09-15, wording kept as written. Every link is fixed here at the chapter's
// request rather than drawn from the National Groups row, which this section does not read,
// so keeping the WhatsApp invite and the calendar current is an edit to this file.
const UK_WHATSAPP_URL = 'https://chat.whatsapp.com/F0nj2RjLNeB1P1hyoDFsTz'
const UK_EVENTS_CALENDAR_URL = 'https://luma.com/pauseai.uk'
const UK_INTRO_CALL = 'https://calendar.app.google/w5t7EgCFwCGKcnAS7'
const UK_CAMPAIGNS_URL = 'https://pauseai.uk/campaigns'

/** The footer row of the UK emails. The labels are the chapter's own, hence Twitter, not X. */
const UK_SOCIALS: ChapterLink[] = [
	{ label: 'Instagram', url: 'https://instagram.com/pauseai_uk' },
	{ label: 'LinkedIn', url: 'https://www.linkedin.com/company/pauseai-uk/' },
	{ label: 'Twitter', url: 'https://x.com/pauseai_uk' },
	{ label: 'TikTok', url: 'https://tiktok.com/@pauseai_uk' },
	{ label: 'Facebook', url: 'https://www.facebook.com/people/Pause-AI-UK/61587358827177/' }
]

// TIME-SENSITIVE. The chapter's next events, in the order the chapter lists them (biggest
// first). Nothing here checks the date, so each one has to be removed once it has happened.
// The Luma links carry the `tk` keys the chapter's own emails use.
const UK_LOBBY_DAY_URL = 'https://luma.com/pauseai-0g9r?tk=PTH5F0'
const UK_EVENTS = [
	{
		when: 'Saturday 5th December',
		title: 'The march.',
		text: "We are putting on the biggest ever demonstration for AI safety. We need it to grab the world's attention.",
		url: 'https://luma.com/pauseai-dec26?tk=UEvEYj'
	},
	{
		when: 'Tuesday 20th October',
		title: 'Mass lobby day in Parliament.',
		text: "Having an actual conversation with your MP is probably the single best way to improve AI policy. So we're going to Parliament to meet with MPs and talk about this problem.",
		url: UK_LOBBY_DAY_URL
	},
	{
		when: 'Saturday 26th September',
		title: 'Flyering and tabling.',
		text: "What would you expect to see if the world were in severe peril? You would expect to see people on the street warning you about it. Let's be those people.",
		url: 'https://luma.com/pauseai-c9wb?tk=U5PkA7'
	}
]

/** The events list and the two lines after it, shared by both UK emails. The chapter's own
 *  email reached the lobby day again through a CiviCRM click-tracking redirect; the page it
 *  redirects to is linked directly. */
function ukActionBlocks(): EmailBlock[] {
	return [
		{
			type: 'list',
			ordered: true,
			items: UK_EVENTS.map(
				(event) => `**${event.when}: ${event.title}** ${event.text}\n[RSVP here](${event.url})`
			)
		},
		{
			type: 'paragraph',
			text: `If you can't make it to London, don't worry. [RSVP to the lobby day on Luma](${UK_LOBBY_DAY_URL}) and click the option on the sign-up form to be sent local opportunities to contact your MP.`
		},
		{
			type: 'paragraph',
			text: `And finally, the most crucial thing that every single person can do is to send an email to their MP every two weeks to call for AI regulation: [pauseai.uk/campaigns](${UK_CAMPAIGNS_URL})`
		}
	]
}

/** Signature, PS and the community line, shared by both UK emails apart from the closing
 *  line(s) and whether the footer mentions WhatsApp: volunteers were asked to join it up
 *  front, everyone else hears of it only here. */
function ukSignoff(closing: string[], withWhatsApp: boolean): EmailBlock[] {
	const communityLine = withWhatsApp
		? `Join the [PauseAI UK WhatsApp community](${UK_WHATSAPP_URL}) and subscribe to our [events calendar](${UK_EVENTS_CALENDAR_URL}).`
		: `Subscribe to our [events calendar](${UK_EVENTS_CALENDAR_URL}).`
	return [
		{ type: 'signoff', lines: closing },
		{ type: 'paragraph', text: 'Joseph Miller\nDirector of PauseAI UK' },
		{
			type: 'paragraph',
			text: `PS: if you have questions, just hit reply or [book a short call](${UK_INTRO_CALL}) with Joseph.`
		},
		{ type: 'paragraph', text: communityLine }
	]
}

const ukNonVolunteer: ChapterContent = (firstName) => ({
	subject: `Welcome to PauseAI UK ${firstName}!`,
	htmlStyle: 'plain',
	greeting: [
		{ type: 'paragraph', text: `Hey ${firstName},` },
		{ type: 'paragraph', text: 'Welcome to PauseAI!' }
	],
	body: [
		{
			type: 'heading',
			text: "Here's how you can help to protect yourself and your loved ones from uncontrolled superhuman AI:"
		},
		...ukActionBlocks()
	],
	signoff: ukSignoff(['Joseph'], true),
	socials: UK_SOCIALS
})

const uk: ChapterOverride = {
	name: 'PauseAI UK',
	language: 'en',
	content: {
		none: ukNonVolunteer,
		'act-now': ukNonVolunteer,
		volunteer: (firstName) => ({
			subject: `Welcome to PauseAI UK ${firstName}!`,
			htmlStyle: 'plain',
			greeting: [{ type: 'paragraph', text: `Welcome to PauseAI UK, ${firstName}!` }],
			body: [
				{ type: 'heading', text: 'Join the community' },
				{
					type: 'paragraph',
					text: `If you're interested in volunteering for PauseAI, please join the [PauseAI UK WhatsApp community](${UK_WHATSAPP_URL}), find your local group chat (or suggest a new one) and introduce yourself.`
				},
				{ type: 'heading', text: 'Upcoming events' },
				...ukActionBlocks()
			],
			signoff: ukSignoff(['Best wishes,', 'Joseph'], false),
			socials: UK_SOCIALS
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

// Ported from the two welcome emails PauseAI Sverige's chapter lead sent on 2026-09-25, one
// for Act now and one for Volunteer/Lead, wording kept as written. The WhatsApp and calendar
// links in all three Swedish emails come from the
// chapter's Airtable row, so keeping them current is an Airtable edit, and a sentence is
// dropped when its link is missing rather than shipping a dead one. The calendar must stay
// the public Luma page: the chapter's own draft linked Luma's admin view, which members
// cannot open.
//
// The chapter's own words. The two lines the skeleton adds around them are our Swedish and
// nobody fluent has read them yet, which beats the alternative for these readers: the
// English email. Flip this back if the chapter would rather it waited.
const SWEDISH_COPY_APPROVED = true

// Links the chapter's emails use that no National Groups field holds.
const SWEDEN_CONTACTS_DOC =
	'https://docs.google.com/document/d/1H9erkvaFwAmzqzx5VG28fQPUdg9UWM1__t6kP6DMReY/edit?usp=sharing'
const SWEDEN_EMAIL_BUILDER = 'https://www.jonasvonessen.se/agera/'
const SWEDEN_ACTION_PAGE = 'https://pauseai.se/action'
const SWEDEN_PROJECTS_SHEET =
	'https://docs.google.com/spreadsheets/d/1fy6qmMSBkxa2p-H0jix24kO0HmCbPuV3Bn2Hu3UALrA/edit?usp=sharing'
const CATALYSE_PROJECTS = 'https://catalyse.up.railway.app/projects'

/** The three one-off actions, the same in both emails. */
function swedenOneOffActions(): EmailBlock[] {
	return [
		{ type: 'heading', text: '📌 Enkel engagemang: Punktinsatser' },
		{ type: 'paragraph', text: '**1️⃣ Skicka mejl till politiker**' },
		{
			type: 'list',
			items: [
				`Använd våra [kontaktuppgifter, mall och tips för att skicka mejl](${SWEDEN_CONTACTS_DOC}).`,
				{
					text: `Du kan även använd en **mejlbyggare** (t.ex. [Jonas Von Essens verktyg](${SWEDEN_EMAIL_BUILDER})) för att skapa personliga mejl.`,
					items: ['Vår Mejlbyggare är tyvärr under ombyggnation']
				},
				'**Tips:** Personifiera mejlmallar – även några meningar gör stor skillnad.'
			]
		},
		{ type: 'paragraph', text: '**2️⃣ Ring politiker**' },
		{
			type: 'list',
			items: [
				'Att ringa är ofta **väldigt effektivt**, särskilt en vecka efter att du skickat ett mejl.',
				`*Kontaktuppgifter och samtalstips finns i [dokumentet](${SWEDEN_CONTACTS_DOC}).*`
			]
		},
		{ type: 'paragraph', text: '**3️⃣ Tipsa nyhetsredaktioner**' },
		{
			type: 'list',
			items: [
				'Genom att tipsa om AI-riskrelaterade nyheter kan vi **öka medvetenheten** i samhället.',
				`*Kontaktuppgifter till Sveriges 25 största redaktioner finns i vår [Google Docs](${SWEDEN_CONTACTS_DOC}).*`
			]
		},
		{ type: 'rule' }
	]
}

function swedenWhatsApp(chapter: ChapterBlockData | null): string[] {
	const whatsapp = chapterLink(chapter, 'WhatsApp')
	return whatsapp
		? [
				`**Gå med i vårat [Whatsapp community](${whatsapp})** – Majoriteten av samtalen sker via Whatsapp.`
			]
		: []
}

function swedenCalendarSentence(chapter: ChapterBlockData | null): string {
	const calendar = chapterLink(chapter, 'Events')
	return calendar ? ` [Kalendern](${calendar}) hittar du här.` : ''
}

function swedenContent(
	subject: string,
	firstName: string,
	intro: string,
	involved: EmailBlock[]
): EmailContent {
	return {
		subject,
		greeting: [
			{ type: 'heading', level: 1, text: `Hej ${firstName}!` },
			{ type: 'paragraph', text: intro }
		],
		body: [...swedenOneOffActions(), ...involved, { type: 'rule' }],
		signoff: [
			{ type: 'rule' },
			{
				type: 'paragraph',
				text: '**Tack för att du vill göra skillnad!**\nHör gärna av dig om du har frågor eller idéer.'
			},
			{ type: 'rule' },
			{ type: 'signoff', lines: ['*Vänliga hälsningar*', '*Carl Stylin PauseAI Sverige*'] }
		]
	}
}

const SWEDEN_PETITION = 'https://www.mittskifte.org/petitions/ta-riskerna-med-ai-pa-allvar'

/** The chapter's earlier, shorter welcome, kept for signups with no intent until the chapter
 *  writes one for them. */
const swedenWelcome: ChapterContent = (firstName, chapter) => {
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
	content: {
		none: swedenWelcome,
		'act-now': (firstName, chapter) =>
			swedenContent(
				'PauseAI Sverige - Så här kan du engagera dig för AI-säkerhet',
				firstName,
				'Kul att du har valt att engagera dig – tack för det! Här kommer konkreta sätt att göra skillnad, oavsett om du vill göra en enstaka insats eller ta ett större steg.',
				[
					{ type: 'heading', text: '🌟 Ta nästa steg: Bli mer involverad' },
					{ type: 'paragraph', text: 'Vill du göra ännu mer? Då är du välkommen att:' },
					{
						type: 'list',
						items: [
							...swedenWhatsApp(chapter),
							`**Delta på ett intro- eller månadsmöte** – perfekt för att lära känna våra projekt och gemenskapen.${swedenCalendarSentence(chapter)}`,
							`**Besök vår hemsida** under fliken **[Agera](${SWEDEN_ACTION_PAGE})** för mer information om hur du kan bidra.`
						]
					}
				]
			),
		volunteer: (firstName, chapter) =>
			swedenContent(
				'PauseAI Sverige - Volontär/lead inom PauseAI',
				firstName,
				'Kul att du har valt att engagera dig – tack för det! Här kommer konkreta sätt att göra skillnad och information om fortsatt kontakt.',
				[
					{ type: 'heading', text: '🌟 Bli mer involverad i vårt arbete' },
					{ type: 'paragraph', text: 'Fortsatt engagemang:' },
					{
						type: 'list',
						items: [
							...swedenWhatsApp(chapter),
							`**Välkommen till intro- och månadsmöte** – Du kommer bli inbjuden till ett intromöte och våra månadsmöten.${swedenCalendarSentence(chapter)}`,
							`**Pågående projekt:** vi har några projekt som pågår och andra som ligger i startgroparna. Du hittar fler av våra [gemensamma projekt](${SWEDEN_PROJECTS_SHEET}) med övriga AI-safety sfären i Sverige här. Registrera dig gärna på [Catalyse](${CATALYSE_PROJECTS}) för att se PauseAI specifika projekt.`
						]
					}
				]
			)
	}
}

/** The override for a Members `country` value and intent bucket, or null for the shared
 *  copy. Countries are matched as the live script matches them, with `includes`. */
export function getChapterOverride(
	country: string | undefined,
	bucket: IntentBucket
): ResolvedOverride | null {
	const override = country?.includes('United Kingdom')
		? uk
		: country?.includes('Canada')
			? canada
			: country?.includes('Sweden') && SWEDISH_COPY_APPROVED
				? sweden
				: null
	const content = override?.content[bucket]
	return override && content ? { name: override.name, language: override.language, content } : null
}

const BUCKETS: IntentBucket[] = ['none', 'act-now', 'volunteer']

/** The chapter whose own email a country gets, and who it covers, or null when the country
 *  gets the shared copy. Labels the preview page's country picker. */
export function describeChapterOverride(country: string): ChapterOverrideSummary | null {
	const covered = BUCKETS.filter((bucket) => getChapterOverride(country, bucket))
	const name = covered.length ? getChapterOverride(country, covered[0])?.name : null
	if (!name) return null
	return { name, scope: covered.length === BUCKETS.length ? 'all' : covered }
}
