// Demo-only sample data for the portal. Everything here is made up; there is no backend.
// Payment dates are generated relative to today so "upcoming payments" always looks current.

export interface Localized {
  en: string;
  es: string;
}

export type AgentStatus = 'active' | 'onboarding' | 'inactive';
export type PaymentStatus = 'paid' | 'scheduled' | 'pending';
export type DocStatus = 'signed' | 'pending' | 'valid' | 'expired';
export type Role = 'superadmin' | 'hr' | 'payroll' | 'viewer';
export type Permission = 'profiles.view' | 'profiles.edit' | 'payments.edit' | 'export' | 'roles.manage';

export interface Client {
  id: string;
  name: string;
  industry: Localized;
}

export interface Payment {
  id: string;
  date: string; // ISO yyyy-mm-dd
  amount: number; // USD
  status: PaymentStatus;
  concept: Localized;
}

export interface AgentDoc {
  id: string;
  name: Localized;
  date: string;
  status: DocStatus;
}

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  birthDate: string;
  nationalId: string;
  emergencyContact: { name: string; phone: string; relation: Localized };
  position: Localized;
  clientId: string;
  /** 0 = Sunday … 6 = Saturday */
  shiftDays: number[];
  shiftStart: string;
  shiftEnd: string;
  startDate: string;
  status: AgentStatus;
  monthlySalary: number; // USD, paid in two halves
  bankAccount: string;
  payments: Payment[];
  documents: AgentDoc[];
  /** Values for VirtualLlama-defined custom fields, keyed by CustomFieldDef.id */
  custom: Record<string, string>;
}

export interface CustomFieldDef {
  id: string;
  label: Localized;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  lastLogin: string;
}

export interface DemoAccount {
  email: string;
  password: string;
  kind: 'agent' | 'admin';
  /** Agent.id or AdminUser.id */
  refId: string;
  label: string;
}

export interface DemoDb {
  version: number;
  clients: Client[];
  agents: Agent[];
  customFields: CustomFieldDef[];
  admins: AdminUser[];
  rolePermissions: Record<Role, Permission[]>;
}

export const DB_VERSION = 1;

export const ROLES: Role[] = ['superadmin', 'hr', 'payroll', 'viewer'];
export const PERMISSIONS: Permission[] = ['profiles.view', 'profiles.edit', 'payments.edit', 'export', 'roles.manage'];

/** Login accounts shown on the demo login page: two agents, two admins. */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: 'maria.quispe@demo.virtuallama.com', password: 'demo123', kind: 'agent', refId: 'a01', label: 'María Quispe' },
  { email: 'diego.rojas@demo.virtuallama.com', password: 'demo123', kind: 'agent', refId: 'a02', label: 'Diego Rojas' },
  { email: 'sofia.aranibar@demo.virtuallama.com', password: 'demo123', kind: 'admin', refId: 'u01', label: 'Sofía Aranibar' },
  { email: 'ricardo.paz@demo.virtuallama.com', password: 'demo123', kind: 'admin', refId: 'u02', label: 'Ricardo Paz' },
];

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Paydays are the 15th and the last day of each month. Returns the `past` previous and `future` next paydays. */
function paydays(today: Date, past: number, future: number): { date: Date; future: boolean }[] {
  const all: Date[] = [];
  for (let m = -4; m <= 3; m++) {
    const y = today.getFullYear();
    const mo = today.getMonth() + m;
    all.push(new Date(Date.UTC(y, mo, 15)), new Date(Date.UTC(y, mo + 1, 0)));
  }
  const t = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const before = all.filter((d) => d.getTime() < t).slice(-past);
  const after = all.filter((d) => d.getTime() >= t).slice(0, future);
  return [...before.map((date) => ({ date, future: false })), ...after.map((date) => ({ date, future: true }))];
}

export const SALARY: Localized = { en: 'Salary (half month)', es: 'Sueldo (quincena)' };
export const BONUS: Localized = { en: 'Performance bonus', es: 'Bono por desempeño' };

function buildPayments(agentId: string, monthly: number, status: AgentStatus, today: Date, bonus = 0): Payment[] {
  if (status === 'inactive') {
    return paydays(today, 6, 0)
      .slice(0, 4)
      .map((p, i) => ({ id: `${agentId}-p${i}`, date: iso(p.date), amount: monthly / 2, status: 'paid', concept: SALARY }));
  }
  const days = status === 'onboarding' ? paydays(today, 1, 2) : paydays(today, 4, 2);
  const list: Payment[] = days.map((p, i) => ({
    id: `${agentId}-p${i}`,
    date: iso(p.date),
    amount: monthly / 2,
    status: p.future ? (i === days.length - 1 ? 'pending' : 'scheduled') : 'paid',
    concept: SALARY,
  }));
  if (bonus) {
    const last = days.filter((d) => !d.future).at(-1);
    if (last) list.push({ id: `${agentId}-bonus`, date: iso(last.date), amount: bonus, status: 'paid', concept: BONUS });
  }
  return list.sort((a, b) => b.date.localeCompare(a.date));
}

