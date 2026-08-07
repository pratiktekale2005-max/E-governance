# Source Priority Policy

Governs what happens when two official sources disagree about the same scheme
fact (e.g. PM-KISAN benefit amount listed differently on `pmkisan.gov.in` vs
`myscheme.gov.in`).

## Priority Tiers

| Tier | Meaning | Examples |
|------|---------|----------|
| 1 | Authoritative — the scheme's own ministry/department portal, or MyScheme (curated by the National Portal team) | pmkisan.gov.in, pmjay.gov.in, myscheme.gov.in |
| 2 | Secondary — general/open-data sources used to cross-check, never to originate a fact | data.gov.in |
| 3 | Unverified — anything not in `sources.yaml`. The pipeline refuses to ingest tier-3 sources automatically. |

## Conflict Resolution Rules

1. **Tier 1 always wins** over Tier 2/3 for any field.
2. If **two Tier-1 sources conflict** (e.g. a scheme's own site vs MyScheme):
   - Keep both values.
   - Set `status = "review_required"`.
   - Log the conflict in `data/manifests/conflicts.jsonl`.
   - Never auto-merge or silently pick one — a human reviewer resolves it.
3. **Central vs State**: never merged into a single record. A Central and a
   State scheme with a similar name are stored as two independent scheme
   records with a `related_scheme_ids` cross-reference.
4. **Freshness overrides priority within the same tier**: if both are Tier 1,
   the more recently verified value is shown, but the older value is retained
   in version history (Module 6).
5. **No inference.** If a field cannot be sourced from a Tier 1/2 source, it
   is stored as `null`, never guessed or filled from general knowledge.

## Escalation

Any scheme with `status = "review_required"` for more than 30 days is
flagged in the quality report (Module 5) for manual escalation.
