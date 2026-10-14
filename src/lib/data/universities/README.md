# Universities

Optional "University" field on the signup form. Shown for any country that has a list here; stored in Airtable's `Members` → `University` (single line text) as the plain name, without the abbreviation.

## United Kingdom (`gb.json`)

163 entries, snapshot taken 2026-09-24. Each has a `name`, the UKPRN as `id`, and an `abbreviation` only where one is commonly known and unambiguous (so no "UoB": Birmingham, Bristol, Bath and Bradford all use it).

Source: Wikidata, institutions in the UK that are universities with a UKPRN (the register of recognised providers) and no end date, then curated by hand:

- Dropped further education colleges and awarding-only bodies (Runshaw, Blackpool and The Fylde, University of Wales, ...).
- Added degree-awarding institutions Wikidata does not class as universities (UCL, St George's, Royal Veterinary College, ...), with their UKPRNs.
- Renamed to current names (Lancaster University, Solent University, ...).

To refresh, re-run the query below at <https://query.wikidata.org> and diff against `gb.json`. Do not overwrite the file wholesale: the curation above is not in the query.

```sparql
SELECT ?uLabel ?ukprn WHERE {
  ?u wdt:P31/wdt:P279* wd:Q3918 ; wdt:P17 wd:Q145 ; wdt:P4971 ?ukprn .
  FILTER NOT EXISTS { ?u wdt:P576 [] }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
```

## Adding a country

1. Add `<iso2>.json` here: an array of `{ name, abbreviation?, id? }`, sorted by name ignoring a leading "The" / "University of".
2. Register it in `UNIVERSITIES_BY_COUNTRY` in `index.ts`, keyed by the country name exactly as it appears in `COUNTRIES` (`src/lib/components/onboarding/options.ts`).

That is all: the form field, the typeahead and the server-side check pick it up.
