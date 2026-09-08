import { PrimaryCta } from '@/components/ui/cta'
import { DataTable, type DataTableColumn, type DataTableRow } from '@/components/ui/data-table'
import { TwoTone } from '@/components/ui/two-tone'
import { results as copy } from '@/content/pages/ai-visibility-check'
import { shapeLabels, type QuestionShape } from '@/lib/visibility-check/questions'
import {
  engineIds,
  engineNames,
  type Cell,
  type VisibilityCheckResult,
} from '@/lib/visibility-check/schema'

/**
 * The reading, rendered in place of the form once a run completes.
 *
 * Plain React with no hooks so the same markup renders on the server for a
 * form posted without JavaScript and inside the client island for one posted
 * with it. Every state is a word in a table cell, never a colour: the site
 * rule that no evidence class travels by hue alone applies to a result grid
 * more than anywhere.
 */

function cellWord(cell: Cell | undefined): string {
  if (!cell || cell.status === 'failed') return copy.cellWords.failed
  if (cell.cited) return copy.cellWords.cited
  if (cell.mentioned) return copy.cellWords.mentioned
  if (cell.engine === 'google_aio') {
    return cell.panel === 'none' ? copy.cellWords.noPanel : copy.cellWords.notCited
  }
  return copy.cellWords.absent
}

export function VisibilityCheckResults({
  result,
  id,
}: {
  result: VisibilityCheckResult
  id?: string
}) {
  const columns: DataTableColumn[] = [
    { key: 'question', header: copy.columns.question, rowHeader: true },
    ...engineIds.map((engine) => ({ key: engine, header: engineNames[engine] })),
  ]

  const rows: DataTableRow[] = result.questions.map((question) => ({
    question: `${question.id.toUpperCase()}. ${shapeLabels[question.shape as QuestionShape] ?? question.shape}`,
    ...Object.fromEntries(
      engineIds.map((engine) => [
        engine,
        cellWord(result.cells.find((cell) => cell.engine === engine && cell.questionId === question.id)),
      ]),
    ),
  }))

  const s = result.summary

  return (
    <div id={id} tabIndex={-1} role="region" aria-labelledby="results-title" className="done vresults">
      <p className="text-eyebrow text-ink-2">{copy.eyebrow}</p>
      <h2 id="results-title" className="text-h2 text-ink">
        {copy.title}
      </h2>

      <p className="text-lead reading-sentence measure-wide text-ink">{s.sentence}</p>

      <p className="text-coordinate mt-4 text-ink-2">
        {result.brandName} / {result.domain} / {result.requestId}
      </p>

      <DataTable
        caption={copy.gridCaption}
        captionVisible
        columns={columns}
        rows={rows}
        className="mt-8"
      />

      <ul className="vlegend text-caption mt-5 text-ink-2" aria-label="Cell legend">
        {copy.legend.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <h3 className="text-h3 mt-10 text-ink">{copy.questionsHeading}</h3>
      <ol className="olist mt-4" aria-label={copy.questionsHeading}>
        {result.questions.map((question, index) => (
          <li key={question.id}>
            <span className="n" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            {question.text}
          </li>
        ))}
      </ol>

      <h3 className="text-h3 mt-10 text-ink">{copy.topDomainsHeading}</h3>
      <p className="measure-wide mt-3 text-ink-2">{copy.topDomainsLead}</p>
      {s.topDomains.length > 0 ? (
        <ol className="olist mt-4" aria-label={copy.topDomainsHeading}>
          {s.topDomains.map((entry, index) => (
            <li key={entry.domain}>
              <span className="n" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              {entry.domain}
              <span className="text-coordinate ml-3 text-ink-2">
                {entry.cells} of {s.citedDenominator}
                {entry.owned ? ', your domain' : ''}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-ink-2">{copy.noDomains}</p>
      )}

      <TwoTone sentence={copy.rule} className="text-lead mt-10 max-w-[58ch]" />

      <h3 className="text-h3 mt-10 text-ink">{copy.next.title}</h3>
      <p className="measure-wide mt-3 text-ink-2">{copy.next.body}</p>

      <div className="cta-row mt-8">
        <PrimaryCta cta={copy.primaryCta} />
        <PrimaryCta cta={copy.secondaryCta} variant="secondary" />
      </div>
    </div>
  )
}
