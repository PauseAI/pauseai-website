import type { IntentBucket, OnboardingEmailLanguage } from './types.js'

// Hand-maintained en/es/fr copy for the onboarding welcome email. NOT routed through
// the site's Paraglide/inlang pipeline (build-time only, not live in prod — see
// docs/L10N.md). Adapted from the org's existing reviewed copy in
// email-templates/*.json (see ROUTING.md for which template each block came from),
// not invented from scratch, EXCEPT where a comment below says otherwise.
//
// Markdown-style `[label](url)` links are used throughout (matching the `plain_text`
// style already used in the existing MailerSend templates) and are converted to
// `<a>` tags for HTML by src/lib/server/onboardingEmail/markdown.ts.

const VIDEO_URL = 'https://www.youtube.com/watch?v=ZHxJwv4TdJo'
const ACTION_PAGE_URL = 'https://pauseai.info/action'

export type LanguageCopy = {
	subject: (firstName: string) => string
	greeting: (firstName: string) => string
	verifyLine: (verificationLink: string) => string
	ignoreNote: string
	/** Intent-acknowledgement sentence, echoing the join-form copy in
	 *  src/lib/components/onboarding/messages.ts (~L204-217). */
	intent: Record<IntentBucket, string>
	videoIntro: string
	videoLinkText: string
	howWeCreateChangeHeading: string
	howWeCreateChangeIntro: string
	/** Differs slightly depending on whether the reader opted into volunteering. */
	howWeCreateChangeVolunteerLine: string
	howWeCreateChangeNonVolunteerLine: string
	howWeCreateChangeListItems: string[]
	howWeCreateChangeClosing: string
	connectHeading: string
	connectFoundIntro: (chapterName: string, leader: string) => string
	connectFallbackIntro: string
	welcomeCallsLine: (url: string) => string
	whatsNextHeading: string
	whatsNextP1: string
	whatsNextP2: string
	whatsNextClosing: string
	signoffFound: (leader: string, chapterName: string) => string
	signoffFallback: string
	linksHeading: string
	unsubscribeLine: (url: string) => string
	addressLine: string
}

const en: LanguageCopy = {
	subject: (firstName) => `Welcome to PauseAI, ${firstName}!`,
	greeting: (firstName) => `Welcome to PauseAI, ${firstName}!`,
	verifyLine: (link) => `To verify your email address, click [this link](${link}).`,
	ignoreNote: 'If you did not request to join, you can ignore this message.',
	intent: {
		'keep-informed':
			"You told us you want to keep informed — you'll get global campaign updates, plus news and ways to help from your local chapter.",
		'act-now': "You told us you just want to take action now — here's what you can do today.",
		volunteer:
			"You told us you want to volunteer regularly — we'll help you find a role that fits, and your local chapter will be in touch.",
		lead: "You told us you want to lead — you're ready to organize in your country or region, and your local chapter will be in touch."
	},
	videoIntro: 'Watch our video below for a summary of the Pause position:',
	videoLinkText: 'Video Introduction',
	howWeCreateChangeHeading: 'How We Create Change',
	howWeCreateChangeIntro: 'At PauseAI, we believe in the power of collective action.',
	howWeCreateChangeVolunteerLine: "As a volunteer, you'll have opportunities to participate in:",
	howWeCreateChangeNonVolunteerLine: 'There are lots of ways to take part:',
	howWeCreateChangeListItems: [
		'Online actions (petitions, social media campaigns, letter-writing to officials)',
		'Offline activities (local protests, community meetings, awareness events)',
		'Local chapter initiatives.'
	],
	howWeCreateChangeClosing:
		'Your participation, whether big or small, matters greatly in our collective effort to ensure AI development proceeds safely and ethically.',
	connectHeading: 'Connect With Your Community',
	connectFoundIntro: (chapterName, leader) =>
		`You're part of the PauseAI ${chapterName} chapter, led by ${leader}. They'll be in touch to help you get plugged in locally.`,
	connectFallbackIntro:
		"There's no local PauseAI chapter in your country yet, so for now you're part of the PauseAI Global community. Our Global Onboarding team will be in touch.",
	welcomeCallsLine: (url) =>
		`In the meantime, join one of our [Welcome Calls](${url}) to meet other new members and hear more about what we do.`,
	whatsNextHeading: "What's Next",
	whatsNextP1:
		"If you opted in to our newsletter, you'll receive the PauseAI monthly update on upcoming actions and events.",
	whatsNextP2: `After meeting with the community via our Welcome meetings or through your National Chapter, you'll be informed of the next action, but if you're looking for a step to take right now, check out our [Action page](${ACTION_PAGE_URL}).`,
	whatsNextClosing:
		'Welcome aboard! Together, we can take action to prevent the catastrophic impacts of the development of Artificial Intelligence.',
	signoffFound: (leader, chapterName) => `${leader} and the PauseAI ${chapterName} Team`,
	signoffFallback: 'Maxime and The PauseAI Global Team',
	linksHeading: 'Follow along',
	unsubscribeLine: (url) => `Don't want to receive these emails? [Unsubscribe here](${url}).`,
	addressLine: 'PauseAI, Box C5957, Kwikstaartlaan 42, 3704GS Zeist, The Netherlands'
}

