# Interview demo

Live URL: https://nyc-fema-recovery-monitor.vercel.app

This is a small analytical prototype using public OpenFEMA data. It is not a FEMA grant-management system.

Only share the screen if asked. Ninety seconds. Then stop.

## 15-second mention

I wanted to understand Public Assistance from an analyst’s point of view. I used the public OpenFEMA worksheet file for New York and built a small monitoring prototype. It shows the portfolio and a review queue. It is not a grant system.

## 30-second explanation

The file is New York State, not NYC-only. About 59,000 worksheets and about $41 billion in federal share obligated. That is statewide federal funding in the snapshot, not City cash.

There is an NYC-related view. I created that tag. It is not an official FEMA geography.

Then there is an exception queue. A flag means look here first. It does not mean the project is non-compliant.

## 60-second explanation

I wanted to understand the work, so I used OpenFEMA and built a small prototype.

The universe is New York State because City agencies are often coded Statewide. I did not pretend the public file has a clean NYC portfolio.

I checked that the Grants Manager project id is unique, so I am not double-counting worksheets.

Amount flags compare a project with others in the same disaster. A large Sandy worksheet can be normal. The same amount in a small flood may not be.

The useful part is the limit. Public data can show where to look. It cannot show contracts, invoices, insurance, or reimbursement status. Those still have to be in the grant file.

## 90-second screen-share walkthrough

1. **Overview.** Independent prototype. New York State Public Assistance. Snapshot August 26, 2026. 59,291 worksheets. About $41.1B federal share. Statewide, not NYC.

2. **NYC-related.** Toggle it. Say: this is an analyst view, not an official City portfolio. MTA and Port Authority are not City agencies.

3. **Exception Monitor.** One row. Screening flag, not a finding. Amount is versus the same disaster, not versus whatever filter is on the page.

4. **Project detail.** Internal evidence needed. Contracts, procurement, invoices, proof of payment, insurance, reimbursement status are not in OpenFEMA. View source record if they ask.

5. **Stop.** Do not open Methodology unless asked.

## If they push

- $41.1B = sum of federal share on unique NY worksheets in this snapshot. Not official City cash.
- Flag ≠ finding.
- Negative share may be a deobligation. Not automatically an error.
- I would not use this tool to decide eligibility.
