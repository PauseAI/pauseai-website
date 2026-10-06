import type { EmailBlock } from './blocks.js'
import type { IntentBucket, OnboardingEmailLanguage } from './types.js'

// The lines every onboarding email carries, whoever wrote the rest of it. composeBlocks()
// places them, so neither the shared copy nor a chapter override can drop one: the
// confirm link is the reason the email exists, and the newsletter and critical alert
// line repeats a promise the signup form already made.
//
// A language only a chapter override is written in still needs an entry here.

export type FixedCopy = {
	/** What goes straight after the greeting: the verification link, as a link in a line or as
	 *  a button under one, and normally the "ignore this" line. */
	confirm: (verificationLink: string) => EmailBlock[]
	/** What we will send them, just before the sign-off. Varies with the bucket in English
	 *  because Irina's copy does; one line serves every bucket elsewhere. `subscribed` is the
	 *  Members record's own "Email subscription" checkbox, forwarded by the Airtable automation
	 *  as `email_subscription` — known at send time, so the line states it rather than hedging
	 *  with "if you opted in". Undefined (a caller that doesn't pass the field, such as the
	 *  preview pages) keeps the hedged wording rather than guessing. */
	newsletter: (bucket: IntentBucket, subscribed: boolean | undefined) => string
	/** The same promise inside an email a chapter wrote, where our full sentence reads as
	 *  boilerplate bolted onto somebody else's note. */
	newsletterInOwnWords: string
	/** The footer's unsubscribe line, shown only when the caller gives an unsubscribe link. */
	unsubscribe: { question: string; linkText: string }
}

/** The same in every language: it is a postal address, and it has to stay usable as one.
 *  The form the org uses on its mailings. */
export const ADDRESS_LINE = 'PauseAI, Box C5957, Zeist, 3704 GS, Netherlands'

const NONE_SUBSCRIBED =
	"We'll keep you informed about important news, campaign updates, and opportunities to take a more active role in this movement, including local opportunities where there's an active chapter near you. We may also occasionally send you a critical alert."
const NONE_NOT_SUBSCRIBED =
	"You didn't opt in to our newsletter, so we won't add you to it. We may still occasionally send you a critical alert."
const ACT_NOW_SUBSCRIBED =
	"We'll keep you in the loop about future actions, campaign updates, and other opportunities to support the PauseAI movement, including local opportunities where there's an active chapter near you. We may also occasionally send you a critical alert."
const VOLUNTEER_SUBSCRIBED =
	"You'll receive the PauseAI monthly update on upcoming actions and events. We may also occasionally send you a critical alert."

function line(text: string): EmailBlock[] {
	return [{ type: 'paragraph', text }]
}

const en: FixedCopy = {
	confirm: (link) =>
		line(
			`To confirm your email address, click [this link](${link}). If you didn't sign up, you can ignore this message.`
		),
	newsletter: (bucket, subscribed) => {
		if (subscribed === undefined) {
			switch (bucket) {
				case 'none':
					return "If you opted in, we'll keep you informed about important news, campaign updates, and opportunities to take a more active role in this movement, including local opportunities where there's an active chapter near you. Either way, we may occasionally send you a critical alert."
				case 'act-now':
					return "If you opted in, we'll keep you in the loop about future actions, campaign updates, and other opportunities to support the PauseAI movement, including local opportunities where there's an active chapter near you. Either way, we may occasionally send you a critical alert."
				case 'volunteer':
					return "If you opted in to our newsletter, you'll receive the PauseAI monthly update on upcoming actions and events. Either way, we may occasionally send you a critical alert."
			}
		}
		if (!subscribed) return NONE_NOT_SUBSCRIBED
		switch (bucket) {
			case 'none':
				return NONE_SUBSCRIBED
			case 'act-now':
				return ACT_NOW_SUBSCRIBED
			case 'volunteer':
				return VOLUNTEER_SUBSCRIBED
		}
	},
	newsletterInOwnWords:
		"If you opted in, we'll keep you posted. Either way, we may occasionally send you a critical alert.",
	unsubscribe: {
		question: "Don't want emails from us?",
		linkText: 'Unsubscribe from all PauseAI emails'
	}
}

