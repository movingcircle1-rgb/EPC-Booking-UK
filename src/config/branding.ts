export const brandConfig = {
  companyName: 'EPC Booking UK',
  tagline: 'Book Your EPC Certificate Online',
  description:
    'Fast local EPC appointments with qualified energy assessors, clear pricing and digital certificate delivery.',
  name: 'EPC Booking UK',

  logo: {
    primary: '/epc-booking-logo.png',
    footer: '/epc-booking-logo.png',
    alt: 'EPC Booking UK',
  },

  contact: {
    phone: '',
    phoneSecondary: '',
    phoneHref: '',
    phoneSecondaryHref: '',
    email: '',
    emailHref: '',
    address: {
      street: '',
      city: '',
      postcode: '',
      country: 'UK',
    },
  },

  social: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    tiktok: '',
    youtube: '',
    pinterest: '',
  },

  theme: {
    primary: '#1F3447',
    primaryHover: '#1F3447',
    primaryDark: '#1F3447',
    secondary: '#2F4E63',
    bg1: '#F4F6F7',
    bg2: '#E8EEF1',
    text: '#17212B',
    accent: '#be0e0c',
  },

  seo: {
    title: 'EPC Booking UK | Book EPC Certificates Online',
    description:
      'Book your EPC certificate online. Fast local appointments, clear pricing and digital certificate delivery.',
    keywords:
      'EPC certificate, book EPC online, domestic EPC, landlord EPC, energy performance certificate',
    siteUrl: '',
  },

  footer: {
    copyrightText:
      '© ' +
      new Date().getFullYear() +
      ' EPC Booking UK. All Rights Reserved.',
  },
};

export type BrandConfig = typeof brandConfig;
export const branding = brandConfig;
