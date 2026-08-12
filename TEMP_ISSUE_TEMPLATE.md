# Add Turnstile bot protection to `/embed/onboarding-form`

**Type:** Security / High Priority  
**Labels:** security, bug

## Description

The `/embed/onboarding-form?/submit` action lacks bot protection and can be exploited to spam MailerSend with invalid signups, damaging sender reputation. The `/contact` form already has Cloudflare Turnstile protection; the onboarding form needs the same.

## Problem

**Current state:**
- ✅ Honeypot field only (catches bots that render the page)
- ❌ No server-side CAPTCHA verification
- ❌ Bots can POST directly to the endpoint and bypass honeypot

**Impact:**
- Spam subscriptions sent through MailerSend
- Airtable volunteer database flooded with junk records
- Damages sender reputation → legitimate emails marked as spam

## Solution

Apply the same `checkNotSpam()` + Turnstile flow from `/contact-us`:

**Backend:**
1. Call `checkNotSpam(data, url.hostname)` at start of submit action (after line 69)
2. Return error if verification fails
3. Proceed to Airtable/Substack writes only after passing check

**Frontend:**
1. Add Turnstile widget to `OnboardingFlow.svelte` before final submit
2. Include token in form POST

Reuse existing `TURNSTILE_SECRET_KEY` and `TURNSTILE_SITE_KEY` env vars.

### Reference

- `src/routes/contact-us/+page.server.ts` lines 51-182 — working implementation
- `src/lib/components/Turnstile.svelte` — reusable component
