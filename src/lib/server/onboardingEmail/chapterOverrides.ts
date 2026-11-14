import type { EmailBlock, EmailContent } from './blocks.js'
import { GLOBAL_SOCIALS, VIDEO_URL } from './brand.js'
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
	 *  `chapter` is the chapter's live row in the chapter list, so an override can use the
	 *  chapter's own links rather than repeating them here. */
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

/** A link from the chapter's row in the CRM's chapter list, by the label chapter.ts gives it. */
function chapterLink(chapter: ChapterBlockData | null, label: string): string | null {
	return chapter?.links.find((link) => link.label === label)?.url ?? null
}

// Both UK emails are ported from the welcome emails PauseAI UK's director sent as MailerSend
// tests on 2026-09-15, wording kept as written. Every link is fixed here at the chapter's
// request rather than drawn from the chapter list, which this section does not read,
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

// TIME-SENSITIVE. The chapter's next events, in date order. Nothing here checks the date,
// so each one has to be removed once it has happened.
// The Luma links carry the `tk` keys the chapter's own emails use.
const UK_EVENTS = [
	{
		when: 'Saturday 21st November',
		title: 'March Against AI Extinction.',
		text: "We are putting on the biggest ever demonstration for AI safety. We need it to grab the world's attention.",
		url: 'https://luma.com/pauseai-nov26?tk=UEvEYj'
	}
]

/** The events list and the line after it, shared by both UK emails. */
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

// PauseAI Sverige's own emails, one per intent, wording kept as the chapter lead wrote it apart
// from clear typos.
// The WhatsApp, calendar, Instagram and Facebook links come from the chapter's row in the CRM's
// chapter list, so keeping them current is a CRM edit, on the chapter's Chapter details page, and
// a sentence is dropped when its link is missing rather than shipping a dead one. The calendar
// must stay the public Luma page: the chapter's own drafts link Luma's admin view, which members
// cannot open.
//
// The chapter's own words. The lines the skeleton adds around them are our Swedish and nobody
// fluent has read them yet, which beats the alternative for these readers: the
// English email. Flip this back if the chapter would rather it waited.
const SWEDISH_COPY_APPROVED = true

// Links the chapter's emails use that the chapter list does not hold.
const SWEDEN_CONTACTS_DOC =
	'https://docs.google.com/document/d/1H9erkvaFwAmzqzx5VG28fQPUdg9UWM1__t6kP6DMReY/edit?usp=sharing'
const SWEDEN_INTRO_DOC =
	'https://docs.google.com/document/d/1Zy8Rf76gUhVI09CEqVHB84iyQTgbBx4YA9G0Jcm_S_o/edit?usp=sharing'
const SWEDEN_EMAIL_BUILDER = 'https://pauseai.se/mejla/'
const SWEDEN_ACTION_PAGE = 'https://pauseai.se/action'
const SWEDEN_PROPOSAL = 'https://pauseai.se/proposal'
const PRO_HUMAN_DECLARATION = 'https://prohumandeclaration.com/en/sign/demand-ai-accountability'

const SWEDEN_INTRO_DOC_ITEM = `**Läs igenom vårt [introdokument](${SWEDEN_INTRO_DOC})** - ger dig en bra förståelse om oss och hur du kan hjälpa till.`
const SWEDEN_EMAIL_TIP =
	'**Tips:** Personifiera mejlmallar – även några meningar gör stor skillnad.'
const SWEDEN_CALL_CONTACTS = `*Kontaktuppgifter och samtalstips finns i [dokumentet](${SWEDEN_CONTACTS_DOC}).*`
const SWEDEN_PRESS_ITEMS = [
	'Genom att tipsa om AI-riskrelaterade nyheter kan vi **öka medvetenheten** i samhället.',
	`*Kontaktuppgifter till Sveriges 25 största redaktioner finns i vår [Google Docs](${SWEDEN_CONTACTS_DOC}).*`
]
const SWEDEN_SIGNATURE: EmailBlock = {
	type: 'signoff',
	lines: ['*Vänliga hälsningar*', '*PauseAI Sverige*']
}