const DOCS = {
  contract: { en: 'Employment contract', es: 'Contrato de trabajo' },
  id: { en: 'National ID (copy)', es: 'Cédula de identidad (copia)' },
  nda: { en: 'Confidentiality agreement', es: 'Acuerdo de confidencialidad' },
  policy: { en: 'Remote work policy', es: 'Política de trabajo remoto' },
  degree: { en: 'University degree', es: 'Título universitario' },
  english: { en: 'English certificate', es: 'Certificado de inglés' },
} satisfies Record<string, Localized>;

function buildDocs(agentId: string, startDate: string, status: AgentStatus): AgentDoc[] {
  const pending = status === 'onboarding';
  return [
    { id: `${agentId}-d1`, name: DOCS.contract, date: startDate, status: pending ? 'pending' : 'signed' },
    { id: `${agentId}-d2`, name: DOCS.nda, date: startDate, status: pending ? 'pending' : 'signed' },
    { id: `${agentId}-d3`, name: DOCS.id, date: startDate, status: 'valid' },
    { id: `${agentId}-d4`, name: DOCS.degree, date: startDate, status: 'valid' },
    { id: `${agentId}-d5`, name: DOCS.english, date: startDate, status: agentId === 'a08' ? 'expired' : 'valid' },
    { id: `${agentId}-d6`, name: DOCS.policy, date: startDate, status: pending ? 'pending' : 'signed' },
  ];
}

const POS = {
  cs: { en: 'Bilingual Customer Service Agent', es: 'Agente bilingüe de atención al cliente' },
  appt: { en: 'Appointment Setter', es: 'Agente de agendamiento' },
  lead: { en: 'Lead Qualification Specialist', es: 'Especialista en calificación de prospectos' },
  lead_tl: { en: 'Team Lead', es: 'Líder de equipo' },
  tech: { en: 'Tech Support Agent', es: 'Agente de soporte técnico' },
  intake: { en: 'Client Intake Specialist', es: 'Especialista en admisión de clientes' },
} satisfies Record<string, Localized>;

const REL = {
  mother: { en: 'Mother', es: 'Madre' },
  father: { en: 'Father', es: 'Padre' },
  spouse: { en: 'Spouse', es: 'Cónyuge' },
  sibling: { en: 'Sibling', es: 'Hermano/a' },
} satisfies Record<string, Localized>;

const WEEKDAYS = [1, 2, 3, 4, 5];

type AgentSeed = Omit<Agent, 'payments' | 'documents'> & { bonus?: number };

