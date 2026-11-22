// Hardcoded translations for the onboarding embed.
// This is a temporary local alternative to paraglide-based localisation, which
// requires the private l10n cage (PauseAI/paraglide) to compile translations
// into the runtime. Until that access is available, translations live here and
// are reviewable/shippable via normal PRs.

// The chapter-sharing question (chapterShare.ts) and the copy that follows its
// answer. `chapter` is the chapter's name, or null where the country has none yet.
// The question's text is stored on the person's record as what they were shown, so
// a change here changes what new records hold.
interface ChapterShareMessages {
	onboarding_chapter_answer_needed: string
	onboarding_chapter_loading: string
	onboarding_chapter_section_label: string
	onboarding_chapter_heading: (chapter: string) => string
	onboarding_chapter_body: (chapter: string) => string
	onboarding_chapter_yes: (chapter: string) => string
	// The chapter-site checkbox's label (chapterShare.ts, 'chapter-site'). When
	// it changes, add the old one to retiredChapterSiteLabels below.
	onboarding_chapter_site_label: (chapter: string) => string
	// HTML, under that checkbox. Its links open in a new tab, since the form is
	// iframed on the chapter's site.
	onboarding_chapter_site_alternative: string
	// Shown under step 1's Continue when chapterSiteConsentField's checkbox is
	// unchecked, in place of onboarding_chapter_answer_needed ("checkbox", not
	// "question").
	onboarding_chapter_site_consent_needed: string
	onboarding_chapter_subscribe_heading: (chapter: string) => string
	onboarding_chapter_subscribe_yes: (chapter: string) => string
	onboarding_chapter_none_heading: (country: string) => string
	onboarding_chapter_none_body: (country: string) => string
	onboarding_chapter_none_yes: string
	onboarding_chapter_none_subscribe_heading: (country: string) => string
	onboarding_chapter_none_subscribe_yes: string
	onboarding_chapter_no: string
	onboarding_keep_informed_sub_shared: (chapter: string | null) => string
	onboarding_keep_informed_sub_unanswered: (chapter: string | null) => string
	onboarding_keep_informed_sub_not_shared: string
	onboarding_in_touch_shared: (chapter: string | null) => string
	onboarding_in_touch_unanswered: string
	onboarding_in_touch_not_shared: string
	onboarding_chapter_nudge: (chapter: string | null) => string
	onboarding_confirm_keep_informed_shared: (chapter: string | null) => string
	onboarding_confirm_keep_informed_not_shared: string
}

const PRIVACY_EMAIL = 'privacy@pauseai.info'

// Chapter-site checkbox labels no longer shown, by locale. A form loaded before
// a label changed still posts the old label as its stored wording, and the
// server accepts only wordings a form can show (possibleWordings), so these stay
// accepted.
export const retiredChapterSiteLabels: Record<string, ((chapter: string) => string)[]> = {
	en: [(chapter) => `Share my details with ${chapter} and PauseAI Global`],
	de: [(chapter) => `Meine Daten mit ${chapter} und PauseAI Global teilen`],
	fr: [(chapter) => `Partager mes données avec ${chapter} et PauseAI Global`],
	es: [(chapter) => `Compartir mis datos con ${chapter} y PauseAI Global`]
}

const chapterShareEn: ChapterShareMessages = {
	onboarding_chapter_answer_needed: 'Answer the chapter question above to continue.',
	onboarding_chapter_loading: 'Loading the chapter question…',
	onboarding_chapter_section_label: 'Your local chapter',
	onboarding_chapter_heading: (chapter) => `Share your details with ${chapter}?`,
	onboarding_chapter_body: (chapter) =>
		`If you say yes, we share your signup details with ${chapter}, which may be a separate organisation from PauseAI Global. You can change your mind at any time by emailing ${PRIVACY_EMAIL}.`,
	onboarding_chapter_yes: (chapter) => `Yes, share my details with ${chapter}`,
	onboarding_chapter_site_label: (chapter) =>
		`Let ${chapter}'s organisers see my details and contact me about local events and campaigns`,
	onboarding_chapter_site_alternative: `<a target="_blank" rel="noopener noreferrer" href="/privacy">Privacy Policy</a> · Only want PauseAI Global's newsletter? <a target="_blank" rel="noopener noreferrer" href="/subscribe">Subscribe instead</a>.`,
	onboarding_chapter_site_consent_needed: 'Tick the box above to continue.',
	onboarding_chapter_subscribe_heading: (chapter) => `Hear from ${chapter} too?`,
	onboarding_chapter_subscribe_yes: (chapter) =>
		`Yes, share my details with ${chapter} so it can email me local news`,
	onboarding_chapter_none_heading: (country) =>
		`Share your details with a PauseAI chapter in ${country} when one starts?`,
	onboarding_chapter_none_body: (country) =>
		`If you say yes and a chapter starts in ${country}, we share your signup details with it. It may be a separate organisation from PauseAI Global. You can change your mind at any time by emailing ${PRIVACY_EMAIL}.`,
	onboarding_chapter_none_yes: 'Yes, share my details with the chapter when it starts',
	onboarding_chapter_none_subscribe_heading: (country) =>
		`Hear from a PauseAI chapter in ${country} when one starts?`,
	onboarding_chapter_none_subscribe_yes:
		'Yes, share my details with the chapter when it starts, so it can email me local news',
	onboarding_chapter_no: 'No, only PauseAI Global',
	onboarding_keep_informed_sub_shared: (chapter) =>
		chapter
			? `Global campaign updates, plus news and ways to help from ${chapter}.`
			: 'Global campaign updates, plus news and ways to help from your chapter once one starts.',
	onboarding_keep_informed_sub_unanswered: (chapter) =>
		`Global campaign updates, plus news and ways to help from ${chapter ?? 'your chapter once one starts'} if you share your details with it.`,
	onboarding_keep_informed_sub_not_shared: 'Global campaign updates and ways to help.',
	onboarding_in_touch_shared: (chapter) =>
		chapter
			? `${chapter} will email you about it.`
			: 'PauseAI Global will email you about it, and your chapter will too once one starts.',
	onboarding_in_touch_unanswered: "We'll email you about it.",
	onboarding_in_touch_not_shared: 'PauseAI Global will email you about it.',
	onboarding_chapter_nudge: (chapter) =>
		chapter
			? `For events and campaigns from ${chapter} and PauseAI Global, tick Keep me informed.`
			: 'For events and campaigns from PauseAI Global, and your chapter once one starts, tick Keep me informed.',
	onboarding_confirm_keep_informed_shared: (chapter) =>
		chapter
			? `You'll get global campaign updates, plus news and ways to help from ${chapter}.`
			: "You'll get global campaign updates, plus news and ways to help from your chapter once one starts.",
	onboarding_confirm_keep_informed_not_shared:
		"You'll get global campaign updates and ways to help."
}

// Machine translations awaiting a native speaker's check. The country name stays in
// English, as the form's country list is English.
const chapterShareDe: ChapterShareMessages = {
	onboarding_chapter_answer_needed:
		'Beantworte oben die Frage zur lokalen Gruppe, um fortzufahren.',
	onboarding_chapter_loading: 'Die Frage zur lokalen Gruppe wird geladen…',
	onboarding_chapter_section_label: 'Deine lokale Gruppe',
	onboarding_chapter_heading: (chapter) => `Deine Daten mit ${chapter} teilen?`,
	onboarding_chapter_body: (chapter) =>
		`Wenn du zustimmst, teilen wir deine Anmeldeangaben mit ${chapter}. Dabei kann es sich um eine von PauseAI Global getrennte Organisation handeln. Du kannst deine Meinung jederzeit ändern, indem du eine E-Mail an ${PRIVACY_EMAIL} schreibst.`,
	onboarding_chapter_yes: (chapter) => `Ja, meine Daten mit ${chapter} teilen`,
	onboarding_chapter_site_label: (chapter) =>
		`Dem Orga-Team von ${chapter} erlauben, meine Daten zu sehen und mich zu lokalen Veranstaltungen und Kampagnen zu kontaktieren`,
	onboarding_chapter_site_alternative:
		'<a target="_blank" rel="noopener noreferrer" href="/privacy">Datenschutzrichtlinie</a> · Du möchtest nur den Newsletter von PauseAI Global? <a target="_blank" rel="noopener noreferrer" href="/subscribe">Stattdessen abonnieren</a>.',
	onboarding_chapter_site_consent_needed: 'Setze das Häkchen oben, um fortzufahren.',
	onboarding_chapter_subscribe_heading: (chapter) => `Auch Nachrichten von ${chapter} erhalten?`,
	onboarding_chapter_subscribe_yes: (chapter) =>
		`Ja, meine Daten mit ${chapter} teilen, damit mir die Gruppe lokale Neuigkeiten per E-Mail schicken kann`,
	onboarding_chapter_none_heading: (country) =>
		`Deine Daten mit einer PauseAI-Gruppe in ${country} teilen, sobald eine gegründet wird?`,
	onboarding_chapter_none_body: (country) =>
		`Wenn du zustimmst und eine Gruppe in ${country} gegründet wird, teilen wir deine Anmeldeangaben mit ihr. Sie kann eine von PauseAI Global getrennte Organisation sein. Du kannst deine Meinung jederzeit ändern, indem du an ${PRIVACY_EMAIL} schreibst.`,
	onboarding_chapter_none_yes: 'Ja, meine Daten mit der Gruppe teilen, sobald sie gegründet wird',
	onboarding_chapter_none_subscribe_heading: (country) =>
		`Nachrichten von einer PauseAI-Gruppe in ${country} erhalten, sobald eine gegründet wird?`,
	onboarding_chapter_none_subscribe_yes:
		'Ja, meine Daten mit der Gruppe teilen, sobald sie gegründet wird, damit sie mir lokale Neuigkeiten per E-Mail schicken kann',
	onboarding_chapter_no: 'Nein, nur PauseAI Global',
	onboarding_keep_informed_sub_shared: (chapter) =>
		chapter
			? `Updates zu globalen Kampagnen sowie Neuigkeiten und Mitmach-Möglichkeiten von ${chapter}.`
			: 'Updates zu globalen Kampagnen sowie Neuigkeiten und Mitmach-Möglichkeiten von deiner Gruppe, sobald es eine gibt.',
	onboarding_keep_informed_sub_unanswered: (chapter) =>
		chapter
			? `Updates zu globalen Kampagnen sowie Neuigkeiten und Mitmach-Möglichkeiten von ${chapter}, wenn du deine Daten mit der Gruppe teilst.`
			: 'Updates zu globalen Kampagnen. Wenn du deine Daten mit deiner Gruppe teilst, erhältst du außerdem Neuigkeiten und Mitmach-Möglichkeiten von ihr, sobald sie gegründet wird.',
	onboarding_keep_informed_sub_not_shared:
		'Updates zu globalen Kampagnen und Mitmach-Möglichkeiten.',
	onboarding_in_touch_shared: (chapter) =>
		chapter
			? `${chapter} schreibt dir dazu eine E-Mail.`
			: 'PauseAI Global schreibt dir dazu eine E-Mail, und deine Gruppe ebenfalls, sobald es eine gibt.',
	onboarding_in_touch_unanswered: 'Wir schreiben dir dazu eine E-Mail.',
	onboarding_in_touch_not_shared: 'PauseAI Global schreibt dir dazu eine E-Mail.',
	onboarding_chapter_nudge: (chapter) =>
		chapter
			? `Für Veranstaltungen und Kampagnen von ${chapter} und PauseAI Global kreuze „Auf dem Laufenden bleiben“ an.`
			: 'Für Veranstaltungen und Kampagnen von PauseAI Global und, sobald es eine gibt, von deiner Gruppe kreuze „Auf dem Laufenden bleiben“ an.',
	onboarding_confirm_keep_informed_shared: (chapter) =>
		chapter
			? `Du erhältst Updates zu globalen Kampagnen sowie Neuigkeiten und Mitmach-Möglichkeiten von ${chapter}.`
			: 'Du erhältst Updates zu globalen Kampagnen sowie Neuigkeiten und Mitmach-Möglichkeiten von deiner Gruppe, sobald es eine gibt.',
	onboarding_confirm_keep_informed_not_shared:
		'Du erhältst Updates zu globalen Kampagnen und Mitmach-Möglichkeiten.'
}

const chapterShareFr: ChapterShareMessages = {
	onboarding_chapter_answer_needed:
		'Réponds à la question sur le groupe local ci-dessus pour continuer.',
	onboarding_chapter_loading: 'Chargement de la question sur le groupe local…',
	onboarding_chapter_section_label: 'Ton groupe local',
	onboarding_chapter_heading: (chapter) => `Partager tes données avec ${chapter} ?`,
	onboarding_chapter_body: (chapter) =>
		`Si tu réponds oui, nous partageons tes données d'inscription avec ${chapter}, qui peut être une organisation distincte de PauseAI Global. Tu peux changer d'avis à tout moment en écrivant à ${PRIVACY_EMAIL}.`,
	onboarding_chapter_yes: (chapter) => `Oui, partager mes données avec ${chapter}`,
	onboarding_chapter_site_label: (chapter) =>
		`Permettre à l'équipe organisatrice de ${chapter} de voir mes données et de me contacter au sujet des événements et campagnes locaux`,
	onboarding_chapter_site_alternative: `<a target="_blank" rel="noopener noreferrer" href="/privacy">Politique de confidentialité</a> · Tu veux seulement la newsletter de PauseAI Global ? <a target="_blank" rel="noopener noreferrer" href="/subscribe">Abonne-toi plutôt</a>.`,
	onboarding_chapter_site_consent_needed: 'Coche la case ci-dessus pour continuer.',
	onboarding_chapter_subscribe_heading: (chapter) => `Recevoir aussi des nouvelles de ${chapter} ?`,
	onboarding_chapter_subscribe_yes: (chapter) =>
		`Oui, partager mes données avec ${chapter} pour qu'il puisse m'envoyer des nouvelles locales par e-mail`,
	onboarding_chapter_none_heading: (country) =>
		`Partager tes données avec un groupe PauseAI dans le pays sélectionné (${country}) dès qu'il sera créé ?`,
	onboarding_chapter_none_body: (country) =>
		`Si tu réponds oui et qu'un groupe est créé dans le pays sélectionné (${country}), nous partageons tes données d'inscription avec lui. Il peut être une organisation distincte de PauseAI Global. Tu peux changer d'avis à tout moment en écrivant à ${PRIVACY_EMAIL}.`,
	onboarding_chapter_none_yes: 'Oui, partager mes données avec le groupe dès sa création',
	onboarding_chapter_none_subscribe_heading: (country) =>
		`Recevoir des nouvelles d'un groupe PauseAI dans le pays sélectionné (${country}) dès qu'il sera créé ?`,
	onboarding_chapter_none_subscribe_yes:
		"Oui, partager mes données avec le groupe dès sa création, pour qu'il puisse m'envoyer des nouvelles locales par e-mail",
	onboarding_chapter_no: 'Non, seulement PauseAI Global',
	onboarding_keep_informed_sub_shared: (chapter) =>
		chapter
			? `Les actualités des campagnes mondiales, ainsi que des nouvelles de ${chapter} et des possibilités d'action proposées par ce groupe.`
			: "Les actualités des campagnes mondiales, ainsi que des nouvelles de ton groupe et des possibilités d'action proposées par celui-ci dès sa création.",
	onboarding_keep_informed_sub_unanswered: (chapter) =>
		chapter
			? `Les actualités des campagnes mondiales. Si tu partages tes données avec ${chapter}, tu recevras aussi des nouvelles de ce groupe et des possibilités d'action qu'il propose.`
			: "Les actualités des campagnes mondiales. Si tu partages tes données avec ton groupe, tu recevras aussi, dès sa création, des nouvelles de celui-ci et des possibilités d'action qu'il propose.",
	onboarding_keep_informed_sub_not_shared:
		"Les actualités des campagnes mondiales et des occasions d'agir.",
	onboarding_in_touch_shared: (chapter) =>
		chapter
			? `${chapter} t'écrira à ce sujet par e-mail.`
			: "PauseAI Global t'écrira à ce sujet par e-mail, et ton groupe aussi dès qu'il existera.",
	onboarding_in_touch_unanswered: "Nous t'écrirons à ce sujet par e-mail.",
	onboarding_in_touch_not_shared: "PauseAI Global t'écrira à ce sujet par e-mail.",
	onboarding_chapter_nudge: (chapter) =>
		chapter
			? `Pour les événements et les campagnes de ${chapter} et de PauseAI Global, coche « Me tenir informé·e ».`
			: "Pour les événements et les campagnes de PauseAI Global, et de ton groupe dès qu'il existera, coche « Me tenir informé·e ».",
	onboarding_confirm_keep_informed_shared: (chapter) =>
		chapter
			? `Tu recevras les actualités des campagnes mondiales, ainsi que des nouvelles de ${chapter} et des possibilités d'action proposées par ce groupe.`
			: "Tu recevras les actualités des campagnes mondiales, ainsi que des nouvelles de ton groupe et des possibilités d'action proposées par celui-ci dès sa création.",
	onboarding_confirm_keep_informed_not_shared:
		"Tu recevras les actualités des campagnes mondiales et des occasions d'agir."
}