function swedenAction(title: string, items: string[]): EmailBlock[] {
	return [
		{ type: 'paragraph', text: `**${title}**` },
		{ type: 'list', items }
	]
}

/** "[Instagram](…) och [Facebook](…)", or just the one the row has; null when it has neither. */
function swedenSocials(chapter: ChapterBlockData | null): string | null {
	const links = ['Instagram', 'Facebook'].flatMap((label) => {
		const url = chapterLink(chapter, label)
		return url ? [`[${label}](${url})`] : []
	})
	return links.length ? links.join(' och ') : null
}

/** The Act now email's first action. Without Instagram or Facebook it is only the petition. */
function swedenFollowAction(chapter: ChapterBlockData | null): EmailBlock[] {
	const socials = swedenSocials(chapter)
	const petition = `Skriv på [pro human declaration](${PRO_HUMAN_DECLARATION}) - AI-bolagen måste hållas ansvariga för deras system och systemets beslut.`
	return socials
		? swedenAction('1️⃣ Följ oss och skriv på upprop', [
				`Följ oss på ${socials} - där lägger vi upp nyheter och kommande event.`,
				petition
			])
		: swedenAction('1️⃣ Skriv på upprop', [petition])
}

function swedenVolunteerClosing(chapter: ChapterBlockData | null): string {
	const socials = swedenSocials(chapter)
	return socials
		? `Hör gärna av dig om du har frågor och följ oss gärna på ${socials}.`
		: 'Hör gärna av dig om du har frågor.'
}

/** Dropped when the chapter row has no WhatsApp link. */
function swedenWhatsappItem(chapter: ChapterBlockData | null): string[] {
	const whatsapp = chapterLink(chapter, 'WhatsApp')
	return whatsapp
		? [
				`**Gå med i vårat [WhatsApp community](${whatsapp})** – Majoriteten av samtalen sker via WhatsApp.`
			]
		: []
}

function swedenMeetingItem(chapter: ChapterBlockData | null): string {
	const calendar = chapterLink(chapter, 'Events')
	const meeting =
		'**Delta på ett intromöte** – perfekt för att lära känna våra projekt och gemenskapen.'
	return calendar ? `${meeting} [Kalendern](${calendar}) hittar du här.` : meeting
}

function swedenSignoff(closing: string): EmailBlock[] {
	return [
		{ type: 'rule' },
		{ type: 'paragraph', text: `**Tack för att du vill göra skillnad!**\n${closing}` },
		{ type: 'rule' },
		SWEDEN_SIGNATURE
	]
}

const swedenActNow: ChapterContent = (firstName, chapter) => ({
	subject: 'PauseAI Sverige - Så här kan du engagera dig för AI-säkerhet',
	greeting: [
		{ type: 'heading', level: 1, text: `Hej ${firstName}!` },
		{
			type: 'paragraph',
			text: 'Kul att du har valt att engagera dig – tack för det! Här kommer konkreta sätt att göra skillnad, oavsett om du vill göra en enstaka insats eller ta ett större steg.'
		}
	],
	body: [
		{ type: 'heading', text: '📌 Enkelt engagemang: Punktinsatser' },
		...swedenFollowAction(chapter),
		...swedenAction('2️⃣ Skicka mejl till politiker', [
			`Använd våra [kontaktuppgifter, mall och tips för att skicka mejl](${SWEDEN_CONTACTS_DOC}).`,
			`Du kan även använda vår [mejlbyggare](${SWEDEN_EMAIL_BUILDER}).`,
			SWEDEN_EMAIL_TIP
		]),
		...swedenAction('3️⃣ Ring politiker', [
			'Att ringa är ofta **väldigt effektivt**, särskilt en vecka efter att du skickat ett mejl.',
			SWEDEN_CALL_CONTACTS
		]),
		...swedenAction('4️⃣ Tipsa nyhetsredaktioner', SWEDEN_PRESS_ITEMS),
		{ type: 'rule' },
		{ type: 'heading', text: '🌟 Ta nästa steg: Bli mer involverad' },
		{ type: 'paragraph', text: 'Vill du göra ännu mer? Då är du välkommen att:' },
		{
			type: 'list',
			items: [
				SWEDEN_INTRO_DOC_ITEM,
				...swedenWhatsappItem(chapter),
				swedenMeetingItem(chapter),
				`**Besök vår hemsida** under fliken **[Agera](${SWEDEN_ACTION_PAGE})** för mer information om hur du kan bidra.`
			]
		},
		{ type: 'rule' }
	],
	signoff: swedenSignoff('Hör gärna av dig om du har frågor eller idéer.')
})

