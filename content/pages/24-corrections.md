# Corrections

## Route

`/corrections`

## Provenance

Authored 2026-08-19 alongside `src/content/pages/corrections.ts`, not transcribed from copy that existed first. CONTENT_VERIFICATION.md R6 recorded this route as blocked because no approved copy existed for it, and docs/17 wave 0 item 0.4 records that the block was roughly 200 words of policy rather than a missing fact. This is that policy, and it is pending Brandon's editorial review in the same sense as rows A3 and A4.

## SEO

**Title:** Corrections | Hendricks

**Description:** How Hendricks corrects a published error, how to report one, and the dated log of corrections made to this site.

**H1:** Corrections

**Eyebrow:** Editorial Policy

## Lead

Hendricks publishes measurement. Measurement that cannot be corrected in public is not measurement.

This page states what gets corrected, how to report an error, and what the firm did the last time it found one in its own work.

## Direct answer

**Eyebrow:** CORRECTIONS POLICY

**Hendricks corrects any published statement of fact that turns out to be wrong, including figures, dates, names, definitions, and the machine-readable claims a page emits in its structured data. A substantive correction is dated, described, and left visible in the log on this page rather than edited away, and anyone can report an error through the contact form.**

## What gets logged, and what gets fixed quietly.

Eyebrow: Scope

The line is whether the change alters a claim. A change that alters a claim is logged. A change that does not is not, because a log padded with typo fixes hides the corrections that matter.

Table caption: How each class of change is handled.

| The change | How it is handled |
| --- | --- |
| A statement of fact that is wrong: a figure, a date, a name, a definition, a source, or a claim in structured data | Corrected on the page and logged here with both dates, what was published, and what changed. |
| A claim that is accurate but reads as more than the evidence behind it supports | Narrowed to the claim the evidence carries, and logged. Overstating is an error even when every number in the sentence is right. |
| A number whose method, sample, or date range was described incompletely | The description is completed and logged. The figure stands only if the completed description still supports it. |
| A typo, a broken link, a formatting fault, or a rewording that alters no claim | Fixed without an entry. |

## How to report an error.

Eyebrow: Reporting An Error

Use the contact form and select Other. Include enough that the claim can be checked without a reply first.

- The address of the page
- The sentence, figure, or table cell in question
- What you believe is correct
- How you know, where that can be shared

Every report gets one of three answers: the claim is corrected, the claim stands and the reason is given, or the claim comes off the page while it is checked.

A report that produces no answer is a failure of this policy rather than a decision under it.

CTA: Open the contact form

## Dated, described, and left visible.

Eyebrow: How A Correction Is Recorded

A corrected page carries the correction rather than a clean version of itself. The entry states what was published, not only what replaced it, so a reader can see the claim that was wrong.

Each entry records the date the claim was published, the date it was corrected, what was wrong, and what changed. Where a figure was revised, both figures appear.

Structured data is in scope. A claim a visitor never reads but a machine can read is still a published claim, and the oldest entry below is one of those.

Where a published Hendricks figure is contradicted by someone running the same design, the contradiction is published here beside the original figure. That case is the reason this page exists.

## Corrections to date.

Eyebrow: Log

Seven entries, newest first. The log does not reconstruct changes made before this page existed.

### Incomplete release metadata and audit disclosures in The Answer Index v2026.09.1 data package

Published 2026-09-01. Corrected 2026-10-04. Page: The Answer Index.

What was published: Data package v2026.09.1, exact DOI 10.5281/zenodo.22242103, shipped without complete release and citation metadata, described probe completion without cleanly separating 1,920 planned probes from 1,919 measured probes, did not ship the 11 google.com retrieval-plumbing events excluded from the analytic corpus, and did not explicitly state that no independent browser-screenshot control was run or preserved for the Google AI Overview figures.

What was wrong: The analytic corpus and reported findings were unchanged, but the package did not expose a complete audit trail for its exclusion or state the browser-control limitation as plainly as the evidence required. Under this policy, an incomplete method or limitation description is a correction even when the published analytic totals remain unchanged.

