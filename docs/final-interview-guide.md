# Final interview guide

**Role:** Analyst – Sandy Grant Management & Insurance  
**Office:** NYC Mayor’s Office of Management and Budget, FEMA Disaster Recovery Task Force  
**Live prototype:** https://nyc-fema-recovery-monitor.vercel.app

This is interview preparation. It is not a product spec.

Speak in short sentences. Simple words. Do not sound like a memo.

---

# Hiring-manager view

Pretend Jesse Meyerson is interviewing an early-career candidate.

## What would make him interested

You already do parts of the job under other names.

- Reimbursement monitoring (Pronghorn)
- Finding and reconciling discrepancies (BDO)
- Validation and exception checks on a large file (E Fund)
- Settlement, refunds, and chargebacks with other teams (Alibaba)
- Controls and governance language (Columbia ERM)

That is a real skill match. Not “I like public service.”

You also did the homework. You looked at OpenFEMA. You did not claim to be a FEMA expert. You separated a screening flag from a finding.

## What would concern him

- No direct FEMA, grants-portal, or City-government experience
- The project could look like a coding demo if you talk too long about React
- If you call $41.1B “NYC funding,” trust drops immediately
- If you cannot explain why NYC-related is not official
- Resume numbers (75% to 98%) will be probed. If the story is fuzzy, it hurts more than not having the number

## What evidence he wants

- One clean reimbursement / exception story
- One clean reconciliation story
- One clean “I learned a new requirement and applied it” story
- Calm answers when you do not know a FEMA rule
- A short, accurate description of the prototype

## Resume claims he will probe

- 75% to 98% reimbursement accuracy
- What you actually did at BDO vs. what seniors did
- What “70,000+ records” meant in practice
- What you owned at Alibaba vs. what you observed
- Whether Columbia ERM was applied work or coursework

Mark any missing detail as **DETAIL TO CONFIRM** below. Do not invent it in the room.

## Project decisions he will challenge

- Why New York State, not NYC
- Why MTA / Port Authority are in the subset
- Why percentiles
- Why a flag is not a finding
- Why public data cannot determine eligibility

A strong answer is short and names the limit. A weak answer defends the dashboard.

## Strong vs. weak

**Strong:** “I would check the invoice against the worksheet, write down the difference, and ask the agency for the missing support. I would not decide eligibility on my own.”

**Weak:** “I would use the dashboard to see if it is non-compliant.”

---

# 30-minute interview map

This is a first-round conversation. Timing will move.

## 0–3 min — Intro

“Tell me about yourself.”  
Maybe “walk me through your resume.”

If this runs long, later sections shrink. Keep the opening under two minutes.

## 3–8 min — Why this job

Why OMB. Why this role. Why disaster recovery / FEMA.

He is testing motivation, not passion speeches.

## 8–15 min — Experience

He will pick one or two jobs and go deep.

Most likely: Pronghorn reimbursement, BDO exceptions, E Fund data.

This is where the 75% → 98% number gets tested.

## 15–22 min — Behavioral / situational

Discrepancy. Incomplete files. Competing deadlines. Stakeholders.

He may give a live scenario: invoice does not match, agency is silent, large project.

## 22–26 min — Role / FEMA / project

Only if there is time, or if you mentioned the prototype.

He may ask what the Task Force does day to day.

If he asks to see the site, use the 90-second walkthrough. Then stop.

## 26–30 min — Your questions

Ask one strong question. Have two backups.

## How it can vary

- Some interviewers stay on resume the whole time.
- Some jump to a scenario in minute 5.
- Some never ask about the project. Do not force it.
- If he is technical, he may ask about double-counting. Answer in one minute, then come back to the grant workflow.

---

# Opening

## Tell me about yourself

About 75–100 seconds.

I’m currently building a mix of finance, audit, risk, and data skills.

At Pronghorn I worked on budget execution and reimbursement monitoring. I looked for policy exceptions and helped improve reimbursement-processing accuracy from 75% to 98%. **DETAIL TO CONFIRM:** your exact role in that 75% to 98% change — what you counted, over what period, and whether you owned the process or supported it.

At BDO I worked in audit. I reconciled journal entries and bank confirmations. When something did not match, I followed it.

