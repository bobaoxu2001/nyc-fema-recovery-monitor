# Interview demo — NYC FEMA Public Assistance Recovery Monitor

Live URL: https://nyc-fema-recovery-monitor.vercel.app

Use this if you have about 90 seconds on a shared screen. Speak in your own words. The text below is a guide, not a script to memorize.

## 30-second explanation

I wanted to understand FEMA Public Assistance before this interview.

I pulled the public OpenFEMA project-worksheet file for New York and turned it into a small grant-monitoring prototype.

The first screen shows how much federal funding is on the books, which disasters drive it, and which applicants hold the largest portfolios.

I also added simple screening flags for unusually large projects and missing information. Those flags are not compliance findings. They just help an analyst decide what to look at first.

## 60-second explanation

I built this because the job is about watching a grant portfolio, not about predicting disasters.

The data are obligated Public Assistance worksheets from OpenFEMA. Each row is one project. I checked that the FEMA Grants Manager project id is unique for New York, so I can add federal share without double-counting.

The overview answers the first questions an analyst would ask: how much federal money, which disasters, which applicants, which work categories.

The exception monitor then ranks records that sit in the top 5% of the current filter, or that have missing fields, or a negative obligation that may be a deobligation.

I was careful about language. Public data cannot tell you whether procurement was proper or whether a reimbursement is eligible. So the tool says “flagged for analyst review,” not “non-compliant.”

That is the same distinction I used in reimbursement monitoring and in audit work: first find the exceptions, then pull the documents.

## 90-second screen-share walkthrough

1. **Overview.** Point to the independent-prototype label and the data-refresh date. Say this is New York State OpenFEMA data, not an official OMB system.

2. **KPIs.** Total projects, total federal obligations, applicants, disasters, median amount, and projects flagged for review. Mention that the median is much smaller than the average because a few worksheets are enormous.

3. **Filters.** Switch Disaster to Hurricane Sandy (DR-4085), then to COVID-19 (DR-4480), then to Remnants of Hurricane Ida (DR-4615). Note that COVID and Sandy dominate New York’s federal share.

4. **Optional NYC toggle.** Geography → NYC-related subset. Explain that city agencies are often coded Statewide, so you used county, city, and applicant-name rules instead of pretending OpenFEMA has a clean NYC flag.

5. **Exception Monitor.** Show the p95 / p99 thresholds and one high-dollar row. Read the banner: flags are screening indicators, not findings.

6. **Project detail.** Open a flagged worksheet. Show federal share versus project amount, then the illustrative checklist. Read the note that invoices, procurement files, and insurance records are not in OpenFEMA.

7. **Methodology.** If there is time, show the grain / identifier decision and the “not affiliated with FEMA or OMB” disclaimer.

Stop there. Offer to walk through a specific applicant if they want.

## Possible interviewer questions and answers

### Why did you build this?

I wanted a concrete way to learn the Public Assistance file before talking about grant monitoring. Building a small monitor forced me to decide what a project is, what I can add, and what I cannot claim.

### What did you learn about FEMA Public Assistance?

Public Assistance is project-based. The public file is obligated worksheets, not the full grant file. Work is grouped into categories such as debris, emergency protective measures, roads, buildings, and utilities. A few disasters, especially Sandy and COVID in New York, account for most of the federal share. A lot of City work sits in Statewide rather than in a borough county field.

### What does the exception monitor do?

It ranks worksheets that look unusual in the current filter: very large federal share, missing fields, negative obligations, or records that look similar. It also shows when one applicant or one category dominates the selected dollars. That is a concentration indicator, not a problem by itself.

### Why aren’t these flags compliance findings?

Because the public file does not contain the evidence you would need for a finding. There are no contracts, invoices, proofs of payment, or insurance reviews. A large project can be completely proper. A missing field can be a data-quality issue. I can put a record in a review queue. I cannot declare it ineligible from OpenFEMA alone.

### What are the limitations of OpenFEMA?

It is not the official financial system. FEMA says the numbers can differ from USASpending or internal ledgers. Unobligated work is missing. Applicant names can have typos. There is no reliable official NYC flag. Supporting documents are not there. I treated it as a monitoring snapshot, not as a system of record.

### How does this relate to your previous work?

At Pronghorn I watched budget execution and reimbursement and looked for policy exceptions. At BDO I reconciled records and investigated exceptions for workpapers. At E Fund I built a validation pipeline over a large dataset. This prototype is the same sequence: get a clean grain, add what is safe to add, flag exceptions, and write down the limits.

### What would you add if you had access to internal OMB data?

I would keep the OpenFEMA worksheet as the index row and attach City cost data, contracts, procurement packages, invoices, proofs of payment, insurance information, and reimbursement status. Then an analyst could go from “this worksheet is large” to “here is the invoice packet and the remaining reimbursement.” That workflow is sketched on the Methodology page. It is not implemented, because those files are not public.

### How would contracts, invoices, procurement, and reimbursement records fit into this system?

They would hang off the project identifier. The dashboard would still start with obligations and flags. The detail page would replace the illustrative checklist with actual document status: received, missing, in review. Exception review would then feed reconciliation and management reporting.

### How would you improve the tool for real analysts?

I would confirm the NYC entity list with the agencies OMB actually monitors. I would add version history so deobligations are visible as a trail, not just a negative amount. I would let analysts assign a review owner and a status. I would not add a model that pretends to score fraud from public fields.

### Why is COVID in a Sandy-focused conversation?

Because it is in the New York Public Assistance file and it is currently the largest disaster by federal share. A portfolio monitor should show the whole book, then let you filter to Sandy, Ida, or a single applicant. I would not hide COVID just to make the demo look more Sandy-like.

### How do you avoid double-counting?

I used the project-details file, not the award-activity file. I checked that `gmProjectId` is unique for every New York row. Then I summed federal share once per worksheet. If that uniqueness ever broke, the refresh script would fail validation.

### What is the NYC-related filter really doing?

It is a conservative tag so a City-focused analyst can narrow the statewide file. It will miss oddly named entities and it may include bi-state ones such as the Port Authority. I show the count and the rules instead of calling it the official NYC portfolio.