What changed: On 2026-10-04, Hendricks published data package v2026.09.2 under exact DOI 10.5281/zenodo.23132107. It adds complete release and citation metadata, distinguishes planned from measured probes, ships excluded-cite-events.csv with all 11 retrieval-plumbing events, and makes the missing browser-screenshot control explicit. No question, captured observation, source classification, analytic table, reported finding, panel version, or panel hash changed. The v2026.09.1 record remains preserved at its exact DOI.

### A Google AI Overviews reading produced by a parser that discarded rendered panels, on the Hendricks Selection Baseline

Published 2026-08-19. Corrected 2026-09-01. Page: Hendricks Selection Baseline.

What was published: The study read Google AI Overviews as citing a source on 1 of its 13 measured cells in the 2026-08-19 run, findings 02 and 03 built conclusions on that reading, and the first correction to the page stated that the reading it draws from that number was unchanged.

What was wrong: The probe bailed out of any overview panel the vendor flagged as asynchronously rendered, discarding usable panels, so the engine read as nearly silent when it was not. The archived run the first correction pointed to was itself read through the defective parser, which is why this entry exists on a page that had already been corrected once for the same engine. The probe’s own source now records the defect and the fix: treating the asynchronous flag alone as absence had discarded fully usable answers.

What changed: The published counts stand as records of what the defective instrument read, and the conclusions built on them are corrected inline on the page: the most-answers-cited-nothing headline now holds for ChatGPT rather than for all three engines, the averaging argument now rests on the two engines that were read correctly, and the sentence in the earlier correction claiming the reading was unchanged is withdrawn by name. Corroboration rather than cause: corpus run run-2026-09-01T022903Z, taken after the parser fix, reads Google AI Overviews citing on 430 of 462 rendered panels at 6.8 sources per rendered panel.

### An engine-contribution reading resting on the same discarded panels, on Who Gets Cited in AI Answers

Published 2026-08-19. Corrected 2026-09-01. Page: Who Gets Cited in AI Answers.

What was published: Finding 03 read Google AI Overviews as supplying 6 domains across 6 slots and concluded that almost the entire citation set in the run came from one engine.

What was wrong: The same parser defect: asynchronously rendered overview panels were discarded, so the engine’s contribution describes the defect rather than the engine.

What changed: The counts stand as a record of the instrument; the almost-everything-from-one-engine conclusion came off, and the finding now carries the corrected reading inline with the run id of the corroborating corpus, run-2026-09-01T022903Z, which reads the engine citing on 430 of 462 rendered panels.

### A stability reading of 1.00 that was the parser defect agreeing with itself, on Two Runs, Same Questions

Published 2026-08-19. Corrected 2026-09-01. Page: Two Runs, Same Questions.

What was published: Finding 04 reported Google AI Overviews returning an identical citation set on its one comparable cell, an overlap of 1.00, and finding 01 reported agreement on whether a cell cited across all 51 comparable cells.

What was wrong: Twelve Google AI Overviews cells read as empty in both runs because the parser discarded asynchronously rendered panels in both, so the defect agreed with itself, and the single 1.00 cell was the one panel that escaped it, read twice.

What changed: A scope note on finding 01 and a corrected reading on finding 04 are inline: no Google AI Overviews stability reading exists on that pair of runs. The later corpus rounds, run-2026-09-01T014944Z against run-2026-09-01T022903Z, read that engine’s self-agreement at 0.622 over 201 rendered panels under the fixed parser.

### Figures from a run whose record had been overwritten, on the Hendricks Selection Baseline

Published 2026-08-19. Corrected 2026-08-19. Page: Hendricks Selection Baseline.

What was published: The study published a 2026-08-19 run of 51 cells with all 51 measured, 19 of them citing a source, 248 distinct domains across 305 citation slots, 218 domains cited exactly once, reddit.com in 14 cells, linkedin.com in 10, and Google AI Overviews returning no sourced overview on any of the 17 questions.