const chapterShareEs: ChapterShareMessages = {
	onboarding_chapter_answer_needed:
		'Responde arriba a la pregunta sobre el grupo local para continuar.',
	onboarding_chapter_loading: 'Cargando la pregunta sobre el grupo local…',
	onboarding_chapter_section_label: 'Tu grupo local',
	onboarding_chapter_heading: (chapter) => `¿Compartir tus datos con ${chapter}?`,
	onboarding_chapter_body: (chapter) =>
		`Si dices que sí, compartimos tus datos de inscripción con ${chapter}, que puede ser una organización distinta de PauseAI Global. Puedes cambiar de opinión en cualquier momento escribiendo a ${PRIVACY_EMAIL}.`,
	onboarding_chapter_yes: (chapter) => `Sí, compartir mis datos con ${chapter}`,
	onboarding_chapter_site_label: (chapter) =>
		`Permitir que el equipo organizador de ${chapter} vea mis datos y me contacte sobre eventos y campañas locales`,
	onboarding_chapter_site_alternative:
		'<a target="_blank" rel="noopener noreferrer" href="/privacy">Política de privacidad</a> · ¿Solo quieres el boletín de PauseAI Global? <a target="_blank" rel="noopener noreferrer" href="/subscribe">Suscríbete en su lugar</a>.',
	onboarding_chapter_site_consent_needed: 'Marca la casilla de arriba para continuar.',
	onboarding_chapter_subscribe_heading: (chapter) => `¿Recibir también noticias de ${chapter}?`,
	onboarding_chapter_subscribe_yes: (chapter) =>
		`Sí, compartir mis datos con ${chapter} para que pueda enviarme noticias locales por correo electrónico`,
	onboarding_chapter_none_heading: (country) =>
		`¿Compartir tus datos con un grupo de PauseAI en ${country} cuando se cree uno?`,
	onboarding_chapter_none_body: (country) =>
		`Si dices que sí y se crea un grupo en ${country}, compartimos tus datos de inscripción con él. Puede ser una organización distinta de PauseAI Global. Puedes cambiar de opinión en cualquier momento escribiendo a ${PRIVACY_EMAIL}.`,
	onboarding_chapter_none_yes: 'Sí, compartir mis datos con el grupo cuando se cree',
	onboarding_chapter_none_subscribe_heading: (country) =>
		`¿Recibir noticias de un grupo de PauseAI en ${country} cuando se cree uno?`,
	onboarding_chapter_none_subscribe_yes:
		'Sí, compartir mis datos con el grupo cuando se cree, para que pueda enviarme noticias locales por correo electrónico',
	onboarding_chapter_no: 'No, solo PauseAI Global',
	onboarding_keep_informed_sub_shared: (chapter) =>
		chapter
			? `Novedades de las campañas globales, además de noticias de ${chapter} y propuestas de este grupo para que puedas ayudar.`
			: 'Novedades de las campañas globales, además de noticias de tu grupo y propuestas de este para que puedas ayudar, cuando se cree.',
	onboarding_keep_informed_sub_unanswered: (chapter) =>
		chapter
			? `Novedades de las campañas globales. Si compartes tus datos con ${chapter}, recibirás también noticias de este grupo y propuestas para que puedas ayudar.`
			: 'Novedades de las campañas globales. Si compartes tus datos con tu grupo, recibirás también, cuando se cree, noticias de este y propuestas para que puedas ayudar.',
	onboarding_keep_informed_sub_not_shared: 'Novedades de las campañas globales y formas de ayudar.',
	onboarding_in_touch_shared: (chapter) =>
		chapter
			? `${chapter} te escribirá por correo electrónico sobre ello.`
			: 'PauseAI Global te escribirá por correo electrónico sobre ello, y tu grupo también cuando exista uno.',
	onboarding_in_touch_unanswered: 'Te escribiremos por correo electrónico sobre ello.',
	onboarding_in_touch_not_shared: 'PauseAI Global te escribirá por correo electrónico sobre ello.',
	onboarding_chapter_nudge: (chapter) =>
		chapter
			? `Para recibir información sobre los eventos y las campañas de ${chapter} y de PauseAI Global, marca «Mantenme informado/a».`
			: 'Para recibir información sobre los eventos y las campañas de PauseAI Global y, cuando se cree, de tu grupo, marca «Mantenme informado/a».',
	onboarding_confirm_keep_informed_shared: (chapter) =>
		chapter
			? `Recibirás novedades de las campañas globales, además de noticias de ${chapter} y propuestas de este grupo para que puedas ayudar.`
			: 'Recibirás novedades de las campañas globales, además de noticias de tu grupo y propuestas de este para que puedas ayudar, cuando se cree.',
	onboarding_confirm_keep_informed_not_shared:
		'Recibirás novedades de las campañas globales y formas de ayudar.'
}

const chapterShareIt: ChapterShareMessages = {
	onboarding_chapter_answer_needed:
		'Rispondi alla domanda sul gruppo locale qui sopra per continuare.',
	onboarding_chapter_loading: 'Caricamento della domanda sul gruppo locale…',
	onboarding_chapter_section_label: 'Il tuo gruppo locale',
	onboarding_chapter_heading: (chapter) => `Condividere i tuoi dati con ${chapter}?`,
	onboarding_chapter_body: (chapter) =>
		`Se rispondi sì, condividiamo i tuoi dati di iscrizione con ${chapter}, che può essere un'organizzazione distinta da PauseAI Global. Puoi cambiare idea in qualsiasi momento scrivendo a ${PRIVACY_EMAIL}.`,
	onboarding_chapter_yes: (chapter) => `Sì, condividi i miei dati con ${chapter}`,
	onboarding_chapter_site_label: (chapter) =>
		`Condividi i miei dati con ${chapter} e PauseAI Global`,
	onboarding_chapter_site_consent_needed: 'Per continuare, dai il tuo consenso.',
	onboarding_chapter_subscribe_heading: (chapter) => `Ricevere notizie anche da ${chapter}?`,
	onboarding_chapter_subscribe_yes: (chapter) =>
		`Sì, condividi i miei dati con ${chapter} così che possa inviarmi notizie locali via e-mail`,
	onboarding_chapter_none_heading: (country) =>
		`Condividere i tuoi dati con un gruppo PauseAI in ${country} quando ne nascerà uno?`,
	onboarding_chapter_none_body: (country) =>
		`Se rispondi sì e nasce un gruppo in ${country}, condividiamo con esso i tuoi dati di iscrizione. Può essere un'organizzazione distinta da PauseAI Global. Puoi cambiare idea in qualsiasi momento scrivendo a ${PRIVACY_EMAIL}.`,
	onboarding_chapter_none_yes: 'Sì, condividi i miei dati con il gruppo quando nascerà',
	onboarding_chapter_none_subscribe_heading: (country) =>
		`Ricevere notizie da un gruppo PauseAI in ${country} quando ne nascerà uno?`,
	onboarding_chapter_none_subscribe_yes:
		'Sì, condividi i miei dati con il gruppo quando nascerà, così che possa inviarmi notizie locali via e-mail',
	onboarding_chapter_no: 'No, solo PauseAI Global',
	onboarding_keep_informed_sub_shared: (chapter) =>
		chapter
			? `Aggiornamenti sulle campagne globali, oltre a notizie e modi per aiutare da ${chapter}.`
			: 'Aggiornamenti sulle campagne globali, oltre a notizie e modi per aiutare dal tuo gruppo locale quando ne nascerà uno.',
	onboarding_keep_informed_sub_unanswered: (chapter) =>
		chapter
			? `Aggiornamenti sulle campagne globali, oltre a notizie e modi per aiutare da ${chapter} se condividi i tuoi dati con il gruppo.`
			: 'Aggiornamenti sulle campagne globali. Se condividi i tuoi dati con il tuo gruppo locale, riceverai anche notizie e modi per aiutare da quel gruppo quando nascerà.',
	onboarding_keep_informed_sub_not_shared:
		'Aggiornamenti sulle campagne globali e modi per aiutare.',
	onboarding_in_touch_shared: (chapter) =>
		chapter
			? `${chapter} ti scriverà via e-mail al riguardo.`
			: 'PauseAI Global ti scriverà via e-mail al riguardo, e lo farà anche il tuo gruppo locale quando ne nascerà uno.',
	onboarding_in_touch_unanswered: 'Ti scriveremo via e-mail al riguardo.',
	onboarding_in_touch_not_shared: 'PauseAI Global ti scriverà via e-mail al riguardo.',
	onboarding_chapter_nudge: (chapter) =>
		chapter
			? `Per eventi e campagne di ${chapter} e di PauseAI Global, seleziona «Tienimi informato/a».`
			: 'Per eventi e campagne di PauseAI Global e, quando ne nascerà uno, del tuo gruppo locale, seleziona «Tienimi informato/a».',
	onboarding_confirm_keep_informed_shared: (chapter) =>
		chapter
			? `Riceverai aggiornamenti sulle campagne globali, oltre a notizie e modi per aiutare da ${chapter}.`
			: 'Riceverai aggiornamenti sulle campagne globali, oltre a notizie e modi per aiutare dal tuo gruppo locale quando ne nascerà uno.',
	onboarding_confirm_keep_informed_not_shared:
		'Riceverai aggiornamenti sulle campagne globali e modi per aiutare.'
}

export interface OnboardingMessages extends ChapterShareMessages {
	onboarding_page_title: string
	onboarding_page_description: string
	onboarding_browse_banner: string
	onboarding_field_full_name: string
	onboarding_placeholder_full_name: string
	onboarding_field_email: string
	onboarding_placeholder_email: string
	onboarding_field_country: string
	onboarding_placeholder_country: string
	onboarding_field_city: string
	onboarding_placeholder_city: string
	onboarding_us_note: string
	onboarding_btn_continue: string
	onboarding_btn_browse: string
	onboarding_browse_helper: string
	onboarding_step2_heading: string
	onboarding_optins_heading: string
	onboarding_email_critical_notice: string
	onboarding_intent_keep_informed_label: string
	onboarding_intent_newsletter_label: string
	onboarding_intent_newsletter_sub: string
	onboarding_intent_more_optional: string
	onboarding_intent_act_now_label: string
	onboarding_intent_act_now_sub: string
	onboarding_intent_volunteer_label: string
	onboarding_intent_volunteer_sub: string
	onboarding_intent_lead_label: string
	onboarding_intent_lead_sub: string
	onboarding_gdpr_consent: string
	onboarding_btn_submit: string
	onboarding_btn_submitting: string
	onboarding_btn_back: string
	onboarding_confirm_newsletter: string
	onboarding_check_inbox_title: string
	onboarding_check_inbox_body: string
	onboarding_confirm_b_sub: string
	onboarding_confirm_volunteer_title: string
	onboarding_confirm_volunteer_sub: string
	onboarding_browse_header_title: string
	onboarding_browse_header_sub: string
	onboarding_browse_keep_informed_title: string
	onboarding_btn_sign_me_up: string
	onboarding_btn_signing_up: string
	onboarding_section_ways_to_help: string
	onboarding_next_step_title: string
	onboarding_next_step_p1: string
	onboarding_next_step_p2: string
	onboarding_footer_join_conversation: string
	onboarding_footer_discord_btn: string
	onboarding_footer_follow_us: string
	onboarding_step_about: string
	onboarding_step_intent: string
	onboarding_step_volunteer_form: string
	onboarding_step_check_inbox: string
	onboarding_step_next_steps: string
	onboarding_volunteer_title: string
	onboarding_volunteer_intro: string
	onboarding_field_zip: string
	onboarding_placeholder_zip: string
	onboarding_helper_zip: string
	onboarding_field_uk_postcode: string
	onboarding_placeholder_uk_postcode: string
	onboarding_helper_uk_postcode: string
	onboarding_field_university: string
	onboarding_placeholder_university: string
	onboarding_helper_university: string
	onboarding_field_discord: string
	onboarding_helper_discord: string
	onboarding_field_phone: string
	onboarding_placeholder_dial_code: string
	onboarding_placeholder_phone: string
	onboarding_field_languages: string
	onboarding_placeholder_languages: string
	onboarding_field_discovery: string
	onboarding_placeholder_discovery: string
	onboarding_field_motivations: string
	onboarding_field_skills: string
	onboarding_field_hours: string
	onboarding_placeholder_specify: string
	onboarding_agree_volunteer: string
	onboarding_agree_conduct: string
	onboarding_become_paying_member: string
	onboarding_become_paying_member_disclaimer: string
	onboarding_paying_member_heading: string
	onboarding_paying_member_description: string
	onboarding_paying_member_donate_notice: string
	onboarding_lead_title: (role: string) => string
	onboarding_lead_meta: string
	onboarding_lead_intro: string
	onboarding_lead_has_chapter: (country: string) => string
	onboarding_lead_check_chapter: string
	onboarding_lead_what_you_do_title: string
	onboarding_lead_do_1: string
	onboarding_lead_do_2: string
	onboarding_lead_do_3: string
	onboarding_lead_do_4: string
	onboarding_lead_looking_for_title: string
	onboarding_lead_looking_1: string
	onboarding_lead_looking_2: string
	onboarding_lead_looking_3: string
	onboarding_lead_looking_4: string
	onboarding_lead_looking_5: string
	onboarding_lead_looking_6: string
	onboarding_lead_nice_to_have_title: string
	onboarding_lead_nice_1: string
	onboarding_lead_nice_2: string
	onboarding_lead_nice_3: string
	onboarding_lead_imperfect: string
	onboarding_lead_support_title: string
	onboarding_lead_support: string
	onboarding_lead_next_steps_title: string
	onboarding_lead_next_steps: string
	onboarding_lead_apply_btn: string
	onboarding_discovery_pauseai_social: string
	onboarding_discovery_other_social: string
	onboarding_discovery_referral: string
	onboarding_discovery_news: string
	onboarding_discovery_event: string
	onboarding_discovery_search: string
	onboarding_discovery_other: string
	onboarding_motivation_ai_safety: string
	onboarding_motivation_democratic_oversight: string
	onboarding_motivation_ethical_tech: string
	onboarding_motivation_ai_governance: string
	onboarding_motivation_job_displacement: string
	onboarding_motivation_misinformation: string
	onboarding_motivation_deepfakes: string
	onboarding_motivation_power: string
	onboarding_motivation_privacy: string
	onboarding_motivation_environment: string
	onboarding_motivation_addiction: string
	onboarding_motivation_weapons: string
	onboarding_motivation_cyber: string
	onboarding_motivation_bioweapons: string
	onboarding_motivation_other: string
	onboarding_skill_software: string
	onboarding_skill_video: string
	onboarding_skill_social_media: string
	onboarding_skill_events: string
	onboarding_skill_speaking: string
	onboarding_skill_writing: string
	onboarding_skill_design: string
	onboarding_skill_research: string
	onboarding_skill_comms: string
	onboarding_skill_fundraising: string
	onboarding_skill_community: string
	onboarding_skill_advocacy: string
	onboarding_skill_education: string
	onboarding_skill_admin: string
	onboarding_skill_legal: string
	onboarding_skill_other: string
	onboarding_hours_under_3: string
	onboarding_hours_3_6: string
	onboarding_hours_6_10: string
	onboarding_hours_10_20: string
	onboarding_hours_20_plus: string
	onboarding_action_ai_concerns_title: string
	onboarding_action_ai_concerns_sub: string
	onboarding_action_email_reps_title: string
	onboarding_action_email_reps_sub: string
	onboarding_action_lobby_title: string
	onboarding_action_lobby_sub: string
	onboarding_action_talk_title: string
	onboarding_action_talk_sub: string
	onboarding_action_catalyse_title: string
	onboarding_action_catalyse_sub: string
	onboarding_action_petitions_title: string
	onboarding_action_petitions_sub: string
	onboarding_action_donate_title: string
	onboarding_action_donate_sub: string
	onboarding_error_generic: string
	onboarding_error_unexpected: string
}