At E Fund I built a Python and SQL pipeline on more than 70,000 records, with validation and exception checks.

I also did settlement monitoring at Alibaba — refunds, chargebacks, remittance delays — and I studied enterprise risk at Columbia, including COSO and ISO 31000.

My read of this role is: watch a grant portfolio, check project costs, find missing support, reconcile differences, and help the City get eligible FEMA reimbursement.

I think the job needs three things. First, careful financial monitoring. Second, being able to work with data and exceptions. Third, reading requirements and working with agencies, the State, and FEMA.

That is close to work I have already done, just in a new domain.

I did not grow up wanting to work in disaster recovery. After I looked at the Task Force and at Public Assistance, the work made sense to me. FEMA funding only helps the City if the documentation and controls are solid. That is the part I know how to practice.

---

# The three “why” questions

## Why OMB?

OMB sits at the center of how the City uses money.

The work is financial and analytical. It also has a public result. If reimbursement is slow or sloppy, the City either leaves federal money on the table or takes risk it should not take.

I want to see City-wide work, not one agency’s books in isolation. OMB does that.

## Why this role?

This role is reimbursement, documentation, and follow-up.

That is close to what I have done. At Pronghorn I watched reimbursements and exceptions. At BDO I reconciled records. At E Fund I validated a large file.

Here the “file” is a FEMA project. The support is contracts, invoices, proof of payment, and insurance. The output is eligible reimbursement and a clean record for FEMA.

I am not claiming I already know the Stafford Act in practice. I am claiming the workflow is familiar.

## Why FEMA / disaster recovery?

I would not say I have always been passionate about this.

I looked at the job and then at Public Assistance. What interested me was the mechanics. A disaster happens. The City spends money. FEMA may reimburse eligible costs if the file is complete.

That depends on documentation and controls. It also depends on people who can work across agencies without losing the numbers.

That combination is why I applied.

---

# FEMA knowledge

Keep these to 20–40 seconds. If you do not know a rule, say so.

## 1. What is FEMA?

FEMA is the federal agency that coordinates disaster response and recovery in the United States. For this job, the relevant part is grant funding after a presidential disaster declaration, especially Public Assistance.

## 2. What is FEMA Public Assistance?

It is FEMA’s program for state, local, tribal, and certain nonprofit applicants. It can fund debris removal, emergency work, and repair or replacement of public facilities. It is project-based. The public file I used shows obligated project worksheets, not the full grant file.

## 3. What does the FEMA Disaster Recovery Task Force do?

I understand it as the City’s team for managing disaster-recovery grants after major events. It works with agencies, New York State, FEMA, and OMB so the City can document costs and recover eligible federal funding. **DETAIL TO CONFIRM** from Jesse if he describes the mandate differently.

## 4. What do you think this team does day to day?

Watch project costs. Check supporting documents. Find gaps. Follow up with agencies. Reconcile City records to FEMA records. Help move reimbursement along. Report status internally.

I would expect a mix of spreadsheet work, portal work, and emails with agencies.

## 5. What are procurement materials?

The file that shows how the work was bought. Bids, contracts, sole-source justifications, change orders. FEMA cares because grant funds have procurement rules. I have not applied those rules yet. I know they matter before a cost is treated as eligible.

## 6. Why are invoices and proof of payment important?

An invoice shows what was billed. Proof of payment shows the applicant actually paid it. Together they support the cost on the worksheet. If they do not match the project record, that is a discrepancy to clear before reimbursement.

## 7. Why does insurance matter?

FEMA should not pay for the same loss twice. Insurance proceeds can reduce the eligible amount. So the file needs coverage, claims, and proceeds, not just the contractor invoice.

## 8. What does reimbursement mean here?

The City or the agency spends first, or at least documents the cost. Then FEMA reimburses the eligible federal share. Obligation in OpenFEMA is not the same as cash received.

## 9. Why are supporting documents important?

Because the worksheet amount is a claim. The documents are the evidence. Without them, you cannot reconcile, you cannot answer FEMA, and you cannot close the project cleanly.

## 10. What is the Stafford Act?

It is the main federal law behind presidential disaster declarations and much of FEMA’s assistance, including Public Assistance. I know the name and the role. I would not pretend I can cite sections in an eligibility fight.

## 11. Do you need to be a FEMA expert before joining?

