# Free AI Visibility Check

## Route

`/ai-visibility-check`

## SEO

**Title:** Free AI Visibility Check: Is Your Brand in the Answer? | Hendricks

**Description:** Enter a website and a market. Hendricks asks the AI systems it observes five buyer questions in one run and reports whether your brand was named or cited, with the denominator and the run time.

**H1:** Is your brand in the answer?

**Eyebrow:** Free AI Visibility Check

## Primary objective

Give a visitor a real, denominated reading of their brand's visibility across the four observed systems in one run, record the contact for follow-up, and route the qualified ones to the Search Intelligence Diagnostic. Requested by Brandon Lincoln Hendricks 2026-09-07. Rows V1 to V4 in `CONTENT_VERIFICATION.md`.

## Lead

**Claim:** One run, five buyer questions, twenty answers.

**Continuation:** The reading shows whether your brand was named or cited, who was cited instead, and how far that is from being chosen.

## Direct answer

**Eyebrow:** What this check does

The AI Visibility Check asks five questions a buyer in your market would ask, in one capture, to every AI system Hendricks observes, and records whether each answer named your brand, cited your website as a source, or did neither. It uses the same engine adapters and the same citation parser as The Answer Index, the Hendricks research corpus. Every count is reported with its denominator and its run time. It measures the first rung of the selection journey, visibility, and nothing above it: whether the brand was understood, considered, or recommended is a different measurement.

Hendricks observes four systems: Google AI Overviews, ChatGPT, Perplexity, and Gemini.

Every count on this page (five questions, twenty answers) is computed in `src/content/pages/ai-visibility-check.ts` from the question list and the observed-systems list, never typed.

## The check

Anchor: `#check`

**Eyebrow:** The Check

## Describe what you sell the way a customer would ask for it.

The five questions are built from that phrase and shown with the result. Hendricks pays for the twenty probes.

**Fieldset, Your market:** Brand name (required; hint: The name a customer would say, for example Hendricks, not Hendricks Agency LLC.) · Website (required) · What you sell, in a customer’s words (required; hint: For example: commercial HVAC maintenance, or CRM software for small law firms.) · Where you sell it (optional; hint: Optional. A city, region, or country, for example Houston or the United Kingdom. Leave blank for a national market.)

**Fieldset, Where to send the follow-up:** Your name (required) · Work email (required)

**Marketing opt-in and notice at collection:** the Diagnostic application's approved sentences, verbatim (`legal/01`).

**Submit:** Run the check

**Submitting:** Collecting answers

**Pending:** Twenty answers are being collected in one capture. Most runs take between one and three minutes, because the ChatGPT endpoint is the slowest. Keep this page open.

**Errors:** The check did not run. · Check the fields listed below, then run it again. · This connection has used its three free runs for today. Try again in about N minutes, or apply for a Diagnostic. · The free check has reached its daily limit. Hendricks pays for every run, so the limit is a real one. Try again tomorrow, or apply for a Diagnostic. · The check is not available right now. Try again later, or apply for a Diagnostic. · A check for this website was already run from this address in the last ten minutes. Its reading was shown on screen at the time; wait ten minutes to run it again. · The check could not be run. Please try again.

## Your reading

Rendered in place of the form once a run completes.

**Eyebrow:** Your Reading

## What the engines returned.

The reading sentence, built from the run: brand, cited count of cited denominator, named count of mention denominator, cells measured of cells total, run time in UTC. Then a table, caption "Five questions, one row each, and one column per observed system. Each cell is one answer, captured once.", questions down and one column per observed system across, each cell one of Cited, Mentioned, Absent, Not cited, No panel, Not measured.

Legend:

- Cited: your website appeared as a source in the answer.
- Mentioned: the answer named the brand and did not link to your site.
- Absent: the answer neither named the brand nor cited your site.
- Not cited and No panel: Google AI Overviews reports citations only, so a name in its panel text is not read.
- Not measured: the system did not return an answer inside the run, and the cell is excluded from every denominator.

**The questions that were asked:** the five questions, numbered, each with its shape.