const en: OnboardingMessages = {
	...chapterShareEn,
	onboarding_page_title: 'Get involved',
	onboarding_page_description:
		'Find the highest-impact way for you to help pause the development of superhuman AI.',
	onboarding_browse_banner:
		"You're browsing without signing up, leave your email below so we can tell you when new opportunities go live.",
	onboarding_field_full_name: 'Full name *',
	onboarding_placeholder_full_name: 'Full name',
	onboarding_field_email: 'Email *',
	onboarding_placeholder_email: 'Email',
	onboarding_field_country: 'Country of residence *',
	onboarding_placeholder_country: 'Select your country',
	onboarding_field_city: 'City / town of residence *',
	onboarding_placeholder_city: 'City / town',
	onboarding_us_note:
		'PauseAI US is a separate organisation. Head over to <a target="_blank" rel="noopener noreferrer" href="https://peopleforapause.org/get-involved">People for a Pause</a> to get involved there.',
	onboarding_btn_continue: 'Continue →',
	onboarding_btn_browse: '👀 I just want to take action now',
	onboarding_browse_helper: 'Skip ahead to see the actions you can take today, no email required.',
	onboarding_step2_heading: 'What brings you here?',
	onboarding_optins_heading: 'Want to hear from us?',
	onboarding_email_critical_notice:
		'We may occasionally send you a critical alert, even if you don\'t opt into any of these. You can unsubscribe from any list at any time. See our <a target="_blank" rel="noopener noreferrer" href="/privacy">privacy policy</a>.',
	onboarding_intent_keep_informed_label: 'Keep me informed',
	onboarding_intent_newsletter_label: 'Subscribe to our Substack',
	onboarding_intent_newsletter_sub: "AI news from the PauseAI team's perspective.",
	onboarding_intent_more_optional: 'Want to do more? (optional)',
	onboarding_intent_act_now_label: 'I just want to take action now',
	onboarding_intent_act_now_sub: 'Show me what I can do today.',
	onboarding_intent_volunteer_label: 'I want to volunteer regularly',
	onboarding_intent_volunteer_sub: 'Help me find a role that fits.',
	onboarding_intent_lead_label: 'I want to lead',
	onboarding_intent_lead_sub: "I'm ready to organize in my country or region.",
	onboarding_gdpr_consent:
		'I agree to the <a target="_blank" rel="noopener noreferrer" href="/privacy">Privacy Policy</a>.&nbsp;*',
	onboarding_btn_submit: 'Submit →',
	onboarding_btn_submitting: 'Submitting...',
	onboarding_btn_back: '← Back',
	onboarding_confirm_newsletter:
		"You're subscribed to our Substack: AI news from the PauseAI team's perspective, delivered by email.",
	onboarding_check_inbox_title: 'Check your inbox',
	onboarding_check_inbox_body:
		"We've sent you an email. Click the link in it to confirm your address. If it's not there, check your spam folder.",
	onboarding_confirm_b_sub: 'Here are a few ways to make a difference today.',
	onboarding_confirm_volunteer_title: 'Welcome to the team.',
	onboarding_confirm_volunteer_sub: "You're on the volunteer list. We'll be in touch soon.",
	onboarding_browse_header_title: 'Take action right now.',
	onboarding_browse_header_sub:
		'Below are some actions you can take right now. The best way to stay informed about new opportunities is to sign up below.',
	onboarding_browse_keep_informed_title: 'Keep me informed',
	onboarding_btn_sign_me_up: 'Sign me up →',
	onboarding_btn_signing_up: 'Signing up...',
	onboarding_section_ways_to_help: 'A few ways to help today',
	onboarding_next_step_title: '★ Recommended next step',
	onboarding_next_step_p1:
		'Join one of our Member Community Welcome Meetings, or a local social event, to find out more about PauseAI\'s community: <a target="_blank" rel="noopener noreferrer" href="/communities#events">see upcoming events</a>.',
	onboarding_next_step_p2:
		'Want to get kick-started into action straight away? Check out our <a target="_blank" rel="noopener noreferrer" href="/action">list of actions</a>.',
	onboarding_footer_join_conversation: 'Join the conversation',
	onboarding_footer_discord_btn: 'Join PauseAI on Discord',
	onboarding_footer_follow_us: 'Follow us',
	onboarding_step_about: 'About you',
	onboarding_step_intent: 'Intent',
	onboarding_step_volunteer_form: 'Volunteer form',
	onboarding_step_check_inbox: 'Check your inbox',
	onboarding_step_next_steps: 'Next steps',
	onboarding_volunteer_title: 'Sign up to volunteer',
	onboarding_volunteer_intro: 'Tell us a bit about yourself so we can find a role that fits.',
	onboarding_field_zip: 'Zip code',
	onboarding_placeholder_zip: 'e.g. 02134',
	onboarding_helper_zip: 'Your 5-digit zip code is used to find your Local Group.',
	onboarding_field_uk_postcode: 'Postcode',
	onboarding_placeholder_uk_postcode: 'e.g. SW1A 1AA',
	onboarding_helper_uk_postcode:
		"Your full postcode. We use it to connect you with your MP's constituency and your nearest local group.",
	onboarding_field_university: 'University (optional)',
	onboarding_placeholder_university: 'Search by name or abbreviation, e.g. LSE',
	onboarding_helper_university: 'Studying at a university? Let us know which one.',
	onboarding_field_discord: 'Discord username',
	onboarding_helper_discord:
		'If you don\'t have a Discord account, we encourage you to <a target="_blank" rel="noopener noreferrer" href="https://discord.com/register">create one here</a>.',
	onboarding_field_phone: 'Phone number',
	onboarding_placeholder_dial_code: '+1',
	onboarding_placeholder_phone: '(555) 000-0000',
	onboarding_field_languages: 'What languages do you speak? *',
	onboarding_placeholder_languages: 'Select languages',
	onboarding_field_discovery: 'How did you find out about PauseAI?',
	onboarding_placeholder_discovery: 'Select an option',
	onboarding_field_motivations: 'What motivated you to join?',
	onboarding_field_skills: 'Skills & interests',
	onboarding_field_hours: 'How much time can you commit weekly? *',
	onboarding_placeholder_specify: 'Please specify',
	onboarding_agree_volunteer:
		'I agree with the <a target="_blank" rel="noopener noreferrer" href="/volunteer-agreement">Volunteer Agreement</a>&nbsp;*',
	onboarding_agree_conduct:
		'I agree with the <a target="_blank" rel="noopener noreferrer" href="/code-of-conduct">Code of Conduct</a>&nbsp;*',
	onboarding_become_paying_member:
		'I want to become a paying member — open the donation page after submitting.',
	onboarding_become_paying_member_disclaimer:
		'The payment processor (Stripe) will open in a new tab when you submit.',
	onboarding_paying_member_heading: 'Would you like to become a paying member of PauseAI Global?',
	onboarding_paying_member_description:
		'By contributing a $5 monthly fee, you can support the work of PauseAI Global volunteers to protest, lobby and coordinate for a global pause on the development of Artificial General Intelligence. To unsubscribe, message us at <a href="mailto:unsubscribe@pauseai.info">unsubscribe@pauseai.info</a>.',
	onboarding_paying_member_donate_notice:
		'You can also make a larger contribution to PauseAI Global by donating to us <a target="_blank" rel="noopener noreferrer" href="https://pauseai.info/donate">here</a>.',
	onboarding_lead_title: (role) => `${role} Volunteer Description`,
	onboarding_lead_meta: 'Part-time volunteer role · 5–15 hours/week',
	onboarding_lead_intro:
		'Pause AI Global is looking for leaders around the world to run local groups that lead organising efforts in their area. This is a part-time volunteer role requiring 5-15 hours per week. Each group leader will be responsible for planning direct actions, mobilising volunteers and coordinating with the Global PauseAI team.',
	onboarding_lead_has_chapter: (country) =>
		`<strong>${country} already has a PauseAI chapter</strong>, so rather than founding a national group, you could lead a regional or city group within it. Find your chapter at <a target="_blank" rel="noopener noreferrer" href="/communities">pauseai.info/communities</a>, or apply below and we'll talk it through.`,
	onboarding_lead_check_chapter:
		'<strong>First, check that your country doesn\'t already have a chapter:</strong> <a target="_blank" rel="noopener noreferrer" href="/communities">pauseai.info/communities</a>.',
	onboarding_lead_what_you_do_title: "What you'll do",
	onboarding_lead_do_1:
		'Recruit and grow your local group by welcoming new volunteers and organising events together.',
	onboarding_lead_do_2: 'Build relationships with local activist groups and journalists.',
	onboarding_lead_do_3:
		"Meet monthly with PauseAI's Global team to swap ideas and stay coordinated with the global strategy and quarterly campaigns.",
	onboarding_lead_do_4: 'Share what your chapter is up to on social media and help promote events.',
	onboarding_lead_looking_for_title: "What we're looking for",
	onboarding_lead_looking_1:
		'Ability to plan and execute direct actions, including workshops and public events.',
	onboarding_lead_looking_2:
		'Excellent communication skills, eager and able to engage diverse communities.',
	onboarding_lead_looking_3:
		'Self-motivated, with the ability to work independently and as part of a team.',
	onboarding_lead_looking_4: "Passion for AI safety and alignment with PauseAI's mission.",
	onboarding_lead_looking_5: 'Comfortable communicating in English',
	onboarding_lead_looking_6: 'Adhere and practice to a non-violent, legal approach.',
	onboarding_lead_nice_to_have_title: 'What would be nice to have',
	onboarding_lead_nice_1: 'Strong organising skills and experience in grassroots activism.',
	onboarding_lead_nice_2: 'Lobbying skills and policymaker engagement experience',
	onboarding_lead_nice_3: 'Media and content writing experience',
	onboarding_lead_imperfect:
		'If you do not meet all of the requirements, we still want to hear from you. The commitment to AI Safety and the belief we can make an impact is the most important factor; we can provide training, resources and a community to lean on.',
	onboarding_lead_support_title: "Support you'll get",
	onboarding_lead_support:
		"You'll join a global network of organisers who are all figuring this out together. We meet monthly, share resources across our chat platforms and help each other troubleshoot. It's a great way to learn new skills, meet thoughtful people and be part of a fast-growing movement that's working on one of the most important issues of our time.",
	onboarding_lead_next_steps_title: 'Next steps',
	onboarding_lead_next_steps:
		'If this sounds like you, please fill in our lead application form below. Our PauseAI Global organising director Irina Tavera reviews every application and will be in touch about next steps.',
	onboarding_lead_apply_btn: 'Apply to become a lead',
	onboarding_discovery_pauseai_social: 'PauseAI affiliated social media',
	onboarding_discovery_other_social: 'Non-PauseAI affiliated social media',
	onboarding_discovery_referral: 'Friend/Family referral',
	onboarding_discovery_news: 'News article',
	onboarding_discovery_event: 'Event/Presentation',
	onboarding_discovery_search: 'Internet search',
	onboarding_discovery_other: 'Other',
	onboarding_motivation_ai_safety: 'AI Safety',
	onboarding_motivation_democratic_oversight: 'Need for democratic oversight',
	onboarding_motivation_ethical_tech: 'Ethical technology',
	onboarding_motivation_ai_governance: 'AI Governance',
	onboarding_motivation_job_displacement: 'Job Displacement',
	onboarding_motivation_misinformation: 'Misinformation',
	onboarding_motivation_deepfakes: 'Deepfake scams and harassment',
	onboarding_motivation_power: 'Concentration of power',
	onboarding_motivation_privacy: 'Privacy loss',
	onboarding_motivation_environment: 'Environmental damage',
	onboarding_motivation_addiction: 'Technology addiction',
	onboarding_motivation_weapons: 'Autonomous weapons',
	onboarding_motivation_cyber: 'Cyberattacks',
	onboarding_motivation_bioweapons: 'Bioweapons',
	onboarding_motivation_other: 'Other',
	onboarding_skill_software: 'Software Development',
	onboarding_skill_video: 'Video Creation',
	onboarding_skill_social_media: 'Social Media Management',
	onboarding_skill_events: 'Event Organization',
	onboarding_skill_speaking: 'Public Speaking/ Presentation',
	onboarding_skill_writing: 'Writing',
	onboarding_skill_design: 'Graphic Design/ Visual Arts',
	onboarding_skill_research: 'Research',
	onboarding_skill_comms: 'Communications/ PR',
	onboarding_skill_fundraising: 'Fundraising',
	onboarding_skill_community: 'Community Organizing',
	onboarding_skill_advocacy: 'Political Advocacy/ Lobbying',
	onboarding_skill_education: 'Education/ Teaching',
	onboarding_skill_admin: 'Administrative Support',
	onboarding_skill_legal: 'Legal Knowledge',
	onboarding_skill_other: 'Other',
	onboarding_hours_under_3: 'Less than 3 hours',
	onboarding_hours_3_6: '3-6 hours',
	onboarding_hours_6_10: '6-10 hours',
	onboarding_hours_10_20: '10-20 hours',
	onboarding_hours_20_plus: '20+ hours',
	onboarding_action_ai_concerns_title: 'Share your AI concerns',
	onboarding_action_ai_concerns_sub: 'Tell your story and add your voice to the public record.',
	onboarding_action_email_reps_title: 'Email your elected representatives',
	onboarding_action_email_reps_sub:
		'Use our Email Builder for a pre-drafted message you can personalize and send.',
	onboarding_action_lobby_title: 'Contact your elected officials',
	onboarding_action_lobby_sub: 'Our lobby tips walk you through what to say.',
	onboarding_action_talk_title: 'Talk to someone in your life about AI safety',
	onboarding_action_talk_sub:
		'A friend, neighbour, colleague, or family member. Our <a target="_blank" rel="noopener noreferrer" href="/counterarguments">counterarguments guide</a> can help you answer tough questions and encourage others to act.',
	onboarding_action_catalyse_title: 'Catalyse — find a volunteer project',
	onboarding_action_catalyse_sub:
		'Browse volunteer projects and join one that matches your skills and time.',
	onboarding_action_petitions_title: 'Sign the petitions',
	onboarding_action_petitions_sub:
		'Add your name alongside thousands of others calling for safer AI.',
	onboarding_action_donate_title: 'Donate or pick up some gear',
	onboarding_action_donate_sub:
		'Make a <a target="_blank" rel="noopener noreferrer" href="/donate">donation</a> or pick up some gear from our <a target="_blank" rel="noopener noreferrer" href="https://pauseai-shop.fourthwall.com/">store</a>.',
	onboarding_error_generic: 'Something went wrong. Please try again.',
	onboarding_error_unexpected: 'An unexpected error occurred. Please try again.'
}