I do not think so. You need to be careful, organized, and willing to learn the guidance. You also need to know when to ask. Domain knowledge comes on the job. Sloppy files do not.

## 12. What would be difficult about this job?

Volume and follow-up. Many projects, many agencies, incomplete packages, and deadlines that are not in your control. Also staying inside the guidance when an agency wants a faster yes.

---

# Story bank

Do not invent. If a fact is missing, it is marked.

## Story A — Pronghorn

**Use for:** reimbursement, monitoring, policy exceptions, controls, detail, process improvement.

**Situation:** I was on budget execution and reimbursement monitoring across business units. **DETAIL TO CONFIRM:** 8 units, team size, your title, dates.

**Task:** Watch spend against budget. Watch reimbursements. Flag policy exceptions.

**Action:** Used SQL and Excel to compare budget and actuals. Checked items that did not fit policy. Escalated exceptions. **DETAIL TO CONFIRM:** who you reported to, what “policy” meant, what you changed in the process.

**Result:** Reimbursement-processing accuracy went from 75% to 98%. **DETAIL TO CONFIRM:** definition of accuracy, sample, time window, your personal contribution vs. the team’s.

**Learned:** A monitoring file is only useful if exceptions have an owner and a follow-up.

**Questions it can answer:** discrepancy, detail, process improvement, controls, why this role.

## Story B — BDO

**Use for:** discrepancy, reconciliation, audit, documentation, deadlines.

**Situation:** Audit engagement. Journal entries and bank confirmations had to be tied out. **DETAIL TO CONFIRM:** industry, year, your level.

**Task:** Reconcile. Investigate mismatches. Put the support in the workpapers.

**Action:** Compared the books to the bank. When a number did not match, I traced it. I documented the path so a reviewer could follow it.

**Result:** Exceptions were cleared or explained before sign-off. **DETAIL TO CONFIRM:** a specific mismatch and dollar amount, if you remember one.

**Learned:** If you cannot show the trail, you do not really have the answer.

**Questions it can answer:** discrepancy, deadline, mistake (if you pick a real one), incomplete information.

## Story C — E Fund

**Use for:** large data, automation, validation, learning quickly, working independently.

**Situation:** Risk monitoring needed a cleaner file. More than 70,000 records.

**Task:** Build a Python/SQL pipeline with validation and exception checks.

**Action:** Loaded the data. Checked required fields and odd values. Sent exceptions to review instead of forcing them into the main total.

**Result:** A repeatable monitoring file instead of a one-off spreadsheet. **DETAIL TO CONFIRM:** what the exceptions were, and what changed after the pipeline.

**Learned:** Count the rows. Do not assume the source is clean. Do not hide nulls as zeros.

**Questions it can answer:** large dataset, learning quickly, independent work, process improvement.

## Story D — Alibaba

**Use for:** stakeholders, transaction monitoring, risk signals, explaining findings.

**Situation:** Settlement monitoring. Refunds, chargebacks, remittance delays. Large transaction set. Recurring review with Finance and Product.

**Task:** Spot delays or odd patterns and bring them to the review.

**Action:** Watched the file. Summarized what I saw in plain language for the meeting. **DETAIL TO CONFIRM:** a concrete example — one delay, one chargeback pattern, what you recommended.

**Result:** Issues were visible in the recurring review instead of sitting in the extract. **DETAIL TO CONFIRM.**

**Learned:** Other teams do not need your spreadsheet. They need the exception and the question.

**Questions it can answer:** stakeholders, explaining complex information, competing priorities.

## Story E — Columbia ERM

**Use for:** complex requirements, unfamiliar framework, translating rules, teamwork, governance.

**Situation:** ERM coursework / project using COSO and ISO 31000. **DETAIL TO CONFIRM:** whether this was a class project, a client-style case, or both.

**Task:** Take a control framework and turn it into practical recommendations.

**Action:** Read the framework. Mapped it to a real process. Wrote recommendations a manager could use.

**Result:** **DETAIL TO CONFIRM.**

**Learned:** A framework is not the deliverable. The deliverable is what someone should do on Monday.

**Questions it can answer:** complex requirements, learning something new, explaining complexity.

---

# Behavioral questions

Each answer is meant to be spoken in about 60–90 seconds.

