import { describe, expect, it } from 'vitest'

import { emailDomain, isBusinessEmail } from '@/lib/forms/business-email'
import { isRandomString, looksLikeGibberish } from '@/lib/forms/gibberish'
import { leadInputSchema } from '@/lib/forms/lead-schema'
import { visibilityCheckInputSchema } from '@/lib/visibility-check/schema'

describe('business email rule', () => {
  it('rejects consumer and disposable mailboxes, including dotted Gmail variants', () => {
    for (const email of [
      'w.o.zu.d.ig.2.3.5@gmail.com',
      'Someone@GMAIL.com',
      'a@googlemail.com',
      'a@outlook.com',
      'a@hotmail.com',
      'a@yahoo.com',
      'a@icloud.com',
      'a@proton.me',
      'a@mailinator.com',
      'a@mail.yahoo.com',
    ]) {
      expect(isBusinessEmail(email), email).toBe(false)
    }
  })

  it('accepts company domains', () => {
    for (const email of ['brandon@hendricks.ai', 'name@company.com', 'ops@fuseworkspace.com']) {
      expect(isBusinessEmail(email), email).toBe(true)
    }
  })

  it('reads the domain after the last @', () => {
    expect(emailDomain('a@b@Example.COM')).toBe('example.com')
    expect(emailDomain('no-at-sign')).toBe('')
  })
})

describe('random-string fill', () => {
  it('flags the bot values seen on 2026-09-27', () => {
    for (const value of ['rAiwZymmdTABxHwSjTW', 'GRXJLcpwcOrptSCRljxvE', 'kHHMXRFjWCtEhFwLtLmcwoUi']) {
      expect(isRandomString(value), value).toBe(true)
    }
  })

  it('leaves real answers alone', () => {
    for (const value of [
      'HubSpot',
      'BigQuery',
      'Head of Growth',
      'Commercial HVAC maintenance',
      'Salesforce',
      'Marketingdirector',
    ]) {
      expect(isRandomString(value), value).toBe(false)
    }
  })

  it('needs two such fields before calling it a bot', () => {
    expect(looksLikeGibberish(['rAiwZymmdTABxHwSjTW', 'A real sentence here.'])).toBe(false)
    expect(looksLikeGibberish(['rAiwZymmdTABxHwSjTW', 'GRXJLcpwcOrptSCRljxvE'])).toBe(true)
  })
})

describe('schemas enforce the business email rule', () => {
  const lead = {
    formName: 'contact',
    audienceType: 'brand',
    firstName: 'Ada',
    lastName: 'Lovelace',
    organization: 'Example Co',
    primaryQuestion: 'Why are competitors entering the shortlist and we are not?',
    currentStack: '',
    desiredTiming: '',
    additionalContext: '',
    primaryMarket: '',
    role: '',
    marketingOptIn: false,
    honeypot: '',
    startedAt: 1_756_000_000_000,
  }

  it('lead forms', () => {
    const blocked = leadInputSchema.safeParse({ ...lead, workEmail: 'w.o.zu.d.ig.2.3.5@gmail.com' })
    expect(blocked.success).toBe(false)
    expect(blocked.error?.issues[0]?.path[0]).toBe('workEmail')
    expect(leadInputSchema.safeParse({ ...lead, workEmail: 'ada@company.com' }).success).toBe(true)
  })

  it('AI Visibility Check', () => {
    const check = {
      brandName: 'Example',
      website: 'example.com',
      market: 'commercial HVAC maintenance',
      location: '',
      name: 'Ada Lovelace',
      marketingOptIn: false,
      honeypot: '',
      startedAt: 1_756_000_000_000,
    }
    expect(visibilityCheckInputSchema.safeParse({ ...check, workEmail: 'ada@gmail.com' }).success).toBe(false)
    expect(visibilityCheckInputSchema.safeParse({ ...check, workEmail: 'ada@company.com' }).success).toBe(true)
  })
})