const de: OnboardingMessages = {
	...chapterShareDe,
	onboarding_page_title: 'Mitmachen',
	onboarding_page_description:
		'Finde den wirkungsvollsten Weg, um bei der Pause der KI-Entwicklung zu helfen.',
	onboarding_browse_banner:
		'Du browst ohne dich anzumelden. Hinterlasse unten deine E-Mail, damit wir dich über neue Möglichkeiten informieren können.',
	onboarding_field_full_name: 'Vollständiger Name *',
	onboarding_placeholder_full_name: 'Vollständiger Name',
	onboarding_field_email: 'E-Mail *',
	onboarding_placeholder_email: 'E-Mail',
	onboarding_field_country: 'Wohnsitzland *',
	onboarding_placeholder_country: 'Land auswählen',
	onboarding_field_city: 'Stadt / Gemeinde *',
	onboarding_placeholder_city: 'Stadt / Gemeinde',
	onboarding_us_note:
		'PauseAI US ist eine eigenständige Organisation. Besuche <a target="_blank" rel="noopener noreferrer" href="https://peopleforapause.org/get-involved">People for a Pause</a>, um dich dort zu engagieren.',
	onboarding_btn_continue: 'Weiter →',
	onboarding_btn_browse: '👀 Ich möchte nur jetzt handeln',
	onboarding_browse_helper: 'Überspringe die Anmeldung und sieh, was du heute tun kannst.',
	onboarding_step2_heading: 'Was bringt dich hierher?',
	onboarding_optins_heading: 'Möchtest du von uns hören?',
	onboarding_email_critical_notice:
		'Wir können dir gelegentlich eine kritische Warnung schicken, auch wenn du keine dieser Optionen ankreuzt. Du kannst dich jederzeit von jeder Liste abmelden. Siehe unsere <a target="_blank" rel="noopener noreferrer" href="/privacy">Datenschutzrichtlinie</a>.',
	onboarding_intent_keep_informed_label: 'Auf dem Laufenden bleiben',
	onboarding_intent_newsletter_label: 'Unseren Substack abonnieren',
	onboarding_intent_newsletter_sub: 'KI-Nachrichten aus der Perspektive des PauseAI-Teams.',
	onboarding_intent_more_optional: 'Möchtest du mehr tun? (optional)',
	onboarding_intent_act_now_label: 'Ich möchte jetzt handeln',
	onboarding_intent_act_now_sub: 'Zeig mir, was ich heute tun kann.',
	onboarding_intent_volunteer_label: 'Ich möchte regelmäßig freiwillig tätig sein',
	onboarding_intent_volunteer_sub: 'Hilf mir, eine passende Rolle zu finden.',
	onboarding_intent_lead_label: 'Ich möchte leiten',
	onboarding_intent_lead_sub: 'Ich bin bereit, in meinem Land oder meiner Region zu organisieren.',
	onboarding_gdpr_consent:
		'Ich stimme der <a target="_blank" rel="noopener noreferrer" href="/privacy">Datenschutzrichtlinie</a> zu.&nbsp;*',
	onboarding_btn_submit: 'Absenden →',
	onboarding_btn_submitting: 'Wird abgesendet...',
	onboarding_btn_back: '← Zurück',
	onboarding_confirm_newsletter:
		'Du hast unseren Substack abonniert: KI-Nachrichten aus der Perspektive des PauseAI-Teams, per E-Mail.',
	onboarding_check_inbox_title: 'Schau in dein Postfach',
	onboarding_check_inbox_body:
		'Wir haben dir eine E-Mail geschickt. Klicke auf den Link darin, um deine Adresse zu bestätigen. Falls du sie nicht findest, schau im Spam-Ordner nach.',
	onboarding_confirm_b_sub: 'Hier sind einige Möglichkeiten, heute etwas zu bewirken.',
	onboarding_confirm_volunteer_title: 'Willkommen im Team.',
	onboarding_confirm_volunteer_sub:
		'Du stehst auf der Freiwilligenliste. Wir melden uns bald bei dir.',
	onboarding_browse_header_title: 'Jetzt handeln.',
	onboarding_browse_header_sub:
		'Im Folgenden findest du Aktionen, die du sofort ergreifen kannst. Am besten bleibst du über neue Möglichkeiten informiert, indem du dich unten anmeldest.',
	onboarding_browse_keep_informed_title: 'Auf dem Laufenden bleiben',
	onboarding_btn_sign_me_up: 'Anmelden →',
	onboarding_btn_signing_up: 'Wird angemeldet...',
	onboarding_section_ways_to_help: 'Einige Möglichkeiten zu helfen',
	onboarding_next_step_title: '★ Empfohlener nächster Schritt',
	onboarding_next_step_p1:
		'Nimm an einem unserer Willkommensmeetings für Mitglieder oder an einem lokalen Event teil, um mehr über die PauseAI-Gemeinschaft zu erfahren: <a target="_blank" rel="noopener noreferrer" href="/communities#events">bevorstehende Events ansehen</a>.',
	onboarding_next_step_p2:
		'Möchtest du sofort aktiv werden? Sieh dir unsere <a target="_blank" rel="noopener noreferrer" href="/action">Aktionsliste</a> an.',
	onboarding_footer_join_conversation: 'An der Unterhaltung teilnehmen',
	onboarding_footer_discord_btn: 'PauseAI auf Discord beitreten',
	onboarding_footer_follow_us: 'Folge uns',
	onboarding_step_about: 'Über dich',
	onboarding_step_intent: 'Absicht',
	onboarding_step_volunteer_form: 'Freiwilligenformular',
	onboarding_step_check_inbox: 'Postfach prüfen',
	onboarding_step_next_steps: 'Nächste Schritte',
	onboarding_volunteer_title: 'Als Freiwillige/r anmelden',
	onboarding_volunteer_intro:
		'Erzähl uns etwas über dich, damit wir eine passende Rolle finden können.',
	onboarding_field_zip: 'Postleitzahl',
	onboarding_placeholder_zip: 'z. B. 02134',
	onboarding_helper_zip:
		'Deine 5-stellige Postleitzahl wird verwendet, um deine lokale Gruppe zu finden.',
	onboarding_field_uk_postcode: 'Postleitzahl (UK)',
	onboarding_placeholder_uk_postcode: 'z. B. SW1A 1AA',
	onboarding_helper_uk_postcode:
		'Deine vollständige Postleitzahl. Wir nutzen sie, um dich deinem Wahlkreis und der nächsten lokalen Gruppe zuzuordnen.',
	onboarding_field_university: 'Universität (optional)',
	onboarding_placeholder_university: 'Nach Name oder Abkürzung suchen, z. B. LSE',
	onboarding_helper_university: 'Studierst du an einer Universität? Sag uns, an welcher.',
	onboarding_field_discord: 'Discord-Benutzername',
	onboarding_helper_discord:
		'Wenn du noch kein Discord-Konto hast, empfehlen wir dir, <a target="_blank" rel="noopener noreferrer" href="https://discord.com/register">hier eines zu erstellen</a>.',
	onboarding_field_phone: 'Telefonnummer',
	onboarding_placeholder_dial_code: '+49',
	onboarding_placeholder_phone: '170 0000000',
	onboarding_field_languages: 'Welche Sprachen sprichst du? *',
	onboarding_placeholder_languages: 'Sprachen auswählen',
	onboarding_field_discovery: 'Wie hast du von PauseAI erfahren?',
	onboarding_placeholder_discovery: 'Option auswählen',
	onboarding_field_motivations: 'Was hat dich motiviert, beizutreten?',
	onboarding_field_skills: 'Fähigkeiten & Interessen',
	onboarding_field_hours: 'Wie viel Zeit kannst du wöchentlich einbringen? *',
	onboarding_placeholder_specify: 'Bitte angeben',
	onboarding_agree_volunteer:
		'Ich stimme der <a target="_blank" rel="noopener noreferrer" href="/volunteer-agreement">Freiwilligenvereinbarung</a> zu&nbsp;*',
	onboarding_agree_conduct:
		'Ich stimme dem <a target="_blank" rel="noopener noreferrer" href="/code-of-conduct">Verhaltenskodex</a> zu&nbsp;*',
	onboarding_become_paying_member:
		'Ich möchte zahlendes Mitglied werden — nach dem Absenden die Spendenseite öffnen.',
	onboarding_become_paying_member_disclaimer:
		'Der Zahlungsanbieter (Stripe) wird beim Absenden in einem neuen Tab geöffnet.',
	onboarding_paying_member_heading: 'Möchtest du zahlendes Mitglied von PauseAI Global werden?',
	onboarding_paying_member_description:
		'Mit einem monatlichen Beitrag von 5 $ kannst du die Arbeit der Freiwilligen von PauseAI Global unterstützen — für Proteste, Lobbyarbeit und Koordination für eine globale Pause der Entwicklung Künstlicher Allgemeiner Intelligenz. Zum Abbestellen schreibe uns an <a href="mailto:unsubscribe@pauseai.info">unsubscribe@pauseai.info</a>.',
	onboarding_paying_member_donate_notice:
		'Du kannst PauseAI Global auch mit einer größeren Spende unterstützen, <a target="_blank" rel="noopener noreferrer" href="https://pauseai.info/donate">hier</a>.',
	onboarding_lead_title: (role) => `${role} – Freiwilligenbeschreibung`,
	onboarding_lead_meta: 'Ehrenamtliche Teilzeitrolle · 5–15 Stunden/Woche',
	onboarding_lead_intro:
		'PauseAI Global sucht Leitungspersonen auf der ganzen Welt, die lokale Gruppen führen und Organisierungsmaßnahmen in ihrer Region koordinieren. Es handelt sich um eine ehrenamtliche Teilzeitrolle mit einem Aufwand von 5–15 Stunden pro Woche. Jede Gruppenleitung ist verantwortlich für die Planung von Aktionen, die Mobilisierung von Freiwilligen und die Koordination mit dem globalen PauseAI-Team.',
	onboarding_lead_has_chapter: (country) =>
		`<strong>${country} hat bereits eine nationale PauseAI-Gruppe</strong>, daher könntest du stattdessen eine regionale oder städtische Gruppe leiten. Finde sie unter <a target="_blank" rel="noopener noreferrer" href="/communities">pauseai.info/communities</a>, oder bewirb dich unten, dann besprechen wir es gemeinsam.`,
	onboarding_lead_check_chapter:
		'<strong>Überprüfe zunächst, ob dein Land bereits eine nationale Gruppe hat:</strong> <a target="_blank" rel="noopener noreferrer" href="/communities">pauseai.info/communities</a>.',
	onboarding_lead_what_you_do_title: 'Was du tun wirst',
	onboarding_lead_do_1:
		'Deine lokale Gruppe aufbauen und wachsen lassen, indem du neue Freiwillige willkommen heißt und gemeinsam Events organisierst.',
	onboarding_lead_do_2: 'Beziehungen zu lokalen Aktivistgruppen und Journalist:innen aufbauen.',
	onboarding_lead_do_3:
		'Monatlich mit dem globalen PauseAI-Team zusammenkommen, um Ideen auszutauschen und mit der globalen Strategie und vierteljährlichen Kampagnen koordiniert zu bleiben.',
	onboarding_lead_do_4:
		'Die Aktivitäten deiner Gruppe in sozialen Medien teilen und Events bekannt machen.',
	onboarding_lead_looking_for_title: 'Was wir suchen',
	onboarding_lead_looking_1:
		'Fähigkeit, direkte Aktionen zu planen und durchzuführen, einschließlich Workshops und öffentlicher Events.',
	onboarding_lead_looking_2:
		'Ausgezeichnete Kommunikationsfähigkeiten und die Bereitschaft, vielfältige Gemeinschaften anzusprechen.',
	onboarding_lead_looking_3:
		'Eigeninitiative und die Fähigkeit, sowohl selbstständig als auch im Team zu arbeiten.',
	onboarding_lead_looking_4:
		'Leidenschaft für KI-Sicherheit und Übereinstimmung mit der Mission von PauseAI.',
	onboarding_lead_looking_5: 'Kommunikation auf Englisch muss möglich sein.',
	onboarding_lead_looking_6: 'Bekenntnis zu einem gewaltfreien und legalen Vorgehen.',
	onboarding_lead_nice_to_have_title: 'Wünschenswert',
	onboarding_lead_nice_1: 'Starke Organisationsfähigkeiten und Erfahrung in der Basisarbeit.',
	onboarding_lead_nice_2:
		'Lobbying-Fähigkeiten und Erfahrung im Umgang mit politischen Entscheidungsträger:innen.',
	onboarding_lead_nice_3: 'Erfahrung in Medien und Contentwriting.',
	onboarding_lead_imperfect:
		'Wenn du nicht alle Anforderungen erfüllst, möchten wir dennoch von dir hören. Das Engagement für KI-Sicherheit und der Glaube, dass wir einen Unterschied machen können, sind das Wichtigste – wir bieten Schulungen, Ressourcen und eine Gemeinschaft, auf die du dich stützen kannst.',
	onboarding_lead_support_title: 'Unterstützung, die du erhältst',
	onboarding_lead_support:
		'Du trittst einem globalen Netzwerk von Organisator:innen bei, die gemeinsam an diesen Herausforderungen arbeiten. Wir treffen uns monatlich, teilen Ressourcen auf unseren Plattformen und helfen uns gegenseitig. Es ist eine großartige Möglichkeit, neue Fähigkeiten zu erlernen, nachdenkliche Menschen kennenzulernen und Teil einer schnell wachsenden Bewegung zu sein, die sich mit einem der wichtigsten Themen unserer Zeit befasst.',
	onboarding_lead_next_steps_title: 'Nächste Schritte',
	onboarding_lead_next_steps:
		'Wenn das zu dir passt, fülle bitte unten unser Bewerbungsformular aus. Irina Tavera, die globale Organizing Director von PauseAI, prüft jede Bewerbung und meldet sich bei dir wegen der nächsten Schritte.',
	onboarding_lead_apply_btn: 'Als Leitung bewerben',
	onboarding_discovery_pauseai_social: 'PauseAI Social Media',
	onboarding_discovery_other_social: 'Andere Social Media',
	onboarding_discovery_referral: 'Empfehlung von Freund/Familie',
	onboarding_discovery_news: 'Zeitungsartikel',
	onboarding_discovery_event: 'Veranstaltung/Präsentation',
	onboarding_discovery_search: 'Internetsuche',
	onboarding_discovery_other: 'Sonstiges',
	onboarding_motivation_ai_safety: 'KI-Sicherheit',
	onboarding_motivation_democratic_oversight: 'Demokratische Kontrolle',
	onboarding_motivation_ethical_tech: 'Ethische Technologie',
	onboarding_motivation_ai_governance: 'KI-Regulierung',
	onboarding_motivation_job_displacement: 'Jobverlust durch KI',
	onboarding_motivation_misinformation: 'Fehlinformationen',
	onboarding_motivation_deepfakes: 'Deepfake-Betrug und Belästigung',
	onboarding_motivation_power: 'Machtkonzentration',
	onboarding_motivation_privacy: 'Datenschutzverlust',
	onboarding_motivation_environment: 'Umweltschäden',
	onboarding_motivation_addiction: 'Technologieabhängigkeit',
	onboarding_motivation_weapons: 'Autonome Waffen',
	onboarding_motivation_cyber: 'Cyberangriffe',
	onboarding_motivation_bioweapons: 'Biowaffen',
	onboarding_motivation_other: 'Sonstiges',
	onboarding_skill_software: 'Softwareentwicklung',
	onboarding_skill_video: 'Videoerstellung',
	onboarding_skill_social_media: 'Social-Media-Management',
	onboarding_skill_events: 'Eventorganisation',
	onboarding_skill_speaking: 'Öffentliches Sprechen / Präsentation',
	onboarding_skill_writing: 'Schreiben',
	onboarding_skill_design: 'Grafikdesign / Visuelle Künste',
	onboarding_skill_research: 'Forschung',
	onboarding_skill_comms: 'Kommunikation / PR',
	onboarding_skill_fundraising: 'Fundraising',
	onboarding_skill_community: 'Community-Aufbau',
	onboarding_skill_advocacy: 'Politisches Engagement / Lobbying',
	onboarding_skill_education: 'Bildung / Unterricht',
	onboarding_skill_admin: 'Verwaltungsunterstützung',
	onboarding_skill_legal: 'Rechtskenntnisse',
	onboarding_skill_other: 'Sonstiges',
	onboarding_hours_under_3: 'Weniger als 3 Stunden',
	onboarding_hours_3_6: '3–6 Stunden',
	onboarding_hours_6_10: '6–10 Stunden',
	onboarding_hours_10_20: '10–20 Stunden',
	onboarding_hours_20_plus: '20+ Stunden',
	onboarding_action_ai_concerns_title: 'KI-Bedenken teilen',
	onboarding_action_ai_concerns_sub:
		'Erzähl deine Geschichte und trage zum öffentlichen Diskurs bei.',
	onboarding_action_email_reps_title: 'E-Mail an deine Abgeordneten senden',
	onboarding_action_email_reps_sub:
		'Nutze unseren E-Mail-Builder für eine vorgefertigte Nachricht, die du personalisieren und versenden kannst.',
	onboarding_action_lobby_title: 'Deine gewählten Vertreter:innen kontaktieren',
	onboarding_action_lobby_sub: 'Unsere Lobbying-Tipps helfen dir, das Richtige zu sagen.',
	onboarding_action_talk_title: 'Mit jemandem in deinem Umfeld über KI-Sicherheit sprechen',
	onboarding_action_talk_sub:
		'Ein Freund, Nachbar, Kollege oder Familienmitglied. Unser <a target="_blank" rel="noopener noreferrer" href="/counterarguments">Leitfaden für Gegenargumente</a> hilft dir, schwierige Fragen zu beantworten und andere zum Handeln zu motivieren.',
	onboarding_action_catalyse_title: 'Catalyse — finde ein Freiwilligenprojekt',
	onboarding_action_catalyse_sub:
		'Durchstöbere Freiwilligenprojekte und finde eines, das zu deinen Fähigkeiten und deiner Zeit passt.',
	onboarding_action_petitions_title: 'Petitionen unterzeichnen',
	onboarding_action_petitions_sub:
		'Füge deinen Namen zu Tausenden hinzu, die für eine sicherere KI eintreten.',
	onboarding_action_donate_title: 'Spenden oder Merchandise kaufen',
	onboarding_action_donate_sub:
		'Leiste eine <a target="_blank" rel="noopener noreferrer" href="/donate">Spende</a> oder entdecke unser Sortiment in unserem <a target="_blank" rel="noopener noreferrer" href="https://pauseai-shop.fourthwall.com/">Shop</a>.',
	onboarding_error_generic: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
	onboarding_error_unexpected: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.'
}

