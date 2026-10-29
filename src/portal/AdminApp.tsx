import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Lang } from '@/i18n';
import { fmt, type PortalDict } from '@/i18n/portal';
import { BONUS, PERMISSIONS, ROLES, SALARY, type Agent, type AgentStatus, type DemoDb, type Payment, type PaymentStatus, type Permission, type Role } from './data';
import { can, date, fullName, getSession, loc, logout, money, todayIso, upcoming, useDb } from './store';
import { AppBar, Avatar, Badge, Card, Icon, inputCls, paymentTone, statusTone } from './ui';

interface Props {
  lang: Lang;
  t: PortalDict;
  paths: { home: string; login: string; alt: string };
}

type Tab = 'overview' | 'people' | 'roles' | 'fields';
const TABS: { id: Tab; icon: string }[] = [
  { id: 'overview', icon: 'grid' },
  { id: 'people', icon: 'users' },
  { id: 'roles', icon: 'shield' },
  { id: 'fields', icon: 'sliders' },
];
const STATUSES: AgentStatus[] = ['active', 'onboarding', 'inactive'];
const PAY_STATUSES: PaymentStatus[] = ['paid', 'scheduled', 'pending'];
const WEEK = [1, 2, 3, 4, 5, 6, 0];

export default function AdminApp({ lang, t, paths }: Props) {
  const session = getSession();
  const { db, update, reset } = useDb();
  const me = session?.kind === 'admin' ? db.admins.find((u) => u.id === session.refId) : undefined;
  const [tab, setTab] = useState<Tab>('overview');
  const [editing, setEditing] = useState<{ agent: Agent; isNew: boolean } | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!me) location.replace(paths.login);
  }, [me]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  if (!me) return <p class="p-10 text-center text-muted">{t.common.loading}</p>;

  const perm = (p: Permission) => can(db, me.role, p);
  const A = t.admin;

  return (
    <>
      <AppBar
        home={paths.home}
        altHref={paths.alt}
        altLabel={lang === 'en' ? 'ES' : 'EN'}
        userName={me.name}
        userMeta={t.common.roles[me.role]}
        logoutLabel={t.common.logout}
        onLogout={() => (logout(), (location.href = paths.login))}
      />

      <main class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 class="text-5xl">{A.title}</h1>
            <p class="mt-1 text-sm text-muted">{fmt(t.common.signedInAs, { name: me.name, role: t.common.roles[me.role] })}</p>
          </div>
          <button type="button" onClick={reset} class="text-xs text-muted underline-offset-4 hover:text-ink hover:underline">
            {t.common.reset}
          </button>
        </div>

        <nav class="mt-8 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1.5 ring-1 ring-ink/5" aria-label={A.title}>
          {TABS.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setTab(x.id)}
              class={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === x.id ? 'bg-ink text-white' : 'text-muted hover:bg-paper hover:text-ink'}`}
              aria-current={tab === x.id ? 'page' : undefined}
            >
              <Icon name={x.icon} class="size-4" />
              {A.tabs[x.id]}
            </button>
          ))}
        </nav>

        <div class="mt-6">
          {tab === 'overview' && <Overview db={db} t={t} lang={lang} />}
          {tab === 'people' && (
            <People
              db={db}
              t={t}
              lang={lang}
              canEdit={perm('profiles.edit')}
              canExport={perm('export')}
              onEdit={(agent, isNew) => setEditing({ agent: structuredClone(agent), isNew })}
              onExported={() => setToast(A.exported)}
            />
          )}
          {tab === 'roles' && <Roles db={db} t={t} lang={lang} canManage={perm('roles.manage')} update={update} />}
          {tab === 'fields' && <Fields db={db} t={t} lang={lang} canEdit={perm('profiles.edit')} update={update} />}
        </div>
      </main>

      {editing && (
        <AgentEditor
          key={editing.agent.id}
          initial={editing.agent}
          isNew={editing.isNew}
          db={db}
          t={t}
          lang={lang}
          canEditProfile={perm('profiles.edit')}
          canEditPayments={perm('payments.edit')}
          onClose={() => setEditing(null)}
          onSave={(agent) => {
            update((d) => {
              const i = d.agents.findIndex((x) => x.id === agent.id);
              if (i >= 0) d.agents[i] = agent;
              else d.agents.unshift(agent);
              return d;
            });
            setEditing(null);
          }}
        />
      )}

      {toast && (
        <div class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm text-white shadow-xl" role="status">
          {toast}
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------- Overview

function Overview({ db, t, lang }: { db: DemoDb; t: PortalDict; lang: Lang }) {
  const A = t.admin;
  const today = todayIso();
  const limit = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  const working = db.agents.filter((a) => a.status !== 'inactive');
  const next = db.agents
    .flatMap((a) => upcoming(a).map((p) => ({ agent: a, p })))
    .filter(({ p }) => p.date >= today && p.date <= limit)
    .sort((x, y) => x.p.date.localeCompare(y.p.date));
  const byClient = db.clients
    .map((c) => ({ c, n: working.filter((a) => a.clientId === c.id).length }))
    .sort((x, y) => y.n - x.n);
  const max = Math.max(1, ...byClient.map((x) => x.n));
  const payday = next[0]?.p.date;
  const paydayItems = next.filter((x) => x.p.date === payday);

  const kpis = [
    { label: A.kpiActive, value: String(db.agents.filter((a) => a.status === 'active').length), icon: 'users' },
    { label: A.kpiOnboarding, value: String(db.agents.filter((a) => a.status === 'onboarding').length), icon: 'user' },
    {
      label: A.kpiUpcoming,
      value: money(paydayItems.reduce((s, x) => s + x.p.amount, 0), lang),
      note: payday ? fmt(A.kpiUpcomingNote, { date: date(payday, lang), count: paydayItems.length }) : undefined,
      icon: 'dollar',
    },
    { label: A.kpiPayroll, value: money(working.reduce((s, a) => s + a.monthlySalary, 0), lang), icon: 'chart' },
  ];

  return (
    <div class="grid gap-6">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} class={`rounded-3xl p-6 ${i === 0 ? 'bg-ink text-white' : 'bg-white ring-1 ring-ink/5'}`}>
            <div class="flex items-center justify-between">
              <p class={`text-xs font-semibold tracking-wide uppercase ${i === 0 ? 'text-white/60' : 'text-muted'}`}>{k.label}</p>
              <Icon name={k.icon} class={`size-5 ${i === 0 ? 'text-lavender' : 'text-primary'}`} />
            </div>
            <p class="mt-3 font-display text-5xl tracking-wide">{k.value}</p>
            {k.note && <p class="mt-1 text-xs text-muted">{k.note}</p>}
          </div>
        ))}
      </div>

      <div class="grid gap-6 lg:grid-cols-5">
        <Card title={A.byClient} icon="building" class="lg:col-span-2">
          <ul class="grid gap-4">
            {byClient.map(({ c, n }) => (
              <li key={c.id}>
                <div class="flex items-baseline justify-between gap-3 text-sm">
                  <span class="font-semibold text-ink">{c.name}</span>
                  <span class="font-display text-2xl text-ink">{n}</span>
                </div>
                <p class="text-xs text-muted">{loc(c.industry, lang)}</p>
                <div class="mt-2 h-2 rounded-full bg-paper">
                  <div class="h-2 rounded-full bg-primary" style={{ width: `${(n / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={A.upcomingTitle} icon="calendar" class="lg:col-span-3">
          <ul class="divide-y divide-ink/5">
            {next.slice(0, 8).map(({ agent, p }) => (
              <li key={p.id} class="flex items-center gap-3 py-3">
                <Avatar name={fullName(agent)} size="size-9" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-ink">{fullName(agent)}</p>
                  <p class="text-xs text-muted">{date(p.date, lang)}</p>
                </div>
                <Badge tone={paymentTone[p.status]}>{t.common.paymentStatus[p.status]}</Badge>
                <span class="w-24 text-right text-sm font-semibold">{money(p.amount, lang)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- People (directory + search + export)

function People({
  db,
  t,
  lang,
  canEdit,
  canExport,
  onEdit,
  onExported,
}: {
  db: DemoDb;
  t: PortalDict;
  lang: Lang;
  canEdit: boolean;
  canExport: boolean;
  onEdit: (a: Agent, isNew: boolean) => void;
  onExported: () => void;
}) {
  const A = t.admin;
  const [q, setQ] = useState('');
  const [client, setClient] = useState('');
  const [status, setStatus] = useState('');
  const clientName = (id: string) => db.clients.find((c) => c.id === id)?.name ?? '';

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return db.agents.filter((a) => {
      if (client && a.clientId !== client) return false;
      if (status && a.status !== status) return false;
      if (!needle) return true;
      return [fullName(a), a.email, a.city, loc(a.position, lang), clientName(a.clientId)].join(' ').toLowerCase().includes(needle);
    });
  }, [db, q, client, status, lang]);

  const exportXlsx = async () => {
    const { default: writeExcelFile } = await import('write-excel-file/browser');
    const bold = (value: string) => ({ value, fontWeight: 'bold' as const });
    const header = [A.colName, t.agent.email, t.agent.phone, t.agent.city, A.colPosition, A.colClient, A.colStatus, t.agent.startDate, A.colSalary, A.colNextPay, t.agent.amount, ...db.customFields.map((f) => loc(f.label, lang))].map(bold);
    const data = rows.map((a) => {
      const next = upcoming(a)[0];
      return [
        fullName(a),
        a.email,
        a.phone,
        a.city,
        loc(a.position, lang),
        clientName(a.clientId),
        t.common.agentStatus[a.status],
        a.startDate,
        a.monthlySalary,
        next?.date ?? null,
        next?.amount ?? null,
        ...db.customFields.map((f) => a.custom[f.id] ?? null),
      ];
    });
    await writeExcelFile([header, ...data]).toFile(`virtual-llama-team-${todayIso()}.xlsx`);
    onExported();
  };

  return (
    <Card>
      <div class="flex flex-wrap items-center gap-3">
        <label class="relative min-w-[16rem] flex-1">
          <span class="sr-only">{A.search}</span>
          <Icon name="search" class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
          <input type="search" value={q} onInput={(e) => setQ(e.currentTarget.value)} placeholder={A.search} class={`${inputCls} pl-10`} />
        </label>
        <select value={client} onChange={(e) => setClient(e.currentTarget.value)} class={`${inputCls} w-auto!`} aria-label={A.colClient}>
          <option value="">{A.allClients}</option>
          {db.clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.currentTarget.value)} class={`${inputCls} w-auto!`} aria-label={A.colStatus}>
          <option value="">{A.allStatuses}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t.common.agentStatus[s]}
            </option>
          ))}
        </select>
        {canExport && (
          <button type="button" onClick={exportXlsx} class="btn-ghost py-2.5">
            <Icon name="download" class="size-4" />
            {A.export}
          </button>
        )}
        {canEdit && (
          <button type="button" onClick={() => onEdit(blankAgent(db), true)} class="btn-primary py-2.5">
            <Icon name="plus" class="size-4" />
            {A.add}
          </button>
        )}
      </div>

      <p class="mt-5 text-xs text-muted">{fmt(A.results, { count: rows.length })}</p>
      <div class="mt-2 overflow-x-auto">
        <table class="w-full min-w-[52rem] text-left text-sm">
          <thead class="text-xs text-muted uppercase">
            <tr class="border-b border-ink/10">
              <th class="py-2 font-semibold">{A.colName}</th>
              <th class="py-2 font-semibold">{A.colPosition}</th>
              <th class="py-2 font-semibold">{A.colClient}</th>
              <th class="py-2 font-semibold">{A.colStatus}</th>
              <th class="py-2 text-right font-semibold">{A.colSalary}</th>
              <th class="py-2 text-right font-semibold">{A.colNextPay}</th>
              <th class="py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => {
              const next = upcoming(a)[0];
              return (
                <tr key={a.id} class="cursor-pointer border-b border-ink/5 hover:bg-paper" onClick={() => onEdit(a, false)}>
                  <td class="py-3">
                    <div class="flex items-center gap-3">
                      <Avatar name={fullName(a)} size="size-9" />
                      <div class="min-w-0">
                        <p class="font-semibold text-ink">{fullName(a)}</p>
                        <p class="text-xs text-muted">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-3">{loc(a.position, lang)}</td>
                  <td class="py-3">{clientName(a.clientId)}</td>
                  <td class="py-3">
                    <Badge tone={statusTone[a.status]}>{t.common.agentStatus[a.status]}</Badge>
                  </td>
                  <td class="py-3 text-right font-semibold whitespace-nowrap">{money(a.monthlySalary, lang)}</td>
                  <td class="py-3 text-right whitespace-nowrap">{next ? date(next.date, lang) : t.common.noValue}</td>
                  <td class="py-3 text-right">
                    <span class="inline-grid size-8 place-items-center rounded-full text-muted hover:bg-white hover:text-ink" aria-label={t.common.edit}>
                      <Icon name={canEdit ? 'edit' : 'eye'} class="size-4" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p class="py-10 text-center text-sm text-muted">{A.noResults}</p>}
      </div>
    </Card>
  );
}