// Adapted from email-templates/canada-fr-*.json, with Canada/Montréal-specific
// content and the pauseia.fr/fr/agir stand-in link dropped (France is now a real
// chapter reached via the normal lookup — see ROUTING.md and the decision record).
// Register: "vous" throughout, matching that template's tone — NOT the "tu" register
// used on the live /join form's fr copy in messages.ts. The intent-acknowledgement
// sentences below were translated from messages.ts's "tu" copy into "vous" to keep
// the whole email in one consistent register; flagging this register choice for
// human review since it means the email doesn't literally quote the join-form copy.
const fr: LanguageCopy = {
	subject: (firstName) => `Bienvenue à PauseAI, ${firstName} !`,
	greeting: (firstName) => `Bienvenue à PauseAI, ${firstName} !`,
	verifyLine: (link) => `Pour vérifier votre adresse e-mail, [cliquez sur ce lien](${link}).`,
	ignoreNote: "Si vous n'avez pas demandé à nous rejoindre, vous pouvez ignorer ce message.",
	intent: {
		'keep-informed':
			"Vous nous avez dit vouloir rester informé·e — vous recevrez les actualités des campagnes mondiales, ainsi que les nouvelles et les occasions d'agir de votre groupe local.",
		'act-now':
			"Vous nous avez dit vouloir agir dès maintenant — voici ce que vous pouvez faire dès aujourd'hui.",
		volunteer:
			'Vous nous avez dit vouloir être bénévole régulièrement — nous allons vous aider à trouver un rôle qui vous correspond, et votre groupe local vous contactera.',
		lead: 'Vous nous avez dit vouloir prendre la tête — vous êtes prêt·e à organiser dans votre pays ou votre région, et votre groupe local vous contactera.'
	},
	videoIntro: 'Regardez notre vidéo ci-dessous pour un résumé de la position de PauseAI :',
	videoLinkText: 'Introduction vidéo',
	howWeCreateChangeHeading: 'Comment nous faisons bouger les choses',
	howWeCreateChangeIntro: "Chez PauseAI, nous croyons au pouvoir de l'action collective.",
	howWeCreateChangeVolunteerLine: "En tant que bénévole, vous aurez l'occasion de participer à :",
	howWeCreateChangeNonVolunteerLine: 'Il existe de nombreuses façons de participer :',
	howWeCreateChangeListItems: [
		'Des actions en ligne (pétitions, campagnes sur les réseaux sociaux, envoi de lettres aux responsables)',
		'Des activités hors ligne (manifestations locales, réunions communautaires, événements de sensibilisation)',
		'Des initiatives des sections locales.'
	],
	howWeCreateChangeClosing:
		"Votre participation, quelle que soit son ampleur, joue un rôle essentiel dans notre effort collectif visant à garantir que le développement de l'IA se déroule de manière sûre et éthique.",
	connectHeading: 'Connectez-vous avec votre communauté',
	connectFoundIntro: (chapterName, leader) =>
		`Vous faites partie de la section PauseAI ${chapterName}, dirigée par ${leader}. Elle vous contactera pour vous aider à vous impliquer localement.`,
	connectFallbackIntro:
		"Il n'existe pas encore de section locale de PauseAI dans votre pays, vous faites donc partie de la communauté PauseAI Global pour l'instant. Notre équipe d'accueil mondiale vous contactera.",
	welcomeCallsLine: (url) =>
		`En attendant, rejoignez l'un de nos [appels de bienvenue](${url}) pour rencontrer d'autres nouveaux membres et en savoir plus sur ce que nous faisons.`,
	whatsNextHeading: 'Et maintenant ?',
	whatsNextP1:
		"Si vous avez choisi de vous abonner, vous recevrez l'infolettre mensuelle de PauseAI, qui vous tiendra informé des actions et événements à venir.",
	whatsNextP2: `Après avoir rencontré la communauté lors de nos réunions de bienvenue ou par l'intermédiaire de votre section nationale, vous serez informé de la prochaine action à mener, mais si vous souhaitez agir dès maintenant, consultez notre page [Action](${ACTION_PAGE_URL}).`,
	whatsNextClosing:
		"Bienvenue parmi nous ! Ensemble, nous pouvons agir pour prévenir les conséquences catastrophiques du développement de l'intelligence artificielle.",
	signoffFound: (leader, chapterName) => `${leader} et l'équipe PauseAI ${chapterName}`,
	signoffFallback: "Maxime et l'équipe PauseAI Global",
	linksHeading: 'Suivez-nous',
	unsubscribeLine: (url) =>
		`Vous ne souhaitez plus recevoir ces e-mails ? [Se désabonner ici](${url}).`,
	addressLine: 'PauseAI, Box C5957, Kwikstaartlaan 42, 3704GS Zeist, Pays-Bas'
}

