// Fake persistence for the demo: the "database" lives in localStorage and the session in sessionStorage.
// Both fail gracefully (private mode, blocked storage) by falling back to in-memory seed data.
import { useState } from 'preact/hooks';
import { buildSeed, DB_VERSION, DEMO_ACCOUNTS, type Agent, type DemoAccount, type DemoDb, type Localized, type Permission } from './data';
import type { Lang } from '@/i18n';

const DB_KEY = 'vl-demo-db';
const SESSION_KEY = 'vl-demo-session';

export interface Session {
  kind: DemoAccount['kind'];
  refId: string;
}

export function loadDb(): DemoDb {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const db = JSON.parse(raw) as DemoDb;
      if (db.version === DB_VERSION) return db;
    }
  } catch {
    /* fall through to seed */
  }
  return buildSeed();
}

export function saveDb(db: DemoDb) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    /* demo keeps working in memory */
  }
}

export function resetDb(): DemoDb {
  try {
    localStorage.removeItem(DB_KEY);
  } catch {
    /* ignore */
  }
  return buildSeed();
}

/** Preact hook: current db plus an updater that persists every change. */
export function useDb() {
  const [db, setDb] = useState<DemoDb>(loadDb);
  const update = (fn: (draft: DemoDb) => DemoDb) =>
    setDb((prev) => {
      const next = fn(structuredClone(prev));
      saveDb(next);
      return next;
    });
  const reset = () => setDb(resetDb());
  return { db, update, reset };
}

export function login(email: string, password: string): DemoAccount | null {
  const acc = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password);
  if (!acc) return null;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ kind: acc.kind, refId: acc.refId } satisfies Session));
  } catch {
    /* ignore */
  }
  return acc;
}

export function getSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function logout() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

// ---- formatting helpers ----

export const loc = (v: Localized, lang: Lang) => v[lang];

export const fullName = (a: Pick<Agent, 'firstName' | 'lastName'>) => `${a.firstName} ${a.lastName}`;

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const locale = (lang: Lang) => (lang === 'en' ? 'en-US' : 'es-BO');

export const money = (n: number, lang: Lang) =>
  new Intl.NumberFormat(locale(lang), { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

export const date = (isoDate: string, lang: Lang) =>
  new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(isoDate));

export const weekdayShort = (day: number, lang: Lang) =>
  new Intl.DateTimeFormat(locale(lang), { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 0, 7 + day)));

export const todayIso = () => new Date().toISOString().slice(0, 10);

/** Upcoming (not yet paid) payments, soonest first. */
export const upcoming = (a: Agent) => a.payments.filter((p) => p.status !== 'paid' && p.date >= todayIso()).sort((x, y) => x.date.localeCompare(y.date));

export const can = (db: DemoDb, role: keyof DemoDb['rolePermissions'], p: Permission) => db.rolePermissions[role].includes(p);