function blankAgent(db: DemoDb): Agent {
  const ref = db.agents[0];
  return {
    id: `a${Date.now()}`,
    firstName: '',
    lastName: '',
    email: '',
    phone: '+591 ',
    city: 'La Paz',
    address: '',
    birthDate: '2000-01-01',
    nationalId: '',
    emergencyContact: { name: '', phone: '', relation: { en: '', es: '' } },
    position: ref.position,
    clientId: db.clients[0].id,
    shiftDays: [1, 2, 3, 4, 5],
    shiftStart: '09:00',
    shiftEnd: '18:00',
    startDate: todayIso(),
    status: 'onboarding',
    monthlySalary: 850,
    bankAccount: '',
    payments: [],
    documents: [],
    custom: {},
  };
}

// ---------------------------------------------------------------- Create / edit profile & payments

function AgentEditor({
  initial,
  isNew,
  db,
  t,
  lang,
  canEditProfile,
  canEditPayments,
  onClose,
  onSave,
}: {
  initial: Agent;
  isNew: boolean;
  db: DemoDb;
  t: PortalDict;
  lang: Lang;
  canEditProfile: boolean;
  canEditPayments: boolean;
  onClose: () => void;
  onSave: (a: Agent) => void;
}) {
  const A = t.admin;
  const [a, setA] = useState<Agent>(initial);
  const set = <K extends keyof Agent>(k: K, v: Agent[K]) => setA((x) => ({ ...x, [k]: v }));
  const setPay = (id: string, patch: Partial<Payment>) => setA((x) => ({ ...x, payments: x.payments.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const positions = useMemo(() => [...new Map(db.agents.map((x) => [x.position.en, x.position])).values()], [db]);
  const canSave = canEditProfile || canEditPayments;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, []);

  const text = (label: string, k: 'firstName' | 'lastName' | 'email' | 'phone' | 'city' | 'address' | 'nationalId' | 'bankAccount', type: 'text' | 'email' | 'tel' = 'text') => (
    <label class="grid gap-1.5 text-sm">
      <span>{label}</span>
      {/* Cast: Preact's input typings can't take a union for `type`. */}
      <input type={type as 'text'} value={a[k]} disabled={!canEditProfile} required={k === 'firstName' || k === 'lastName' || k === 'email'} onInput={(e) => set(k, e.currentTarget.value)} class={inputCls} />
    </label>
  );

  return (
    <div
      class="fixed inset-0 z-50 flex justify-end bg-ink/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isNew ? A.newTitle : fmt(A.editTitle, { name: fullName(initial) })}
    >
      <form
        class="flex h-full w-full max-w-2xl flex-col bg-paper shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => (e.preventDefault(), onSave(a))}
      >
        <header class="flex items-center justify-between gap-4 bg-ink px-6 py-5 text-white">
          <div class="flex items-center gap-3">
            <Avatar name={fullName(a).trim() || '?'} />
            <h2 class="text-lg text-white">{isNew ? A.newTitle : fmt(A.editTitle, { name: fullName(initial) })}</h2>
          </div>
          <button type="button" onClick={onClose} class="grid size-9 place-items-center rounded-full hover:bg-white/10" aria-label={t.common.cancel}>
            <Icon name="close" class="size-5" />
          </button>
        </header>

        <div class="flex-1 space-y-8 overflow-y-auto px-6 py-6">
          {!canEditProfile && (
            <p class="flex items-center gap-2 rounded-xl bg-lavender/40 px-4 py-3 text-sm text-ink">
              <Icon name="lock" class="size-4" />
              {A.readOnly}
            </p>
          )}

          <section>
            <h3 class="text-sm">{A.profileSection}</h3>
            <div class="mt-3 grid gap-4 sm:grid-cols-2">
              {text(A.firstName, 'firstName')}
              {text(A.lastName, 'lastName')}
              {text(t.agent.email, 'email', 'email')}
              {text(t.agent.phone, 'phone', 'tel')}
              {text(t.agent.city, 'city')}
              {text(t.agent.nationalId, 'nationalId')}
              <div class="sm:col-span-2">{text(t.agent.address, 'address')}</div>
              <label class="grid gap-1.5 text-sm">
                <span>{t.agent.birthDate}</span>
                <input type="date" value={a.birthDate} disabled={!canEditProfile} onInput={(e) => set('birthDate', e.currentTarget.value)} class={inputCls} />
              </label>
              {text(t.agent.bank, 'bankAccount')}
            </div>
          </section>

          <section>
            <h3 class="text-sm">{A.jobSection}</h3>
            <div class="mt-3 grid gap-4 sm:grid-cols-2">
              <label class="grid gap-1.5 text-sm">
                <span>{t.agent.position}</span>
                <select
                  value={a.position.en}
                  disabled={!canEditProfile}
                  onChange={(e) => set('position', positions.find((p) => p.en === e.currentTarget.value) ?? a.position)}
                  class={inputCls}
                >
                  {positions.map((p) => (
                    <option key={p.en} value={p.en}>
                      {loc(p, lang)}
                    </option>
                  ))}
                </select>
              </label>
              <label class="grid gap-1.5 text-sm">
                <span>{t.agent.client}</span>
                <select value={a.clientId} disabled={!canEditProfile} onChange={(e) => set('clientId', e.currentTarget.value)} class={inputCls}>
                  {db.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label class="grid gap-1.5 text-sm">
                <span>{t.agent.status}</span>
                <select value={a.status} disabled={!canEditProfile} onChange={(e) => set('status', e.currentTarget.value as AgentStatus)} class={inputCls}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t.common.agentStatus[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label class="grid gap-1.5 text-sm">
                <span>{t.agent.startDate}</span>
                <input type="date" value={a.startDate} disabled={!canEditProfile} onInput={(e) => set('startDate', e.currentTarget.value)} class={inputCls} />
              </label>
              <label class="grid gap-1.5 text-sm">
                <span>{A.shiftStart}</span>
                <input type="time" value={a.shiftStart} disabled={!canEditProfile} onInput={(e) => set('shiftStart', e.currentTarget.value)} class={inputCls} />
              </label>
              <label class="grid gap-1.5 text-sm">
                <span>{A.shiftEnd}</span>
                <input type="time" value={a.shiftEnd} disabled={!canEditProfile} onInput={(e) => set('shiftEnd', e.currentTarget.value)} class={inputCls} />
              </label>
              <fieldset class="sm:col-span-2">
                <legend class="text-sm">{A.shiftDays}</legend>
                <div class="mt-1.5 grid grid-cols-7 gap-2">
                  {WEEK.map((d) => {
                    const on = a.shiftDays.includes(d);
                    const label = new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'es-BO', { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 0, 7 + d)));
                    return (
                      <button
                        key={d}
                        type="button"
                        disabled={!canEditProfile}
                        aria-pressed={on}
                        onClick={() => set('shiftDays', on ? a.shiftDays.filter((x) => x !== d) : [...a.shiftDays, d])}
                        class={`rounded-xl py-2.5 text-xs font-semibold capitalize transition disabled:opacity-60 ${on ? 'bg-ink text-white' : 'bg-white text-muted ring-1 ring-ink/10'}`}
                      >
                        {label.replace('.', '')}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <label class="grid gap-1.5 text-sm">
                <span>{A.salary}</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={a.monthlySalary}
                  disabled={!canEditProfile && !canEditPayments}
                  onInput={(e) => set('monthlySalary', Number(e.currentTarget.value))}
                  class={inputCls}
                />
              </label>
            </div>
          </section>

          <section>
            <div class="flex items-center justify-between gap-4">
              <h3 class="text-sm">{A.paymentsSection}</h3>
              {canEditPayments && (
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  onClick={() =>
                    setA((x) => ({
                      ...x,
                      payments: [{ id: `${x.id}-p${Date.now()}`, date: todayIso(), amount: x.monthlySalary / 2, status: 'scheduled', concept: SALARY }, ...x.payments],
                    }))
                  }
                >
                  <Icon name="plus" class="size-4" />
                  {A.addPayment}
                </button>
              )}
            </div>
            {!canEditPayments && <p class="mt-2 text-xs text-muted">{A.noPaymentsPermission}</p>}
            <ul class="mt-3 space-y-2">
              {a.payments.map((p) => (
                <li key={p.id} class="grid grid-cols-2 items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-ink/5 sm:grid-cols-[9rem_1fr_5.5rem_9.5rem_auto]">
                  <input type="date" value={p.date} disabled={!canEditPayments} onInput={(e) => setPay(p.id, { date: e.currentTarget.value })} class={inputCls} aria-label={t.agent.date} />
                  <select
                    value={p.concept.en === BONUS.en ? 'bonus' : 'salary'}
                    disabled={!canEditPayments}
                    onChange={(e) => setPay(p.id, { concept: e.currentTarget.value === 'bonus' ? BONUS : SALARY })}
                    class={inputCls}
                    aria-label={t.agent.concept}
                  >
                    <option value="salary">{loc(SALARY, lang)}</option>
                    <option value="bonus">{loc(BONUS, lang)}</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={p.amount}
                    disabled={!canEditPayments}
                    onInput={(e) => setPay(p.id, { amount: Number(e.currentTarget.value) })}
                    class={inputCls}
                    aria-label={t.agent.amount}
                  />
                  <select value={p.status} disabled={!canEditPayments} onChange={(e) => setPay(p.id, { status: e.currentTarget.value as PaymentStatus })} class={inputCls} aria-label={t.agent.status}>
                    {PAY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t.common.paymentStatus[s]}
                      </option>
                    ))}
                  </select>
                  {canEditPayments ? (
                    <button
                      type="button"
                      onClick={() => setA((x) => ({ ...x, payments: x.payments.filter((y) => y.id !== p.id) }))}
                      class="grid size-9 place-items-center justify-self-end rounded-full text-muted hover:bg-red-50 hover:text-red-700"
                      aria-label={A.remove}
                    >
                      <Icon name="trash" class="size-4" />
                    </button>
                  ) : (
                    <span />
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 class="text-sm">{A.customSection}</h3>
            <div class="mt-3 grid gap-4 sm:grid-cols-2">
              {db.customFields.map((f) => (
                <label key={f.id} class="grid gap-1.5 text-sm">
                  <span>{loc(f.label, lang)}</span>
                  <input
                    value={a.custom[f.id] ?? ''}
                    disabled={!canEditProfile}
                    onInput={(e) => set('custom', { ...a.custom, [f.id]: e.currentTarget.value })}
                    class={inputCls}
                  />
                </label>
              ))}
            </div>
          </section>
        </div>

        <footer class="flex justify-end gap-3 border-t border-ink/10 bg-white px-6 py-4">
          <button type="button" onClick={onClose} class="btn-ghost py-2.5">
            {t.common.cancel}
          </button>
          {canSave && (
            <button type="submit" class="btn-primary py-2.5">
              {t.common.save}
            </button>
          )}
        </footer>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------- Roles & permissions

function Roles({ db, t, lang, canManage, update }: { db: DemoDb; t: PortalDict; lang: Lang; canManage: boolean; update: (fn: (d: DemoDb) => DemoDb) => void }) {
  const A = t.admin;
  const toggle = (role: Role, p: Permission) =>
    update((d) => {
      const list = d.rolePermissions[role];
      d.rolePermissions[role] = list.includes(p) ? list.filter((x) => x !== p) : [...list, p];
      return d;
    });

  return (
    <div class="grid gap-6">
      {!canManage && (
        <p class="flex items-center gap-2 rounded-xl bg-lavender/40 px-4 py-3 text-sm text-ink">
          <Icon name="lock" class="size-4" />
          {A.noRolesPermission}
        </p>
      )}

      <Card title={A.rolesTitle} icon="users">
        <p class="-mt-2 mb-5 text-sm text-muted">{A.rolesLead}</p>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[36rem] text-left text-sm">
            <thead class="text-xs text-muted uppercase">
              <tr class="border-b border-ink/10">
                <th class="py-2 font-semibold">{A.colUser}</th>
                <th class="py-2 font-semibold">{A.colRole}</th>
                <th class="py-2 text-right font-semibold">{A.colLastLogin}</th>
              </tr>
            </thead>
            <tbody>
              {db.admins.map((u) => (
                <tr key={u.id} class="border-b border-ink/5">
                  <td class="py-3">
                    <div class="flex items-center gap-3">
                      <Avatar name={u.name} size="size-9" />
                      <div>
                        <p class="font-semibold text-ink">{u.name}</p>
                        <p class="text-xs text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-3">
                    <select
                      value={u.role}
                      disabled={!canManage}
                      onChange={(e) =>
                        update((d) => {
                          d.admins = d.admins.map((x) => (x.id === u.id ? { ...x, role: e.currentTarget.value as Role } : x));
                          return d;
                        })
                      }
                      class={`${inputCls} w-auto!`}
                      aria-label={A.colRole}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {t.common.roles[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td class="py-3 text-right whitespace-nowrap">{date(u.lastLogin, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title={A.matrixTitle} icon="shield">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[36rem] text-sm">
            <thead class="text-xs text-muted uppercase">
              <tr class="border-b border-ink/10">
                <th class="py-2 text-left font-semibold" />
                {ROLES.map((r) => (
                  <th key={r} class="px-2 py-2 text-center font-semibold">
                    {t.common.roles[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p} class="border-b border-ink/5">
                  <td class="py-3 text-left font-medium text-ink">{t.common.permissions[p]}</td>
                  {ROLES.map((r) => (
                    <td key={r} class="px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        class="size-4 accent-primary"
                        checked={db.rolePermissions[r].includes(p)}
                        // Super admin always keeps every permission so the demo can't lock itself out.
                        disabled={!canManage || r === 'superadmin'}
                        onChange={() => toggle(r, p)}
                        aria-label={`${t.common.roles[r]}: ${t.common.permissions[p]}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------- Custom profile fields

function Fields({ db, t, lang, canEdit, update }: { db: DemoDb; t: PortalDict; lang: Lang; canEdit: boolean; update: (fn: (d: DemoDb) => DemoDb) => void }) {
  const A = t.admin;
  const [en, setEn] = useState('');
  const [es, setEs] = useState('');

  const add = (e: Event) => {
    e.preventDefault();
    if (!en.trim() || !es.trim()) return;
    update((d) => {
      d.customFields.push({ id: `f${Date.now()}`, label: { en: en.trim(), es: es.trim() } });
      return d;
    });
    setEn('');
    setEs('');
  };

  return (
    <Card title={A.fieldsTitle} icon="sliders">
      <p class="-mt-2 mb-5 text-sm text-muted">{A.fieldsLead}</p>
      <ul class="divide-y divide-ink/5 rounded-2xl bg-paper px-4">
        {db.customFields.map((f) => (
          <li key={f.id} class="flex items-center justify-between gap-4 py-3">
            <div>
              <p class="text-sm font-semibold text-ink">{loc(f.label, lang)}</p>
              <p class="text-xs text-muted">{loc(f.label, lang === 'en' ? 'es' : 'en')}</p>
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={() =>
                  update((d) => {
                    d.customFields = d.customFields.filter((x) => x.id !== f.id);
                    return d;
                  })
                }
                class="grid size-9 place-items-center rounded-full text-muted hover:bg-red-50 hover:text-red-700"
                aria-label={A.remove}
              >
                <Icon name="trash" class="size-4" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {canEdit ? (
        <form onSubmit={add} class="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label class="grid gap-1.5 text-sm">
            <span>{A.fieldLabelEn}</span>
            <input value={en} onInput={(e) => setEn(e.currentTarget.value)} required class={inputCls} />
          </label>
          <label class="grid gap-1.5 text-sm">
            <span>{A.fieldLabelEs}</span>
            <input value={es} onInput={(e) => setEs(e.currentTarget.value)} required class={inputCls} />
          </label>
          <button type="submit" class="btn-primary py-2.5">
            <Icon name="plus" class="size-4" />
            {A.addField}
          </button>
        </form>
      ) : (
        <p class="mt-4 flex items-center gap-2 text-sm text-muted">
          <Icon name="lock" class="size-4" />
          {A.readOnly}
        </p>
      )}
    </Card>
  );
}