const swedenVolunteer: ChapterContent = (firstName, chapter) => ({
	subject: 'PauseAI Sverige - Volontär/lead inom PauseAI',
	greeting: [
		{ type: 'heading', level: 1, text: `Hej ${firstName}!` },
		{
			type: 'paragraph',
			text: 'Kul att du har valt att engagera dig – tack för det! Här kommer konkreta sätt att göra skillnad och information om fortsatt kontakt. Mer information finns att hitta på [pauseai.se](https://pauseai.se).'
		}
	],
	body: [
		{ type: 'heading', text: '🌟 Engagera dig' },
		{ type: 'paragraph', text: 'Fortsatt engagemang:' },
		{
			type: 'list',
			items: [SWEDEN_INTRO_DOC_ITEM, swedenMeetingItem(chapter), ...swedenWhatsappItem(chapter)]
		},
		{ type: 'rule' },
		{ type: 'heading', text: '📌 Enkelt engagemang: att göra under tiden' },
		...swedenAction('1️⃣ Skicka mejl till politiker', [
			`Använd vår [mejlbyggare](${SWEDEN_EMAIL_BUILDER}) eller om du vill skriva mejlet själv finns kontaktuppgifter, mall och tips [här](${SWEDEN_CONTACTS_DOC}).`,
			SWEDEN_EMAIL_TIP
		]),
		...swedenAction('2️⃣ Ring politiker', [
			'Att ringa är ofta **väldigt effektivt**, särskilt för att följa upp efter att du skickat ett mejl.',
			SWEDEN_CALL_CONTACTS
		]),
		...swedenAction('3️⃣ Tipsa nyhetsredaktioner', SWEDEN_PRESS_ITEMS),
		{ type: 'rule' }
	],
	signoff: swedenSignoff(swedenVolunteerClosing(chapter))
})

/** The chapter's translation of the shared no-intent email, newsletter line included. */
const swedenNoIntent: ChapterContent = (firstName, chapter) => {
	const whatsapp = chapterLink(chapter, 'WhatsApp')
	const socials = swedenSocials(chapter)
	const follow = socials
		? ` Följ oss gärna på ${socials} - där lägger vi upp nyheter och kommande event.`
		: ''
	const body: EmailBlock[] = [
		{
			type: 'paragraph',
			text: `Tack för att du anmält dig.\nVi bygger en global rörelse som kräver en paus i utvecklingen av avancerade AI-system tills de kan göras säkra och demokratiskt styrda.${follow}`
		},
		{
			type: 'paragraph',
			text: `Du kan läsa mer om vad vi efterfrågar i [vårt förslag](${SWEDEN_PROPOSAL}).`
		}
	]
	if (whatsapp) {
		body.push({
			type: 'paragraph',
			text: `Det finns en PauseAI-grupp i Sverige. Du är välkommen att ansluta dig till dem:\n[WhatsApp](${whatsapp})`
		})
	}

	return {
		subject: 'Tack för att du har registrerat dig hos PauseAI',
		greeting: [{ type: 'heading', level: 1, text: `Hej ${firstName}!` }],
		body,
		newsletter:
			'Om du har valt att få information, kommer vi att hålla dig uppdaterad om viktiga nyheter, kampanjuppdateringar och möjligheter att ta en mer aktiv roll i denna rörelse, inklusive lokala möjligheter där det finns ett aktivt kapitel nära dig. Oavsett kommer vi ibland skicka viktiga meddelanden till dig.',
		signoff: [
			{ type: 'paragraph', text: 'Vi är glada att du är med oss och ser fram emot att höras.' },
			SWEDEN_SIGNATURE
		]
	}
}

