# Data Dictionary — Government Scheme Record

This is the canonical schema every scheme is normalized into (Module 4).
Enforced in code by `schemas/scheme_schema.py`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `scheme_id` | string | yes | Stable slug, e.g. `pm-kisan`, `mh-lek-ladki` |
| `scheme_name` | string | yes | Official name, original wording preserved |
| `department` | string | no | e.g. "Department of Agriculture & Farmers Welfare" |
| `ministry` | string | no | e.g. "Ministry of Agriculture" |
| `category` | enum | yes | farmer / student / women / health / housing / social_welfare / other |
| `jurisdiction` | enum | yes | `central` or `state` |
| `state` | string\|null | yes | null for central schemes |
| `summary` | string | yes | 1–3 sentence plain-language summary |
| `benefits` | string | yes | Official wording, preserved as-is |
| `eligibility` | list[string] | yes | Structured bullet list, one criterion per item |
| `required_documents` | list[string] | yes | |
| `application_steps` | list[string] | yes | Ordered |
| `application_mode` | enum | yes | online / offline / both / unknown |
| `official_urls` | list[string] | yes | At least one, must be from `sources.yaml` domains |
| `language` | string | yes | ISO 639-1 code, e.g. `en`, `hi`, `mr` |
| `retrieved_date` | date | yes | When raw content was fetched |
| `last_verified_date` | date | yes | When a human/automated check last confirmed accuracy |
| `status` | enum | yes | draft / extracted / validated / review_required / published / stale |
| `source_id` | string | yes | Foreign key into `sources.yaml` |
| `content_hash` | string | yes | sha256 of normalized content, for change detection |
| `version` | int | yes | Increments on any content change |
| `related_scheme_ids` | list[string] | no | Cross-references (e.g. state variant of a central scheme) |

## Rules (mirrors Module 4)

- Preserve official wording in `benefits` / `eligibility` — no paraphrasing during normalization.
- Missing data is `null`, never inferred.
- Central and State rules are never merged into one record.
- `eligibility` must be structured (list), not a paragraph blob.
