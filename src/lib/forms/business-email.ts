/**
 * The business-email rule for every public form (Brandon, 2026-09-27).
 *
 * Hendricks sells to organizations, and the forms that cost money to answer
 * (the AI Visibility Check buys twenty paid probes per run) were being filled
 * by bots using dotted Gmail variants of one address. A consumer mailbox is
 * free to mint in any quantity, so it proves nothing about the sender; a
 * company domain at least has to exist and be owned.
 *
 * Deliberately a list rather than an MX or reputation lookup: it runs with no
 * network call, so it can sit inside the schema and reject before anything is
 * spent. The list covers the consumer providers that carry nearly all freemail
 * volume and the disposable services bots rotate through. Free of the
 * `server-only` marker so the same rule can be tested directly.
 */

const FREE_EMAIL_DOMAINS = new Set([
  // Google, Microsoft, Yahoo, Apple, AOL
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'hotmail.co.uk',
  'live.com',
  'msn.com',
  'passport.com',
  'yahoo.com',
  'yahoo.co.uk',
  'ymail.com',
  'rocketmail.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'aim.com',
  // Privacy and independent consumer providers
  'proton.me',
  'protonmail.com',
  'pm.me',
  'tutanota.com',
  'tuta.io',
  'hey.com',
  'fastmail.com',
  'zoho.com',
  'mail.com',
  'email.com',
  'gmx.com',
  'gmx.net',
  'gmx.de',
  'web.de',
  'yandex.com',
  'yandex.ru',
  'mail.ru',
  'inbox.ru',
  'bk.ru',
  'list.ru',
  'rambler.ru',
  'qq.com',
  '163.com',
  '126.com',
  'sina.com',
  'naver.com',
  'daum.net',
  // US ISP mailboxes
  'comcast.net',
  'att.net',
  'sbcglobal.net',
  'verizon.net',
  'bellsouth.net',
  'cox.net',
  'charter.net',
  'earthlink.net',
  // Disposable and temporary inboxes
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'sharklasers.com',
  '10minutemail.com',
  'temp-mail.org',
  'tempmail.com',
  'tempmail.net',
  'throwawaymail.com',
  'yopmail.com',
  'getnada.com',
  'trashmail.com',
  'dispostable.com',
  'maildrop.cc',
  'mailnesia.com',
  'fakeinbox.com',
  'emailondeck.com',
  'mohmal.com',
  'burnermail.io',
])

/** The domain part of an address, lowercased, or '' when there is none. */
export function emailDomain(email: string): string {
  const at = email.lastIndexOf('@')
  return at === -1 ? '' : email.slice(at + 1).trim().toLowerCase()
}

/**
 * True when the address sits on a domain an organization owns.
 *
 * Subdomains of a listed provider count as that provider, so a regional or
 * vanity host such as `mail.yahoo.com` is not a way around the rule.
 */
export function isBusinessEmail(email: string): boolean {
  const domain = emailDomain(email)
  if (!domain) return false

  const labels = domain.split('.')
  for (let i = 0; i < labels.length - 1; i += 1) {
    if (FREE_EMAIL_DOMAINS.has(labels.slice(i).join('.'))) return false
  }

  return true
}

export const BUSINESS_EMAIL_MESSAGE =
  'Use your work email address at your company domain. Personal addresses such as Gmail, Outlook, or Yahoo are not accepted.'
