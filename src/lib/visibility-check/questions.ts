import type { Question } from '@/lib/visibility-check/schema'

/**
 * The five buyer questions, built from the visitor's market phrase.
 *
 * Templates rather than a model: a template is published, repeatable and
 * cannot be steered into an arbitrary prompt, which matters when the prompt is
 * relayed to four paid endpoints. The five shapes are five of the ten in The
 * Answer Index panel (panel v2.0, `shapes`), chosen because they are the ones
 * where a provider's own site has a reason to appear: who provides it, how the
 * options compare, what it costs, how to choose, and who is trusted.
 *
 * No brand-name question is asked. "Is {brand} any good?" names the brand in
 * the prompt, so a mention in the answer would measure the prompt rather than
 * the market, and the reading would flatter every brand equally.
 */

export const questionShapes = [
  'provider_discovery',
  'comparison',
  'cost',
  'selection_criteria',
  'trust_credential',
] as const

export type QuestionShape = (typeof questionShapes)[number]

export const shapeLabels: Record<QuestionShape, string> = {
  provider_discovery: 'Who provides it',
  comparison: 'How the options compare',
  cost: 'What it costs',
  selection_criteria: 'How to choose',
  trust_credential: 'Who is trusted',
}

/** Collapses internal whitespace and drops a trailing full stop or question mark. */
function clean(phrase: string): string {
  return phrase.replace(/\s+/g, ' ').replace(/[.?!\s]+$/, '').trim()
}

/**
 * "in Houston" reads well after every template below; "in the United Kingdom"
 * and "in Texas" do too. A location that already starts with a preposition is
 * left alone, so "near Austin" and "across Europe" survive as typed.
 */
function place(location: string | undefined): string {
  if (!location) return ''
  const cleaned = clean(location)
  if (cleaned.length === 0) return ''
  return /^(in|near|across|around|throughout|for)\s/i.test(cleaned) ? ` ${cleaned}` : ` in ${cleaned}`
}

export function buildQuestions(market: string, location?: string): Question[] {
  const m = clean(market)
  const where = place(location)

  /**
   * Every template keeps the market phrase as the object of "of" or the
   * subject of a verb, never as an attributive noun, so a long phrase such as
   * "AI search visibility measurement for B2B brands" still reads as a
   * question a person would type. Measured 2026-09-07: "the leading {m}
   * providers" did not survive that phrase; "the leading providers of {m}" does.
   */
  const texts: Record<QuestionShape, string> = {
    provider_discovery: `Who are the best providers of ${m}${where}?`,
    comparison: `How do the leading providers of ${m}${where} compare?`,
    cost: `How much does ${m} cost${where}?`,
    selection_criteria: `What should I look for when choosing ${m}${where}?`,
    trust_credential: `Which providers of ${m}${where} are the most trusted, and why?`,
  }

  return questionShapes.map((shape, index) => ({
    id: `q${index + 1}`,
    shape,
    text: texts[shape],
  }))
}