## 1. Tell me about a time you found a discrepancy.

**Story:** BDO.

In audit I was reconciling journal entries and bank confirmations. One balance did not tie. I did not adjust it to make the file look clean. I went back to the source. I listed what matched and what did not. Then I took the exception to the senior. We either found the missing piece or documented why it was still open. The takeaway is: a difference is a work item, not a rounding problem.

## 2. Tell me about a time you had to pay close attention to detail.

**Story:** Pronghorn.

Reimbursement files are easy to rubber-stamp. I compared budget to actual and checked items against policy. Small coding errors and out-of-policy items were the whole job. The accuracy number moved from 75% to 98% after that monitoring got tighter. **DETAIL TO CONFIRM** your exact part in that move. The takeaway is: the error is usually in the exception, not in the total.

## 3. Tell me about a time you improved a process.

**Story:** Pronghorn or E Fund.

Pronghorn: we were missing exceptions in reimbursement. I helped turn that into a regular budget-versus-actual and exception review so items were caught earlier.

E Fund: the 70,000-row file was not usable as a one-off. I put validation in the pipeline so exceptions came out as a list.

Pick one. Do not tell both.

## 4. Tell me about a time you worked with a large dataset.

**Story:** E Fund.

More than 70,000 records. I used Python and SQL. I did not start with a chart. I started with counts, nulls, and duplicates. Then exception rules. Then a monitoring view. That is the same habit I used on the OpenFEMA file.

## 5. Tell me about a time you had to learn something quickly.

**Story:** E Fund or Columbia ERM.

E Fund: I had to get the pipeline and the validation rules working without a long ramp. I learned the fields, wrote checks, and asked when a rule was unclear.

Columbia: COSO and ISO 31000 were new as working tools. I translated them into recommendations instead of quoting the framework.

## 6. Tell me about a time you worked with multiple stakeholders.

**Story:** Alibaba.

Settlement issues cut across Finance and Product. I brought refund, chargeback, or delay patterns to a recurring review. I tried to say what happened, how large it was, and what we needed from the other team. I did not dump the extract on them.

## 7. Tell me about a time you had competing priorities.

**Story:** BDO or Alibaba.

BDO: confirmations, reconciliations, and workpaper deadlines landed together. I listed what blocked sign-off first. Open exceptions before nice-to-have formatting.

**DETAIL TO CONFIRM** a real week if you remember one.

## 8. Tell me about a mistake you made.

Do not invent a fake humble-brag.

Use a real one. If you cannot, say you want to give an honest example and use:

I once treated a source field as complete when it was not. I published a count, then found nulls. I corrected it, added a completeness check, and did not do that again.

**DETAIL TO CONFIRM** which job this was. If it was not you, do not use it.

## 9. Tell me about a difficult stakeholder.

**Story:** Alibaba, if you have a real friction point. Otherwise BDO, a client who was slow on support.

I needed information they did not want to stop and give. I made the request specific. What I needed, why, and by when. I followed up in writing. I did not escalate first.

**DETAIL TO CONFIRM.**

## 10. Tell me about a disagreement with a teammate.

**DETAIL TO CONFIRM.** Do not fabricate.

If you have one: we disagreed on whether an item was in or out of policy / in or out of the sample. I showed the source. We either agreed or took it to the senior. I did not win by talking louder.

## 11. Tell me about a time you worked independently.

**Story:** E Fund.

I owned the pipeline work. I set checks, ran them, and brought exceptions, not a raw dump. I asked questions when the rule was unclear. Independent does not mean isolated.

## 12. Tell me about a time you had incomplete information.

**Story:** BDO or Pronghorn.

A reimbursement or a confirmation was missing support. I did not fill the gap with an assumption. I marked it outstanding, asked for the document, and kept the item open until it landed.

That is the same posture I would use with an incomplete FEMA package.

## 13. Tell me about a time you identified a control issue.

**Story:** Pronghorn policy exceptions, or BDO if a control did not catch a mismatch.

I saw items that policy should have stopped, or a reconciling item with no owner. I raised it with the example, not with a theory. Controls fail in the exception list.

## 14. Tell me about a time you had to explain something complex.

**Story:** Alibaba review, or Columbia ERM, or the OpenFEMA prototype.

