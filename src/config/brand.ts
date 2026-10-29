// Client-specific facts shared by every language. Swap this file (plus the
// @theme tokens in global.css and the dictionaries in src/i18n) to re-skin
// the template for another client.
export const brand = {
  name: 'Virtual Llama',
  url: 'https://virtuallama.com',
  email: 'businessinquiries@virtuallama.com',
  phone: '+1 (828) 390-1922',
  phoneHref: 'tel:+18283901922',
  // TODO: confirm the client's WhatsApp number.
  whatsapp: 'https://wa.me/18283901922',
  // TODO: replace with the client's real profiles.
  socials: [
    { name: 'Instagram', href: '#', icon: 'instagram' },
    { name: 'Facebook', href: '#', icon: 'facebook' },
    { name: 'LinkedIn', href: '#', icon: 'linkedin' },
  ],
} as const;
