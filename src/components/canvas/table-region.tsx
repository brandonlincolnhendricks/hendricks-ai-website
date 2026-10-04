import type { ReactNode } from 'react'

import { plateChrome } from '@/content/shared/chrome'

export type TableColumn = {
  key: string
  header: string
  /** Renders as a row header rather than a cell. Use for the identifying column. */
  rowHeader?: boolean
}

export type TableRow = Record<string, ReactNode>

/**
 * A table inside a labelled, keyboard reachable scroll region (canvas
 * `_canvas.css` section 15).
 *
 * Rows are separated by hairlines: no zebra fill, no cell border and no outer
 * box. The region carries `role="region"`, its caption as an accessible name
 * and `tabindex="0"`, so a wide table scrolls inside its own box and is
 * reachable from the keyboard rather than being silently clipped.
 *
 * The caption is always rendered. A table whose caption is only an accessible
 * name leaves a sighted reader to infer what the columns are counting, and D-E
 * treats that inference as lost text.
 *
 * The scroll hint under the region is `aria-hidden`: a keyboard or screen
 * reader user reaches the region through its own name and role, and the hint is
 * for the reader who can see the table clipped and cannot tell that it moves.
 */
export function TableRegion({
  caption,
  columns,
  rows,
}: {
  caption: string
  columns: readonly TableColumn[]
  rows: readonly TableRow[]
}) {
  return (
    <>
      <div className="tablewrap" role="region" aria-label={caption} tabIndex={0}>
        <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) =>
                column.rowHeader ? (
                  <th key={column.key} scope="row">
                    {row[column.key]}
                  </th>
                ) : (
                  <td key={column.key}>{row[column.key]}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <p aria-hidden="true" className="text-caption mt-2 text-ink-2">
        {plateChrome.scrollHint}
      </p>
    </>
  )
}
