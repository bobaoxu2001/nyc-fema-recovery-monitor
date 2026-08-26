# Interview demo — NYC FEMA Public Assistance Recovery Monitor

Live URL: https://nyc-fema-recovery-monitor.vercel.app

This is a small analytical prototype using public OpenFEMA data. It is not a FEMA grant-management system.

Speak in your own words. Short sentences.

## 15-second version

I wanted to understand FEMA Public Assistance from an analyst’s point of view. I used the public OpenFEMA worksheet file for New York and built a small monitoring prototype. It shows the portfolio, then flags records that may deserve a closer look. Those flags are not compliance findings.

## 30-second version

I built this because I wanted to see how grant monitoring might look in this role.

The data are obligated Public Assistance worksheets for New York State. The headline dollars are statewide federal share, not NYC-only funding. There is an NYC-related subset, but that is an analyst tag, not an official geography.

The first screen shows size, concentration, and what to review next. I was careful not to call a large or incomplete record non-compliant. Public data cannot support that.

## 60-second version

I wanted to understand how the work in this role might look from an analyst’s perspective, so I used OpenFEMA public data to build a small monitoring prototype.

The file is New York State, because city agencies are often coded Statewide. I did not pretend OpenFEMA has a clean NYC flag.

The dashboard answers four questions: what the data are, how large the book is, where funding sits, and what might deserve review.

I checked that the Grants Manager project id is unique in New York, so federal share is summed once per worksheet. I did not use the award-activity file, because that one can have multiple obligation events.

The exception monitor uses simple screens: high-dollar in the current filter, missing fields, and negative amounts that may be deobligations. That is the same sequence I used in reimbursement monitoring and audit work. Find exceptions first. Then pull documents.

## 90-second screen-share walkthrough

1. Overview. Point to “Independent analytical prototype” and “New York State Public Assistance.” Say the dollars are statewide federal share.

2. KPIs. Worksheets, federal share, applicants, disasters, flagged for review.

3. Toggle NYC-related. Say this is an analyst subset. Not every tagged applicant is a City agency.

4. Click Hurricane Sandy. Then COVID-19 if there is time. Note that COVID currently holds more federal share than Sandy in this file.

5. Exception Monitor. Read one flag. Say it is a screening indicator, not a finding.

6. Open one project. Show the illustrative workflow. Read the disclaimer: contracts, invoices, insurance, and reimbursement status are not in OpenFEMA.

7. Methodology if asked. Grain, identifier, and what you would add with internal OMB data.

## Possible interviewer questions

Keep answers around 20–40 seconds.

### 1. Why did you build this?

I wanted to understand the work before the interview. Building a small monitor forced me to decide what a project is, what I can add, and what I cannot claim.

### 2. What did you learn from the project?

Public Assistance is project-based. The public file is obligated worksheets, not the full grant file. It is useful for portfolio monitoring. It is not enough for a compliance finding.

### 3. What is FEMA Public Assistance?

It is FEMA’s grant program for debris, emergency work, and restoration of public facilities after a declared disaster. Applicants are usually governments or certain nonprofits. The public file shows obligated project worksheets.

### 4. What does the dashboard actually measure?

Federal share obligated on those worksheets. Plus counts of projects, applicants, and disasters. Flags are screens on that selected set.

### 5. Why New York State data instead of only NYC?

OpenFEMA does not have a reliable official NYC flag. Many City agencies sit in Statewide. If I had filtered only to five boroughs, I would have undercounted. So the universe is New York State, with an NYC-related subset I can explain.

### 6. How did you identify NYC-related records?

Three conservative rules: five-borough county, applicant city, or a documented name pattern. NYCHA is a City entity. Port Authority and MTA are regional authorities. A hospital in Manhattan may only be a geographic match. I do not call all of them City agencies.

### 7. What does “flagged for review” mean?

It means the record is unusual or incomplete in the current filter. It goes into a review queue. It does not mean the project is wrong.

### 8. Does a flag mean the project is non-compliant?

No. The public file does not have contracts, invoices, or insurance reviews. I can prioritize. I cannot determine eligibility from OpenFEMA alone.

### 9. Why the 95th / 99th percentile?

They are simple, explainable screens. They move with the selected portfolio. A $2 million worksheet can be typical in Sandy and unusual in a small flood. I do not apply them if the selection has fewer than 20 positive-amount projects.

### 10. How did you make sure you were not double-counting?

I used the project-details file, not the award-activity file. I checked that gmProjectId is unique for every New York row. Then I summed federal share once per worksheet.

### 11. What are the limitations of OpenFEMA data?

It is not the official financial system. Unobligated work is missing. Applicant names can have typos. There is no official NYC geography. Supporting documents are not there.

### 12. What data would you want at OMB?

City cost data, contracts, procurement packages, invoices, proofs of payment, insurance, and reimbursement status. Keep the public worksheet as the index row.

### 13. How would procurement records fit?

They would attach to the project identifier. The dashboard would still start with obligations. The detail page would show whether the procurement file was received.

### 14. How would invoices and proof of payment fit?

Same way. They support the costs on the worksheet. Public data cannot show whether the applicant paid an eligible invoice.

### 15. How would insurance information fit?

As a duplication-of-benefits check against the same project. OpenFEMA does not include proceeds or coverage.

### 16. How does this connect to your previous experience?

At Pronghorn I watched reimbursements and policy exceptions. At BDO I reconciled records and investigated exceptions. At E Fund I validated a large dataset and monitored outliers. At Columbia I worked on risk and controls. This prototype is that sequence applied to public grant data.

### 17. What would you improve next?

Confirm the NYC entity list with the agencies OMB actually monitors. Show deobligation history if internal data had versions. Add a review owner and status. I would not add a fraud score from public fields.

### 18. What was the most interesting thing you learned?

How much of the New York Public Assistance book is a small number of disasters and applicants. And that COVID currently outweighs Sandy in this public file. A monitor has to show the whole book, then let you filter.
