# Volunteer Onboarding Pipeline — Plan of Action

Source memo: `Volunteer Onboarding Pipeline - Design Memo 36d85ac2bea480f88252c2d4e1c8ea15.md`
Date: 2026-05-27 · **Updated 2026-06-10 — all open questions resolved (see Decisions). Plan is unblocked.**

## Verdict

Memo coherent and implementable on the current stack (SvelteKit 2 / Svelte 5, MDsvex, Airtable SDK, MailerSend, Substack). Build to **V2** (demo spec — everything in the memo from the "Version 2 workflow:" heading onward); V1 is superseded — ignore its contradictions. A demo exists at `pauseaionboardtest21526.netlify.app` as a design reference, but it is a standalone **Next.js** build (not SvelteKit) — it is a visual/UX spec to reproduce, not code we can drop in. All four intents + browse mode walked through and confirmed working (2026-05-27).

**Major change from memo (decision 2026-06-10):** the Volunteer path will NOT embed Tally. Tally is deprecated from pauseai.info; the Volunteer step becomes a native form writing directly to Airtable. Other PauseAI sites (e.g. pauseai.uk) may keep using Tally during a gradual switchover; long-term they embed the pauseai.info form via iframe with pre-filled country.

## Decisions (2026-06-10)

Answers to the former open questions, recorded verbatim-in-substance:

1. **Consent model — resolved.**
   - **Newsletter** = explicit consent → opt-in checkbox (default unchecked) on Step 1. Writes `Email subscription`.
   - **Critical mobilization** = **legitimate interest**, not consent. No checkbox; the email is retained for mobilization regardless of the newsletter choice. Unchecking newsletter does NOT stop mobilization email (1a, 1c, 1d confirmed).
   - Consequence: **no `Mobilization consent` field** — legitimate interest is not a consent record. Instead the UI must show a short legitimate-interest notice near the email field (e.g. "We may contact you about critical mobilizations; see our privacy policy"), and the privacy policy must document the legitimate-interest basis (ideally backed by a Legitimate Interests Assessment). Owner: legal/ops — copy needed before launch.
2. **Tally — deprecated from pauseai.info.** Volunteer path is rebuilt as a native form. Other sites (pauseai.uk is the live example) may continue embedding Tally form `wbGvKe` until they migrate. `wbGvKe` is the Tally form ID of the current volunteer application form, embedded at `src/posts/join.md` (pauseai.info/join).
3. **City — add to Step 1** alongside Country.
4. **Tally pre-fill field keys — moot.** Pre-fill into Tally no longer happens (native form pre-fills trivially from Step 1 state). Residual task: extract the field list from form `wbGvKe` to use as the spec for the native volunteer form.
5. **Luma calendar — dropped from scope.** Not relevant to the pipeline; remove the embed from the build.
6. **Chapter notification — manual in Airtable.** No automation to duplicate, no server-side notification firing. We still do the `(country, city) → chapter` lookup to *record* routing, but notifying the chapter is an Airtable-side manual process. Out of build scope.
7. **Native form + iframe for country sites.** Ideal end-state: pauseai.info exposes the onboarding form embeddable in an iframe with pre-filled country for country-level sites. Switchover is gradual — country sites keep Tally until they opt in. Adds Phase 4 below.

## Demo walkthrough findings (2026-05-27)

All paths verified live. Flow matches memo structure. Gaps found between demo and memo / production needs (annotated with 2026-06-10 resolutions):

- **No consent checkbox on contact Step 1.** The memo describes an opt-in checkbox; the demo has none. → Resolved: add newsletter checkbox (explicit consent) + legitimate-interest notice for mobilization (Decision 1).
- **Tally form not pre-filled.** → Moot: Tally replaced by native form (Decision 2).
- **City field inconsistent.** Contact Step 1 collects Country only. → Resolved: City added to Step 1 (Decision 3).
- **Luma slug dead.** `cal-pauseai` 404s. → Resolved: Luma dropped (Decision 5).
- **Lead Step 4 missing Microgrants link.** The memo (search: *"Learn more about our Microgrants"*) specifies a Microgrants link on the Lead confirmation; absent in demo. Add it.
- **Demo is Next.js + Sentry** (Sentry 403s in console). Confirms full rebuild on SvelteKit, no code reuse from the demo.
- Confirmed working: adaptive stepper (3 dots A/B, 4 dots C/D), browse skip-Step-2, intent-dependent button label (Submit vs Continue), browse inline-signup validation, Discord + 9 social links on all confirmations, Lead mailto prefill + "contact me" checkbox.

