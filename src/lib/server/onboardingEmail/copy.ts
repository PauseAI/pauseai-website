import type { EmailBlock, EmailContent } from './blocks.js'
import {
	ACTION_PAGE_URL,
	GLOBAL_DISCORD_URL,
	GLOBAL_SOCIALS,
	PROPOSAL_URL,
	VIDEO_URL,
	WELCOME_CALLS_URL
} from './brand.js'
import type { BaseLanguage, ChapterBlockData, IntentBucket } from './types.js'

// The shared copy, ported from what the live MailerSend templates send so that the switch to
// this renderer changes as little as possible:
//  - no intent / Act now: Irina's confirmation copy (templates 7dnvo4dyjd345r86 and
//    ynrw7gy8z1n42k8e), English only, as today
//  - Volunteer and Lead, English: the Global volunteer template (3z0vkloo5v1l7qrx), with its
//    "Chapter Lead of your country" paragraph replaced by the chapter block
//  - Volunteer and Lead, Spanish: the Spanish template (o65qngkj1mjlwr12) as it is
// The fixed lines (confirm link, newsletter line) are in fixed.ts. Markdown-style
// `[label](url)` links and `**bold**` are converted by markdown.ts.

const GLOBAL_SIGNATURE = 'Maxime and The PauseAI Global Team'

function greeting(firstName: string): EmailBlock[] {
	return [{ type: 'heading', level: 1, text: `Welcome to PauseAI, ${firstName}!` }]
}

// Non-volunteers get no personal follow-up, so the block only points at the chapter's public
// links and promises nothing. It is left out when the chapter has no links to show.
function chapterLinksBlock(chapter: ChapterBlockData | null): EmailBlock[] {
	if (!chapter || chapter.links.length === 0) return []
	return [
		{
			type: 'paragraph',
			text: `**There's a PauseAI chapter in ${chapter.name}.** You're welcome to join them:`
		},
		{ type: 'links', items: chapter.links }
	]
}

function enNonVolunteer(
	bucket: IntentBucket,
	chapter: ChapterBlockData | null,
	firstName: string
): EmailContent {
	const actNow = bucket === 'act-now'
	return {
		subject: actNow ? 'Thanks for taking action with PauseAI' : 'Thanks for signing up to PauseAI',
		greeting: greeting(firstName),
		body: [
			{
				type: 'paragraph',
				text: actNow ? 'Thanks for choosing to take action with PauseAI.' : 'Thanks for signing up.'
			},
			{
				type: 'paragraph',
				text: `We are cultivating a global movement calling for a pause on the development of advanced AI systems until they can be made safe and democratically governed. You can read more about what we are calling for in [our proposal](${PROPOSAL_URL}).`
			},
			...chapterLinksBlock(chapter)
		],
		signoff: [
			{
				type: 'paragraph',
				text: "We're glad you're with us, and look forward to getting connected."
			},
			{ type: 'signoff', lines: [actNow ? 'Thanks again,' : 'Best,', GLOBAL_SIGNATURE] }
		],
		socials: GLOBAL_SOCIALS
	}
}

// Picking Volunteer or Lead includes consent to share details with the chapter, so where there
// is one it is the chapter that follows up.
function volunteerContactBlock(chapter: ChapterBlockData | null): EmailBlock[] {
	if (!chapter) return [{ type: 'paragraph', text: 'Our onboarding team will be in touch.' }]
	const blocks: EmailBlock[] = [
		{
			type: 'paragraph',
			text: `**PauseAI ${chapter.name}** will be in touch to invite you to meet your local community at meetings and events.`
		}
	]
	if (chapter.links.length > 0) blocks.push({ type: 'links', items: chapter.links })
	return blocks
}

function enVolunteer(chapter: ChapterBlockData | null, firstName: string): EmailContent {
	return {
		subject: `Welcome to PauseAI, ${firstName}!`,
		greeting: greeting(firstName),
		body: [
			{
				type: 'paragraph',
				text: "We're thrilled to have you join our growing global volunteer network. Your decision to stand with us demonstrates that you share our commitment to ensuring artificial intelligence is developed slowly and safely in a way that benefits all of humanity, and isn't left to the whims of for-profit companies in a reckless race to smarter-than-human AI. Watch our video below for a summary of the Pause position:"
			},
			{ type: 'button', text: 'Video Introduction', url: VIDEO_URL },
			{ type: 'heading', text: 'First Steps to Get Involved:' },
			{ type: 'paragraph', text: '**1. Join Our Welcome Calls**' },
			{
				type: 'paragraph',
				text: `Join us for an introduction to the PauseAI community. You'll meet other new volunteers, learn about our current initiatives, and find ways to get involved immediately. Check out our list of upcoming welcome calls [here](${WELCOME_CALLS_URL}).`
			},
			{ type: 'paragraph', text: '**2. Connect With Your Community**' },
			{
				type: 'paragraph',
				text: `Please join us on our global [Discord server](${GLOBAL_DISCORD_URL}).`
			},
			...volunteerContactBlock(chapter),
			{ type: 'heading', text: 'How We Create Change' },
			{ type: 'paragraph', text: 'At PauseAI, we believe in the power of collective action.' },
			{
				type: 'paragraph',
				text: 'By coming together as concerned citizens to protest, persuade the public, and write to our decision-makers we can influence the necessary change to advocate for a pause on the most advanced AI development.'
			},
			{
				type: 'paragraph',
				text: "As a volunteer, you'll have opportunities to participate in:"
			},
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
				text: `After meeting with the community via our Welcome meetings or through your National Chapter, you'll be informed of the next action, but if you're looking for a step to take right now, check out our [Action page](${ACTION_PAGE_URL}).`
			}
		],
		signoff: [
			{
				type: 'paragraph',
				text: 'Welcome aboard! Together, we can take action to prevent the catastrophic impacts of the development of Artificial Intelligence.'
			},
			{ type: 'signoff', lines: ['Best regards,', GLOBAL_SIGNATURE] }
		],
		socials: GLOBAL_SOCIALS
	}
}

