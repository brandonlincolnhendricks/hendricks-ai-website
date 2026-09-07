# 21 - The AI Visibility Check

## 1. What it is

The free instrument Brandon asked for on 2026-09-07. A visitor enters a brand, a website, a market phrase, an optional location, a name and an email. The site asks Google AI Overviews, ChatGPT, Perplexity and Gemini five buyer questions built from the market phrase, in one capture, and shows a reading: whether each of the twenty answers named the brand, cited the website, or did neither, plus the domains the answers cited instead. Brandon receives an email with the reading and the contact, and a row lands in the CRM sheet.

Two entry points. The homepage station `#ai-visibility-check` is one website field that GETs to `/ai-visibility-check?site=`. The route itself carries the full form, the reading, and the copy that explains the three states, which is what makes the page worth indexing on its own.

## 2. Where the code is

| Concern | File |
|---|---|
| Input contract and result types | `src/lib/visibility-check/schema.ts` |
| The five question templates | `src/lib/visibility-check/questions.ts` |
| Mention, citation, summary and the reading sentence | `src/lib/visibility-check/scoring.ts` |
| The four DataForSEO adapters and parsers | `src/lib/visibility-check/engines.ts` |
| One run: twenty parallel probes | `src/lib/visibility-check/run.ts` |
| Spend ceilings | `src/lib/visibility-check/limits.ts` |
| Email, sheet, webhook, visitor copy | `src/lib/visibility-check/delivery.ts` |
| The server action | `src/lib/visibility-check/actions.ts` |
| The form island and the reading | `src/components/visibility/` |
| The route | `src/app/(marketing)/ai-visibility-check/` |
| Copy | `src/content/pages/ai-visibility-check.ts`, mirrored in `content/pages/31-ai-visibility-check.md` |
| Sheets adapter and row layouts | `src/lib/crm/google-sheets.ts`, `src/lib/crm/rows.ts` |

The engine adapters are a port of `~/claudecode/answer-index/collector/engines.py`, itself vendored from the client checker on 2026-08-31. The two parser rules that matter (Gemini grounding redirects resolved from the title; AI Overviews read on both the card list and the inline links) are kept verbatim and pinned by `tests/unit/visibility-check.test.ts`. If the collector changes its parser, change this port in the same pass or the page's claim that it uses "the same citation parser as The Answer Index" stops being true.

## 3. Cost and ceilings

One run is twenty probes. At 2026-09 list prices, read from the API's own `cost` field on the Answer Index capture:

| Engine | Per probe | Per run (5) |
|---|---|---|
| ChatGPT, gpt-4.1 with web search | $0.070 | $0.35 |
| Gemini 2.5 Flash with web search | $0.037 | $0.19 |
| Perplexity sonar | $0.006 | $0.03 |
| Google SERP advanced with AI Overview | $0.002 | $0.01 |
| Total | | about $0.58, up to $0.70 with retries the vendor bills |

Three ceilings, all in `limits.ts` and the environment:

- Three runs per visitor per UTC day, keyed on the same hashed identifier the lead forms use.
- `VISIBILITY_CHECK_DAILY_CAP` runs per UTC day across the whole site, default 40. Forty runs is about $28. Raise it in Vercel when the DataForSEO balance can carry it.
- A ten-minute duplicate bucket on email plus website, so a double submit cannot buy the same twenty probes twice.

Without a shared store (`RATE_LIMIT_REDIS_URL`) every ceiling is per instance, which is a floor rather than a ceiling. The lead forms accept the same degradation. The DataForSEO balance itself is the hard stop: at zero every cell fails and the reading says so.

## 4. Environment

Set in Vercel, production and preview. Never commit or print a value.

| Variable | Purpose |
|---|---|
| `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD` | The probe transport. Without them the form renders and every run returns the unavailable state. |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | `website-crm-sheets@hendricks-ai-prod.iam.gserviceaccount.com`. No project role; its only access is the writer share on the sheet. |
| `GOOGLE_SHEETS_PRIVATE_KEY` | The PEM from the key file, base64 encoded. |
| `CRM_SHEET_ID` | The spreadsheet id. The sheet has two tabs, `Leads` and `Visibility Checks`, whose header rows are the contract `src/lib/crm/rows.ts` writes against. |
| `VISIBILITY_CHECK_DAILY_CAP` | Runs per UTC day. |
| `VISIBILITY_CHECK_SEND_VISITOR_COPY` | `true` sends the visitor their reading by email. Off until an applicant-facing message is approved (DR-95). |
| `RESEND_API_KEY`, `LEAD_FROM_EMAIL`, `LEAD_NOTIFICATION_EMAIL` | Already set for the lead forms; the check reuses them. |