## Build target

New route `src/routes/onboarding/+page.svelte` (client state machine, modelled on `src/routes/write/+page.svelte`) plus `+page.server.ts` form action.

**Reuse existing:**

- `src/lib/components/NewsletterSignup.svelte` — Substack opt-in (`pauseai.substack.com/api/v1/free`)
- `src/lib/components/Socials.svelte` + Discord `discord.gg/2XXWXvErfA`
- `src/lib/airtable.ts` `createRecord()` — DB write
- `src/routes/api/national-groups/+server.ts` (Airtable `appWPTGqZmUcs3NWu/tblEQJ26hxBAEkaP8`) — chapter lookup by country

**No longer reused:** `src/lib/components/TallyEmbed.svelte` — Volunteer path is now a native form (Decision 2). Leave the component in place; `pauseai.info/join` still uses it until the onboarding route replaces that page, and country sites reference Tally during switchover.

## Phases

### Phase 1 — frontend port

- State machine: Step 1 basic info → Step 2 intent (4 buttons) → Step 3 conditional (A keep-informed / B act-now / C volunteer / D lead) → Step 4 confirm (C + D only).
- Step 1 fields: Full name, Email, Country, **City** (Decision 3), newsletter opt-in checkbox (default unchecked, Decision 1), legitimate-interest notice text near email. Country is required and must be a real country — no "Prefer not to say"/opt-out option (2026-06-10).
- Adaptive stepper: 3 dots (A/B) vs 4 dots (C/D) — memo: *"Stepper / progress indicator"*.
- Browse mode: Step 1 "act now" button → skip Step 2 → Act-now page with inline "Stay in the loop" block — memo: *"Browse mode (the only path browse users reach)"*. Inline block collects Full Name, Email, Country, City to match Step 1.
- Strip demo-only chrome — memo: *"Demo-only chrome (remove before launch)"*: top banner, preview note, restart pill, "Start over (demo)" button.
- **Volunteer path C — native form** (replaces Tally embed): replicate the fields of Tally form `wbGvKe` per **`Tally wbGvKe Field Spec.md`** (extracted 2026-06-10): Discord username, phone, languages (31 options, English pre-selected; displayed in each language's own name, stored as English canonical values — display→value table in the spec file, finding 10), skills & interests (16), motivation (15), discovery method (collapse the `Event`/`Event/Presentation` dupe), weekly hours (6 options — 2026-06-10: Tally's `10+ hours` split into `10-20 hours` and `20+ hours`, plus escape hatch `None — I'd rather support in other ways`; picking it submits normally and the confirmation promotes the Donate card — never divert before capturing the record), Privacy Policy + Volunteer Agreement checkboxes, conditional "Please specify" inputs per Tally's triggers (2026-06-10: keep the wider discovery trigger — specify-box on Other, Event/Presentation, News article, and both social-media options, per the spec's conditional-logic table; motivation/skills/languages specify on Other). Specify text → existing `… (Other)` / `Other languages` fields. Public Statement signing + paying-member checkboxes NOT carried over — covered by confirmation action cards. Conditional zip-code field when Country = United States (only — follow-up 5, as in Tally). Pre-fill name/email/country/city from Step 1 state. On submit → advance to Step 4. No Tally postMessage listener needed. Pending: country-list choice (follow-up 6).
- Lead Step 4: include Microgrants link (demo gap).
- No Luma embed (Decision 5).

### Phase 2 — backend

