# Data notes

Snapshot retrieved from the official OpenFEMA API (no API key).

| Item | Value |
| --- | --- |
| Source | OpenFEMA Public Assistance Funded Projects Details v2 |
| Endpoint | https://www.fema.gov/api/open/v2/PublicAssistanceFundedProjectsDetails |
| Geography | `stateAbbreviation eq 'NY'` |
| OpenFEMA `$count` | 59,291 |
| Rows downloaded | 59,291 (matched) |
| Unique `gmProjectId` | 59,291 |
| Applicants (joined) | 4,819 |
| Disasters | 61 |
| Federal share obligated | $41,058,915,840.25 |
| NYC-related rows | 3,100 |
| Negative federal share | 28 |
| Missing applicant / category / title / amount | 0 |
| Duplicate-looking groups (strict rule) | 0 |

Largest disasters by federal share in this snapshot:

1. DR-4480-NY COVID-19 Pandemic — about $17.4B
2. DR-4085-NY Hurricane Sandy — about $14.8B
3. DR-1391-NY Fires and Explosions — about $4.7B
4. DR-4567-NY Tropical Storm Isaias — about $0.78B
5. DR-4615-NY Remnants of Hurricane Ida — about $0.73B

Headline totals sum `federalShareObligated` once per worksheet. See `data/processed/validation.json` after each refresh.
