import { env } from '$env/dynamic/private'

// Stubbed by default for testing: would-be writes are captured for inspection at
// /embed/onboarding-form/stub. Set ONBOARDING_LIVE=true to write to Airtable and
// Substack for real (Phase 2/3 launch; requires the Airtable fresh-fields batch
// to be done).
export const isOnboardingLive = () => env.ONBOARDING_LIVE === 'true'

// Whether an onboarding update without a valid continuation token is refused
// rather than only reported. Has no effect while ONBOARDING_CONTINUATION_SECRET
// is unset: see onboardingContinuation.ts.
export const isContinuationEnforced = () => env.ONBOARDING_CONTINUATION_ENFORCE === 'true'

// Whether rows the form creates are marked as CiviCRM's to send the signup mail for
// (docs/join-form-flow.md, "Signup mail owner"). The Members field must exist before
// this is turned on, since Airtable refuses a write naming an unknown field.
export const isSignupMailOwnerCrm = () => env.SIGNUP_MAIL_OWNER_CRM === 'true'