// No chapter block: this email already describes PauseAI en Español, the community every
// Spanish-speaking country shares, and a chapter block would single out Spain.
function esVolunteer(firstName: string): EmailContent {
	return {
		subject: `¡Bienvenido a PauseAI, ${firstName}!`,
		greeting: [{ type: 'heading', level: 1, text: `¡Bienvenido a PauseAI, ${firstName}!` }],
		body: [
			{
				type: 'paragraph',
				text: 'Estamos encantados de que te unas a nuestra creciente red global de voluntarios. Tu decisión de apoyarnos demuestra que compartes nuestro compromiso de garantizar que la inteligencia artificial se desarrolle de forma pausada y segura, beneficiando a todos en lugar de quedar a merced de los caprichos de empresas con fines de lucro en una carrera imprudente hacia una IA más inteligente que la humana. Mira nuestro vídeo a continuación para obtener un resumen de la posición de PauseAI:'
			},
			{ type: 'button', text: 'Video Introductorio', url: VIDEO_URL },
			{ type: 'heading', text: 'Primeros pasos para involucrarse en las comunidades' },
			{ type: 'paragraph', text: '**PauseAI en Español**' },
			{
				type: 'paragraph',
				text: 'Voluntarios de España e Hispanoamérica nos hemos unido bajo el nombre de PauseAI en Español, con el objetivo de paliar la falta de información sobre el tema en nuestro idioma y desarrollar iniciativas útiles.'
			},
			{
				type: 'paragraph',
				text: 'Contamos con un [WhatsApp](https://chat.whatsapp.com/KEgD22LEo6xEVvjH4fD8br) donde coordinamos llamadas grupales mensuales y una página [web propia](https://pauseai.es/). En la web encontrarás una sección de artículos en profundidad sobre [los riesgos de la IA](https://pauseai.es/riesgos), información sobre la necesidad de una pausa y consejos para escribir a los políticos, entre otros contenidos. También tenemos un [Substack en español](https://pauseaispanish.substack.com/) donde publicamos un boletín mensual de noticias.'
			},
			{
				type: 'paragraph',
				text: 'Con el apoyo de voluntarios como tú esperamos poner en marcha muchos más proyectos de comunicación y activismo, estamos abiertos a tus sugerencias.'
			},
			{ type: 'paragraph', text: '**PauseAI Global**' },
			{
				type: 'paragraph',
				text: `Por fuera de eso, puedes unirte a nuestro [servidor de Discord](${GLOBAL_DISCORD_URL}) y las [llamadas de bienvenida](${WELCOME_CALLS_URL}) para personas de cualquier parte del mundo. Ambas en inglés.`
			},
			{ type: 'heading', text: 'Cómo creamos el cambio' },
			{ type: 'paragraph', text: 'En PauseAI creemos en el poder de la acción colectiva.' },
			{
				type: 'paragraph',
				text: 'Al unirnos como ciudadanos preocupados para protestar, persuadir al público y escribir a quienes toman las decisiones, podemos influir en el cambio necesario para abogar por una pausa en el desarrollo más avanzado de la IA.'
			},
			{ type: 'paragraph', text: 'Como voluntario, tendrás oportunidades de participar en:' },
			{
				type: 'list',
				items: [
					'Acciones online: peticiones, campañas en redes sociales, envío de emails a funcionarios.',
					'Actividades presenciales: protestas locales, reuniones comunitarias, eventos de concientización.',
					'Iniciativas de los capítulos locales.'
				]
			},
			{
				type: 'paragraph',
				text: 'Tu participación, ya sea grande o pequeña, es muy importante en nuestro esfuerzo colectivo para garantizar que el desarrollo de la IA avance de forma segura y ética.'
			},
			{ type: 'heading', text: '¿Y ahora qué?' },
			{
				type: 'paragraph',
				text: `Después de reunirte con la comunidad a través de nuestras reuniones de bienvenida o a través de tu Capítulo nacional, se te informará sobre la próxima acción, pero si estás buscando un paso a seguir ahora mismo, consulta nuestra página de [Acción](${ACTION_PAGE_URL}).`
			}
		],
		signoff: [
			{
				type: 'paragraph',
				text: '¡Bienvenido a bordo! Juntos, podemos tomar medidas para prevenir los impactos catastróficos del desarrollo de la Inteligencia Artificial.'
			},
			{ type: 'signoff', lines: ['Saludos cordiales,', 'Maxime y el equipo de PauseAI Global'] }
		],
		socials: GLOBAL_SOCIALS
	}
}

/** The shared copy for a signup with no chapter override. Only English has a non-volunteer
 *  version, so the caller passes `en` for every non-volunteer, as the live templates do. */
export function baseContent(
	language: BaseLanguage,
	bucket: IntentBucket,
	chapter: ChapterBlockData | null,
	firstName: string
): EmailContent {
	if (bucket !== 'volunteer') return enNonVolunteer(bucket, chapter, firstName)
	return language === 'es' ? esVolunteer(firstName) : enVolunteer(chapter, firstName)
}