Rotating the sheet key: mint a new key on the service account in the Google Cloud console (IAM, service accounts, keys), replace `GOOGLE_SHEETS_PRIVATE_KEY`, redeploy, delete the old key. Nothing else changes.

## 5. What the visitor sees

1. The form, under the answer-first block. Six fields, the Diagnostic application's notice at collection verbatim, the optional marketing box unchecked.
2. On submit, the button reads "Asking four systems", a pending line says most runs take one to three minutes, and an elapsed clock runs. The browser waits for the action; without JavaScript it waits the same way and gets the same page back.
3. The reading: one sentence with every denominator and the run time; a five by four table of words (Cited, Mentioned, Absent, Not cited, No panel, Not measured); the legend; the five questions; who was cited instead, ranked by cells; the evidence rule; what happens next; the Diagnostic CTA.

The Google AI Overviews column never reads "Mentioned": the panel text is not read for a name, because the vendor's AIO payload has been wrong on presence in both directions on this account. The legend says so on the page.

## 6. What Brandon sees

An email from `LEAD_FROM_EMAIL` to `LEAD_NOTIFICATION_EMAIL`, reply-to set to the visitor, subject `AI Visibility Check: <brand> (<domain>), cited X of N`, with the contact, the reading sentence, the five questions, the grid as text, who was cited instead, the cost, and the attribution.

A row in the `Visibility Checks` tab with the same data, `Status` set to `New`, `Owner` and `Notes` blank, and the full result as JSON in the last column. The three lead forms now also write a row to the `Leads` tab on every submission, so the sheet is the one pipeline record.

## 7. Failure modes, in the order they were designed against

- DataForSEO down, credentials wrong, or the account's IP allowlist rejecting Vercel (task 40207, seen on the first preview run 2026-09-07): every cell fails. The email still goes out (subject "cited 0 of 0") and the row still lands with reading `unmeasured`, so the lead is kept; the visitor is told the engines did not answer and can retry in an hour. Check the DataForSEO balance and the allowlist at app.dataforseo.com/api-access first. Vercel functions have no fixed egress IP, so the allowlist must be off for the check to run in production.
- One engine slow: its cells time out at 170 seconds and are excluded from every denominator; the other fifteen cells read normally.
- Sheet append fails: logged with the request id, the email still goes out, the reading still shows. Check that the sheet is still shared with the service account and the key is not deleted.
- Email fails: logged, the row still lands. Check the Resend domain.
- Both fail: logged as "reached no durable destination" with the request id. The reading was shown. The visitor was not told anything went wrong, because nothing they care about did.

## 8. Changing the questions

The templates are in `questions.ts` and pinned by a unit test. Adding a sixth question raises every run's cost by a fifth and changes every denominator on the page and in the email, so the copy that says "five questions" and "twenty cells" changes with it. Do not add a brand-name question: it names the brand in the prompt, so a mention would measure the prompt rather than the market.

## 9. Running it locally

`next start` in Next 16 does not load `.env.local`, and `vercel env pull` returns every sensitive value as an empty string, so a local run needs the file filled from local sources and exported into the shell:

```
vercel env pull .env.local --environment=production --yes
# Every sensitive value arrives empty, so fill these five by hand:
#   DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD   from ~/.zshenv
#   GOOGLE_SHEETS_CLIENT_EMAIL               client_email in the key file below
#   GOOGLE_SHEETS_PRIVATE_KEY                base64 of private_key in
#                                            ~/.config/mcp-credentials/website-crm-sheets.json
#   CRM_SHEET_ID                             the spreadsheet id
# Then delete the VERCEL_*, NX_* and TURBO_* lines: VERCEL_ENV=production
# without NEXT_PUBLIC_VERCEL_ENV=production makes every route throw by design.
set -a; source .env.local; set +a
pnpm build && pnpm start --port 3200
```

Delete `.env.local` when you are done rather than parking it. A filled copy in
the working tree is a service-account key sitting beside the code, and on
2026-09-07 one leaked into the Playwright build and wrote forty rows to the
live Leads tab.

`playwright.config.ts` blanks every paid and durable channel for the e2e server, so the suite cannot spend or write rows even with the file present, but a stray `next build` for any other purpose would still read it.
