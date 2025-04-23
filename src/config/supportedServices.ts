
export const SUPPORTED_SERVICES = {
  GA4: 'ga4',
  HUBSPOT: 'hubspot',
  STRIPE: 'stripe',
  SENDGRID: 'sendgrid'
} as const

export type SupportedService = typeof SUPPORTED_SERVICES[keyof typeof SUPPORTED_SERVICES]