// Adapted from email-templates/spanish-*.json for the shared sections. The intent
// acknowledgement sentences, the fallback/found "connect with your community" copy,
// and the non-volunteer variant of "how we create change" have NO equivalent in any
// existing template or in messages.ts (which has no `es` locale) — these are
// newly-written Spanish copy and should get native-speaker review before shipping.
const es: LanguageCopy = {
	subject: (firstName) => `¡Bienvenido/a a PauseAI, ${firstName}!`,
	greeting: (firstName) => `¡Bienvenido/a a PauseAI, ${firstName}!`,
	verifyLine: (link) => `Para verificar tu dirección de email, haz clic en [este enlace](${link}).`,
	ignoreNote: 'Si no solicitaste unirte, puedes ignorar este mensaje.',
	intent: {
		'keep-informed':
			'Nos dijiste que quieres mantenerte informado/a — recibirás actualizaciones de campañas globales, además de noticias y formas de ayudar desde tu capítulo local.',
		'act-now':
			'Nos dijiste que solo quieres pasar a la acción ahora — esto es lo que puedes hacer hoy mismo.',
		volunteer:
			'Nos dijiste que quieres ser voluntario/a de forma regular — te ayudaremos a encontrar un rol que encaje contigo, y tu capítulo local se pondrá en contacto.',
		lead: 'Nos dijiste que quieres liderar — estás listo/a para organizar en tu país o región, y tu capítulo local se pondrá en contacto.'
	},
	videoIntro:
		'Mira nuestro vídeo a continuación para obtener un resumen de la posición de PauseAI:',
	videoLinkText: 'Video Introductorio',
	howWeCreateChangeHeading: 'Cómo creamos el cambio',
	howWeCreateChangeIntro: 'En PauseAI creemos en el poder de la acción colectiva.',
	howWeCreateChangeVolunteerLine: 'Como voluntario/a, tendrás oportunidades de participar en:',
	howWeCreateChangeNonVolunteerLine: 'Hay muchas maneras de participar:',
	howWeCreateChangeListItems: [
		'Acciones online: peticiones, campañas en redes sociales, envío de emails a funcionarios.',
		'Actividades presenciales: protestas locales, reuniones comunitarias, eventos de concientización.',
		'Iniciativas de los capítulos locales.'
	],
	howWeCreateChangeClosing:
		'Tu participación, ya sea grande o pequeña, es muy importante en nuestro esfuerzo colectivo para garantizar que el desarrollo de la IA avance de forma segura y ética.',
	connectHeading: 'Conecta con tu comunidad',
	connectFoundIntro: (chapterName, leader) =>
		`Formas parte del capítulo de PauseAI en ${chapterName}, liderado por ${leader}. Se pondrán en contacto contigo para ayudarte a integrarte a nivel local.`,
	connectFallbackIntro:
		'Todavía no hay un capítulo local de PauseAI en tu país, así que por ahora formas parte de la comunidad global de PauseAI. Nuestro equipo global de incorporación se pondrá en contacto contigo.',
	welcomeCallsLine: (url) =>
		`Mientras tanto, únete a una de nuestras [llamadas de bienvenida](${url}) para conocer a otros nuevos miembros y saber más sobre lo que hacemos.`,
	whatsNextHeading: '¿Y ahora qué?',
	whatsNextP1:
		'Si te suscribiste a nuestra lista de correo, recibirás el boletín mensual de PauseAI que te mantendrá al día sobre las próximas acciones y eventos.',
	whatsNextP2: `Después de reunirte con la comunidad a través de nuestras reuniones de bienvenida o a través de tu Capítulo nacional, se te informará sobre la próxima acción, pero si estás buscando un paso a seguir ahora mismo, consulta nuestra página de [Acción](${ACTION_PAGE_URL}).`,
	whatsNextClosing:
		'¡Bienvenido/a a bordo! Juntos, podemos tomar medidas para prevenir los impactos catastróficos del desarrollo de la Inteligencia Artificial.',
	signoffFound: (leader, chapterName) => `${leader} y el equipo de PauseAI ${chapterName}`,
	signoffFallback: 'Maxime y el equipo de PauseAI Global',
	linksHeading: 'Síguenos',
	unsubscribeLine: (url) =>
		`¿No quieres recibir estos correos? [Cancelar suscripción aquí](${url}).`,
	addressLine: 'PauseAI, Box C5957, Kwikstaartlaan 42, 3704GS Zeist, Países Bajos'
}

export const LANGUAGE_COPY: Record<OnboardingEmailLanguage, LanguageCopy> = { en, fr, es }

export const SHARED = { VIDEO_URL, ACTION_PAGE_URL }
