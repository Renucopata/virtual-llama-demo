export type Lang = 'en' | 'es';

export interface Item {
  icon: string;
  title: string;
  text: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'select' | 'textarea';
  required?: boolean;
  autocomplete?: string;
  options?: string[];
  /** Span both columns on wide screens. */
  full?: boolean;
}

export interface ApplyForm {
  title: string;
  lead: string;
  fields: FormField[];
  submit: string;
  success: string;
}

export type ApplyPath = 'agent' | 'company';

export interface Dict {
  meta: { title: string; description: string };
  apply: {
    meta: { title: string; description: string };
    eyebrow: string;
    question: string;
    lead: string;
    choices: Record<ApplyPath, { icon: string; title: string; text: string }>;
    change: string;
    forms: Record<ApplyPath, ApplyForm>;
    sending: string;
    error: string;
    privacy: string;
    back: string;
  };
  nav: { links: { label: string; href: string }[]; cta: string; login: string; menu: string; close: string; switchLang: string };
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
    lead: string;
    cta: string;
    journey: string;
    secondary: string;
    stats: { value: string; label: string }[];
    card: { status: string; caller: string; lines: string[]; footer: string };
  };
  advantages: { eyebrow: string; title: string; lead: string; items: Item[] };
  about: { eyebrow: string; title: string; story: string[]; valuesTitle: string; values: Item[] };
  team: { eyebrow: string; title: string; lead: string; items: Item[] };
  services: { eyebrow: string; title: string; lead: string; items: (Item & { bullets: string[] })[]; cta: string };
  industries: { eyebrow: string; title: string; lead: string; items: Item[] };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  contact: {
    eyebrow: string;
    title: string;
    lead: string;
    form: {
      name: string;
      company: string;
      email: string;
      phone: string;
      service: string;
      serviceOptions: string[];
      message: string;
      submit: string;
      sending: string;
      success: string;
      error: string;
      privacy: string;
    };
    hoursLabel: string;
    hours: string;
    emailLabel: string;
    emailNote: string;
    phoneLabel: string;
  };
  footer: { tagline: string; socials: string; rights: string };
  whatsapp: string;
}