I had to explain why a total was not safe to use, or why a framework recommendation mattered. I started with the decision, then the evidence, then the limit.

## 15. Tell me about a time you worked under a tight deadline.

**Story:** BDO.

Audit has dates that do not move. I finished the items that blocked review first. I wrote the workpaper so someone else could pick it up if needed.

---

# Situational questions

Framework: Understand → Verify → Document → Communicate → Follow up.

I do not decide FEMA eligibility in these answers.

## Scenario 1 — Invoice does not match the project cost record

I would not pick a number and move on.

I would understand the difference. Invoice total, project record, federal share, dates.

I would verify both sources. Same project id, same vendor, same period.

I would write down the gap.

I would ask the agency for the missing invoice, a revision, or an explanation.

I would follow up until the file matches or the item is parked with a reason.

## Scenario 2 — Incomplete documentation

I would list what is present and what is missing. Contract, invoice, proof of payment, procurement, insurance.

I would not call the project ineligible from that list alone.

I would send a specific request. I would keep a log. I would flag the project as outstanding, not as a finding.

## Scenario 3 — Not sure if a cost is eligible

I would not guess.

I would write the question. What is the cost. What is the project. What guidance I already checked.

I would ask my supervisor or the person who owns eligibility calls.

I would document the question and the answer.

I am not a FEMA expert on day one. Guessing is worse than asking.

## Scenario 4 — Agency is silent, deadline coming

I would confirm the deadline and what is still missing.

I would follow up in writing, with the list and the date.

If still silent, I would escalate inside OMB the way the team does it — not by surprising the agency in a big meeting if a phone call would work.

I would keep a paper trail.

## Scenario 5 — Many grants, many deadlines

I would sort by deadline, dollar size, and how incomplete the file is.

A large project with missing proof of payment is ahead of a small complete one.

I would keep a simple tracker. I would tell my manager if the queue is not realistic.

## Scenario 6 — Negative federal obligation

I would not assume it is an error.

In OpenFEMA, negatives can be deobligations or adjustments.

I would verify the project id, the disaster, and whether later records net it out.

I would ask whether City records show the same net position.

I would document it as “needs explanation,” not “bad data.”

## Scenario 7 — Unusually large project

Large can be normal. Sandy and COVID have huge worksheets.

I would ask: large compared with what? Same disaster, same category, same applicant.

I would review the description, the amount, and what support we actually have.

I would not call it suspicious.

## Scenario 8 — Two systems, two amounts

I would treat it as a reconciling item.

I would identify both sources. OpenFEMA vs. a City database vs. an invoice log.

I would compare grain. Project vs. obligation event vs. payment.

I would not force them to match by deleting a row.

I would document the difference and who owns the next check.

---

# Project questions

Story: I wanted to understand the work from an analyst’s perspective, so I explored OpenFEMA public data and built a small monitoring prototype.

Biggest lesson: public data can help identify where to look. It cannot determine whether a project is compliant.

## 1. Why did you build this?

To learn the file before the interview. Not to build a grant system.

## 2. What did you learn?

PA is project-based. The public file is obligated worksheets. A few disasters and applicants hold a lot of the money. Documentation still lives somewhere else.

## 3. Why New York State instead of NYC?

OpenFEMA has no clean official NYC flag. City agencies are often Statewide. Borough-only would undercount.

## 4. How did you define NYC-related?

Borough county, applicant city, or a documented name pattern. Conservative. Not official.

## 5. Why isn’t it an official portfolio?

Because I made the rules. FEMA did not. OMB did not.

## 6. What does $41.1B represent?

Federal share obligated on NY worksheets in this snapshot. Not City cash received. Not NYC-only.

## 7. How did you avoid double-counting?

I used the details file, not award activities. I checked gmProjectId was unique in New York. Then I summed federal share once per row.

## 8. Why gmProjectId?

It is the Grants Manager project id. In v2 it is the primary key. It was unique in the NY extract.

## 9. What does flagged for review mean?

Put it in a queue. Unusual amount versus its disaster, missing field, or a negative share that may be a deobligation.

## 10. Does a flag mean non-compliant?

No.

## 11. Why disaster cohorts?

A $2 million Sandy worksheet can be normal. The same amount in a small flood may not be. The peer group is the disaster. Filters on the page do not move the flag.