const sweden: ChapterOverride = {
	name: 'PauseAI Sverige',
	language: 'sv',
	content: {
		none: swedenNoIntent,
		'act-now': swedenActNow,
		volunteer: swedenVolunteer
	}
}

// PauseAI Deutschland's own emails, one per intent, wording kept as the chapter wrote it. The
// confirm line and the newsletter line are theirs too, and are the `de` entry in fixed.ts.
// Every link is fixed here rather than drawn from the chapter list, so keeping the
// Discord and WhatsApp invites current is an edit to this file.
const GERMANY_SITE = 'https://www.pause-ai.de'

const GERMANY_ENGAGED =
	'Wir freuen uns, dass Du Dich für eine menschliche Zukunft engagieren willst.'
const GERMANY_ACTIONS_TEXT =
	'Das effektivste Mittel, um für mehr Aufklärung zu sorgen, ist eine Mail an Deinen Abgeordneten. Auf unserer Webseite gibt es dafür ein spezielles Tool und es gibt noch viele andere Möglichkeiten, direkt aktiv zu werden.'
const GERMANY_ONBOARDING_CALL_TEXT =
	'Buch Dir am besten hier einen Termin. Dort können wir gemeinsam besprechen, was wir als PauseAI gerade alles machen, wie Du am besten mithelfen kannst und Du kannst Fragen stellen.'

const GERMANY_ACTIONS_URL = `${GERMANY_SITE}/#was-du-tun-kannst`
const GERMANY_ONBOARDING_CALL_URL = `${GERMANY_SITE}/mitmachen`

/** One of the "Außerdem" items: a bold title, the text, and its link on a line of its own. Only
 *  each email's main step is a button, so the confirm button is not lost among a row of them. */
function germanyItem(title: string, text: string, label: string, url: string): EmailBlock {
	return { type: 'paragraph', text: `**${title}**\n${text}\n[${label}](${url})` }
}

/** The community items every German email lists, in the chapter's order. */
const GERMANY_COMMUNITY: EmailBlock[] = [
	germanyItem(
		'Unsere Discord-Community',
		'Wir kommunizieren und arbeiten hauptsächlich über Discord. Komm rein und sag Hallo.',
		'Discord beitreten',
		'https://discord.gg/VuVVyJQ37M'
	),
	germanyItem(
		'Lokalgruppen',
		'Werde Teil einer Lokalgruppe in Deiner Nähe. Gemeinsam organisieren wir Infoabende, Stammtische und Aktionen vor Ort.',
		'Lokalgruppen finden',
		`${GERMANY_SITE}/lokalgruppen`
	),
	germanyItem(
		'Unsere WhatsApp-Community',
		'Tritt unserer Gruppe bei, um Dich mit anderen auszutauschen und Neuigkeiten mitzubekommen.',
		'Zur WhatsApp-Gruppe',
		'https://chat.whatsapp.com/C7p9cdH41IE1MQwPHQLWCX?mode=ems_share_t'
	),
	germanyItem(
		'Wöchentliches virtuelles Treffen',
		'Jeden Donnerstag ein Thema rund um KI. Jeder ist willkommen.',
		'Zu den Veranstaltungen',
		'https://lu.ma/pauseai_de'
	)
]

const GERMANY_NON_VOLUNTEER_REST: EmailBlock[] = [
	{ type: 'button', text: 'WAS DU TUN KANNST', url: GERMANY_ACTIONS_URL },
	{ type: 'heading', text: 'Außerdem' },
	germanyItem(
		'Onboarding-Call',
		GERMANY_ONBOARDING_CALL_TEXT,
		'Termin aussuchen',
		GERMANY_ONBOARDING_CALL_URL
	),
	...GERMANY_COMMUNITY
]

