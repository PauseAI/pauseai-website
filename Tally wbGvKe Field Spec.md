# Tally Form `wbGvKe` — Field Spec (extracted 2026-06-10)

Source: live form at `tally.so/r/wbGvKe` ("Get involved!"), parsed from its `__NEXT_DATA__` block definition. This is the spec for the native Volunteer form (Plan of Action, Phase 1 path C). Schema-only extraction — no submission data touched.

## Questions (in form order)

### 1. Full Name
- Type: text, **required**

### 2. Email
- Type: email, **required**
- Helper text: Preferably Gmail if you have one

### 3. Discord Username
- Type: text
- Helper text: If you don't have a Discord account, we encourage you to create one  here

### 4. Phone Number
- Type: phone
- Helper text: Please use International Formatting

### 5. Country of residence
- Type: dropdown (single), **required**
- Options (196, full list):
  Afghanistan · Albania · Algeria · Andorra · Angola · Antigua & Barbuda · Argentina · Armenia · Australia · Austria · Azerbaijan · Bahamas · Bahrain · Bangladesh · Barbados · Belarus · Belgium · Belize · Benin · Bhutan · Bolivia · Bosnia & Herzegovina · Botswana · Brazil · Brunei · Bulgaria · Burkina Faso · Burundi · Cabo Verde · Cambodia · Cameroon · Canada · Central African Republic · Chad · Chile · China · Colombia · Comoros · Congo · Costa Rica · Côte d'Ivoire · Croatia · Cuba · Cyprus · Czech Republic · Denmark · Djibouti · Dominica · Dominican Republic · DR Congo · Ecuador · Egypt · El Salvador · Equatorial Guinea · Eritrea · Estonia · Eswatini · Ethiopia · Fiji · Finland · France · Gabon · Gambia · Georgia · Germany · Ghana · Greece · Grenada · Guatemala · Guinea · Guinea-Bissau · Guyana · Haiti · Honduras · Hungary · Iceland · India · Indonesia · Iran · Iraq · Ireland · Israel · Italy · Jamaica · Japan · Jordan · Kazakhstan · Kenya · Kiribati · Kuwait · Kyrgyzstan · Laos · Latvia · Lebanon · Lesotho · Liberia · Libya · Liechtenstein · Lithuania · Luxembourg · Madagascar · Malawi · Malaysia · Maldives · Mali · Malta · Marshall Islands · Mauritania · Mauritius · Mexico · Micronesia · Moldova · Monaco · Mongolia · Montenegro · Morocco · Mozambique · Myanmar · Namibia · Nauru · Nepal · Netherlands · New Zealand · Nicaragua · Niger · Nigeria · North Korea · North Macedonia · Norway · Oman · Pakistan · Palau · Palestine · Panama · Papua New Guinea · Paraguay · Peru · Philippines · Poland · Portugal · Qatar · Romania · Russia · Rwanda · Saint Kitts & Nevis · Saint Lucia · Samoa · San Marino · Sao Tome & Principe · Saudi Arabia · Senegal · Serbia · Seychelles · Sierra Leone · Singapore · Slovakia · Slovenia · Solomon Islands · Somalia · South Africa · South Korea · South Sudan · Spain · Sri Lanka · St. Vincent & Grenadines · Sudan · Suriname · Sweden · Switzerland · Syria · Taiwan · Tajikistan · Tanzania · Thailand · Timor-Leste · Togo · Tonga · Trinidad & Tobago · Tunisia · Turkey · Turkmenistan · Tuvalu · Uganda · Ukraine · United Arab Emirates · United Kingdom · United States · Uruguay · Uzbekistan · Vanuatu · Vatican City · Venezuela · Vietnam · Yemen · Zambia · Zimbabwe

### 6. City/ town of residence
- Type: text, **required**

### 7. Zip Code
- Type: number, **required**, conditional — hidden by default
- Helper text: Your 5-digit zip code is used to find your Local Group

