# Airtable Cleanup — Members Table Select Fields

Base: PauseAI Volunteers & Actions (`appWPTGqZmUcs3NWu`)
Table: Members (`tblL1icZBhTV1gQ9o`)
Prepared 2026-06-10 from the schema audit (`Airtable Data Audit.md`). Schema-only: option lists come from field metadata — **no record data was read**, so per-option row counts are unknown. Ops should check counts per option (group-by view) before deciding where manual effort is worth it.

## Why this matters

The onboarding pipeline (Plan of Action, Phase 2) writes to these fields via the API. Two failure modes if options stay dirty:

- Write **without** typecast → any value not exactly matching an existing option is rejected; submissions fail.
- Write **with** typecast → unknown values silently create yet another junk option; the mess grows.

So canonical option lists must exist before the pipeline goes live, and the native form must emit exactly those values.

## How the pollution happened

1. **Typecast auto-creation.** Tally's Airtable integration creates a new select option for every unrecognized submitted value instead of failing.
2. **Wording generations.** Form questions/options were reworded over the years; each generation's values became permanent options that now coexist.
3. **Free-text eras.** Some questions (hours, languages, country) were once free-text inputs — every distinct typed answer became an option.
4. **Comma-join bug (singleSelect).** A multi-value answer written into a singleSelect becomes ONE option that is the whole comma-joined string (e.g. `Google / search engine, News / article`).
5. **Comma-split bug (multipleSelects).** Incoming strings are split on commas, so an option whose _label_ contained a comma got torn into fragments (e.g. `Planning events (e.g. protests` + `local meet-ups)`).

## Chosen approach (2026-06-10): fresh fields + backfill

Rather than cleaning options in place, **create new fields with exactly the canonical option lists, and backfill them from the legacy fields via the mapping tables below**. Decided because it:

- **eliminates re-pollution**: Tally's integration binds to the legacy fields (by field ID) and keeps writing there; the pipeline writes only the new fields, which Tally can never touch;
- is **non-destructive and reversible**: legacy data stays intact as the audit trail;
- avoids Airtable's rename-collision mechanics entirely (no rename-onto-existing-option problem).

Mechanics:

1. Rename each legacy field to `X (legacy)` (integrations bind by field ID — Tally keeps working) and create the new field under the clean name with exactly the canonical options.
2. **Backfill** legacy → new per the mapping tables below, via an Airtable scripting-extension or API one-off (ops-side — needs record access; this doc is the spec only). Rows whose legacy value maps to "clear/blank" get no new-field value; "per-row review" rows go to a filtered view for a manual pass.
3. Repoint views/automations (Irina's volunteer view, comms filters) at the new fields.
4. After the last Tally embed dies (Phase 4 complete): final backfill sweep over rows created since, then archive/hide the legacy fields.

Transition caveat: until step 4, rows arriving via Tally have only legacy values — any view filtering on a new field misses them unless the backfill is re-run (or an Airtable automation mirrors legacy→new on record creation; worth setting up if the switchover takes months).

---

## 1. `Projected weekly hours` (singleSelect — ~58 options, worst offender)

**Canonical (6 — revised 2026-06-10: Tally's `10+ hours` split into two; support-only kept, 21% of rows):**
`Less than 3 hours`
`3-6 hours`
`6-10 hours`
`10-20 hours`
`20+ hours`
`None — I'd rather support in other ways`

**Issue:** three generations — current brackets, old brackets (`1 to 2`, `2 to 5`, `5 to 10`, `10 to 15`, `15 +`), raw free-text numbers, comma-joined combos, absurd junk, and an empty-string option. Note: `1` and `2` appear twice in the schema dump — likely whitespace-variant duplicate options; verify in the UI.

**Full current option list (exhaustive):**

`None, I just want to provide support (financial or otherwise)`
`0`
`0.5`
`0.5, 1 to 2`
`1`
`1`
`1, 1 to 2`
`1 to 2`
`2, 1 to 2`
`2`
`2.5, 1 to 2`
`2, 2 to 5`
`Less than 3 hours`
`3`
`2 to 5`
`3, 1 to 2`
`3.3`
`3, 2 to 5`
`3-6 hours`
`4`
`4, 2 to 5`
`5`
`5, 1 to 2`
`5, 2 to 5`
`5, 5 to 10`
`5, 10 to 15`
`6`
`7`
`5 to 10`
`6-10 hours`
`8`
`10`
`10, 2 to 5`
`10+ hours`
`10 to 15`
`12`
`14`
`15`
`15 +`
`20`
`20, 5 to 10`
`20, 10 to 15`
`21`
`30`
`35`
`36`
`40`
`40, 15 +`
`45`
`50`
`52`
`70`
`110`
`300`
`510`
`1213`
`100000000`
`33766736539`
`` (empty)

**Mapping rules:**

| Legacy value(s)                                                                                                                     | Map to                                    | Note                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`, `0.5`, `1`, `2`, plus combos starting 0.5/1/2/2.5                                                                              | `Less than 3 hours`                       |                                                                                                                                                         |
| `1 to 2`                                                                                                                            | `Less than 3 hours`                       |                                                                                                                                                         |
| `3`, `3.3`, `4`, `5`, plus combos starting 3/4/5                                                                                    | `3-6 hours`                               |                                                                                                                                                         |
| `2 to 5`                                                                                                                            | `3-6 hours`                               | approximation (spans bracket boundary)                                                                                                                  |
| `6`, `7`, `8`                                                                                                                       | `6-10 hours`                              |                                                                                                                                                         |
| `5 to 10`                                                                                                                           | `6-10 hours`                              | approximation                                                                                                                                           |
| `10`, `12`, `14`, `15` standalone; combo `10, 2 to 5`                                                                               | `10-20 hours`                             |                                                                                                                                                         |
| `10 to 15`                                                                                                                          | `10-20 hours`                             |                                                                                                                                                         |
| `15 +`                                                                                                                              | `10-20 hours`                             | approximation — "15+" could mean 20+; conservative bin                                                                                                  |
| `10+ hours` (legacy Tally bracket)                                                                                                  | `10-20 hours`                             | approximation — true split unknowable; conservative bin. Rows keep exact legacy value for re-binning                                                    |
| `20`–`70` standalone (`20`, `21`, `30`, `35`, `36`, `40`, `45`, `50`, `52`, `70`); combos `20, 5 to 10`, `20, 10 to 15`, `40, 15 +` | `20+ hours`                               |                                                                                                                                                         |
| `110`, `300`, `510`, `1213`, `100000000`, `33766736539`                                                                             | blank (clear value)                       | >week-length impossible; junk                                                                                                                           |
| `` (empty option)                                                                                                                   | delete                                    |                                                                                                                                                         |
| Combos `X, Y to Z` generally                                                                                                        | bracket for the leading number `X`        | the number is the person's precise answer                                                                                                               |
| `None, I just want to provide support (financial or otherwise)`                                                                     | `None — I'd rather support in other ways` | RESOLVED 2026-06-10: **740 of 3,499 rows (21%)** — kept as canonical 6th option; maps 1:1. Cohort = donor/supporter segment, feeds the donate-divert UX |

---

## 2. `Discovery method of PAI` (singleSelect — 22 options)

**New field type: `multipleSelects`** (decided 2026-06-10). The legacy comma combos are old multi-select answers forced into a singleSelect — a multi-select new field restores them losslessly: backfill splits on comma and maps each part (no per-row pass needed). The native form still asks single-choice and writes one tag; the field accepting multiple is storage-side only, plus a canonical `Podcast` backfill-only option.

**Canonical (8 = 7 form options + `Podcast`, after collapsing the Event dupe):**
`PauseAI affiliated social media`
`Non-PauseAI affiliated social media`
`Friend/Family referral`
`News article`
`Event/Presentation`
`Internet search`
`Other`
`Podcast` (backfill-only — not offered on the form)

**Issue:** two wording generations, the `Event` / `Event/Presentation` near-dupe, comma-joined singleSelect combos.

**Row counts (group-by, 2026-06-10):**
(Empty) 386
PauseAI affiliated social media 174
Non-PauseAI affiliated social media 314
Friend/Family referral 214
News article 176
Event/Presentation 67
Internet search 998
Event 29
Other 627
Podcast 34
Social media account of PauseAI (…) 64
Friends / word of mouth 96
Google / search engine 133
News / article 111
Podcast / video 24
Social media post by someone else 33
Local event / protest 14
combos 5 total (2+1+1+1; `Friends / word of mouth, Other` did not appear — likely 0, verify). ≈3,500 rows.

**What the counts settle:**

- **Combos = 5 rows total**, and with the multi-select new field they backfill automatically (split on comma, map each part) — no manual pass at all.
- **Podcast = 58 rows** (34 + 24 `Podcast / video`) → real volume; recommend **keeping `Podcast` as a canonical option** in the new field rather than folding into Non-PauseAI social media. The option list may contain values the native form never offers — backfill-only options cost nothing.
- (Empty) 386 → no backfill, stays empty.
- Post-merge totals:
  Internet search 1,131
  Other 627
  Non-PauseAI social 347
  Friend/Family referral ~311
  News article 287
  PauseAI social ~241
  Event/Presentation 110
  Podcast 58.

**Full current option list (exhaustive):**

`PauseAI affiliated social media`
`Non-PauseAI affiliated social media`
`Friend/Family referral`
`News article`
`Event/Presentation`
`Internet search`
`Event`
`Other`
`Podcast`
`Social media account of PauseAI (Facebook / twitter / instagram / etc)`
`Friends / word of mouth`
`Google / search engine`
`News / article`
`Friends / word of mouth, Other`
`Podcast / video`
`Social media post by someone else`
`Local event / protest`
`Google / search engine, News / article`
`Social media account of PauseAI (Facebook / twitter / instagram / etc), Podcast`
`Other, Google / search engine`
`Google / search engine, Social media account of PauseAI (Facebook / twitter / instagram / etc)`
`Other, Friends / word of mouth`

**Mapping rules:**

| Legacy value                                                             | Map to                                | Note                                                                                 |
| ------------------------------------------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------ |
| `Event`                                                                  | `Event/Presentation`                  | the dupe collapse                                                                    |
| `Social media account of PauseAI (Facebook / twitter / instagram / etc)` | `PauseAI affiliated social media`     |                                                                                      |
| `Social media post by someone else`                                      | `Non-PauseAI affiliated social media` |                                                                                      |
| `Friends / word of mouth`                                                | `Friend/Family referral`              |                                                                                      |
| `Google / search engine`                                                 | `Internet search`                     |                                                                                      |
| `News / article`                                                         | `News article`                        |                                                                                      |
| `Local event / protest`                                                  | `Event/Presentation`                  |                                                                                      |
| `Podcast`, `Podcast / video`                                             | `Podcast` (kept as canonical option)  | 58 rows — counts justify keeping; backfill-only option, native form needn't offer it |
| Comma combos (6 options)                                                 | split on comma, map each part         | automatic — new field is multipleSelects; 5 rows total                               |

---

## 3. `Motivation` (multipleSelects — 15 options) — ✅ CLEAN

Exactly matches the native-form canonical list. No action.

`AI Safety`
`Need for democratic oversight`
`Ethical technology`
`AI Governance`
`Job Displacement`
`Misinformation`
`Deepfake scams and harassment`
`Concentration of power`
`Privacy loss`
`Environmental damage`
`Technology addiction`
`Autonomous weapons`
`Cyberattacks`
`Bioweapons`
`Other`

---

## 4. `Skills & Interests` (multipleSelects — ~35 options)

**Canonical (16, from the native-form spec):**
`Software Development`
`Video Creation`
`Social Media Management`
`Event Organization`
`Public Speaking/ Presentation`
`Writing`
`Graphic Design/ Visual Arts`
`Research`
`Communications/ PR`
`Fundraising`
`Community Organizing`
`Political Advocacy/ Lobbying`
`Education/ Teaching`
`Administrative Support`
`Legal Knowledge`
`Other`

**Issue:** current 16 + an old lowercase tag set + an older long-form set, two of which are comma-split fragments of one original option (`Planning events (e.g. protests, local meet-ups)`).

**Full current option list (exhaustive):**

`Software Development`
`Video Creation`
`Social Media Management`
`Event Organization`
`Public Speaking/ Presentation`
`Writing`
`Graphic Design/ Visual Arts`
`Research`
`Communications/ PR`
`Fundraising`
`Community Organizing`
`Political Advocacy/ Lobbying`
`Education/ Teaching`
`Administrative Support`
`Legal Knowledge`
`Other`
`protest`
`software`
`design`
`video`
`strategy`
`marketing`
`community`
`events`
`write`
`Participating in events`
`local meet-ups)`
`Creating video content`
`Planning events (e.g. protests`
`Writing to elected officials`
`Outreach to public figures`
`Recruiting volunteers`
`Writing articles`
`Lobby meetings with elected officials`
`Posting on social media`

**Mapping rules** (multipleSelects merges are additive-safe — adding the canonical tag and removing the legacy one loses nothing):

| Legacy value                                                            | Map to                        | Note                             |
| ----------------------------------------------------------------------- | ----------------------------- | -------------------------------- |
| `software`                                                              | `Software Development`        |                                  |
| `video`, `Creating video content`                                       | `Video Creation`              |                                  |
| `design`                                                                | `Graphic Design/Visual Arts`  |                                  |
| `write`, `Writing articles`                                             | `Writing`                     |                                  |
| `events`, `Planning events (e.g. protests`, `local meet-ups)`           | `Event Organization`          |                                  |
| `protest`                                                               | `Event Organization`          |                                  |
| `community`, `Recruiting volunteers`                                    | `Community Organizing`        |                                  |
| `marketing`, `Posting on social media`                                  | `Social Media Management`     |                                  |
| `strategy`                                                              | `Other`                       | no canonical home                |
| `Participating in events`                                               | `Other`                       | participation ≠ a skill; or drop |
| `Writing to elected officials`, `Lobby meetings with elected officials` | `Political Advocacy/Lobbying` |                                  |
| `Outreach to public figures`                                            | `Communications/PR`           |                                  |

---

## 5. `Languages` (multipleSelects — ~120 options)

**New field type: `multipleSelects`** (same as legacy — people speak several languages; backfill maps each legacy tag to its canonical tag per row).

**Naming convention (decided 2026-06-10): English names everywhere.** Tally's list used endonyms (`Srpski`, `Français`, `Deutsch`) while the kept extra options use English names — a mixed list where `Bosnian` next to `Srpski` reads like a dupe. The stored canonical values are English names; the form is ours, so its _displayed_ labels can still show endonyms (e.g. "Français (French)") while storing the English value.

**Canonical (31 — Tally's list, English-name labels):**
`English`
`Spanish`
`French`
`German`
`Dutch`
`Chinese`
`Japanese`
`Hindi`
`Portuguese`
`Arabic`
`Russian`
`Italian`
`Korean`
`Polish`
`Indonesian`
`Turkish`
`Romanian`
`Swedish`
`Czech`
`Serbian`
`Filipino`
`Danish`
`Finnish`
`Hebrew`
`Norwegian`
`Bengali`
`Telugu`
`Tamil`
`Thai`
`Vietnamese`
`Other`

**Issue:** free-text era. English-name vs native-name duplicates (`French` vs `Français`), casing variants, proficiency qualifiers ("learning French", "Italian (intermediate)"), ISO-ish codes (`NL`, `DK`), outright junk (`native`, `Germany`), plus real languages absent from the canonical 31 (Greek, Hebrew-as-English-label, Mongolian, …). `Español` appears 3× in the schema dump — whitespace-variant dupes, verify in UI.

**Full current option list (exhaustive):**

`English`
`Español`
`Portuguese`
`German`
`Bosnian`
`Español`
`French`
`Bulgarian`
`Russian`
`Swedish`
`Czech`
`Italian`
`Lithuanian`
`Romanesco`
`Dutch`
`Chinese`
`Slovak`
`Ukrainian`
`Korean`
`Romanian`
`learning basing czech`
`Hausa`
`Japanese`
`Estonian`
`Greek`
`Mandarin`
`increasingly more French`
`Farsi`
`Polish`
`Francais`
`Tagalog`
`French (more or less)`
`Hindi`
`Español`
`Tamil`
`Telugu`
`Catalan`
`Croatian`
`elementary Spanish`
`Arabic`
`a bit German and a bit Spanish`
`deutsch`
`Swiss German`
`Turkish`
`some French :)`
`Slovan`
`slowly learning Dutch`
`Mongolian`
`Français`
`Hebrew`
`Italian (intermediate)`
`Русский`
`Finnish`
`Marathi`
`persian`
`NL`
`DK`
`ES`
`DE`
`FR`
`IT`
`SE`
`Slovenian`
`Danish`
`Igbo`
`Icelandic`
`Hungarian`
`learning French`
`English Welsh`
`Punjabi`
`french`
`finnish`
`Cantonese`
`Kannada`
`Swahili`
`Português`
`French (written)`
`Filipino`
`little Swedish`
`Mandarin Chinese`
`danish`
`Reunionese creole`
`Deutsch`
`Serbian`
`Amharic`
`hindi`
`can read French`
`Latin`
`lithuanian`
`français`
`Urdu`
`Germany`
`Gujarati`
`Wolof`
`native`
`Irish`
`Vietnamese`
`Norwegian`
`Chinese(b1)`
`German(b1)`
`some Dutch`
`Hindi(partially)`
`little English`
`some Russian`
`advanced Brazilian Portuguese`
`intermediate Spanish`
`some French and Spanish`
`Dutch ( geod genoeg)`
`French (basic)`
`espacian`
`Qazaq`
`Malay`
`Polski`
`Italiano`
`中文`
`Nederlands`
`हिन्दी`
`Română`
`Other`
`한국어`
`العربية`
`Türkçe`
`עברית`
`日本語`
`Svenska`
`বাংলা`
`Indonesia`
`Dansk`
`Čeština`
`Norsk`
`Tiếng Việt`
`Srpski`

**Mapping rules** — principle: merge _variants_ (endonyms, casing, proficiency qualifiers) into the English canonical label; **keep real languages that lack a canonical home as extra options** (multipleSelects tolerates a long list; merging them to `Other` destroys data); clear junk.

| Group                                                                           | Legacy values                                                                                                                                                                                                                                                                                                                                                                                                                 | Map to                                                                                                       |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| French variants                                                                 | `French`, `Francais`, `français`, `french`, `Français`, `French (more or less)`, `French (written)`, `French (basic)`, `increasingly more French`, `learning French`, `some French :)`, `can read French`, `FR`                                                                                                                                                                                                               | `French`                                                                                                     |
| German variants                                                                 | `German`, `deutsch`, `Deutsch`, `German(b1)`, `DE`                                                                                                                                                                                                                                                                                                                                                                            | `German`                                                                                                     |
| Spanish variants                                                                | `Español` (3 dupes), `elementary Spanish`, `intermediate Spanish`, `ES`, `espacian`                                                                                                                                                                                                                                                                                                                                           | `Spanish`                                                                                                    |
| Dutch variants                                                                  | `Dutch`, `Nederlands`, `slowly learning Dutch`, `some Dutch`, `Dutch ( geod genoeg)`, `NL`                                                                                                                                                                                                                                                                                                                                    | `Dutch`                                                                                                      |
| Portuguese variants                                                             | `Portuguese`, `Português` (dupe), `advanced Brazilian Portuguese`                                                                                                                                                                                                                                                                                                                                                             | `Portuguese`                                                                                                 |
| Italian variants                                                                | `Italian`, `Italiano`, `Italian (intermediate)`, `IT`                                                                                                                                                                                                                                                                                                                                                                         | `Italian`                                                                                                    |
| Russian variants                                                                | `Russian`, `Русский` (dupe), `some Russian`                                                                                                                                                                                                                                                                                                                                                                                   | `Russian`                                                                                                    |
| Chinese variants                                                                | `Chinese`, `中文`, `Mandarin`, `Mandarin Chinese`, `Chinese(b1)`                                                                                                                                                                                                                                                                                                                                                              | `Chinese`                                                                                                    |
| Czech variants                                                                  | `Czech`, `Čeština`, `learning basing czech`                                                                                                                                                                                                                                                                                                                                                                                   | `Czech`                                                                                                      |
| Swedish variants                                                                | `Swedish`, `Svenska`, `little Swedish`, `SE`                                                                                                                                                                                                                                                                                                                                                                                  | `Swedish`                                                                                                    |
| Danish variants                                                                 | `Danish`, `danish`, `Dansk`, `DK`                                                                                                                                                                                                                                                                                                                                                                                             | `Danish`                                                                                                     |
| Finnish variants                                                                | `Finnish`, `finnish`, `Suomi` (if present)                                                                                                                                                                                                                                                                                                                                                                                    | `Finnish`                                                                                                    |
| Norwegian variants                                                              | `Norwegian`, `Norsk`                                                                                                                                                                                                                                                                                                                                                                                                          | `Norwegian`                                                                                                  |
| Polish variants                                                                 | `Polish`, `Polski`                                                                                                                                                                                                                                                                                                                                                                                                            | `Polish`                                                                                                     |
| Romanian variants                                                               | `Romanian`, `Română`                                                                                                                                                                                                                                                                                                                                                                                                          | `Romanian`                                                                                                   |
| Turkish variants                                                                | `Turkish`, `Türkçe`                                                                                                                                                                                                                                                                                                                                                                                                           | `Turkish`                                                                                                    |
| Korean variants                                                                 | `Korean`, `한국어`                                                                                                                                                                                                                                                                                                                                                                                                            | `Korean`                                                                                                     |
| Japanese variants                                                               | `Japanese`, `日本語`                                                                                                                                                                                                                                                                                                                                                                                                          | `Japanese`                                                                                                   |
| Hindi variants                                                                  | `Hindi`, `hindi`, `हिन्दी`, `Hindi(partially)`                                                                                                                                                                                                                                                                                                                                                                                | `Hindi`                                                                                                      |
| Arabic variants                                                                 | `Arabic`, `العربية`                                                                                                                                                                                                                                                                                                                                                                                                           | `Arabic`                                                                                                     |
| Hebrew variants                                                                 | `Hebrew`, `עברית`                                                                                                                                                                                                                                                                                                                                                                                                             | `Hebrew`                                                                                                     |
| Tamil variants                                                                  | `Tamil`, `தமிழ்`                                                                                                                                                                                                                                                                                                                                                                                                              | `Tamil`                                                                                                      |
| Telugu variants                                                                 | `Telugu`, `తెలుగు`                                                                                                                                                                                                                                                                                                                                                                                                            | `Telugu`                                                                                                     |
| Serbian variants                                                                | `Serbian`, `Srpski`                                                                                                                                                                                                                                                                                                                                                                                                           | `Serbian` (`Srpski` = "Serbian" in Serbian). `Bosnian` NOT merged — kept as own option (resolved 2026-06-10) |
| Filipino variants                                                               | `Filipino`, `Tagalog`                                                                                                                                                                                                                                                                                                                                                                                                         | `Filipino`                                                                                                   |
| Vietnamese variants                                                             | `Vietnamese`, `Tiếng Việt`                                                                                                                                                                                                                                                                                                                                                                                                    | `Vietnamese`                                                                                                 |
| Bengali variants                                                                | `বাংলা`                                                                                                                                                                                                                                                                                                                                                                                                                       | `Bengali`                                                                                                    |
| Indonesian variants                                                             | `Indonesia`                                                                                                                                                                                                                                                                                                                                                                                                                   | `Indonesian`                                                                                                 |
| Thai variants                                                                   | `ไทย`                                                                                                                                                                                                                                                                                                                                                                                                                         | `Thai`                                                                                                       |
| English variants                                                                | `little English`, `English Welsh` (split intent: English + Welsh)                                                                                                                                                                                                                                                                                                                                                             | `English` (+ keep/add `Welsh`)                                                                               |
| Farsi/Persian                                                                   | `Farsi`, `persian`                                                                                                                                                                                                                                                                                                                                                                                                            | `Farsi` (kept option, no canonical home)                                                                     |
| Multi-language strings                                                          | `a bit German and a bit Spanish`, `some French and Spanish`                                                                                                                                                                                                                                                                                                                                                                   | per-row: add both canonical tags                                                                             |
| Real languages, no canonical home — **keep as options** (already English-named) | `Bulgarian`, `Lithuanian` (+ `lithuanian` dupe), `Slovak`, `Ukrainian`, `Hausa`, `Estonian`, `Greek`, `Catalan`, `Croatian`, `Swiss German`, `Mongolian`, `Marathi`, `Slovenian`, `Igbo`, `Icelandic`, `Hungarian`, `Punjabi`, `Cantonese`, `Kannada`, `Swahili`, `Reunionese creole`, `Amharic`, `Latin`, `Urdu`, `Gujarati`, `Wolof`, `Irish`, `Qazaq` (→ rename `Kazakh`), `Malay`, `Bosnian` (kept — resolved 2026-06-10) | normalize casing, keep                                                                                       |
| Junk                                                                            | `Romanesco`, `Slovan`, `native`, `Germany`                                                                                                                                                                                                                                                                                                                                                                                    | per-row review or clear                                                                                      |

---

## 6. `Country` (singleSelect — ~107 options)

**Canonical:** RESOLVED 2026-06-10 — the **full 196-country list** from `Tally wbGvKe Field Spec.md`; new field gets all 196 as options. No `Prefer not to say` / opt-out option — the form requires a real country. (Demo's curated 8, for reference/ordering only: Germany, United Kingdom, United States, Netherlands, France, Brazil, India, Australia.)

**Issue:** free-text era left junk and non-country entries; list is also _incomplete_ vs the Tally 196 (any new country submitted via typecast mints an option).

**Full current option list (exhaustive):**

`A country`
`Albania`
`Argentina`
`Armenia`
`Australia`
`Austria`
`Bangladesh`
`Belgium`
`Brazil`
`Bulgaria`
`Cameroon`
`Canada`
`Chehab`
`Chile`
`China`
`Colombia`
`Congo`
`Croatia`
`Czech Republic`
`Denmark`
`DR Congo`
`Egypt`
`Estonia`
`Finland`
`France`
`Gabon`
`Germany`
`Ghana`
`Honduras`
`Hungary`
`India`
`Iran`
`Ireland`
`Israel`
`Italy`
`Japan`
`Kazakhstan`
`Kenya`
`Malaysia`
`Mauritius`
`Mexico`
`Montenegro`
`Morocco`
`Netherlands`
`New Zealand`
`Nigeria`
`Norway`
`Pakistan`
`Peru`
`Philippines`
`Poland`
`Portugal`
`private`
`Puerto Rico`
`Qatar`
`Romania`
`Russia`
`Serbia`
`Singapore`
`South Africa`
`Spain`
`Sweden`
`Switzerland`
`Taiwan`
`Turkey`
`United Arab Emirates`
`United Kingdom`
`United States`
`Uruguay`
`Vienna`
`Yemen`
`Zambia`
`Zimbabwe`
`Zuid-Utopia`
`السعيد`
`Vietnam`
`Barbados`
`Iceland`
`Saudi Arabia`
`Afghanistan`
`Greece`
`Slovakia`
`Tunisia`
`Lithuania`
`Costa Rica`
`Malta`
`Rwanda`
`Burkina Faso`
`Jordan`
`Slovenia`
`Indonesia`
`Nepal`
`Algeria`
`Latvia`
`Cambodia`
`Ecuador`
`Niger`
`South Korea`
`Luxembourg`
`Guinea`
`Senegal`
`Bahamas`
`Sudan`
`Guatemala`
`Ukraine`
`Angola`
`Uganda`
`Bolivia`
`Malawi`
`Thailand`
`Timor-Leste`

**Mapping rules:**

| Legacy value                                    | Map to                                   | Note                                                                                             |
| ----------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `Vienna`                                        | `Austria`                                | city typed as country                                                                            |
| `A country`, `private`, `Zuid-Utopia`, `السعيد` | clear (blank)                            | non-answers; new field stays empty for these legacy rows                                         |
| `Chehab`                                        | clear                                    | looks like a person's name typed into the field                                                  |
| `Puerto Rico`                                   | `United States`                          | RESOLVED 2026-06-10: fold — PR not on the 196 list; US chapter covers it                         |
| All remaining (real countries)                  | same country in the 196-option new field | resolved 2026-06-10: full Tally 196 list; pre-create all 196 options so typecast is never needed |

---

## 7. `zipcode` (number) — type problem, not options

Native form keeps Tally's behavior: US-only zip code (shown when Country = United States, feeds PauseAI US local-group matching; decided 2026-06-10). Problem with the **number** type: it strips leading zeros — northeastern US zips like `02134` are stored as `2134`, corrupting them.

**Recommendation:** per the fresh-fields approach, create a new `Zip code` (singleLineText) field for the pipeline; rename legacy to `zipcode (legacy)` (Tally keeps writing it by field ID). Backfill: copy legacy numbers across, left-padding to 5 digits to restore lost leading zeros. Retire the legacy field after the last Tally embed dies.

---

## Order of operations (fresh-fields approach)

1. ~~Judgment calls~~ — all resolved 2026-06-10: `Podcast` kept (backfill-only, 58 rows) · hours support-only kept (canonical 6th option, 740 rows / 21%) · `Puerto Rico` folded into `United States` · `Bosnian` kept as own language option · country list = full Tally 196.
2. Rename legacy fields to `X (legacy)`: `Country`, `Discovery method of PAI`, `Skills & Interests`, `Projected weekly hours`, `Languages`, `zipcode`. (`Motivation` is clean — reuse as-is, no new field.) Tally integration unaffected (binds by field ID).
3. Create new fields under the clean names with exactly the canonical option lists, plus `Postcode` (singleLineText) and the pipeline's other new fields (`Intent`, `Chapter lead interest`, `Signup source`).
4. Backfill legacy → new per the mapping tables above (scripting extension / API one-off). Discovery comma combos split automatically (multi-select new field). "Per-row review" values (multi-language strings, `Chehab`, junk) → filtered view, manual pass.
5. Repoint views/automations at the new fields.
6. Enable pipeline writes (no typecast) — new fields only.
7. While any country site still runs Tally: either re-run the backfill periodically or add an Airtable automation mirroring legacy→new on record creation (recommended if switchover takes months).
8. Phase 4 complete (last Tally embed gone): final backfill sweep, archive/hide legacy fields, deactivate the mirror automation.

Re-pollution risk under this approach: confined to the legacy fields, which are disposable — the clean fields are never writable by Tally. ✅