- `+page.server.ts` form action → `createRecord()` into Members; tag `Intent` + `Signup source` = `June 2026 onboarding flow` (all flow submissions). Browse-then-opt-in writes on inline submit. Volunteer path writes the full field set in the same action (single write path — Q2's "intercept Tally" problem disappears).
- Newsletter checkbox → Substack (reuse NewsletterSignup logic) + set `Email subscription`.
- Chapter routing: server-side `(country[, city]) → chapter` lookup via national-groups Airtable, recorded on the row if useful. **No notification firing** — chapter notification is manual in Airtable (Decision 6).
- Lead path D: `mailto:Irina@pauseai.info` prefill + "contact me" flag (memo: *"Email our Organizing Director"*).

### Phase 3 — test + launch

- Test 4 intents + browse. Verify Airtable writes (incl. native volunteer fields), newsletter opt-in, stepper.
- Run V1 live 2 weeks → iterate (memo: *"build a V1, test it for two weeks, then iterate"*).
- Once stable: point `pauseai.info/join` at the new route / retire the Tally embed there.

### Phase 4 — country-site iframe embed (post-launch, gradual)

- Expose the onboarding form embeddable in an iframe (dedicated minimal-chrome route or query param, e.g. `/onboarding?embed=1&country=GB`), with **pre-filled country** per Decision 7.
- Cross-origin plumbing: postMessage for iframe resize + submit/advance signalling.
- Set `Signup source` (or a per-site value) so embedded submissions are attributable.
- Switchover is gradual and opt-in per site; pauseai.uk is the reference Tally-using site. Coordinate with country-site leads. Tally form `wbGvKe` stays live until the last site migrates.

## Data model (Airtable)

Audited live schema of base "PauseAI Volunteers & Actions" (`appWPTGqZmUcs3NWu`), schema-only, no record/PII access. Full field worksheet: `Airtable Data Audit.md`.

**Write target = `tblL1icZBhTV1gQ9o` "Members"** (66 fields). The Tally Volunteer form already lands here (`Tally ID` field), so it is the natural "one list" — all tiers write here, tagged by intent. No new table needed. Native volunteer submissions will leave `Tally ID` empty — that plus `Signup source` distinguishes them from legacy/country-site Tally rows during the switchover.

**Fields that already map cleanly** (no work beyond writing them): `Full name`, `Email`, `Country`, `City`, `Discord Username`, `Phone`, `Languages`, `Skills & Interests`, `Projected weekly hours`, `Motivation`, `Discovery method of PAI`, `Email subscription`, `Data privacy policy agreed`, `Volunteer Agreement`, `Verified email`, `Tally ID`, `Created Datetime`.

### New fields required (no existing equivalent)

1. **`Intent`** — singleSelect: `Keep informed`, `Act now`, `Volunteer`, `Lead`. The core segmentation field; nothing today distinguishes volunteers from interest-only (memo: *"all of the information lands in airtable in one list … distinguished between volunteers and interest only"*). All downstream filtering (Irina's volunteer view, Comms mobilization list) depends on it.
2. **`Chapter lead interest`** — checkbox. For Lead path (memo: *"Yes — please contact me about starting a chapter"*). Distinct from existing `Leading National Chapter` link, which marks people who *already* lead.
3. **`Signup source`** — singleSelect. Decided 2026-06-10: every submission from the new flow gets the single value **`June 2026 onboarding flow`**; other sources stay as they are (legacy/country-site Tally rows taggable as `tally`, per-site values addable for Phase 4 embeds later). Within-flow path granularity (keep-informed vs browse vs volunteer vs lead) comes from `Intent`, not this field. Existing `Discovery method of PAI` records how they *heard*, not how they *entered*.

~~4. `Mobilization consent`~~ — **not needed** (Decision 1): mobilization rests on legitimate interest, not consent, so there is no consent state to record. `Email subscription` alone records the newsletter choice.

### Not new fields

- Lead "why I want to lead" → sent via `mailto` (memo: *"Email our Organizing Director"*), not stored.
- Chapter routing → derived from `Country` lookup vs National Chapters; no member field needed unless we want to record which chapter applies (notification itself is manual — Decision 6).
- Country/select reuse → not a missing field but a **value-pollution** problem (see cleanup pre-req below).

### Data-cleanup pre-req

`Country` (~120 options, junk entries), `Projected weekly hours`, `Skills & Interests`, `Discovery method`, `Languages` are all polluted singleSelect/multiSelect fields (Tally appends a new option per submit). The native form's clean fixed dropdowns will not match these option names — writes risk failing or spawning more junk options. Clean these (or map to a controlled list, e.g. the `List of countries and languages` table) before wiring the pipeline writes. Upside of Decision 2: once pauseai.info stops using Tally, the main source of option pollution dries up (country-site Tally embeds remain a residual source until Phase 4 completes).

## Follow-ups

### Resolved (2026-06-10)

1. ~~**Tally `wbGvKe` field list**~~ — full spec extracted from the live form into `Tally wbGvKe Field Spec.md` (22 questions, full option lists, conditional logic).
2. ~~**Country list**~~ — full 196-country list (as extracted in the spec file; new Airtable `Country` field gets the same 196 options). Demo's curated 8 for reference/ordering: Germany, United Kingdom, United States, Netherlands, France, Brazil, India, Australia — could inform a "popular countries first" group at the top of the dropdown.
3. ~~**Tally-only fields**~~ —
   - Public Statement signing + paying-member checkboxes dropped from the form (covered by confirmation action cards: "Sign the petitions" incl. PauseAI Statement; "Donate or pick up some gear").
   - "I want to receive e-mail updates" = the newsletter → `Email subscription`, becomes the Decision-1 optional checkbox (Tally's required version was forced consent).
   - Zip code: shown only when Country = **United States** (decided UK first, revised to US same day), matching Tally ("5-digit zip code … to find your Local Group" — feeds PauseAI US local-group matching). No zip/postcode for other countries. ⚠️ Legacy `zipcode` is a number field (strips leading zeros, `02134` → `2134`) — fresh-fields batch creates a text `Zip code` field.
4. ~~**Country-site inventory**~~ — all national-chapter websites scanned (homepage + common join/volunteer paths): `wbGvKe` embeds = pauseai.info `/join` (this repo, replaced in Phase 3) + **pauseai.uk homepage** (confirmed live iframe). Clean: pauseai.rs, pauseia.fr, pauseai.es, pause-ai.de, pauseai.cz, pauseai.se, pauseai-us.org; pauseai.ca confirmed by Harry. Netherlands/Nigeria/Italy/Romania/Kenya/Poland/Australia have no own websites. **pauseai.uk is the only Phase 4 migration.**
5. ~~**Duplicate submissions**~~ — **no upsert** for V1: plain `createRecord()` per submit; repeat email = new row, flagged/handled in Airtable as today (`duplicate` checkbox). Harry to clarify longer-term policy; revisit if dupe volume warrants.
6. All Airtable cleanup judgment calls — see `AirtableCleanup.md` (Podcast kept · hours support-only kept, 740 rows / 21% · Puerto Rico → United States · Bosnian kept · English-name language convention, endonym display).

### OPEN — action needed

1. **Legal copy** *(owner: legal/ops · needed before LAUNCH, not build)*
   Write two pieces: (a) privacy-policy section documenting the **legitimate-interest basis** for critical-mobilization email (ideally backed by a Legitimate Interests Assessment); (b) the one-line **Step-1 notice** near the email field, e.g. *"We may contact you about critical mobilizations — see our privacy policy."*
   → Suggestion: draft (b) now and iterate with legal; it's one sentence and unblocks final Step-1 UI copy.

2. **Airtable fresh-fields batch** *(owner: Airtable admins — Nils DasSpieler / Anthony Bailey per memo · needed before PHASE 2 writes)*
   Execute `AirtableCleanup.md`: rename legacy fields to `X (legacy)`, create the new canonical fields (incl. `Intent`, `Chapter lead interest`, `Signup source`, text `Zip code`), run the backfill script per the mapping tables, repoint views.
   → Suggestion: the doc is decision-complete — this is now pure execution; the only in-flight verifications are the whitespace-dupe options (`1`, `2`, `Español`×3) and the zero-count check on `Friends / word of mouth, Other`.

3. **Automation inventory** *(owner: ops/Airtable admins · needed before PHASE 3 launch; includes the email-verification check)*
   List every Airtable automation that fires on Members record creation (`Follow-up email sent`, `Onboarder email`, Onboarding Events table imply several) and decide per automation whether pipeline rows should trigger it. **Specifically check the verification-email automation**: the repo's `/verify` → `/api/verify` click-side works for pipeline rows as-is, so if the send automation triggers on *any* new Members row, verification works for free; if it's Tally-filtered, widen the trigger.
   → Suggestion: widen the verification trigger to all new Members rows rather than sending from the form action — keeps email sending in one place (Airtable) and the codebase stateless.

4. **Country-site leads confirmation** *(owner: ops + site leads · needed before PHASE 4 only)*
   One-line ask to each site lead: "does your site embed the Tally form `wbGvKe` anywhere not linked from the homepage?" The scan covered linked/common paths only.
   → Suggestion: batch it into whatever Phase-4 kickoff message goes to pauseai.uk (the only known migration).

5. **Donate-path visibility** *(owner: Harry/design · revisit AFTER V1 data)*
   Context: 740/3,499 members (21%) said "None, I just want to provide support (financial or otherwise)" — donors with no pre-submit door (donation is the LAST confirmation action card). Decided so far: 6th hours option `None — I'd rather support in other ways`, capture-then-divert (submit first, then donate-promoted confirmation).
   Still open: (a) secondary "Just want to support us financially? → Donate" link on Step 2; (b) promoting the Donate card above petitions on confirmations.
   → Suggestion: ship V1 with (b) only for users who picked the 6th hours option (already implied by capture-then-divert), then decide (a) once V1 shows where donors actually land.