const fr: OnboardingMessages = {
	...chapterShareFr,
	onboarding_page_title: 'Participer',
	onboarding_page_description:
		"Trouve le moyen le plus efficace pour toi d'aider à mettre en pause le développement de l'IA surhumaine.",
	onboarding_browse_banner:
		"Tu navigues sans t'inscrire. Laisse ton e-mail ci-dessous pour être informé·e des nouvelles opportunités.",
	onboarding_field_full_name: 'Nom complet *',
	onboarding_placeholder_full_name: 'Nom complet',
	onboarding_field_email: 'E-mail *',
	onboarding_placeholder_email: 'E-mail',
	onboarding_field_country: 'Pays de résidence *',
	onboarding_placeholder_country: 'Sélectionne ton pays',
	onboarding_field_city: 'Ville / commune de résidence *',
	onboarding_placeholder_city: 'Ville / commune',
	onboarding_us_note:
		'PauseAI US est une organisation distincte. Rends-toi sur <a target="_blank" rel="noopener noreferrer" href="https://peopleforapause.org/get-involved">People for a Pause</a> pour t\'impliquer là-bas.',
	onboarding_btn_continue: 'Continuer →',
	onboarding_btn_browse: '👀 Je veux juste agir maintenant',
	onboarding_browse_helper:
		"Passe directement aux actions que tu peux entreprendre aujourd'hui, sans e-mail requis.",
	onboarding_step2_heading: "Qu'est-ce qui t'amène ici ?",
	onboarding_optins_heading: 'Tu veux avoir de nos nouvelles ?',
	onboarding_email_critical_notice:
		'Nous pouvons occasionnellement t\'envoyer une alerte critique, même si tu ne coches aucune de ces options. Tu peux te désinscrire de n\'importe quelle liste à tout moment. Voir notre <a target="_blank" rel="noopener noreferrer" href="/privacy">politique de confidentialité</a>.',
	onboarding_intent_keep_informed_label: 'Me tenir informé·e',
	onboarding_intent_newsletter_label: "S'abonner à notre Substack",
	onboarding_intent_newsletter_sub: "L'actualité de l'IA vue par l'équipe PauseAI.",
	onboarding_intent_more_optional: 'Tu veux en faire plus ? (facultatif)',
	onboarding_intent_act_now_label: 'Je veux juste agir maintenant',
	onboarding_intent_act_now_sub: "Montre-moi ce que je peux faire aujourd'hui.",
	onboarding_intent_volunteer_label: 'Je veux être bénévole régulièrement',
	onboarding_intent_volunteer_sub: 'Aide-moi à trouver un rôle qui me correspond.',
	onboarding_intent_lead_label: 'Je veux prendre la tête',
	onboarding_intent_lead_sub: 'Je suis prêt·e à organiser dans mon pays ou ma région.',
	onboarding_gdpr_consent:
		'J\'accepte la <a target="_blank" rel="noopener noreferrer" href="/privacy">Politique de confidentialité</a>.&nbsp;*',
	onboarding_btn_submit: 'Envoyer →',
	onboarding_btn_submitting: 'Envoi en cours...',
	onboarding_btn_back: '← Retour',
	onboarding_confirm_newsletter:
		"Tu es abonné·e à notre Substack : l'actualité de l'IA vue par l'équipe PauseAI, par e-mail.",
	onboarding_check_inbox_title: 'Vérifie ta boîte mail',
	onboarding_check_inbox_body:
		"Nous t'avons envoyé un e-mail. Clique sur le lien qu'il contient pour confirmer ton adresse. Si tu ne le trouves pas, jette un œil dans tes spams.",
	onboarding_confirm_b_sub: "Voici quelques moyens de faire la différence dès aujourd'hui.",
	onboarding_confirm_volunteer_title: "Bienvenue dans l'équipe.",
	onboarding_confirm_volunteer_sub:
		'Tu es sur la liste des bénévoles. Nous te contacterons bientôt.',
	onboarding_browse_header_title: 'Agis dès maintenant.',
	onboarding_browse_header_sub:
		"Voici quelques actions que tu peux entreprendre dès maintenant. Le meilleur moyen de rester informé·e des nouvelles opportunités est de t'inscrire ci-dessous.",
	onboarding_browse_keep_informed_title: 'Me tenir informé·e',
	onboarding_btn_sign_me_up: "M'inscrire →",
	onboarding_btn_signing_up: 'Inscription en cours...',
	onboarding_section_ways_to_help: "Quelques moyens d'aider dès aujourd'hui",
	onboarding_next_step_title: '★ Prochaine étape recommandée',
	onboarding_next_step_p1:
		'Rejoins l\'une de nos réunions d\'accueil de la communauté des membres, ou un événement social local, pour en savoir plus sur la communauté PauseAI : <a target="_blank" rel="noopener noreferrer" href="/communities#events">voir les événements à venir</a>.',
	onboarding_next_step_p2:
		'Tu veux passer à l\'action tout de suite ? Consulte notre <a target="_blank" rel="noopener noreferrer" href="/action">liste d\'actions</a>.',
	onboarding_footer_join_conversation: 'Rejoindre la conversation',
	onboarding_footer_discord_btn: 'Rejoindre PauseAI sur Discord',
	onboarding_footer_follow_us: 'Suis-nous',
	onboarding_step_about: 'À propos de toi',
	onboarding_step_intent: 'Intention',
	onboarding_step_volunteer_form: 'Formulaire de bénévolat',
	onboarding_step_check_inbox: 'Vérifie ta boîte mail',
	onboarding_step_next_steps: 'Prochaines étapes',
	onboarding_volunteer_title: "S'inscrire comme bénévole",
	onboarding_volunteer_intro:
		'Parle-nous un peu de toi afin que nous puissions trouver un rôle qui te correspond.',
	onboarding_field_zip: 'Code postal',
	onboarding_placeholder_zip: 'ex. 75001',
	onboarding_helper_zip: 'Ton code postal permet de trouver ton groupe local.',
	onboarding_field_uk_postcode: 'Code postal (UK)',
	onboarding_placeholder_uk_postcode: 'ex. SW1A 1AA',
	onboarding_helper_uk_postcode:
		'Ton code postal complet. Il nous permet de te rattacher à ta circonscription et au groupe local le plus proche.',
	onboarding_field_university: 'Université (facultatif)',
	onboarding_placeholder_university: 'Recherche par nom ou abréviation, ex. LSE',
	onboarding_helper_university: "Tu étudies à l'université ? Dis-nous laquelle.",
	onboarding_field_discord: "Nom d'utilisateur Discord",
	onboarding_helper_discord:
		'Si tu n\'as pas de compte Discord, nous t\'encourageons à en <a target="_blank" rel="noopener noreferrer" href="https://discord.com/register">créer un ici</a>.',
	onboarding_field_phone: 'Numéro de téléphone',
	onboarding_placeholder_dial_code: '+33',
	onboarding_placeholder_phone: '06 00 00 00 00',
	onboarding_field_languages: 'Quelles langues parles-tu ? *',
	onboarding_placeholder_languages: 'Sélectionne les langues',
	onboarding_field_discovery: 'Comment as-tu découvert PauseAI ?',
	onboarding_placeholder_discovery: 'Sélectionne une option',
	onboarding_field_motivations: "Qu'est-ce qui t'a motivé·e à nous rejoindre ?",
	onboarding_field_skills: 'Compétences & intérêts',
	onboarding_field_hours: 'Combien de temps peux-tu consacrer par semaine ? *',
	onboarding_placeholder_specify: 'Merci de préciser',
	onboarding_agree_volunteer:
		'J\'accepte l\'<a target="_blank" rel="noopener noreferrer" href="/volunteer-agreement">Accord de bénévolat</a>&nbsp;*',
	onboarding_agree_conduct:
		'J\'accepte le <a target="_blank" rel="noopener noreferrer" href="/code-of-conduct">Code de conduite</a>&nbsp;*',
	onboarding_become_paying_member:
		'Je souhaite devenir membre payant — ouvrir la page de don après envoi.',
	onboarding_become_paying_member_disclaimer:
		"Le prestataire de paiement (Stripe) s'ouvrira dans un nouvel onglet lors de l'envoi.",
	onboarding_paying_member_heading: 'Souhaites-tu devenir membre payant de PauseAI Global ?',
	onboarding_paying_member_description:
		'Avec une cotisation mensuelle de 5 $, tu peux soutenir le travail des bénévoles de PauseAI Global — protestations, plaidoyer et coordination pour une pause mondiale du développement de l\'Intelligence Artificielle Générale. Pour te désabonner, écris-nous à <a href="mailto:unsubscribe@pauseai.info">unsubscribe@pauseai.info</a>.',
	onboarding_paying_member_donate_notice:
		'Tu peux aussi apporter une contribution plus importante à PauseAI Global en faisant un don <a target="_blank" rel="noopener noreferrer" href="https://pauseai.info/donate">ici</a>.',
	onboarding_lead_title: (role) => `Description du rôle bénévole : ${role}`,
	onboarding_lead_meta: 'Rôle bénévole à temps partiel · 5 à 15 heures/semaine',
	onboarding_lead_intro:
		"PauseAI Global recherche des responsables partout dans le monde pour diriger des groupes locaux qui mènent les efforts d'organisation dans leur région. Il s'agit d'un rôle bénévole à temps partiel nécessitant 5 à 15 heures par semaine. Chaque responsable de groupe sera chargé·e de planifier des actions directes, de mobiliser des bénévoles et de coordonner avec l'équipe PauseAI Global.",
	onboarding_lead_has_chapter: (country) =>
		`<strong>${country} a déjà un groupe PauseAI national</strong>, donc plutôt que d'en fonder un, tu pourrais diriger un groupe régional ou local au sein de celui-ci. Trouve-le sur <a target="_blank" rel="noopener noreferrer" href="/communities">pauseai.info/communities</a>, ou postule ci-dessous et nous en discuterons ensemble.`,
	onboarding_lead_check_chapter:
		'<strong>Vérifie d\'abord que ton pays n\'a pas déjà de groupe national :</strong> <a target="_blank" rel="noopener noreferrer" href="/communities">pauseai.info/communities</a>.',
	onboarding_lead_what_you_do_title: 'Ce que tu feras',
	onboarding_lead_do_1:
		'Recruter et développer ton groupe local en accueillant de nouveaux bénévoles et en organisant des événements ensemble.',
	onboarding_lead_do_2:
		'Construire des relations avec des groupes militants locaux et des journalistes.',
	onboarding_lead_do_3:
		"Rencontrer chaque mois l'équipe Global de PauseAI pour échanger des idées et rester coordonné·e avec la stratégie mondiale et les campagnes trimestrielles.",
	onboarding_lead_do_4:
		'Partager les activités de ton groupe sur les réseaux sociaux et aider à promouvoir les événements.',
	onboarding_lead_looking_for_title: 'Ce que nous recherchons',
	onboarding_lead_looking_1:
		'Capacité à planifier et exécuter des actions directes, y compris des ateliers et des événements publics.',
	onboarding_lead_looking_2:
		"D'excellentes compétences en communication, avec l'envie et la capacité d'engager des communautés diverses.",
	onboarding_lead_looking_3:
		'Autonomie, avec la capacité de travailler de manière indépendante et en équipe.',
	onboarding_lead_looking_4:
		"Passion pour la sécurité de l'IA et adhésion à la mission de PauseAI.",
	onboarding_lead_looking_5: "À l'aise pour communiquer en anglais",
	onboarding_lead_looking_6: 'Respecter et pratiquer une approche non violente et légale.',
	onboarding_lead_nice_to_have_title: 'Ce qui serait un plus',
	onboarding_lead_nice_1:
		"De solides compétences d'organisation et de l'expérience en activisme de terrain.",
	onboarding_lead_nice_2:
		"Compétences de lobbying et expérience d'engagement avec des décideurs politiques",
	onboarding_lead_nice_3: 'Expérience en médias et en rédaction de contenu',
	onboarding_lead_imperfect:
		"Si tu ne remplis pas tous les critères, nous voulons quand même avoir de tes nouvelles. L'engagement pour la sécurité de l'IA et la conviction que nous pouvons avoir un impact sont les facteurs les plus importants ; nous pouvons fournir formation, ressources et une communauté sur laquelle s'appuyer.",
	onboarding_lead_support_title: 'Le soutien que tu recevras',
	onboarding_lead_support:
		"Tu rejoindras un réseau mondial d'organisateur·rices qui apprennent tous ensemble. Nous nous réunissons chaque mois, partageons des ressources sur nos plateformes de discussion et nous entraidons pour résoudre les problèmes. C'est une excellente façon d'apprendre de nouvelles compétences, de rencontrer des personnes réfléchies et de faire partie d'un mouvement en pleine croissance qui œuvre sur l'un des enjeux les plus importants de notre époque.",
	onboarding_lead_next_steps_title: 'Prochaines étapes',
	onboarding_lead_next_steps:
		"Si cela te correspond, remplis notre formulaire de candidature ci-dessous. Notre directrice de l'organisation chez PauseAI Global, Irina Tavera, examine chaque candidature et te recontactera pour les prochaines étapes.",
	onboarding_lead_apply_btn: 'Postuler pour devenir responsable',
	onboarding_discovery_pauseai_social: 'Réseaux sociaux affiliés à PauseAI',
	onboarding_discovery_other_social: 'Réseaux sociaux non affiliés à PauseAI',
	onboarding_discovery_referral: "Recommandation d'un ami ou de la famille",
	onboarding_discovery_news: 'Article de presse',
	onboarding_discovery_event: 'Événement/Présentation',
	onboarding_discovery_search: 'Recherche sur Internet',
	onboarding_discovery_other: 'Autre',
	onboarding_motivation_ai_safety: "Sécurité de l'IA",
	onboarding_motivation_democratic_oversight: "Besoin d'un contrôle démocratique",
	onboarding_motivation_ethical_tech: 'Technologie éthique',
	onboarding_motivation_ai_governance: "Gouvernance de l'IA",
	onboarding_motivation_job_displacement: "Suppression d'emplois",
	onboarding_motivation_misinformation: 'Désinformation',
	onboarding_motivation_deepfakes: 'Deepfakes, arnaques et harcèlement',
	onboarding_motivation_power: 'Concentration du pouvoir',
	onboarding_motivation_privacy: 'Perte de vie privée',
	onboarding_motivation_environment: 'Dommages environnementaux',
	onboarding_motivation_addiction: 'Dépendance technologique',
	onboarding_motivation_weapons: 'Armes autonomes',
	onboarding_motivation_cyber: 'Cyberattaques',
	onboarding_motivation_bioweapons: 'Armes biologiques',
	onboarding_motivation_other: 'Autre',
	onboarding_skill_software: 'Développement logiciel',
	onboarding_skill_video: 'Création vidéo',
	onboarding_skill_social_media: 'Gestion des réseaux sociaux',
	onboarding_skill_events: "Organisation d'événements",
	onboarding_skill_speaking: 'Prise de parole en public / Présentation',
	onboarding_skill_writing: 'Rédaction',
	onboarding_skill_design: 'Design graphique / Arts visuels',
	onboarding_skill_research: 'Recherche',
	onboarding_skill_comms: 'Communication / RP',
	onboarding_skill_fundraising: 'Collecte de fonds',
	onboarding_skill_community: 'Organisation communautaire',
	onboarding_skill_advocacy: 'Plaidoyer politique / Lobbying',
	onboarding_skill_education: 'Éducation / Enseignement',
	onboarding_skill_admin: 'Support administratif',
	onboarding_skill_legal: 'Connaissances juridiques',
	onboarding_skill_other: 'Autre',
	onboarding_hours_under_3: 'Moins de 3 heures',
	onboarding_hours_3_6: '3 à 6 heures',
	onboarding_hours_6_10: '6 à 10 heures',
	onboarding_hours_10_20: '10 à 20 heures',
	onboarding_hours_20_plus: '20 heures ou plus',
	onboarding_action_ai_concerns_title: "Partage tes préoccupations sur l'IA",
	onboarding_action_ai_concerns_sub: 'Raconte ton histoire et ajoute ta voix au dossier public.',
	onboarding_action_email_reps_title: 'Écris à tes représentant·es élu·es',
	onboarding_action_email_reps_sub:
		"Utilise notre générateur d'e-mails pour un message pré-rédigé que tu peux personnaliser et envoyer.",
	onboarding_action_lobby_title: 'Contacte tes élu·es',
	onboarding_action_lobby_sub: "Nos conseils de lobbying te guident sur ce qu'il faut dire.",
	onboarding_action_talk_title: "Parle à quelqu'un de ton entourage de la sécurité de l'IA",
	onboarding_action_talk_sub:
		'Un ami, un voisin, un collègue ou un membre de la famille. Notre <a target="_blank" rel="noopener noreferrer" href="/counterarguments">guide des contre-arguments</a> peut t\'aider à répondre aux questions difficiles et à encourager les autres à agir.',
	onboarding_action_catalyse_title: 'Catalyse — trouve un projet de bénévolat',
	onboarding_action_catalyse_sub:
		'Parcours les projets de bénévolat et rejoins-en un adapté à tes compétences et à ton temps disponible.',
	onboarding_action_petitions_title: 'Signe les pétitions',
	onboarding_action_petitions_sub:
		"Ajoute ton nom à ceux de milliers d'autres personnes appelant à une IA plus sûre.",
	onboarding_action_donate_title: 'Fais un don ou procure-toi des articles',
	onboarding_action_donate_sub:
		'Fais un <a target="_blank" rel="noopener noreferrer" href="/donate">don</a> ou procure-toi des articles sur notre <a target="_blank" rel="noopener noreferrer" href="https://pauseai-shop.fourthwall.com/">boutique</a>.',
	onboarding_error_generic: "Une erreur s'est produite. Merci de réessayer.",
	onboarding_error_unexpected: "Une erreur inattendue s'est produite. Merci de réessayer."
}