## 12. OpenFEMA limits?

Not the official financial system. No unobligated work. No contracts, invoices, insurance, or reimbursement status. Names can be messy.

## 13. If you had OMB data?

Keep the worksheet as the index. Attach City cost, contract, procurement, invoice, proof of payment, insurance, reimbursement status.

## 14–17. Contracts, procurement, invoices, insurance

They hang off the project id. They are the evidence layer. They are not in OpenFEMA.

## 18. What would you improve?

Confirm the NYC entity list with the agencies OMB actually monitors. Add review status if I had internal data. I would not add a risk score.

## 19. How does it connect to previous work?

Same sequence as Pronghorn, BDO, and E Fund. Get the grain right. Add what is safe. Flag exceptions. Write down the limits.

## 20. Most important lesson?

Where to look is not the same as what is eligible.

---

# 90-second demo

Live URL: https://nyc-fema-recovery-monitor.vercel.app

## 15 seconds

I built a small prototype on public OpenFEMA data to understand PA from an analyst’s view. It is a monitoring file, not a grant system.

## 30 seconds

New York State worksheets. About 59,000 rows. About $41 billion federal share. That number is statewide, not NYC. There is an NYC-related view I created. Then an exception queue. Flags are not findings.

## 60 seconds

I wanted to see the work. I used OpenFEMA. I checked I was not double-counting. The first screen is the book. The second is a careful NYC subset. The third is review flags against the same disaster, not against whatever filter is on the page. Then the project page shows what OpenFEMA does not have: contracts, invoices, insurance, reimbursement.

## 90-second screen share

1. Overview. Independent prototype. New York State. 59,291 worksheets. About $41.1B federal share. Snapshot August 26, 2026.
2. Toggle NYC-related. Say it is not an official portfolio. MTA and Port Authority are not City agencies.
3. Exception Monitor. One example. Screening flag, not finding. Amount vs. the same disaster.
4. Project detail. Internal evidence needed. View source record if asked.
5. Stop. Do not open Methodology unless asked.

If he has not asked for the site, do not share screen.

---

# Kill questions

Short answers. Do not win. Show judgment.

**Why trust $41.1B?**  
It is the sum of federalShareObligated on unique NY worksheets in this OpenFEMA snapshot. OpenFEMA says it is not the official financial system. I would not use it as a City cash number.

**How do you know you did not double-count?**  
gmProjectId was unique. I did not use the award-activity file.

**Why NYC-related?**  
So a City-focused analyst can narrow the statewide file. It is my tag.

**Isn’t MTA different from a City agency?**  
Yes. I label it a regional / public authority. Still NYC-related for monitoring. Not a City agency.

**Why percentiles?**  
Simple and explainable. Peer group is the disaster. Not a fraud score.

**Why does a negative obligation matter?**  
It may be a deobligation. It needs an explanation. It is not automatically an error.

**Could a high-dollar project be normal?**  
Yes. Especially in Sandy or COVID.

**Can this tell me if procurement was compliant?**  
No.

**Why can’t public data determine eligibility?**  
Eligibility depends on the work, the documents, insurance, and the guidance. Those are not in the public worksheet.

**Flag vs. finding?**  
A flag is a queue. A finding needs evidence and a determination.

**Isn’t this just a dashboard?**  
It is a small prototype of a monitoring workflow. The useful part is the judgment about what the file can and cannot support.

**How is this relevant to grant management?**  
Same sequence: portfolio, exceptions, documents, reconciling, reimbursement. The documents are still missing. That is the point.

---

# Gap questions

## No FEMA experience. Why hire you?

I do not have FEMA experience yet. I do have reimbursement monitoring, reconciliation, controls, and data validation. Those are the daily motions. I also spent time on Public Assistance before this interview. I can learn the portal and the guidance. I cannot fake the file.

## No government grant experience.

True. I have done the financial and exception parts in other settings. Grants add eligibility and agency coordination. I would learn those on the team.

## No Grants Portal.

I have not used it. I used the public data because that is what I could access. I would expect to learn the portal in the first weeks. I have learned other systems by using them on real files.

## No GIS.

This role, as I read it, is not a mapping role first. It is a grant file role. If GIS is needed later, I can learn it. I would not lead with maps.

