export const brandConfig = {
  companyName: 'National',
  tagline: 'Professional Services Across the UK',
  description:
    'Flexible service platform for multiple business types, locations and future expansion.',
  name: 'National',

  logo: {
    primary: '/National Removal header.png',
    footer: '/National removal footer.png',
    alt: 'National',
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
    primary: '#e71c5e',
    primaryHover: '#c91852',
    primaryDark: '#a01545',
    secondary: '#949494',
    bg1: '#949494',
    bg2: '#e1e1e1',
    text: '#293132',
    accent: '#e71c5e',
  },

  seo: {
    title: 'National | Professional Services',
    description: 'Flexible service platform for multiple business types across the UK.',
    keywords: 'national, services, uk business, locations',
    siteUrl: '',
  },

  footer: {
    copyrightText:
      '© ' +
      new Date().getFullYear() +
      ' National. All Rights Reserved.',
  },
};

export type BrandConfig = typeof brandConfig;
export const branding = brandConfig;