const AGENTS: AgentSeed[] = [
  {
    id: 'a01', firstName: 'María Fernanda', lastName: 'Quispe', email: 'maria.quispe@demo.virtuallama.com', phone: '+591 712 45 830',
    city: 'La Paz', address: 'Av. 6 de Agosto 2145, Sopocachi', birthDate: '1997-03-14', nationalId: '6845123 LP',
    emergencyContact: { name: 'Rosa Mamani', phone: '+591 715 22 904', relation: REL.mother },
    position: POS.cs, clientId: 'c01', shiftDays: WEEKDAYS, shiftStart: '08:00', shiftEnd: '17:00', startDate: '2025-05-05',
    status: 'active', monthlySalary: 900, bankAccount: 'Banco Unión ···· 4821', bonus: 75,
    custom: { english: 'C1 · EF SET 68', wpm: '72', shirt: 'S', equipment: 'Headset + laptop' },
  },
  {
    id: 'a02', firstName: 'Diego Alejandro', lastName: 'Rojas', email: 'diego.rojas@demo.virtuallama.com', phone: '+591 760 18 337',
    city: 'Cochabamba', address: 'Calle España 482, Zona Central', birthDate: '1995-11-02', nationalId: '5321870 CB',
    emergencyContact: { name: 'Lucía Rojas', phone: '+591 772 90 115', relation: REL.sibling },
    position: POS.appt, clientId: 'c02', shiftDays: [2, 3, 4, 5, 6], shiftStart: '10:00', shiftEnd: '19:00', startDate: '2025-08-18',
    status: 'active', monthlySalary: 820, bankAccount: 'Banco Mercantil ···· 1093',
    custom: { english: 'B2 · EF SET 58', wpm: '64', shirt: 'L', equipment: 'Headset' },
  },
  {
    id: 'a03', firstName: 'Valeria', lastName: 'Mamani', email: 'valeria.mamani@demo.virtuallama.com', phone: '+591 731 66 402',
    city: 'El Alto', address: 'Av. Juan Pablo II 1870', birthDate: '1998-07-21', nationalId: '7790214 LP',
    emergencyContact: { name: 'Pedro Mamani', phone: '+591 720 13 556', relation: REL.father },
    position: POS.lead, clientId: 'c03', shiftDays: WEEKDAYS, shiftStart: '09:00', shiftEnd: '18:00', startDate: '2025-06-02',
    status: 'active', monthlySalary: 950, bankAccount: 'BNB ···· 7710', bonus: 100,
    custom: { english: 'C1 · EF SET 70', wpm: '80', shirt: 'M', equipment: 'Headset + laptop' },
  },
  {
    id: 'a04', firstName: 'Carlos', lastName: 'Gutiérrez', email: 'carlos.gutierrez@demo.virtuallama.com', phone: '+591 778 40 219',
    city: 'Santa Cruz', address: 'Calle Libertad 315, Equipetrol', birthDate: '1991-01-30', nationalId: '4102936 SC',
    emergencyContact: { name: 'Andrea Suárez', phone: '+591 765 30 887', relation: REL.spouse },
    position: POS.lead_tl, clientId: 'c01', shiftDays: WEEKDAYS, shiftStart: '08:00', shiftEnd: '17:00', startDate: '2025-04-14',
    status: 'active', monthlySalary: 1300, bankAccount: 'Banco Ganadero ···· 3348',
    custom: { english: 'C2 · EF SET 76', wpm: '75', shirt: 'L', equipment: 'Headset + laptop + monitor' },
  },
  {
    id: 'a05', firstName: 'Daniela', lastName: 'Vargas', email: 'daniela.vargas@demo.virtuallama.com', phone: '+591 702 88 645',
    city: 'Sucre', address: 'Calle Bolívar 77', birthDate: '1999-09-09', nationalId: '8034517 CH',
    emergencyContact: { name: 'Elena Vargas', phone: '+591 718 44 120', relation: REL.mother },
    position: POS.cs, clientId: 'c05', shiftDays: [0, 1, 2, 3, 4], shiftStart: '12:00', shiftEnd: '21:00', startDate: '2025-09-01',
    status: 'active', monthlySalary: 850, bankAccount: 'Banco Unión ···· 5562',
    custom: { english: 'B2 · EF SET 61', wpm: '69', shirt: 'S', equipment: 'Headset' },
  },
  {
    id: 'a06', firstName: 'Jorge', lastName: 'Choque', email: 'jorge.choque@demo.virtuallama.com', phone: '+591 745 12 908',
    city: 'La Paz', address: 'Calle Murillo 1020, Centro', birthDate: '2000-04-18', nationalId: '9123450 LP',
    emergencyContact: { name: 'Martha Choque', phone: '+591 711 87 336', relation: REL.mother },
    position: POS.tech, clientId: 'c05', shiftDays: WEEKDAYS, shiftStart: '14:00', shiftEnd: '23:00', startDate: '2026-10-13',
    status: 'onboarding', monthlySalary: 880, bankAccount: 'BNB ···· 2207',
    custom: { english: 'B2 · EF SET 60', wpm: '66', shirt: 'M', equipment: 'Pending delivery' },
  },
  {
    id: 'a07', firstName: 'Camila', lastName: 'Torrez', email: 'camila.torrez@demo.virtuallama.com', phone: '+591 790 33 571',
    city: 'Cochabamba', address: 'Av. América 640', birthDate: '1996-12-05', nationalId: '6230498 CB',
    emergencyContact: { name: 'Raúl Torrez', phone: '+591 722 50 904', relation: REL.father },
    position: POS.intake, clientId: 'c04', shiftDays: WEEKDAYS, shiftStart: '08:00', shiftEnd: '17:00', startDate: '2025-07-07',
    status: 'active', monthlySalary: 980, bankAccount: 'Banco Mercantil ···· 8835',
    custom: { english: 'C1 · EF SET 67', wpm: '77', shirt: 'M', equipment: 'Headset + laptop' },
  },
  {
    id: 'a08', firstName: 'Luis Fernando', lastName: 'Mendoza', email: 'luis.mendoza@demo.virtuallama.com', phone: '+591 769 21 448',
    city: 'Santa Cruz', address: 'Av. Banzer 3er anillo', birthDate: '1994-06-27', nationalId: '5689021 SC',
    emergencyContact: { name: 'Carla Mendoza', phone: '+591 777 14 309', relation: REL.sibling },
    position: POS.appt, clientId: 'c02', shiftDays: WEEKDAYS, shiftStart: '10:00', shiftEnd: '19:00', startDate: '2025-04-28',
    status: 'inactive', monthlySalary: 800, bankAccount: 'Banco Ganadero ···· 6610',
    custom: { english: 'B2 · EF SET 55', wpm: '60', shirt: 'L', equipment: 'Returned' },
  },
  {
    id: 'a09', firstName: 'Gabriela', lastName: 'Rocha', email: 'gabriela.rocha@demo.virtuallama.com', phone: '+591 735 70 291',
    city: 'Tarija', address: 'Calle Sucre 250', birthDate: '1998-02-11', nationalId: '7456102 TJ',
    emergencyContact: { name: 'Mónica Rocha', phone: '+591 713 92 664', relation: REL.mother },
    position: POS.cs, clientId: 'c03', shiftDays: [3, 4, 5, 6, 0], shiftStart: '09:00', shiftEnd: '18:00', startDate: '2026-01-12',
    status: 'active', monthlySalary: 860, bankAccount: 'BNB ···· 9184',
    custom: { english: 'C1 · EF SET 66', wpm: '70', shirt: 'S', equipment: 'Headset + laptop' },
  },
  {
    id: 'a10', firstName: 'Andrés', lastName: 'Salazar', email: 'andres.salazar@demo.virtuallama.com', phone: '+591 708 55 136',
    city: 'La Paz', address: 'Av. Arce 2510, San Jorge', birthDate: '1999-10-23', nationalId: '8801347 LP',
    emergencyContact: { name: 'Patricia Salazar', phone: '+591 716 28 450', relation: REL.mother },
    position: POS.lead, clientId: 'c04', shiftDays: WEEKDAYS, shiftStart: '09:00', shiftEnd: '18:00', startDate: '2026-10-20',
    status: 'onboarding', monthlySalary: 920, bankAccount: 'Banco Unión ···· 3076',
    custom: { english: 'C1 · EF SET 69', wpm: '74', shirt: 'M', equipment: 'Pending delivery' },
  },
];

