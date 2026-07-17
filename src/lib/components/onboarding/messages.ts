// Hardcoded translations for the onboarding embed.
// This is a temporary local alternative to paraglide-based localisation, which
// requires the private l10n cage (PauseAI/paraglide) to compile translations
// into the runtime. Until that access is available, translations live here and
// are reviewable/shippable via normal PRs.
export interface OnboardingMessages {
	onboarding_page_title: string
	onboarding_page_description: string
	onboarding_browse_banner: string
	onboarding_field_full_name: string
	onboarding_placeholder_full_name: string
	onboarding_field_email: string
	onboarding_placeholder_email: string
	onboarding_helper_email_gmail: string
	onboarding_field_country: string
	onboarding_placeholder_country: string
	onboarding_field_city: string
	onboarding_placeholder_city: string
	onboarding_btn_continue: string
	onboarding_btn_browse: string
	onboarding_browse_helper: string
	onboarding_step2_heading: string
	onboarding_intent_keep_informed_label: string
	onboarding_intent_keep_informed_sub: string
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
	onboarding_confirm_keep_informed: string
	onboarding_confirm_newsletter: string
	onboarding_confirm_a_title: string
	onboarding_confirm_b_title: string
	onboarding_confirm_b_sub: string
	onboarding_confirm_volunteer_title: string
	onboarding_confirm_volunteer_sub: string
	onboarding_browse_header_title: string
	onboarding_browse_header_sub: string
	onboarding_browse_signed_up: string
	onboarding_browse_keep_informed_title: string
	onboarding_browse_keep_informed_sub: string
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
	onboarding_step_confirmed: string
	onboarding_step_next_steps: string
	onboarding_volunteer_title: string
	onboarding_volunteer_intro: string
	onboarding_field_zip: string
	onboarding_placeholder_zip: string
	onboarding_helper_zip: string
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
	onboarding_lead_title: (role: string) => string
	onboarding_lead_meta: string
	onboarding_lead_intro: string
	onboarding_lead_us_branch: string
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
	onboarding_lead_email_btn: string
	onboarding_lead_please_mention: string
	onboarding_lead_mention_1: string
	onboarding_lead_mention_2: string
	onboarding_lead_mention_3: string
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
	onboarding_action_microcommit_title: string
	onboarding_action_microcommit_sub: string
	onboarding_action_petitions_title: string
	onboarding_action_petitions_sub: string
	onboarding_action_donate_title: string
	onboarding_action_donate_sub: string
	onboarding_error_generic: string
	onboarding_error_unexpected: string
}