### 8. What languages do you speak?
- Type: multi-select
- Default pre-selected: ['English']
- Options (31):
  - English
  - Español
  - Français
  - Deutsch
  - Nederlands
  - 中文
  - 日本語
  - हिन्दी
  - Português
  - العربية
  - Русский
  - Italiano
  - 한국어
  - Polski
  - Indonesia
  - Türkçe
  - Română
  - Svenska
  - Čeština
  - Srpski
  - Filipino
  - Dansk
  - Suomi
  - עברית
  - Norsk
  - বাংলা
  - తెలుగు
  - தமிழ்
  - ไทย
  - Tiếng Việt
  - Other

### 9. Please specify
- Type: text, conditional — hidden by default

### 10. How did you find out about PauseAI?
- Type: dropdown (single)
- Options (8):
  - PauseAI affiliated social media
  - Non-PauseAI affiliated social media
  - Friend/Family referral
  - News article
  - Event/Presentation
  - Internet search
  - Event
  - Other

### 11. Please specify
- Type: text, conditional — hidden by default

### 12. What motivated you to join?
- Type: multi-select
- Options (15):
  - AI Safety
  - Need for democratic oversight
  - Ethical technology
  - AI Governance
  - Job Displacement
  - Misinformation
  - Deepfake scams and harassment
  - Concentration of power
  - Privacy loss
  - Environmental damage
  - Technology addiction
  - Autonomous weapons
  - Cyberattacks
  - Bioweapons
  - Other

### 13. Please specify
- Type: text, conditional — hidden by default

### 14. Skills & Interests
- Type: multi-select
- Options (16):
  - Software Development
  - Video Creation
  - Social Media Management
  - Event Organization
  - Public Speaking/ Presentation
  - Writing
  - Graphic Design/ Visual Arts
  - Research
  - Communications/ PR
  - Fundraising
  - Community Organizing
  - Political Advocacy/ Lobbying
  - Education/ Teaching
  - Administrative Support
  - Legal Knowledge
  - Other

### 15. Please specify
- Type: text, conditional — hidden by default

### 16. How much time can you commit weekly?
- Type: dropdown (single), **required**
- Options (4):
  - Less than 3 hours
  - 3-6 hours
  - 6-10 hours
  - 10+ hours

### 17. I agree with the Volunteer Agreement (link to volunteer agreement)
- Type: checkbox, **required**

### 18. I agree with the Privacy Policy (link to privacy policy)
- Type: checkbox, **required**

### 19. I want to receive e-mail updates
- Type: checkbox, **required**

### 20. I agree with PauseAI's Public Statement and I want to sign it (links to pauseai.info/statement)
- Type: checkbox

### 21. Share on the statement page who you are and why addressing AI risks is important to you
- Type: textarea, conditional — hidden by default

### 22. Would you like to become a paying member of PauseAI Global?
- Type: checkbox
- Helper text: By contributing a $5 monthly fee, you can support the work of PauseAI Global volunteers to protest, lobby and coordinate for a global pause on the development of Artificial General Intelligence.  To unsubscribe, message us at  unsubscribe@pauseai.info .
- Helper text: You can also make a larger contribution to PauseAI Global by donating to us  here .
- Options (1):
  - Yes, I would like to become a paying member

## Conditional logic

- IF `Country of residence` IS `United States` → SHOW `Zip Code` (5-digit, used to find Local Group)
- IF `What languages do you speak?` CONTAINS `Other` → SHOW its `Please specify` text input
- IF `How did you find out about PauseAI?` IS ANY OF [`Other`, `Event`, `Event/Presentation`, `News article`, `Non-PauseAI affiliated social media`, `PauseAI affiliated social media`] → SHOW its `Please specify` text input
- IF `What motivated you to join?` IS `Other` → SHOW its `Please specify` text input
- IF `Skills & Interests` IS `Other` → SHOW its `Please specify` text input
- IF `Public Statement` checkbox checked → SHOW the statement-blurb textarea ("Share on the statement page who you are…")