export function buildSeed(today = new Date()): DemoDb {
  return {
    version: DB_VERSION,
    clients: [
      { id: 'c01', name: 'Sunrise Dental Group', industry: { en: 'Healthcare', es: 'Salud' } },
      { id: 'c02', name: 'BlueRidge Home Services', industry: { en: 'Home services', es: 'Servicios para el hogar' } },
      { id: 'c03', name: 'Summit Realty', industry: { en: 'Real estate', es: 'Bienes raíces' } },
      { id: 'c04', name: 'Carolina Legal Partners', industry: { en: 'Legal', es: 'Legal' } },
      { id: 'c05', name: 'Peak Outfitters', industry: { en: 'E-commerce', es: 'Comercio electrónico' } },
    ],
    agents: AGENTS.map(({ bonus, ...a }) => ({
      ...a,
      payments: buildPayments(a.id, a.monthlySalary, a.status, today, bonus),
      documents: buildDocs(a.id, a.startDate, a.status),
    })),
    customFields: [
      { id: 'english', label: { en: 'English certification', es: 'Certificación de inglés' } },
      { id: 'wpm', label: { en: 'Typing speed (WPM)', es: 'Velocidad de tipeo (PPM)' } },
      { id: 'shirt', label: { en: 'T-shirt size', es: 'Talla de polera' } },
      { id: 'equipment', label: { en: 'Company equipment', es: 'Equipo de la empresa' } },
    ],
    admins: [
      { id: 'u01', name: 'Sofía Aranibar', email: 'sofia.aranibar@demo.virtuallama.com', role: 'superadmin', lastLogin: iso(today) },
      { id: 'u02', name: 'Ricardo Paz', email: 'ricardo.paz@demo.virtuallama.com', role: 'hr', lastLogin: iso(today) },
      { id: 'u03', name: 'Ana Lucía Prado', email: 'ana.prado@demo.virtuallama.com', role: 'payroll', lastLogin: '2026-10-21' },
      { id: 'u04', name: 'Marco Antonio Ruiz', email: 'marco.ruiz@demo.virtuallama.com', role: 'viewer', lastLogin: '2026-10-02' },
    ],
    rolePermissions: {
      superadmin: [...PERMISSIONS],
      hr: ['profiles.view', 'profiles.edit', 'export'],
      payroll: ['profiles.view', 'payments.edit', 'export'],
      viewer: ['profiles.view'],
    },
  };
}
