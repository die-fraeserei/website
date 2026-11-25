// Single source of truth for business / contact details.
// Used by the footer, the contact section, the Impressum and the Datenschutzerklärung.
//
// TODO(owner): replace every value marked TODO with the real data before going live.
// The Impressum is legally required (§ 5 DDG) and must be complete and correct.

export const BUSINESS = {
  name: 'Die Fräserei',
  owner: 'Michael Hartmann Lihs',
  street: 'Jesinger Hauptstr. 132',
  postalCode: '72070',
  city: 'Tübingen',
  country: 'Deutschland',
  region: '',
  email: 'michael.lihs@mailbox.org', // TODO: confirm the address exists
  phone: '0170 1968 533', // TODO: e.g. '+49 123 456789' or keep null to hide it
  // Optional legal details – set to null if not applicable.
  vatId: 'DE438867671', // USt-IdNr. (§ 27a UStG), e.g. 'DE123456789'
  smallBusinessNote: null as string | null, // e.g. 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.'
} as const;

export const phoneHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, '')}`;
