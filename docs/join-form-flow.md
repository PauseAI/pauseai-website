# Join Form Flow

This document describes the flow of the PauseAI join / onboarding form, from the
landing page through to the Airtable write (or stub capture) and optional
Substack subscription.

## Entry points

The same `OnboardingFlow.svelte` component is mounted from two routes:

| Route                    | File                                                     | Notes                                                                                                                                         |
| ------------------------ | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `/join`                  | `src/posts/join.md` (rendered via `[slug]/+page.svelte`) | Standalone page. Optionally preceded by `CollagenSignup`, which pre-fills `subscribeEmail` when a Collagen UID is detected in the URL.        |
| `/embed/onboarding-form` | `src/routes/embed/onboarding-form/+page.svelte`          | Embeddable version (iframed by partner sites). Reads `?country=` and `?bg=` query params; reports its height to the parent via `postMessage`. |

Both render `<OnboardingFlow />` from
`src/lib/components/onboarding/OnboardingFlow.svelte`.

## Step machine

`OnboardingFlow` is a small state machine with a `step` counter
(`1 → 2 → 3 → 4`) and two derived values: `mode` (`'contact' | 'browse'`) and
`intent` (`'act-now' | 'volunteer' | 'lead' | null`).

```mermaid
stateDiagram-v2
    [*] --> Step1
    Step1: Step 1 — Basic info\n(name, email, country, city)
    Step1 --> Step2: Continue (client-side)
    Step1 --> Browse: "I just want to take action now"
    Browse: Browse mode\n(act-now, no signup)

    Step2: Step 2 — Intent\n(keep informed / newsletter / act-now / volunteer / lead)
    Step2 --> Step1: Back
    Step2 --> Submit2: Submit (POST /embed/onboarding-form?/submit)
    Submit2 --> Step3Confirm: intent = null OR act-now (contact)
    Submit2 --> Step3Volunteer: intent = volunteer
    Submit2 --> Step3Lead: intent = lead

    Browse --> BrowseSignup: "Keep me informed" inline form
    BrowseSignup: POST /embed/onboarding-form?/submit\n(mode=browse, intent=act-now)
    BrowseSignup --> Browse: success → inline confirmation

    Step3Volunteer: Step 3 — Volunteer form\n(languages, skills, hours, agreements)
    Step3Volunteer --> Step2: Back
    Step3Volunteer --> Submit3: Submit (POST, volunteer_details=on)
    Submit3 --> Step4: success

    Step3Lead: Step 3 — Lead role description\n(mailto link to Organizing Director)
    Step3Lead --> [*]: No server submission\n(email hand-off)

    Step3Confirm: Step 3 — Confirmation\n+ ActionCards
    Step4: Step 4 — Volunteer confirmation
    Step3Confirm --> [*]
    Step4 --> [*]
    Browse --> [*]
```

## Server action

All form posts target the `submit` action in
`src/routes/embed/onboarding-form/+page.server.ts`. The action is shared by the
step-2 (basic + intent), browse-mode inline signup, and step-3 volunteer detail
posts. It distinguishes them by the `mode`, `volunteer_details`, and
`record_id` hidden fields.