const es: OnboardingMessages = {
	...chapterShareEs,
	onboarding_page_title: 'Participa',
	onboarding_page_description:
		'Encuentra la forma de mayor impacto para ayudar a pausar el desarrollo de la IA sobrehumana.',
	onboarding_browse_banner:
		'Estás navegando sin inscribirte. Déjanos tu correo abajo para avisarte cuando surjan nuevas oportunidades.',
	onboarding_field_full_name: 'Nombre completo *',
	onboarding_placeholder_full_name: 'Nombre completo',
	onboarding_field_email: 'Correo electrónico *',
	onboarding_placeholder_email: 'Correo electrónico',
	onboarding_field_country: 'País de residencia *',
	onboarding_placeholder_country: 'Selecciona tu país',
	onboarding_field_city: 'Ciudad / localidad de residencia *',
	onboarding_placeholder_city: 'Ciudad / localidad',
	onboarding_us_note:
		'PauseAI US es una organización independiente. Visita <a target="_blank" rel="noopener noreferrer" href="https://peopleforapause.org/get-involved">People for a Pause</a> para involucrarte allí.',
	onboarding_btn_continue: 'Continuar →',
	onboarding_btn_browse: '👀 Solo quiero pasar a la acción ya',
	onboarding_browse_helper:
		'Ve directamente a las acciones que puedes hacer hoy, sin dar tu correo.',
	onboarding_step2_heading: '¿Qué te trae por aquí?',
	onboarding_optins_heading: '¿Quieres recibir noticias nuestras?',
	onboarding_email_critical_notice:
		'Puede que en ocasiones te enviemos un aviso importante, aunque no te suscribas a ninguna de estas opciones. Puedes darte de baja de cualquier lista en cualquier momento. Consulta nuestra <a target="_blank" rel="noopener noreferrer" href="/privacy">política de privacidad</a>.',
	onboarding_intent_keep_informed_label: 'Mantenme informado/a',
	onboarding_intent_newsletter_label: 'Suscríbete a nuestro Substack',
	onboarding_intent_newsletter_sub: 'Noticias sobre IA desde la perspectiva del equipo de PauseAI.',
	onboarding_intent_more_optional: '¿Quieres hacer más? (opcional)',
	onboarding_intent_act_now_label: 'Solo quiero pasar a la acción ya',
	onboarding_intent_act_now_sub: 'Muéstrame qué puedo hacer hoy.',
	onboarding_intent_volunteer_label: 'Quiero colaborar como voluntario/a de forma regular',
	onboarding_intent_volunteer_sub: 'Quiero encontrar un papel que encaje conmigo.',
	onboarding_intent_lead_label: 'Quiero liderar',
	onboarding_intent_lead_sub: 'Estoy listo/a para organizar en mi país o región.',
	onboarding_gdpr_consent:
		'Acepto la <a target="_blank" rel="noopener noreferrer" href="/privacy">política de privacidad</a>.&nbsp;*',
	onboarding_btn_submit: 'Enviar →',
	onboarding_btn_submitting: 'Enviando...',
	onboarding_btn_back: '← Atrás',
	onboarding_confirm_newsletter:
		'Te has suscrito a nuestro Substack: noticias sobre IA desde la perspectiva del equipo de PauseAI, directamente en tu correo.',
	onboarding_check_inbox_title: 'Revisa tu correo',
	onboarding_check_inbox_body:
		'Te hemos enviado un correo. Haz clic en el enlace que contiene para confirmar tu dirección. Si no lo encuentras, mira en la carpeta de spam.',
	onboarding_confirm_b_sub: 'Aquí tienes algunas formas de marcar la diferencia hoy.',
	onboarding_confirm_volunteer_title: 'Te damos la bienvenida al equipo.',
	onboarding_confirm_volunteer_sub:
		'Ya estás en la lista de voluntariado. Nos pondremos en contacto contigo pronto.',
	onboarding_browse_header_title: 'Pasa a la acción ahora mismo.',
	onboarding_browse_header_sub:
		'Aquí tienes algunas acciones que puedes hacer ahora mismo. La mejor forma de enterarte de nuevas oportunidades es inscribirte abajo.',
	onboarding_browse_keep_informed_title: 'Mantenme informado/a',
	onboarding_btn_sign_me_up: 'Inscríbeme →',
	onboarding_btn_signing_up: 'Inscribiendo...',
	onboarding_section_ways_to_help: 'Algunas formas de ayudar hoy',
	onboarding_next_step_title: '★ Siguiente paso recomendado',
	onboarding_next_step_p1:
		'Únete a una de nuestras reuniones de bienvenida para miembros, o a un encuentro local, para conocer mejor la comunidad de PauseAI: <a target="_blank" rel="noopener noreferrer" href="/communities#events">consulta los próximos eventos</a>.',
	onboarding_next_step_p2:
		'¿Quieres ponerte en marcha ya mismo? Echa un vistazo a nuestra <a target="_blank" rel="noopener noreferrer" href="/action">lista de acciones</a>.',
	onboarding_footer_join_conversation: 'Únete a la conversación',
	onboarding_footer_discord_btn: 'Únete a PauseAI en Discord',
	onboarding_footer_follow_us: 'Síguenos',
	onboarding_step_about: 'Sobre ti',
	onboarding_step_intent: 'Intención',
	onboarding_step_volunteer_form: 'Formulario de voluntariado',
	onboarding_step_check_inbox: 'Revisa tu correo',
	onboarding_step_next_steps: 'Siguientes pasos',
	onboarding_volunteer_title: 'Inscríbete como voluntario/a',
	onboarding_volunteer_intro:
		'Cuéntanos un poco sobre ti para que podamos encontrar un papel que encaje contigo.',
	onboarding_field_zip: 'Código postal',
	onboarding_placeholder_zip: 'p. ej. 02134',
	onboarding_helper_zip: 'Usamos tu código postal de 5 dígitos para encontrar tu grupo local.',
	onboarding_field_uk_postcode: 'Código postal',
	onboarding_placeholder_uk_postcode: 'p. ej. SW1A 1AA',
	onboarding_helper_uk_postcode:
		'Tu código postal completo. Lo usamos para ponerte en contacto con la circunscripción de tu MP y con tu grupo local más cercano.',
	onboarding_field_university: 'Universidad (opcional)',
	onboarding_placeholder_university: 'Busca por nombre o abreviatura, p. ej. LSE',
	onboarding_helper_university: '¿Estudias en una universidad? Dinos en cuál.',
	onboarding_field_discord: 'Usuario de Discord',
	onboarding_helper_discord:
		'Si no tienes cuenta de Discord, te animamos a <a target="_blank" rel="noopener noreferrer" href="https://discord.com/register">crear una aquí</a>.',
	onboarding_field_phone: 'Número de teléfono',
	onboarding_placeholder_dial_code: '+34',
	onboarding_placeholder_phone: '600 000 000',
	onboarding_field_languages: '¿Qué idiomas hablas? *',
	onboarding_placeholder_languages: 'Selecciona idiomas',
	onboarding_field_discovery: '¿Cómo conociste PauseAI?',
	onboarding_placeholder_discovery: 'Selecciona una opción',
	onboarding_field_motivations: '¿Qué te motivó a unirte?',
	onboarding_field_skills: 'Habilidades e intereses',
	onboarding_field_hours: '¿Cuánto tiempo puedes dedicar a la semana? *',
	onboarding_placeholder_specify: 'Especifica',
	onboarding_agree_volunteer:
		'Acepto el <a target="_blank" rel="noopener noreferrer" href="/volunteer-agreement">acuerdo de voluntariado</a>&nbsp;*',
	onboarding_agree_conduct:
		'Acepto el <a target="_blank" rel="noopener noreferrer" href="/code-of-conduct">código de conducta</a>&nbsp;*',
	onboarding_become_paying_member:
		'Quiero hacerme miembro de pago: se abrirá la página de donación al enviar.',
	onboarding_become_paying_member_disclaimer:
		'La pasarela de pago (Stripe) se abrirá en una pestaña nueva al enviar.',
	onboarding_paying_member_heading: '¿Te gustaría hacerte miembro de pago de PauseAI Global?',
	onboarding_paying_member_description:
		'Con una cuota mensual de 5 $, apoyas el trabajo de las personas voluntarias de PauseAI Global para protestar, hacer incidencia política y coordinarse en favor de una pausa global en el desarrollo de la inteligencia artificial general. Para darte de baja, escríbenos a <a href="mailto:unsubscribe@pauseai.info">unsubscribe@pauseai.info</a>.',
	onboarding_paying_member_donate_notice:
		'También puedes hacer una aportación mayor a PauseAI Global <a target="_blank" rel="noopener noreferrer" href="https://pauseai.info/donate">donando aquí</a>.',
	onboarding_lead_title: (role) => `Descripción del voluntariado: ${role}`,
	onboarding_lead_meta: 'Voluntariado a tiempo parcial · 5–15 horas/semana',
	onboarding_lead_intro:
		'PauseAI Global busca líderes en todo el mundo para dirigir grupos locales que encabecen la organización en su zona. Es un voluntariado a tiempo parcial de 5 a 15 horas semanales. Cada líder de grupo se encargará de planificar acciones directas, movilizar a voluntarios y coordinarse con el equipo global de PauseAI.',
	onboarding_lead_has_chapter: (country) =>
		`<strong>${country} ya tiene un grupo nacional de PauseAI</strong>, así que, en lugar de fundar uno nuevo, podrías liderar un grupo regional o local dentro de él. Encuentra tu grupo en <a target="_blank" rel="noopener noreferrer" href="/communities">pauseai.info/communities</a>, o preséntate abajo y lo hablamos.`,
	onboarding_lead_check_chapter:
		'<strong>Primero, comprueba que tu país no tenga ya un grupo nacional:</strong> <a target="_blank" rel="noopener noreferrer" href="/communities">pauseai.info/communities</a>.',
	onboarding_lead_what_you_do_title: 'Qué harás',
	onboarding_lead_do_1:
		'Captar y hacer crecer tu grupo local dando la bienvenida a nuevas personas voluntarias y organizando eventos juntos.',
	onboarding_lead_do_2: 'Crear relaciones con colectivos activistas y periodistas de tu zona.',
	onboarding_lead_do_3:
		'Reunirte cada mes con el equipo global de PauseAI para compartir ideas y mantenerte coordinado/a con la estrategia global y las campañas trimestrales.',
	onboarding_lead_do_4:
		'Compartir en redes sociales lo que hace tu grupo y ayudar a promocionar los eventos.',
	onboarding_lead_looking_for_title: 'Qué buscamos',
	onboarding_lead_looking_1:
		'Capacidad para planificar y llevar a cabo acciones directas, incluidos talleres y actos públicos.',
	onboarding_lead_looking_2:
		'Excelentes dotes de comunicación, con ganas y capacidad de conectar con comunidades diversas.',
	onboarding_lead_looking_3:
		'Iniciativa propia, con capacidad para trabajar de forma autónoma y en equipo.',
	onboarding_lead_looking_4:
		'Pasión por la seguridad de la IA y afinidad con la misión de PauseAI.',
	onboarding_lead_looking_5: 'Soltura para comunicarte en inglés.',
	onboarding_lead_looking_6: 'Compromiso con un enfoque no violento y dentro de la legalidad.',
	onboarding_lead_nice_to_have_title: 'Qué valoraremos',
	onboarding_lead_nice_1: 'Buenas dotes organizativas y experiencia en activismo de base.',
	onboarding_lead_nice_2:
		'Habilidades de incidencia política y experiencia en el trato con responsables políticos.',
	onboarding_lead_nice_3: 'Experiencia en medios y redacción de contenidos.',
	onboarding_lead_imperfect:
		'Si no cumples todos los requisitos, queremos saber de ti igualmente. Lo más importante es el compromiso con la seguridad de la IA y la convicción de que podemos tener impacto; podemos ofrecerte formación, recursos y una comunidad en la que apoyarte.',
	onboarding_lead_support_title: 'El apoyo que tendrás',
	onboarding_lead_support:
		'Te unirás a una red global de personas organizadoras que van resolviendo esto juntas. Nos reunimos cada mes, compartimos recursos en nuestros canales de chat y nos ayudamos a resolver problemas. Es una gran forma de aprender nuevas habilidades, conocer a gente reflexiva y formar parte de un movimiento en rápido crecimiento que trabaja en uno de los temas más importantes de nuestro tiempo.',
	onboarding_lead_next_steps_title: 'Siguientes pasos',
	onboarding_lead_next_steps:
		'Si encajas con este perfil, rellena abajo nuestro formulario de solicitud. Irina Tavera, directora de organización de PauseAI Global, revisa cada solicitud y se pondrá en contacto contigo sobre los siguientes pasos.',
	onboarding_lead_apply_btn: 'Solicita liderar un grupo',
	onboarding_discovery_pauseai_social: 'Redes sociales de PauseAI',
	onboarding_discovery_other_social: 'Otras redes sociales',
	onboarding_discovery_referral: 'Recomendación de amigos/familia',
	onboarding_discovery_news: 'Artículo de prensa',
	onboarding_discovery_event: 'Evento/Presentación',
	onboarding_discovery_search: 'Búsqueda en internet',
	onboarding_discovery_other: 'Otro',
	onboarding_motivation_ai_safety: 'Seguridad de la IA',
	onboarding_motivation_democratic_oversight: 'Necesidad de supervisión democrática',
	onboarding_motivation_ethical_tech: 'Tecnología ética',
	onboarding_motivation_ai_governance: 'Gobernanza de la IA',
	onboarding_motivation_job_displacement: 'Destrucción de empleo',
	onboarding_motivation_misinformation: 'Desinformación',
	onboarding_motivation_deepfakes: 'Estafas y acoso con deepfakes',
	onboarding_motivation_power: 'Concentración de poder',
	onboarding_motivation_privacy: 'Pérdida de privacidad',
	onboarding_motivation_environment: 'Daño medioambiental',
	onboarding_motivation_addiction: 'Adicción a la tecnología',
	onboarding_motivation_weapons: 'Armas autónomas',
	onboarding_motivation_cyber: 'Ciberataques',
	onboarding_motivation_bioweapons: 'Armas biológicas',
	onboarding_motivation_other: 'Otro',
	onboarding_skill_software: 'Desarrollo de software',
	onboarding_skill_video: 'Creación de vídeo',
	onboarding_skill_social_media: 'Gestión de redes sociales',
	onboarding_skill_events: 'Organización de eventos',
	onboarding_skill_speaking: 'Hablar en público / Presentaciones',
	onboarding_skill_writing: 'Redacción',
	onboarding_skill_design: 'Diseño gráfico / Artes visuales',
	onboarding_skill_research: 'Investigación',
	onboarding_skill_comms: 'Comunicación / Relaciones públicas',
	onboarding_skill_fundraising: 'Captación de fondos',
	onboarding_skill_community: 'Organización comunitaria',
	onboarding_skill_advocacy: 'Incidencia política / Lobby',
	onboarding_skill_education: 'Educación / Docencia',
	onboarding_skill_admin: 'Apoyo administrativo',
	onboarding_skill_legal: 'Conocimientos jurídicos',
	onboarding_skill_other: 'Otro',
	onboarding_hours_under_3: 'Menos de 3 horas',
	onboarding_hours_3_6: '3-6 horas',
	onboarding_hours_6_10: '6-10 horas',
	onboarding_hours_10_20: '10-20 horas',
	onboarding_hours_20_plus: 'Más de 20 horas',
	onboarding_action_ai_concerns_title: 'Comparte tus preocupaciones sobre la IA',
	onboarding_action_ai_concerns_sub: 'Cuenta tu historia y suma tu voz al registro público.',
	onboarding_action_email_reps_title: 'Escribe a tus representantes electos',
	onboarding_action_email_reps_sub:
		'Usa nuestro Email Builder para obtener un mensaje ya redactado que puedes personalizar y enviar.',
	onboarding_action_lobby_title: 'Contacta con tus cargos electos',
	onboarding_action_lobby_sub: 'Nuestros consejos de incidencia te guían sobre qué decir.',
	onboarding_action_talk_title: 'Habla de la seguridad de la IA con alguien de tu entorno',
	onboarding_action_talk_sub:
		'Una amistad, un vecino, un compañero de trabajo o un familiar. Nuestra <a target="_blank" rel="noopener noreferrer" href="/counterarguments">guía de contraargumentos</a> te ayudará a responder preguntas difíciles y a animar a otras personas a actuar.',
	onboarding_action_catalyse_title: 'Catalyse: encuentra un proyecto de voluntariado',
	onboarding_action_catalyse_sub:
		'Explora proyectos de voluntariado y únete a uno que se ajuste a tus habilidades y tu tiempo.',
	onboarding_action_petitions_title: 'Firma las peticiones',
	onboarding_action_petitions_sub:
		'Suma tu nombre al de miles de personas que piden una IA más segura.',
	onboarding_action_donate_title: 'Dona o hazte con merchandising',
	onboarding_action_donate_sub:
		'Haz una <a target="_blank" rel="noopener noreferrer" href="/donate">donación</a> o consigue algo de nuestra <a target="_blank" rel="noopener noreferrer" href="https://pauseai-shop.fourthwall.com/">tienda</a>.',
	onboarding_error_generic: 'Algo ha fallado. Inténtalo de nuevo.',
	onboarding_error_unexpected: 'Se ha producido un error inesperado. Inténtalo de nuevo.'
}

