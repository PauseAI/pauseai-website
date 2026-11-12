import { defineEnvVars } from '@sveltejs/kit/env';

// @migration-task Review usage of dynamic environment variables. They fall back to the empty string if not present, which may not be what you want.
export const variables = defineEnvVars({
	PUBLIC_SENTRY_DSN: { public: true, schema: (input) => input ?? '' },
	MAILERSEND_API_KEY: { schema: (input) => input ?? '' },
	ANTHROPIC_API_KEY_FOR_WRITE: { schema: (input) => input ?? '' },
	AIRTABLE_WRITE_API_KEY: { schema: (input) => input ?? '' },
	ONBOARDING_EMAIL_RENDER_SECRET: { schema: (input) => input ?? '' },
	ONBOARDING_EMAIL_RENDER_V2_SECRET: { schema: (input) => input ?? '' },
	EMAIL_VERIFICATION_SECRET: { schema: (input) => input ?? '' },
	OPENAI_KEY: { schema: (input) => input ?? '' },
	AIRTABLE_API_KEY: { schema: (input) => input ?? '' },
	PUBLIC_CLOUDINARY_CLOUD_NAME: { schema: (input) => input ?? '' },
	CLOUDINARY_API_KEY: { schema: (input) => input ?? '' },
	CLOUDINARY_API_SECRET: { schema: (input) => input ?? '' },
	CI: { schema: (input) => input ?? '' },
	DEV: { schema: (input) => input ?? '' },
	PARAGLIDE_LOCALES: { schema: (input) => input ?? '' },
	CRM_INTAKE_ENABLED: { schema: (input) => input ?? '' },
	CRM_INTAKE_URL: { schema: (input) => input ?? '' },
	CRM_INTAKE_KEY: { schema: (input) => input ?? '' },
	NOTION_API_KEY: { schema: (input) => input ?? '' },
	ONBOARDING_LIVE: { schema: (input) => input ?? '' },
	ONBOARDING_CONTINUATION_ENFORCE: { schema: (input) => input ?? '' },
	SIGNUP_EMAILS_SENT_BY_CRM: { schema: (input) => input ?? '' },
	ONBOARDING_CONTINUATION_SECRET: { schema: (input) => input ?? '' },
	STATEMENT_SIGNING_LIVE: { schema: (input) => input ?? '' },
	STATEMENT_BACKEND: { schema: (input) => input ?? '' },
	TURNSTILE_SECRET_KEY: { schema: (input) => input ?? '' }
});