```mermaid
sequenceDiagram
    autonumber
    participant U as User (browser)
    participant F as OnboardingFlow.svelte
    participant S as +page.server.ts (submit action)
    participant NG as /api/national-groups
    participant OM as /api/onboarding-mode
    participant AS as Airtable (Members table)
    participant SS as Substack API
    participant ST as onboarding-stub (in-memory)

    U->>F: Fill step 1 (name, email, country, city)
    F->>F: continueToIntent() → step = 2 (no network)

    U->>F: Pick intent + GDPR consent, submit step 2
    F->>S: POST /embed/onboarding-form?/submit\n(mode=contact, intent, basics, keep_informed, newsletter)
    S->>S: Validate required fields + email + country + intent
    S->>S: Honeypot check (nickname field)
    S->>NG: GET /api/national-groups (chapter lookup by country)
    NG-->>S: matching chapter (or null)

    alt isOnboardingLive() (ONBOARDING_LIVE=true)
        alt record_id present (update path)
            S->>AS: updateRecord(base, table, recordId, fields)
            AS-->>S: updated record
        else new record (create path)
            S->>AS: createRecord(base, table, fields)
            AS-->>S: new recordId
            opt newsletter checkbox on
                S->>SS: POST /api/v1/free (subscribe email)
                SS-->>S: ok
            end
        end
        S-->>F: { success: true, recordId }
    else stub mode (default)
        S->>ST: recordStubSubmission({ airtable, fields, meta })
        ST-->>S: stub submission (id, receivedAt)
        S-->>F: { success: true, recordId: existingRecordId | `stub-${id}` }
    end

    F->>F: store recordId in state\n(later posts update instead of duplicate)
    F->>F: advance step (→ 3, or → 4 for volunteer)

    opt intent = volunteer (step 3 volunteer form)
        U->>F: Fill volunteer details (languages, skills, hours, agreements)
        F->>S: POST /embed/onboarding-form?/submit\n(volunteer_details=on, record_id, basics, volunteer fields)
        S->>S: Validate volunteer-specific fields\n(languages, hours, agreements)
        S->>NG: chapter lookup
        alt live
            S->>AS: updateRecord(recordId, volunteer fields)
        else stub
            S->>ST: recordStubSubmission(...)
        end
        S-->>F: { success: true, recordId }
        F->>F: step = 4 (confirmation)
    end

    note over F,OM: On mount, F also fetches /api/onboarding-mode\nand logs LIVE vs STUB to the console.
```

## Data written to Airtable

Target: base `appWPTGqZmUcs3NWu`, table `tblL1icZBhTV1gQ9o` ("Members").

**Step 2 / browse signup (create):** `Full name`, `Email`, `Country`, `City`,
`Intent`, `Signup source`, `Email subscription` (keep_informed),
`Data privacy policy agreed`, `GDPR chapter share permission`.

**Step 3 volunteer (update, only when `volunteer_details=on`):** adds
`Discord Username`, `Phone`, `Languages`, `Other languages`,
`Discovery method of PAI`, `Discovery method of PAI (Other)`, `Motivation`,
`Motivation (Other)`, `Skills & Interests`, `Skill & Interests (Other)`,
`Projected weekly hours`, `Volunteer Agreement`, `Code of Conduct agreed`, and
`Zip code` (US only).

## Validation rules

Enforced in the `submit` action before any write:

- Required: `full_name`, `email`, `country`, `city`.
- `email` must match `^\S+@\S+\.\S+$`.
- `country` must be in `COUNTRIES`.
- `intent` must be one of `INTENTS` (`Act now` | `Volunteer` | `Lead` | `Keep informed`).
- GDPR consent (`agree_gdpr`) required **only on the create path** — step-3
  volunteer updates are exempt because consent was captured at step 2.
- Volunteer path additionally requires: ≥1 language, a valid `hours` value, and
  both `agree_volunteer` and `agree_conduct` checkboxes.
- Honeypot: a non-empty `nickname` field silently returns success (bot caught,
  no write performed).

## Live vs. stub mode

`isOnboardingLive()` in `src/lib/server/onboarding.ts` reads the
`ONBOARDING_LIVE` env var. When false (default), submissions are captured
in-memory by `recordStubSubmission()` and rendered at
`/embed/onboarding-form/stub` for inspection — no Airtable write and no Substack
subscription occur. The component surfaces the current mode in the browser
console via `GET /api/onboarding-mode`.

## Lead path (no submission)

When `intent = 'lead'`, step 3 renders a role description and a `mailto:` link
to the Organizing Director (Irina@pauseai.info). The country is checked against
`/api/national-groups` to decide between "National Group Lead" (no existing
chapter) and "Regional Group Lead" (chapter exists). No POST is made; the
hand-off happens off-platform via email.