What was wrong: Two faults. The figures came from a real three-engine run at 22:54 on 2026-08-18 that carried the 2026-08-19 date, and Hendricks destroyed that run’s result file. The probe named each result file from the client and the date alone, so the scheduled job at 06:16 on 2026-08-19 wrote over it in place. That job queries one engine and carries the alternating engine forward from the day before, so the surviving file held 32 records: 17 Perplexity cells from that morning, 15 ChatGPT cells flagged as carried forward from 2026-08-18, and no Google AI Overviews cells at all. No published figure could be reproduced from any surviving record, which disqualifies it on a page whose value is that a reader can check it. Separately, one figure was wrong on its merits: Google AI Overviews returned one sourced overview of the 17, not none.

What changed: Every 2026-08-19 figure on the study is now read from run 2026-08-19-110930, archived at history/runs/hendricks-2026-08-19-110930.json with its manifest at history/runs/manifest-2026-08-19-110930.json. That run measured 47 of its 51 cells, 20 of them citing a source, across 247 distinct domains and 308 citation slots, and cited hendricks.ai in none of them. Google AI Overviews is reported at 1 of the 13 cells that returned a measurement, the other 4 of its 17 having errored. An answer reported as citing consumer software help pages rested on the destroyed file, cannot be checked against the archive, and came off the page. The 2026-08-18 run is untouched and still reproduces from its own file. The instrument changed as well: every run now writes an immutable archive keyed to a run id, plus a manifest recording which engines were queried, which were carried forward from an earlier run, and which were not run at all. Those are three different states and a bare result file cannot tell them apart after the fact.

### A real citation reported as a citation of a page that never existed, on the Hendricks Selection Baseline

Published 2026-08-19. Corrected 2026-08-19. Page: Hendricks Selection Baseline.

What was published: The study said the single hendricks.ai citation in the 2026-08-18 run pointed at an address that had never existed, and counted both runs as zero citations on that basis.

What was wrong: The page was real. Hendricks published it on 2025-11-25, retired it on 2026-08-17 while replacing the site, and Perplexity cited it on 2026-08-18, the day after it came down. Hendricks reached the wrong conclusion by running the history check against the wrong repository. The firm has two retired sites, the check searched the one with 74 registered insight slugs and a different directory layout, did not find the address there, and stopped. The address was in the other retired site, the one belonging to this codebase. The same published sentence also said the address appeared in no list of retired addresses, and it was in that list in this site’s own source at the time.

What changed: The 2026-08-18 run now reports one real citation of a retired page, and the study leads with the fact that an engine cited an article after the firm had deleted it. The 2026-08-19 run still reports zero. The study’s methodology now carries a step requiring that a claim about a Hendricks page is verified against that page, by named repository, branch, and command.

### A third employer in the founder structured data on the About page

Published 2026-08-17. Corrected 2026-08-17. Page: About.

What was published: The Person structured data on the About page listed three organizations under alumniOf: Merkle, Dentsu, and SolarWinds.

What was wrong: The verified career record names Merkle as the single employer of record, and the visible role timeline on the same page named Merkle and SolarWinds only. The third organization existed in the markup and nowhere a reader could see it, which made it a claim about the founder that the page itself did not support.

What changed: Dentsu was removed from alumniOf the same day. A unit test now asserts that every organization in alumniOf also appears in the visible role timeline, so the markup cannot again state an employer the page does not show.

## Honest limitation

**This log begins on the day the page shipped.**

Hendricks kept no public corrections log before this page. Earlier changes to the site are in version control and are not enumerated here, and nothing on this page claims there were none.

The log records corrections to what Hendricks published. It is not a change log for the site, and it is not an audit performed by anyone outside the firm.

## Related

- Methodology: The measurement standards a published Hendricks figure is held to.
- Research: Published Hendricks measurement, with its method, sample, and stated limits.
- About: The founder record the first entry in the log corrects.

## Sources and updates

This page states the Hendricks corrections policy and the corrections made to this site. It reports no third-party research and cites no external source.

Last reviewed 2026-10-04.

## Closing

Found something wrong on this site? Report it, and it gets an answer.

CTA: Submit a correction