## Findings relevant to the native-form build (reviewed with Harry 2026-06-10)

1. **"I want to receive e-mail updates" = the newsletter consent** (confirmed). Maps to Members `Email subscription`. Tally makes it *required* (forced consent); the native form makes it the optional, default-unchecked newsletter checkbox per Decision 1.
2. **`Public Statement` signing and `paying member` checkboxes — DROP from the native form** (confirmed). The design memo surfaces both as post-signup *actions* on the Contact-mode confirmation page instead: the action-card stack includes "Sign the petitions" (PauseAI Statement first) and "Donate or pick up some gear". No form fields needed.
3. **`Zip Code` — RESOLVED (2026-06-10, revised same day).** Native form keeps Tally's behavior: zip-code field shown only when Country = **United States** ("used to find your Local Group" — PauseAI US matching). No zip/postcode for other countries. Routing model otherwise stays the memo's: `(country, city) → chapter` server-side vs National Chapters, notification manual. ⚠️ Legacy `zipcode` is a number field (strips leading zeros, e.g. `02134`) — the fresh-fields batch creates a text `Zip code` field for the pipeline write.
4. **Country list — OPEN.** Tally uses the full 196-country list; the demo used 8 + Other. Which list the native form uses (full vs curated, and how it maps onto the polluted Airtable `Country` options / the `List of countries and languages` table) is an outstanding question.
5. **Discovery dropdown has near-duplicate options** — Tally's "How did you find out about PauseAI?" contains both `Event` and `Event/Presentation` as separate live options (someone presumably added a variant without removing the original). Collapse to one in the native form; map both to it when reading legacy rows.
6. **Languages defaults to `English` pre-selected.**
7. **Helper texts to keep:** Email — "Preferably Gmail if you have one"; Discord — account-creation encouragement + link; Phone — "Please use International Formatting".
8. **Required fields confirmed** (Harry 2026-06-10): `Full Name`, `Email`, `Country`, `City`, both agreement checkboxes; `weekly hours` required within the Volunteer path. Everything else optional.
9. **Weekly-hours brackets revised for the native form** (2026-06-10): Tally's `10+ hours` splits into `10-20 hours` and `20+ hours` — 5 brackets total. Legacy `10+ hours` rows backfill to `10-20 hours` (conservative bin; see `AirtableCleanup.md`).
10. **Language labels: display endonym, store English** (2026-06-10): the form shows each language in its own name (Tally's labels), but submits/stores the English canonical value — avoids the mixed endonym/English option list in Airtable. Display → stored mapping:

    | Displayed (endonym) | Stored value |
    |---|---|
    | English | English |
    | Español | Spanish |
    | Français | French |
    | Deutsch | German |
    | Nederlands | Dutch |
    | 中文 | Chinese |
    | 日本語 | Japanese |
    | हिन्दी | Hindi |
    | Português | Portuguese |
    | العربية | Arabic |
    | Русский | Russian |
    | Italiano | Italian |
    | 한국어 | Korean |
    | Polski | Polish |
    | Bahasa Indonesia | Indonesian |
    | Türkçe | Turkish |
    | Română | Romanian |
    | Svenska | Swedish |
    | Čeština | Czech |
    | Srpski | Serbian |
    | Filipino | Filipino |
    | Dansk | Danish |
    | Suomi | Finnish |
    | עברית | Hebrew |
    | Norsk | Norwegian |
    | বাংলা | Bengali |
    | తెలుగు | Telugu |
    | தமிழ் | Tamil |
    | ไทย | Thai |
    | Tiếng Việt | Vietnamese |
    | Other | Other |

    (One label corrected from Tally: it displayed `Indonesia` — the country — where the language's own name is `Bahasa Indonesia`.)