**Who was cited instead:** The domains the answers linked to, ranked by how many of the measured cells cited them. These are the sources the engines trusted for your market in this run. Empty state: No answer in this run cited a source.

**Evidence rule:** Absence is not yet a diagnosis. A single answer screen is one observation under one set of conditions.

**What happens next:** Hendricks reviews every reading by hand and follows up by email with what these twenty cells do and do not support. If the gap is worth closing, the next step is the Search Intelligence Diagnostic.

**Primary CTA:** Start with a Search Intelligence Diagnostic. Destination `/diagnostic`.

**Secondary CTA:** Run another check. Destination `/ai-visibility-check`.

## How to read it

Anchor: `#reading`

**Eyebrow:** How To Read It

## Three states, and what each one is not.

| State | What it means | Note |
|---|---|---|
| Absent | The answer neither named the brand nor cited the website. | Absence is not yet a diagnosis. |
| Mentioned | The answer named the brand and linked elsewhere. The engine knows the name and trusts another source for the claim. | A brand mention is not the same as consideration. |
| Cited | The answer linked to the website as a source. The page did work in the answer, which is the condition every rung above depends on. | Visibility, the first rung. |

AI-mediated results can vary by context, wording, location, platform, and time. Hendricks therefore measures controlled intent contexts and repeated outcomes, not one pretend universal ranking.

## What it does not measure

Anchor: `#scope`

**Eyebrow:** Scope

## What this check does not measure.

1. Whether the answer represented the brand accurately.
2. Whether the brand was presented as a legitimate option or actively favored.
3. Whether the reading holds across repeated runs, locations, or wordings. This is one capture under one set of conditions.
4. Why an engine retrieved what it retrieved. Hendricks does not claim access to a model’s hidden reasoning.
5. A name inside a Google AI Overview panel. That surface is read for citations only.

**Scope, from the shared module:** Hendricks observes four systems: Google AI Overviews, ChatGPT, Perplexity, and Gemini. Hendricks does not measure, test, monitor, or report on Google AI Mode or Microsoft Copilot.

## Questions people ask

Anchor: `#questions`

**Eyebrow:** Questions People Ask

## Before you run it.

### Why five questions and not fifty?

Five questions on every observed system is twenty paid probes, which is what a free check can carry. It is enough to show whether a brand is in the answer set at all, and who is. It is not enough to rank anything, which is why the reading never produces a score.

### Why did the reading change when I ran it again?

Answers move. In The Answer Index, Perplexity re-asked the same questions 38 minutes later agreed with itself at a mean overlap of 0.900 and Google AI Overviews at 0.622. Two runs that differ are two observations, not a contradiction, and a Diagnostic measures the stability itself rather than one screen.

### Which systems does it cover?

Hendricks observes four systems: Google AI Overviews, ChatGPT, Perplexity, and Gemini. Hendricks does not measure, test, monitor, or report on Google AI Mode or Microsoft Copilot.

### Is it really free, and what does Hendricks get?

It is free. Hendricks pays for the twenty probes. In return Hendricks receives your contact details and the reading, and follows up by email. There is no obligation, no automated sequence, and no recurring email unless you select the optional box.

### How is this different from an AI visibility tool?

A tool runs a prompt set on a schedule and reports appearances. This is one run of five questions through the parser Hendricks uses in its own research, read by a person. Which of the two a budget should buy is a separate decision, and it has its own page.

**Link:** Do you need an AI visibility tool or a partner? Destination `/ai-visibility-tool-or-partner`.

## Closing

**Eyebrow:** Find the Gap

## The check shows whether you appeared. The Diagnostic shows why.

**Lead, claim:** Twenty cells say where the brand is missing.

**Lead, continuation:** The Search Intelligence Diagnostic measures the full journey across controlled contexts and repeated runs, and produces the roadmap.

**Primary CTA:** Start with a Search Intelligence Diagnostic. Destination `/diagnostic`.

**Link:** Read the Hendricks Measurement Methodology. Destination `/methodology`.

## Structured data

`WebPage` with breadcrumb only. No `FAQPage`, no `Offer`, no `SoftwareApplication`, no rating.
