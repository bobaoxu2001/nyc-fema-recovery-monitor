# NYC FEMA Public Assistance Recovery Monitor

A lightweight analytical prototype for FEMA Public Assistance grant portfolio monitoring and exception review.

It organizes public OpenFEMA project-worksheet data for New York into a simple analyst workflow: portfolio totals, funding by disaster / applicant / work category, and screening flags for records that may deserve a closer look.

This is an independent interview demonstration. It is not affiliated with FEMA, NYC OMB, New York State, or the City of New York.

## Why This Project

The prototype was built to understand FEMA Public Assistance from the perspective of a grant-management analyst — the kind of work done on a disaster-recovery task force that monitors City agency grant portfolios, reviews costs, and supports reimbursement.

It extends prior work in:

- budget execution and reimbursement monitoring
- audit reconciliation and exception investigation
- data validation and risk monitoring on large record sets

It is not a disaster model, a chatbot, or a generic portfolio site.

## What It Does

- Summarizes obligated Public Assistance worksheets for New York
- Breaks federal obligations down by disaster, applicant, and FEMA work category
- Offers an optional NYC-related subset (borough county, applicant city, or documented NYC entity name)
- Flags records for analyst review using transparent, filter-aware rules
- Opens a project detail view with an illustrative (not operational) review checklist

The 90-second story is: public grant data in, a monitoring queue out. Flags are screening indicators, not compliance findings.

## Data Source

Primary dataset:

**OpenFEMA Public Assistance Funded Projects Details v2**

- Page: https://www.fema.gov/openfema-data-page/public-assistance-funded-projects-details-v2
- API: `https://www.fema.gov/api/open/v2/PublicAssistanceFundedProjectsDetails`
- Filter: `stateAbbreviation eq 'NY'`

Joined to:

- [Public Assistance Applicants v1](https://www.fema.gov/openfema-data-page/public-assistance-applicants-v1) on `disasterNumber` + `applicantId` for applicant names
- [Disaster Declarations Summaries v2](https://www.fema.gov/openfema-data-page/disaster-declarations-summaries-v2) on `disasterNumber` for disaster titles

The current snapshot contains **59,291** New York project worksheets and about **$41.1B** in federal share obligated. Rows are retrieved from the official OpenFEMA API with **no API key**. OpenFEMA refreshes this dataset daily. This app stores a processed snapshot so filters stay fast, then checks that the downloaded row count matches OpenFEMA’s `$count`.

## Methodology

Each dashboard row is one obligated project worksheet. Open projects still in pre-obligation processing are not in the source file.

**Identifier:** `gmProjectId` is present and unique for every New York row in the current snapshot. Portfolio totals therefore sum `federalShareObligated` across rows without collapsing.

The app does **not** use Public Assistance Grant Award Activities for headline totals, because that file can contain multiple obligation events per project.

**Primary metric:** federal share obligated.

**NYC-related** is an analyst-constructed subset, not an official geography. A record is tagged if:

1. County is Bronx, Kings, New York, Queens, or Richmond, or
2. Applicant city is New York, Manhattan, Bronx, Brooklyn, Queens, or Staten Island, or
3. Applicant name matches a documented NYC entity pattern (City of New York, NYCHA, MTA New York City Transit, CUNY, and similar)

City agencies are often stored as county = Statewide, so borough filters alone would undercount NYC activity. The current snapshot tags **3,100** worksheets as NYC-related.

Details live on the in-app **Methodology** page.

## Analytical Flags

Flags are calculated on the currently filtered portfolio.

| Flag | Rule |
| --- | --- |
| High-dollar project | Federal share ≥ 95th percentile of positive amounts, and at least 20 positive-amount projects are in the selection |
| Extreme amount outlier | Federal share ≥ 99th percentile under the same conditions |
| Missing project information | Applicant name, disaster, work category, title, or federal share is missing |
| Negative federal obligation | Federal share < 0 (may be a deobligation or adjustment) |
| Potential duplicate-looking record | Same disaster, applicant, normalized title, and federal share rounded to the nearest $100 |

Applicant concentration (≥ 10% of selected federal obligations) and category concentration (≥ 25%) are shown as **portfolio indicators**, not as accusations.

> Flags are analytical screening indicators only. They do not represent compliance findings or FEMA eligibility determinations.

## Limitations

> This application is an independent analytical prototype created for educational and interview demonstration purposes. It is not affiliated with FEMA, NYC OMB, New York State, or the City of New York.

> Analytical flags are screening indicators only and do not represent findings of non-compliance, fraud, grant ineligibility, or improper expenditure.

OpenFEMA does not include procurement files, contracts, invoices, proofs of payment, insurance documents, or City reimbursement status. The project-detail checklist is illustrative only. OpenFEMA also notes that its financial figures come from Grants Manager, not FEMA’s official financial systems, and are not intended for official federal reporting.

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Recharts
- Python 3 + `requests` for the OpenFEMA snapshot pipeline
- Vitest + `unittest` for analytical tests

No database. No login. No LLM.

## Local Development

Requires Node.js 20+ and Python 3.11+ (with `requests`).

```bash
cd nyc-fema-recovery-monitor
python3 -m pip install -r scripts/requirements.txt
npm install
npm run data:refresh    # optional if public/data/projects.json already exists
npm run dev
```

Open http://localhost:3000.

Useful checks:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Data Refresh

```bash
python3 scripts/fetch_fema_data.py
```

or

```bash
npm run data:refresh
```

The script pages through the OpenFEMA API, joins applicants and disaster titles, validates identifiers and money fields, and writes:

- `data/processed/projects.json`
- `data/processed/validation.json`
- `data/processed/meta.json`
- `public/data/projects.json` (served to the browser)

## Deployment

Live URL:

**https://nyc-fema-recovery-monitor.vercel.app**

The app is a standard Next.js site hosted on Vercel.

```bash
npx vercel --prod --yes
```

`public/data/summary.json` and `public/data/projects.json` must be present before the build. The overview can render totals from the small summary file while the worksheet snapshot loads. After that, all filtering is client-side. No FEMA API key is used or required.

## Interview notes

See [docs/interview-demo.md](docs/interview-demo.md) for a 30 / 60 / 90-second walkthrough and likely questions.

## Screenshots

Run the app locally or open the deployed URL. The Overview tab is the demonstration home: KPI cards, disaster ranking, applicant table, work categories, and the project list.