const en: OnboardingMessages = {
	onboarding_page_title: 'Get involved',
	onboarding_page_description:
		'Find the highest-impact way for you to help pause the development of superhuman AI.',
	onboarding_browse_banner:
		"You're browsing without signing up, leave your email below so we can tell you when new opportunities go live.",
	onboarding_field_full_name: 'Full name *',
	onboarding_placeholder_full_name: 'Full name',
	onboarding_field_email: 'Email *',
	onboarding_placeholder_email: 'Email',
	onboarding_helper_email_gmail: 'Preferably Gmail if you have one.',
	onboarding_field_country: 'Country of residence *',
	onboarding_placeholder_country: 'Select your country',
	onboarding_field_city: 'City / town of residence *',
	onboarding_placeholder_city: 'City / town',
	onboarding_btn_continue: 'Continue →',
	onboarding_btn_browse: '👀 I just want to take action now',
	onboarding_browse_helper: 'Skip ahead to see the actions you can take today, no email required.',
	onboarding_step2_heading: 'What brings you here?',
	onboarding_intent_keep_informed_label: 'Keep me informed',
	onboarding_intent_keep_informed_sub:
		'Connect me with my local PauseAI chapter, and keep me updated on global campaigns.',
	onboarding_intent_newsletter_label: 'Subscribe to our Substack',
	onboarding_intent_newsletter_sub: 'General news on AI, delivered via our Substack newsletter.',
	onboarding_intent_more_optional: 'Want to do more? (optional)',
	onboarding_intent_act_now_label: 'I just want to take action now',
	onboarding_intent_act_now_sub: 'Show me what I can do today.',
	onboarding_intent_volunteer_label: 'I want to volunteer regularly',
	onboarding_intent_volunteer_sub: 'Help me find a role that fits.',
	onboarding_intent_lead_label: 'I want to lead',
	onboarding_intent_lead_sub: "I'm ready to organize in my country or region.",
	onboarding_gdpr_consent:
		'I agree to the <a target="_blank" rel="noopener noreferrer" href="/privacy">Privacy Policy</a>, including sharing my details with my local PauseAI chapter (which may be a separate entity to PauseAI Global) for local coordination.&nbsp;*',
	onboarding_btn_submit: 'Submit →',
	onboarding_btn_submitting: 'Submitting...',
	onboarding_btn_back: '← Back',
	onboarding_confirm_keep_informed:
		"We'll connect you with your local PauseAI chapter and keep you updated on global campaigns.",
	onboarding_confirm_newsletter:
		"You're subscribed to our Substack newsletter for general news on AI.",
	onboarding_confirm_a_title: "You're in.",
	onboarding_confirm_b_title: "You're in, thanks for joining us.",
	onboarding_confirm_b_sub: "You're all set. Here are a few ways to make a difference today.",
	onboarding_confirm_volunteer_title: 'Welcome to the team.',
	onboarding_confirm_volunteer_sub: "You're on the volunteer list. We'll be in touch soon.",
	onboarding_browse_header_title: 'Take action right now.',
	onboarding_browse_header_sub:
		'Below are some actions you can take right now. The best way to stay informed about new opportunities is to sign up below.',
	onboarding_browse_signed_up:
		"✓ You're in. We'll connect you with your local PauseAI chapter and keep you updated on global campaigns.",
	onboarding_browse_keep_informed_title: 'Keep me informed',
	onboarding_browse_keep_informed_sub:
		'Connect me with my local PauseAI chapter and keep me updated on global campaigns.',
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
	onboarding_step_confirmed: 'Confirmed',
	onboarding_step_next_steps: 'Next steps',
	onboarding_volunteer_title: 'Sign up to volunteer',
	onboarding_volunteer_intro: 'Tell us a bit about yourself so we can find a role that fits.',
	onboarding_field_zip: 'Zip code',
	onboarding_placeholder_zip: 'e.g. 02134',
	onboarding_helper_zip: 'Your 5-digit zip code is used to find your Local Group.',
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
	onboarding_lead_title: (role) => `${role} Volunteer Description`,
	onboarding_lead_meta: 'Part-time volunteer role · 5–15 hours/week',
	onboarding_lead_intro:
		'Pause AI Global is looking for leaders around the world to run local groups that lead organising efforts in their area. This is a part-time volunteer role requiring 5-15 hours per week. Each group leader will be responsible for planning direct actions, mobilising volunteers and coordinating with the Global PauseAI team.',
	onboarding_lead_us_branch:
		'Since you\'re based in the <strong>United States</strong>, please apply through PauseAI US: <a target="_blank" rel="noopener noreferrer" href="https://form.asana.com/?k=RxWuTz8SYKME33V5nBvK1A&d=1208505553897008">PauseAI US application form</a>.',
	onboarding_lead_has_chapter: (country) =>
		`<strong>${country} already has a PauseAI chapter</strong>, so rather than founding a national group, you could lead a regional or city group within it. Find your chapter at <a target="_blank" rel="noopener noreferrer" href="/communities">pauseai.info/communities</a>, or email our Organizing Director below to talk it through.`,
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
		'If you\'d like to learn more, please contact our PauseAI Global organising director Irina Tavera at <a target="_blank" rel="noopener noreferrer" href="mailto:Irina@pauseai.info">Irina@pauseai.info</a> to schedule an informal exploratory chat.',
	onboarding_lead_email_btn: '✉️ Email our Organizing Director',
	onboarding_lead_please_mention: 'Please let her know the following:',
	onboarding_lead_mention_1: 'Your name',
	onboarding_lead_mention_2: 'Your country of residence',
	onboarding_lead_mention_3: "A few sentences on why you'd like to become a lead",
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
	onboarding_action_microcommit_title: 'Microcommit — weekly bite-sized actions',
	onboarding_action_microcommit_sub:
		'Pick from a list of small ongoing actions and track your contribution over time.',
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
	onboarding_page_title: 'Mitmachen',
	onboarding_page_description:
		'Finde den wirkungsvollsten Weg, um bei der Pause der KI-Entwicklung zu helfen.',
	onboarding_browse_banner:
		'Du browst ohne dich anzumelden. Hinterlasse unten deine E-Mail, damit wir dich über neue Möglichkeiten informieren können.',
	onboarding_field_full_name: 'Vollständiger Name *',
	onboarding_placeholder_full_name: 'Vollständiger Name',
	onboarding_field_email: 'E-Mail *',
	onboarding_placeholder_email: 'E-Mail',
	onboarding_helper_email_gmail: 'Falls vorhanden, bevorzugt Gmail.',
	onboarding_field_country: 'Wohnsitzland *',
	onboarding_placeholder_country: 'Land auswählen',
	onboarding_field_city: 'Stadt / Gemeinde *',
	onboarding_placeholder_city: 'Stadt / Gemeinde',
	onboarding_btn_continue: 'Weiter →',
	onboarding_btn_browse: '👀 Ich möchte nur jetzt handeln',
	onboarding_browse_helper: 'Überspringe die Anmeldung und sieh, was du heute tun kannst.',
	onboarding_step2_heading: 'Was bringt dich hierher?',
	onboarding_intent_keep_informed_label: 'Auf dem Laufenden bleiben',
	onboarding_intent_keep_informed_sub:
		'Verbinde mich mit meinem lokalen PauseAI-Kapitel und halte mich über globale Kampagnen auf dem Laufenden.',
	onboarding_intent_newsletter_label: 'Unseren Substack abonnieren',
	onboarding_intent_newsletter_sub:
		'Allgemeine Neuigkeiten zur KI über unseren Substack-Newsletter.',
	onboarding_intent_more_optional: 'Möchtest du mehr tun? (optional)',
	onboarding_intent_act_now_label: 'Ich möchte jetzt handeln',
	onboarding_intent_act_now_sub: 'Zeig mir, was ich heute tun kann.',
	onboarding_intent_volunteer_label: 'Ich möchte regelmäßig freiwillig tätig sein',
	onboarding_intent_volunteer_sub: 'Hilf mir, eine passende Rolle zu finden.',
	onboarding_intent_lead_label: 'Ich möchte leiten',
	onboarding_intent_lead_sub: 'Ich bin bereit, in meinem Land oder meiner Region zu organisieren.',
	onboarding_gdpr_consent:
		'Ich stimme der <a target="_blank" rel="noopener noreferrer" href="/privacy">Datenschutzrichtlinie</a> zu, einschließlich der Weitergabe meiner Daten an mein lokales PauseAI-Kapitel (das eine separate Einheit von PauseAI Global sein kann) zur lokalen Koordination.&nbsp;*',
	onboarding_btn_submit: 'Absenden →',
	onboarding_btn_submitting: 'Wird abgesendet...',
	onboarding_btn_back: '← Zurück',
	onboarding_confirm_keep_informed:
		'Wir werden dich mit deinem lokalen PauseAI-Kapitel verbinden und dich über globale Kampagnen informieren.',
	onboarding_confirm_newsletter:
		'Du hast unseren Substack-Newsletter für allgemeine KI-Nachrichten abonniert.',
	onboarding_confirm_a_title: 'Du bist dabei.',
	onboarding_confirm_b_title: 'Du bist dabei – danke, dass du dich uns anschließt.',
	onboarding_confirm_b_sub:
		'Alles ist bereit. Hier sind einige Möglichkeiten, heute etwas zu bewirken.',
	onboarding_confirm_volunteer_title: 'Willkommen im Team.',
	onboarding_confirm_volunteer_sub:
		'Du stehst auf der Freiwilligenliste. Wir melden uns bald bei dir.',
	onboarding_browse_header_title: 'Jetzt handeln.',
	onboarding_browse_header_sub:
		'Im Folgenden findest du Aktionen, die du sofort ergreifen kannst. Am besten bleibst du über neue Möglichkeiten informiert, indem du dich unten anmeldest.',
	onboarding_browse_signed_up:
		'✓ Du bist dabei. Wir verbinden dich mit deinem lokalen PauseAI-Kapitel und halten dich über globale Kampagnen auf dem Laufenden.',
	onboarding_browse_keep_informed_title: 'Auf dem Laufenden bleiben',
	onboarding_browse_keep_informed_sub:
		'Verbinde mich mit meinem lokalen PauseAI-Kapitel und halte mich über globale Kampagnen auf dem Laufenden.',
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
	onboarding_step_confirmed: 'Bestätigt',
	onboarding_step_next_steps: 'Nächste Schritte',
	onboarding_volunteer_title: 'Als Freiwillige/r anmelden',
	onboarding_volunteer_intro:
		'Erzähl uns etwas über dich, damit wir eine passende Rolle finden können.',
	onboarding_field_zip: 'Postleitzahl',
	onboarding_placeholder_zip: 'z. B. 02134',
	onboarding_helper_zip:
		'Deine 5-stellige Postleitzahl wird verwendet, um deine lokale Gruppe zu finden.',
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
	onboarding_lead_title: (role) => `${role} – Freiwilligenbeschreibung`,
	onboarding_lead_meta: 'Ehrenamtliche Teilzeitrolle · 5–15 Stunden/Woche',
	onboarding_lead_intro:
		'PauseAI Global sucht Leitungspersonen auf der ganzen Welt, die lokale Gruppen führen und Organisierungsmaßnahmen in ihrer Region koordinieren. Es handelt sich um eine ehrenamtliche Teilzeitrolle mit einem Aufwand von 5–15 Stunden pro Woche. Jede Gruppenleitung ist verantwortlich für die Planung von Aktionen, die Mobilisierung von Freiwilligen und die Koordination mit dem globalen PauseAI-Team.',
	onboarding_lead_us_branch:
		'Da du in den <strong>Vereinigten Staaten</strong> ansässig bist, bewirb dich bitte über PauseAI US: <a target="_blank" rel="noopener noreferrer" href="https://form.asana.com/?k=RxWuTz8SYKME33V5nBvK1A&d=1208505553897008">PauseAI US Bewerbungsformular</a>.',
	onboarding_lead_has_chapter: (country) =>
		`<strong>${country} hat bereits ein PauseAI-Kapitel</strong>, daher könntest du statt einer nationalen Gruppe eine regionale oder städtische Gruppe leiten. Finde dein Kapitel unter <a target="_blank" rel="noopener noreferrer" href="/communities">pauseai.info/communities</a>, oder wende dich per E-Mail an unseren Organizing Director (siehe unten), um es zu besprechen.`,
	onboarding_lead_check_chapter:
		'<strong>Überprüfe zunächst, ob dein Land bereits ein Kapitel hat:</strong> <a target="_blank" rel="noopener noreferrer" href="/communities">pauseai.info/communities</a>.',
	onboarding_lead_what_you_do_title: 'Was du tun wirst',
	onboarding_lead_do_1:
		'Deine lokale Gruppe aufbauen und wachsen lassen, indem du neue Freiwillige willkommen heißt und gemeinsam Events organisierst.',
	onboarding_lead_do_2: 'Beziehungen zu lokalen Aktivistgruppen und Journalist:innen aufbauen.',
	onboarding_lead_do_3:
		'Monatlich mit dem globalen PauseAI-Team zusammenkommen, um Ideen auszutauschen und mit der globalen Strategie und vierteljährlichen Kampagnen koordiniert zu bleiben.',
	onboarding_lead_do_4:
		'Die Aktivitäten deines Kapitels in sozialen Medien teilen und Events bekannt machen.',
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
		'Wenn du mehr erfahren möchtest, wende dich an Irina Tavera, die globale Organizing Director von PauseAI, unter <a target="_blank" rel="noopener noreferrer" href="mailto:Irina@pauseai.info">Irina@pauseai.info</a>, um ein informelles Gespräch zu vereinbaren.',
	onboarding_lead_email_btn: '✉️ E-Mail an unsere Organizing Director',
	onboarding_lead_please_mention: 'Bitte teile ihr Folgendes mit:',
	onboarding_lead_mention_1: 'Deinen Namen',
	onboarding_lead_mention_2: 'Dein Wohnsitzland',
	onboarding_lead_mention_3:
		'Ein paar Sätze darüber, warum du eine Leitungsrolle übernehmen möchtest',
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
	onboarding_action_microcommit_title: 'Mikroengagement – wöchentlich kleine Aktionen',
	onboarding_action_microcommit_sub:
		'Wähle aus einer Liste kleiner fortlaufender Aktionen und verfolge deinen Beitrag über Zeit.',
	onboarding_action_petitions_title: 'Petitionen unterzeichnen',
	onboarding_action_petitions_sub:
		'Füge deinen Namen zu Tausenden hinzu, die für eine sicherere KI eintreten.',
	onboarding_action_donate_title: 'Spenden oder Merchandise kaufen',
	onboarding_action_donate_sub:
		'Leiste eine <a target="_blank" rel="noopener noreferrer" href="/donate">Spende</a> oder entdecke unser Sortiment in unserem <a target="_blank" rel="noopener noreferrer" href="https://pauseai-shop.fourthwall.com/">Shop</a>.',
	onboarding_error_generic: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
	onboarding_error_unexpected: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.'
}

export const onboardingMessages: Record<string, OnboardingMessages> = { en, de }