## Why public sector?

I like work where the documentation has a public consequence. OMB is also still finance. I am not trying to leave analysis. I am trying to put it on City recovery funding.

## Why should we believe you will stay?

Because the work matches skills I already use, and I did the research before applying. I am not shopping a generic analyst title. **DETAIL TO CONFIRM** if you have a genuine longer-term public-finance interest. Do not overclaim.

---

# Questions for Jesse

## Tier 1 — ask if you can

1. For a new analyst, what does a typical project portfolio look like in the first six months?
2. When a reimbursement package comes back incomplete, what does a strong follow-up look like on this team?
3. What do you notice first when someone is going to be good at this job?

## Tier 2 — backups

4. How do analysts split time between the file and coordinating with agencies?
5. What is the hardest part of working across FEMA, the State, and City agencies right now?
6. How do people usually learn Public Assistance on this team?
7. What is still messy in the data or the process that you wish was cleaner?
8. How does insurance review show up in an analyst’s week?

Do not ask anything answered by the posting.

**Best three for a first round:** 1, 2, and 3.

---

# Things I should not say

- $41.1B is NYC FEMA funding
- NYC-related is an official FEMA or City portfolio
- Flagged projects are suspicious, fraudulent, or ineligible
- A negative obligation is an error
- I know the Stafford Act / PA policy well enough to make eligibility calls
- I built a grant-management system
- Let me walk you through the React stack
- Disaster recovery has always been my passion
- Government is slow / bureaucratic
- Long project monologue
- “Risk score”
- “Leverage,” “robust framework,” “end-to-end solution”
- Pretending I have used Grants Portal
- Filling a DETAIL TO CONFIRM with a guess in the room — say you want to be precise instead

---

# Interviewer scorecard

| Area | 5/5 | 3/5 | Concern |
| --- | --- | --- | --- |
| Communication | Short, clear, stops | Understandable but long | Rambling or buzzwords |
| Role understanding | Portfolio → docs → reimbursement | Knows it is FEMA grants | Thinks it is disaster response ops |
| Financial / detail | Talks grain, support, reconciling items | Mentions accuracy | Waves at “I am detail-oriented” |
| Analytical ability | Compares like with like | Can describe a chart | Mixes denominators |
| Judgment | Flag ≠ finding | Careful but vague | Overclaims |
| Stakeholders | Specific request, follow-up | “I would communicate” | Blames the agency |
| Motivation | Researched the work | Likes public impact | Generic passion |
| Learning | Asks when stuck | Willing to learn | Needs to know everything first |
| FEMA knowledge | Accurate and limited | A few right terms | Fake expertise |
| Public-sector interest | Why OMB, specifically | Open to government | Using the City as a stepping stone |

---

# Mock interview (12 questions)

1. Tell me about yourself.  
2. Why this role?  
3. Walk me through the 75% to 98% number.  
4. Tell me about a discrepancy you investigated.  
5. An invoice does not match the project record. What do you do?  
6. What is Public Assistance?  
7. Why is insurance in this job?  
8. You don’t have FEMA experience. Why you?  
9. Why is the prototype New York State, not NYC?  
10. Does a flag mean the project is non-compliant?  
11. Two systems show different amounts. What do you do?  
12. What would you want to know in the first month?

## Top 5 questions most likely to hurt you if underprepared

1. **The 75% → 98% number.** If you cannot say what was counted, it sounds inflated. Practice this with the real definition. **DETAIL TO CONFIRM.**

2. **Invoice mismatch scenario.** If you jump to “ineligible,” you fail the judgment test.

3. **$41.1B / NYC.** One sloppy sentence undoes the prototype.

4. **No FEMA experience.** If you get defensive, or if you oversell the dashboard, you look junior.

5. **Flag vs. finding.** If you call large projects suspicious, you sound like you do not understand grant files.

Practice those five out loud. Do not memorize the guide. Memorize the limits.

---

# Practice list

1. Opening, timed, twice.
2. Why OMB / why this role / why FEMA, 30 seconds each.
3. Pronghorn accuracy story with confirmed details.
4. Invoice mismatch and incomplete package, out loud.
5. 90-second demo, once with the site, then stop on purpose.
6. Fill every **DETAIL TO CONFIRM** before the interview.