// From the live Spanish template, which serves volunteers and no-intent signups. The critical alert
// sentence is new and needs a fluent reader.
const es: FixedCopy = {
	confirm: (link) =>
		line(
			`Para verificar tu dirección de email, haz clic en [este link](${link}). Si no solicitaste unirte, puedes ignorar este mensaje.`
		),
	newsletter: (_bucket, subscribed) => {
		if (subscribed === undefined)
			return 'Si te suscribiste a nuestra lista de correo, recibirás el boletín mensual de PauseAI que te mantendrá al día sobre las próximas acciones y eventos. En cualquier caso, es posible que ocasionalmente te enviemos una alerta crítica.'
		return subscribed
			? 'Te suscribiste a nuestra lista de correo, así que recibirás el boletín mensual de PauseAI con las próximas acciones y eventos. También es posible que ocasionalmente te enviemos una alerta crítica.'
			: 'No te suscribiste a nuestra lista de correo, así que no la recibirás — pero es posible que ocasionalmente te enviemos una alerta crítica.'
	},
	newsletterInOwnWords:
		'Si te suscribiste, te mantendremos al día. En cualquier caso, es posible que ocasionalmente te enviemos una alerta crítica.',
	unsubscribe: {
		question: '¿No quieres recibir nuestros correos?',
		linkText: 'Date de baja de todos los correos de PauseAI'
	}
}

// Ours, not the chapter's: the two lines the skeleton adds around their own words. Machine
// drafted and not yet read by anyone fluent, which is worth less than it sounds against the
// alternative, which is these readers getting the English email.
const sv: FixedCopy = {
	confirm: (link) =>
		line(
			`Bekräfta din e-postadress genom att klicka på [den här länken](${link}). Om du inte har anmält dig kan du bortse från det här meddelandet.`
		),
	newsletter: (_bucket, subscribed) => {
		if (subscribed === undefined)
			return 'Om du har valt att prenumerera håller vi dig uppdaterad om nyheter, kampanjer och sätt att engagera dig. Även om du inte prenumererar kan vi ibland skicka ett viktigt och brådskande meddelande.'
		return subscribed
			? 'Du har valt att prenumerera, så vi håller dig uppdaterad om nyheter, kampanjer och sätt att engagera dig. Vi kan också ibland skicka ett viktigt och brådskande meddelande.'
			: 'Du har inte valt att prenumerera, så vi håller dig inte uppdaterad — men vi kan ibland skicka ett viktigt och brådskande meddelande.'
	},
	newsletterInOwnWords:
		'Om du har valt att prenumerera håller vi dig uppdaterad. Även om du inte prenumererar kan vi ibland skicka ett viktigt och brådskande meddelande.',
	unsubscribe: {
		question: 'Vill du inte få mejl från oss?',
		linkText: 'Avsluta alla mejl från PauseAI'
	}
}

// PauseAI Deutschland's own wording, not ours. Their emails end on the "ignore this" sentence,
// so it is in their sign-off in chapterOverrides.ts rather than here: another German-language
// chapter would have to carry it too.
const DE_NEWSLETTER =
	'**Newsletter**\nWenn Du bei der Anmeldung den Newsletter gewählt hast, bekommst Du etwa einmal im Monat Neuigkeiten zu KI-Risiken und unseren Aktionen. In dringenden Fällen schreiben wir Dir auch ohne Newsletter.'
const de: FixedCopy = {
	confirm: (link) => [
		...line('Bitte bestätige zuerst Deine E-Mail-Adresse:'),
		{ type: 'button', text: 'E-MAIL BESTÄTIGEN', url: link }
	],
	newsletter: () => DE_NEWSLETTER,
	newsletterInOwnWords: DE_NEWSLETTER,
	unsubscribe: {
		question: 'Du möchtest keine E-Mails von uns?',
		linkText: 'Von allen E-Mails von PauseAI abmelden'
	}
}

export const FIXED_COPY: Record<OnboardingEmailLanguage, FixedCopy> = { en, es, sv, de }