function germanyContent(firstName: string, body: EmailBlock[]): EmailContent {
	const welcome = `Willkommen bei PauseAI Deutschland, ${firstName}!`
	return {
		subject: welcome,
		greeting: [
			{
				type: 'paragraph',
				text: `*Based in Berlin and English-speaking? [Click here](${GERMANY_SITE}/berlin).*`
			},
			{ type: 'heading', level: 1, text: welcome }
		],
		body,
		signoff: [
			{ type: 'paragraph', text: 'Fragen? Schreib uns an germany@pauseai.info.' },
			{ type: 'signoff', lines: ['Viele Grüße', 'PauseAI Deutschland'] },
			{
				type: 'paragraph',
				text: '[Impressum](https://pause-ai.de/impressum)  ·  [Datenschutz](https://pause-ai.de/datenschutz)'
			},
			{
				type: 'paragraph',
				text: 'Falls Du Dich nicht angemeldet hast, kannst Du diese Mail ignorieren.'
			}
		]
	}
}

const germany: ChapterOverride = {
	name: 'PauseAI Deutschland',
	language: 'de',
	content: {
		none: (firstName) =>
			germanyContent(firstName, [
				{ type: 'heading', text: 'Danke' },
				{
					type: 'paragraph',
					text: 'Wir freuen uns, dass Du Interesse an PauseAI hast und auf dem Laufenden bleiben willst.\nWenn Du bei der Anmeldung den Newsletter gewählt hast, werden wir Dich in Zukunft auf große Aktionen und Events hinweisen.'
				},
				{ type: 'heading', text: 'Wenn Du aktiv werden willst' },
				{ type: 'paragraph', text: GERMANY_ACTIONS_TEXT },
				...GERMANY_NON_VOLUNTEER_REST
			]),
		'act-now': (firstName) =>
			germanyContent(firstName, [
				{ type: 'heading', text: 'Sofort loslegen' },
				{ type: 'paragraph', text: `${GERMANY_ENGAGED}\n${GERMANY_ACTIONS_TEXT}` },
				...GERMANY_NON_VOLUNTEER_REST
			]),
		volunteer: (firstName) =>
			germanyContent(firstName, [
				{ type: 'heading', text: 'Nächster Schritt: Call zum Kennenlernen' },
				{ type: 'paragraph', text: `${GERMANY_ENGAGED} ${GERMANY_ONBOARDING_CALL_TEXT}` },
				{ type: 'button', text: 'TERMIN AUSSUCHEN', url: GERMANY_ONBOARDING_CALL_URL },
				{ type: 'heading', text: 'Außerdem' },
				...GERMANY_COMMUNITY,
				germanyItem(
					'Auf eigene Faust',
					'Du willst lieber selbst loslegen? Es gibt viele Möglichkeiten, direkt aktiv zu werden.',
					'Was Du tun kannst',
					GERMANY_ACTIONS_URL
				)
			])
	}
}

// In match order. Countries are matched as the live script matches them, with `includes`.
const OVERRIDES: [country: string, override: ChapterOverride | null][] = [
	['United Kingdom', uk],
	['Canada', canada],
	['Sweden', SWEDISH_COPY_APPROVED ? sweden : null],
	['Germany', germany]
]

/** The countries whose chapter's own email is in use. Exported for tests that cover every one. */
export const CHAPTER_OVERRIDE_COUNTRIES: readonly string[] = OVERRIDES.filter(
	([, override]) => override
).map(([country]) => country)

function chapterFor(country: string | undefined): ChapterOverride | null {
	return OVERRIDES.find(([name]) => country?.includes(name))?.[1] ?? null
}

/** The override for a Members `country` value and intent bucket, or null for the shared copy. */
export function getChapterOverride(
	country: string | undefined,
	bucket: IntentBucket
): ResolvedOverride | null {
	const override = chapterFor(country)
	const content = override?.content[bucket]
	return override && content ? { name: override.name, language: override.language, content } : null
}

const BUCKETS: IntentBucket[] = ['none', 'act-now', 'volunteer']

/** The chapter whose own email a country gets, and who it covers, or null when the country
 *  gets the shared copy. Labels the preview page's country picker. */
export function describeChapterOverride(country: string): ChapterOverrideSummary | null {
	const override = chapterFor(country)
	if (!override) return null
	const covered = BUCKETS.filter((bucket) => override.content[bucket])
	return { name: override.name, scope: covered.length === BUCKETS.length ? 'all' : covered }
}
