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