const it: OnboardingMessages = {
	...chapterShareIt,
	onboarding_page_title: 'Partecipa',
	onboarding_page_description:
		"Trova il modo più efficace per te di aiutare a mettere in pausa lo sviluppo dell'IA sovrumana.",
	onboarding_browse_banner:
		'Stai navigando senza iscriverti: lascia la tua e-mail qui sotto così possiamo avvisarti quando ci saranno nuove opportunità.',
	onboarding_field_full_name: 'Nome e cognome *',
	onboarding_placeholder_full_name: 'Nome e cognome',
	onboarding_field_email: 'E-mail *',
	onboarding_placeholder_email: 'E-mail',
	onboarding_field_country: 'Paese di residenza *',
	onboarding_placeholder_country: 'Seleziona il tuo paese',
	onboarding_field_city: 'Città / comune di residenza *',
	onboarding_placeholder_city: 'Città / comune',
	onboarding_us_note:
		'PauseAI US è un\'organizzazione separata. Visita <a target="_blank" rel="noopener noreferrer" href="https://peopleforapause.org/get-involved">People for a Pause</a> per partecipare lì.',
	onboarding_btn_continue: 'Continua →',
	onboarding_btn_browse: '👀 Voglio solo agire subito',
	onboarding_browse_helper: 'Passa direttamente alle azioni che puoi fare oggi, senza e-mail.',
	onboarding_step2_heading: 'Cosa ti porta qui?',
	onboarding_optins_heading: 'Vuoi ricevere le nostre notizie?',
	onboarding_email_critical_notice:
		'Occasionalmente potremmo inviarti un avviso importante, anche se non selezioni nessuna di queste opzioni. Puoi annullare l\'iscrizione da qualsiasi lista in qualsiasi momento. Consulta la nostra <a target="_blank" rel="noopener noreferrer" href="/privacy">informativa sulla privacy</a>.',
	onboarding_intent_keep_informed_label: 'Tienimi informato/a',
	onboarding_intent_newsletter_label: 'Iscriviti al nostro Substack',
	onboarding_intent_newsletter_sub: "Notizie sull'IA dal punto di vista del team di PauseAI.",
	onboarding_intent_more_optional: 'Vuoi fare di più? (facoltativo)',
	onboarding_intent_act_now_label: 'Voglio solo agire subito',
	onboarding_intent_act_now_sub: 'Mostrami cosa posso fare oggi.',
	onboarding_intent_volunteer_label: 'Voglio fare volontariato regolarmente',
	onboarding_intent_volunteer_sub: 'Aiutami a trovare un ruolo adatto a me.',
	onboarding_intent_lead_label: 'Voglio guidare un gruppo',
	onboarding_intent_lead_sub: 'Sono pronto/a a organizzare nel mio paese o nella mia regione.',
	onboarding_gdpr_consent:
		'Accetto l\'<a target="_blank" rel="noopener noreferrer" href="/privacy">Informativa sulla privacy</a>.&nbsp;*',
	onboarding_btn_submit: 'Invia →',
	onboarding_btn_submitting: 'Invio in corso...',
	onboarding_btn_back: '← Indietro',
	onboarding_confirm_newsletter:
		"Sei iscritto/a al nostro Substack: notizie sull'IA dal punto di vista del team di PauseAI, via e-mail.",
	onboarding_check_inbox_title: 'Controlla la tua casella di posta',
	onboarding_check_inbox_body:
		"Ti abbiamo inviato un'e-mail. Clicca sul link che contiene per confermare il tuo indirizzo. Se non la trovi, controlla la cartella spam.",
	onboarding_confirm_b_sub: 'Ecco alcuni modi per fare la differenza già oggi.',
	onboarding_confirm_volunteer_title: 'Benvenuto/a nel team.',
	onboarding_confirm_volunteer_sub: 'Sei nella lista dei volontari. Ti contatteremo presto.',
	onboarding_browse_header_title: 'Agisci subito.',
	onboarding_browse_header_sub:
		'Qui sotto trovi alcune azioni che puoi fare subito. Il modo migliore per essere informato/a sulle nuove opportunità è iscriverti qui sotto.',
	onboarding_browse_keep_informed_title: 'Tienimi informato/a',
	onboarding_btn_sign_me_up: 'Iscrivimi →',
	onboarding_btn_signing_up: 'Iscrizione in corso...',
	onboarding_section_ways_to_help: 'Alcuni modi per aiutare già oggi',
	onboarding_next_step_title: '★ Prossimo passo consigliato',
	onboarding_next_step_p1:
		'Partecipa a uno dei nostri incontri di benvenuto per la comunità dei membri, o a un evento sociale locale, per scoprire di più sulla comunità di PauseAI: <a target="_blank" rel="noopener noreferrer" href="/communities#events">vedi i prossimi eventi</a>.',
	onboarding_next_step_p2:
		'Vuoi passare subito all\'azione? Consulta la nostra <a target="_blank" rel="noopener noreferrer" href="/action">lista di azioni</a>.',
	onboarding_footer_join_conversation: 'Unisciti alla conversazione',
	onboarding_footer_discord_btn: 'Unisciti a PauseAI su Discord',
	onboarding_footer_follow_us: 'Seguici',
	onboarding_step_about: 'Su di te',
	onboarding_step_intent: 'Intenzione',
	onboarding_step_volunteer_form: 'Modulo volontari',
	onboarding_step_check_inbox: 'Controlla la posta',
	onboarding_step_next_steps: 'Prossimi passi',
	onboarding_volunteer_title: 'Iscriviti come volontario/a',
	onboarding_volunteer_intro:
		'Raccontaci qualcosa di te così possiamo trovare un ruolo adatto a te.',
	onboarding_field_zip: 'Codice postale (ZIP)',
	onboarding_placeholder_zip: 'es. 02134',
	onboarding_helper_zip: 'Il tuo codice ZIP a 5 cifre serve a trovare il tuo gruppo locale.',
	onboarding_field_uk_postcode: 'Codice postale (UK)',
	onboarding_placeholder_uk_postcode: 'es. SW1A 1AA',
	onboarding_helper_uk_postcode:
		'Il tuo codice postale completo. Lo usiamo per collegarti al collegio elettorale del tuo parlamentare (MP) e al gruppo locale più vicino.',
	onboarding_field_university: 'Università (facoltativo)',
	onboarding_placeholder_university: 'Cerca per nome o sigla, es. LSE',
	onboarding_helper_university: "Studi all'università? Dicci quale.",
	onboarding_field_discord: 'Nome utente Discord',
	onboarding_helper_discord:
		'Se non hai un account Discord, ti invitiamo a <a target="_blank" rel="noopener noreferrer" href="https://discord.com/register">crearne uno qui</a>.',
	onboarding_field_phone: 'Numero di telefono',
	onboarding_placeholder_dial_code: '+39',
	onboarding_placeholder_phone: '300 000 0000',
	onboarding_field_languages: 'Quali lingue parli? *',
	onboarding_placeholder_languages: 'Seleziona le lingue',
	onboarding_field_discovery: 'Come hai conosciuto PauseAI?',
	onboarding_placeholder_discovery: "Seleziona un'opzione",
	onboarding_field_motivations: 'Cosa ti ha spinto/a a unirti a noi?',
	onboarding_field_skills: 'Competenze e interessi',
	onboarding_field_hours: 'Quanto tempo puoi dedicare ogni settimana? *',
	onboarding_placeholder_specify: 'Specifica',
	onboarding_agree_volunteer:
		'Accetto l\'<a target="_blank" rel="noopener noreferrer" href="/volunteer-agreement">Accordo di volontariato</a>&nbsp;*',
	onboarding_agree_conduct:
		'Accetto il <a target="_blank" rel="noopener noreferrer" href="/code-of-conduct">Codice di condotta</a>&nbsp;*',
	onboarding_become_paying_member:
		"Voglio diventare un membro pagante — apri la pagina delle donazioni dopo l'invio.",
	onboarding_become_paying_member_disclaimer:
		"Il servizio di pagamento (Stripe) si aprirà in una nuova scheda al momento dell'invio.",
	onboarding_paying_member_heading: 'Vuoi diventare un membro pagante di PauseAI Global?',
	onboarding_paying_member_description:
		'Con una quota mensile di 5 $ puoi sostenere il lavoro dei volontari di PauseAI Global che protestano, fanno lobbying e si coordinano per una pausa globale dello sviluppo dell\'Intelligenza Artificiale Generale. Per annullare l\'iscrizione, scrivici a <a href="mailto:unsubscribe@pauseai.info">unsubscribe@pauseai.info</a>.',
	onboarding_paying_member_donate_notice:
		'Puoi anche dare un contributo più grande a PauseAI Global facendo una donazione <a target="_blank" rel="noopener noreferrer" href="https://pauseai.info/donate">qui</a>.',
	onboarding_lead_title: (role) => `Descrizione del ruolo di volontariato: ${role}`,
	onboarding_lead_meta: 'Ruolo di volontariato part-time · 5–15 ore/settimana',
	onboarding_lead_intro:
		'PauseAI Global cerca leader in tutto il mondo per guidare gruppi locali che coordinino le attività di organizzazione nella loro zona. Si tratta di un ruolo di volontariato part-time che richiede 5-15 ore a settimana. Ogni responsabile di gruppo si occuperà di pianificare azioni dirette, mobilitare volontari e coordinarsi con il team di PauseAI Global.',
	onboarding_lead_has_chapter: (country) =>
		`<strong>${country} ha già un gruppo PauseAI nazionale</strong>, quindi invece di fondare un gruppo nazionale potresti guidare un gruppo regionale o cittadino al suo interno. Trova il tuo gruppo su <a target="_blank" rel="noopener noreferrer" href="/communities">pauseai.info/communities</a>, oppure candidati qui sotto e ne parleremo insieme.`,
	onboarding_lead_check_chapter:
		'<strong>Per prima cosa, verifica che il tuo paese non abbia già un gruppo nazionale:</strong> <a target="_blank" rel="noopener noreferrer" href="/communities">pauseai.info/communities</a>.',
	onboarding_lead_what_you_do_title: 'Cosa farai',
	onboarding_lead_do_1:
		'Reclutare volontari e far crescere il tuo gruppo locale, accogliendo nuove persone e organizzando eventi insieme.',
	onboarding_lead_do_2: 'Costruire relazioni con gruppi di attivisti locali e giornalisti.',
	onboarding_lead_do_3:
		'Incontrare ogni mese il team globale di PauseAI per scambiare idee e restare in linea con la strategia globale e le campagne trimestrali.',
	onboarding_lead_do_4:
		'Condividere le attività del tuo gruppo sui social media e aiutare a promuovere gli eventi.',
	onboarding_lead_looking_for_title: 'Cosa cerchiamo',
	onboarding_lead_looking_1:
		'Capacità di pianificare e realizzare azioni dirette, inclusi workshop ed eventi pubblici.',
	onboarding_lead_looking_2:
		'Ottime capacità comunicative, con la voglia e la capacità di coinvolgere comunità diverse.',
	onboarding_lead_looking_3:
		'Spirito di iniziativa, con la capacità di lavorare sia in autonomia sia in squadra.',
	onboarding_lead_looking_4:
		"Passione per la sicurezza dell'IA e adesione alla missione di PauseAI.",
	onboarding_lead_looking_5: 'Capacità di comunicare in inglese senza difficoltà',
	onboarding_lead_looking_6: 'Adesione e impegno a un approccio non violento e legale.',
	onboarding_lead_nice_to_have_title: 'Cosa sarebbe un plus',
	onboarding_lead_nice_1: 'Solide capacità organizzative ed esperienza di attivismo dal basso.',
	onboarding_lead_nice_2: 'Competenze di lobbying ed esperienza di dialogo con decisori politici',
	onboarding_lead_nice_3: 'Esperienza con i media e nella scrittura di contenuti',
	onboarding_lead_imperfect:
		"Se non soddisfi tutti i requisiti, vogliamo comunque sentirti. L'impegno per la sicurezza dell'IA e la convinzione di poter fare la differenza sono il fattore più importante; possiamo offrirti formazione, risorse e una comunità su cui contare.",
	onboarding_lead_support_title: 'Il supporto che riceverai',
	onboarding_lead_support:
		'Entrerai a far parte di una rete globale di organizzatori e organizzatrici che stanno capendo insieme come fare. Ci incontriamo ogni mese, condividiamo risorse sulle nostre piattaforme di chat e ci aiutiamo a vicenda a risolvere i problemi. È un ottimo modo per imparare nuove competenze, conoscere persone riflessive e far parte di un movimento in rapida crescita che lavora su una delle questioni più importanti del nostro tempo.',
	onboarding_lead_next_steps_title: 'Prossimi passi',
	onboarding_lead_next_steps:
		"Se ti rispecchi in questa descrizione, compila il nostro modulo di candidatura qui sotto. La direttrice dell'organizzazione di PauseAI Global, Irina Tavera, esamina ogni candidatura e ti contatterà per i prossimi passi.",
	onboarding_lead_apply_btn: 'Candidati come leader',
	onboarding_discovery_pauseai_social: 'Social media affiliati a PauseAI',
	onboarding_discovery_other_social: 'Social media non affiliati a PauseAI',
	onboarding_discovery_referral: 'Consiglio di amici o familiari',
	onboarding_discovery_news: 'Articolo di giornale',
	onboarding_discovery_event: 'Evento/Presentazione',
	onboarding_discovery_search: 'Ricerca su Internet',
	onboarding_discovery_other: 'Altro',
	onboarding_motivation_ai_safety: "Sicurezza dell'IA",
	onboarding_motivation_democratic_oversight: 'Necessità di un controllo democratico',
	onboarding_motivation_ethical_tech: 'Tecnologia etica',
	onboarding_motivation_ai_governance: "Governance dell'IA",
	onboarding_motivation_job_displacement: 'Perdita di posti di lavoro',
	onboarding_motivation_misinformation: 'Disinformazione',
	onboarding_motivation_deepfakes: 'Truffe e molestie con deepfake',
	onboarding_motivation_power: 'Concentrazione del potere',
	onboarding_motivation_privacy: 'Perdita della privacy',
	onboarding_motivation_environment: 'Danni ambientali',
	onboarding_motivation_addiction: 'Dipendenza dalla tecnologia',
	onboarding_motivation_weapons: 'Armi autonome',
	onboarding_motivation_cyber: 'Attacchi informatici',
	onboarding_motivation_bioweapons: 'Armi biologiche',
	onboarding_motivation_other: 'Altro',
	onboarding_skill_software: 'Sviluppo software',
	onboarding_skill_video: 'Creazione di video',
	onboarding_skill_social_media: 'Gestione dei social media',
	onboarding_skill_events: 'Organizzazione di eventi',
	onboarding_skill_speaking: 'Parlare in pubblico / Presentazioni',
	onboarding_skill_writing: 'Scrittura',
	onboarding_skill_design: 'Grafica / Arti visive',
	onboarding_skill_research: 'Ricerca',
	onboarding_skill_comms: 'Comunicazione / PR',
	onboarding_skill_fundraising: 'Raccolta fondi',
	onboarding_skill_community: 'Organizzazione di comunità',
	onboarding_skill_advocacy: 'Advocacy politica / Lobbying',
	onboarding_skill_education: 'Istruzione / Insegnamento',
	onboarding_skill_admin: 'Supporto amministrativo',
	onboarding_skill_legal: 'Conoscenze giuridiche',
	onboarding_skill_other: 'Altro',
	onboarding_hours_under_3: 'Meno di 3 ore',
	onboarding_hours_3_6: '3-6 ore',
	onboarding_hours_6_10: '6-10 ore',
	onboarding_hours_10_20: '10-20 ore',
	onboarding_hours_20_plus: '20+ ore',
	onboarding_action_ai_concerns_title: "Condividi le tue preoccupazioni sull'IA",
	onboarding_action_ai_concerns_sub:
		'Racconta la tua storia e fai sentire la tua voce pubblicamente.',
	onboarding_action_email_reps_title: 'Scrivi ai tuoi rappresentanti eletti',
	onboarding_action_email_reps_sub:
		'Usa il nostro Email Builder per avere un messaggio già pronto da personalizzare e inviare.',
	onboarding_action_lobby_title: 'Contatta i tuoi rappresentanti politici',
	onboarding_action_lobby_sub: 'I nostri consigli per il lobbying ti guidano su cosa dire.',
	onboarding_action_talk_title: "Parla di sicurezza dell'IA con qualcuno che conosci",
	onboarding_action_talk_sub:
		'Un amico, un vicino, un collega o un familiare. La nostra <a target="_blank" rel="noopener noreferrer" href="/counterarguments">guida alle obiezioni</a> può aiutarti a rispondere alle domande difficili e a incoraggiare gli altri ad agire.',
	onboarding_action_catalyse_title: 'Catalyse — trova un progetto di volontariato',
	onboarding_action_catalyse_sub:
		'Sfoglia i progetti di volontariato e unisciti a uno adatto alle tue competenze e al tuo tempo.',
	onboarding_action_petitions_title: 'Firma le petizioni',
	onboarding_action_petitions_sub:
		"Aggiungi il tuo nome a quello di migliaia di altre persone che chiedono un'IA più sicura.",
	onboarding_action_donate_title: 'Fai una donazione o prendi qualche gadget',
	onboarding_action_donate_sub:
		'Fai una <a target="_blank" rel="noopener noreferrer" href="/donate">donazione</a> o prendi qualche gadget dal nostro <a target="_blank" rel="noopener noreferrer" href="https://pauseai-shop.fourthwall.com/">negozio</a>.',
	onboarding_error_generic: 'Qualcosa è andato storto. Riprova.',
	onboarding_error_unexpected: 'Si è verificato un errore imprevisto. Riprova.'
}

export const onboardingMessages: Record<string, OnboardingMessages> = { en, de, fr, es, it }
