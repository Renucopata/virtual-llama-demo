import { useEffect, useState } from 'preact/hooks';
import type { Lang } from '@/i18n';
import { fmt, type PortalDict } from '@/i18n/portal';
import { date, fullName, getSession, loc, logout, money, upcoming, useDb, weekdayShort } from './store';
import { AppBar, Avatar, Badge, Card, docTone, Field, Icon, paymentTone, statusTone } from './ui';

interface Props {
  lang: Lang;
  t: PortalDict;
  paths: { home: string; login: string; alt: string };
}

const WEEK = [1, 2, 3, 4, 5, 6, 0];

export default function AgentApp({ lang, t, paths }: Props) {
  const session = getSession();
  const { db } = useDb();
  const [toast, setToast] = useState('');
  const agent = session?.kind === 'agent' ? db.agents.find((a) => a.id === session.refId) : undefined;

  useEffect(() => {
    if (!agent) location.replace(paths.login);
  }, [agent]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  if (!agent) return <p class="p-10 text-center text-muted">{t.common.loading}</p>;

  const a = t.agent;
  const client = db.clients.find((c) => c.id === agent.clientId);
  const next = upcoming(agent)[0];
  const name = fullName(agent);

  return (
    <>
      <AppBar
        home={paths.home}
        altHref={paths.alt}
        altLabel={lang === 'en' ? 'ES' : 'EN'}
        userName={name}
        userMeta={loc(agent.position, lang)}
        logoutLabel={t.common.logout}
        onLogout={() => (logout(), (location.href = paths.login))}
      />

      <main class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div class="flex flex-wrap items-center gap-5">
          <Avatar name={name} size="size-16 text-xl" />
          <div>
            <h1 class="text-5xl">{fmt(a.hello, { name: agent.firstName.split(' ')[0] })}</h1>
            <p class="mt-1 text-sm text-muted">{a.lead}</p>
          </div>
          <div class="ml-auto">
            <Badge tone={statusTone[agent.status]}>{t.common.agentStatus[agent.status]}</Badge>
          </div>
        </div>

        <div class="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Personal & contact */}
          <Card title={a.personal} icon="user">
            <dl class="grid gap-4">
              <Field label={a.email} value={<a href={`mailto:${agent.email}`} class="break-all text-primary hover:underline">{agent.email}</a>} />
              <Field label={a.phone} value={agent.phone} />
              <Field label={a.city} value={agent.city} />
              <Field label={a.address} value={agent.address} />
              <div class="grid grid-cols-2 gap-4">
                <Field label={a.birthDate} value={date(agent.birthDate, lang)} />
                <Field label={a.nationalId} value={agent.nationalId} />
              </div>
              <Field
                label={a.emergency}
                value={
                  <>
                    {agent.emergencyContact.name} · {loc(agent.emergencyContact.relation, lang)}
                    <span class="block text-muted">{agent.emergencyContact.phone}</span>
                  </>
                }
              />
            </dl>
          </Card>

          {/* Position, client & schedule */}
          <Card title={a.job} icon="briefcase" class="lg:col-span-2">
            <dl class="grid gap-5 sm:grid-cols-2">
              <Field label={a.position} value={<span class="font-semibold">{loc(agent.position, lang)}</span>} />
              <Field
                label={a.client}
                value={
                  <>
                    <span class="font-semibold">{client?.name}</span>
                    {client && <span class="block text-muted">{loc(client.industry, lang)}</span>}
                  </>
                }
              />
              <Field label={a.startDate} value={date(agent.startDate, lang)} />
              <Field label={a.status} value={t.common.agentStatus[agent.status]} />
            </dl>
            <div class="mt-6 rounded-2xl bg-paper p-5">
              <p class="text-xs font-semibold tracking-wide text-muted uppercase">{a.schedule}</p>
              <div class="mt-3 grid grid-cols-7 gap-2">
                {WEEK.map((d) => {
                  const on = agent.shiftDays.includes(d);
                  return (
                    <div key={d} class={`rounded-xl py-3 text-center text-xs font-semibold capitalize ${on ? 'bg-ink text-white' : 'bg-white text-muted ring-1 ring-ink/5'}`}>
                      {weekdayShort(d, lang).replace('.', '')}
                    </div>
                  );
                })}
              </div>
              <p class="mt-4 flex items-center gap-2 text-sm text-ink">
                <Icon name="clock" class="size-4 text-primary" />
                <span class="font-semibold">
                  {agent.shiftStart} – {agent.shiftEnd}
                </span>
                <span class="text-muted">· {a.timezone}</span>
              </p>
            </div>
          </Card>

          {/* Payments */}
          <Card title={a.pay} icon="dollar" class="lg:col-span-2">
            <div class="grid gap-4 sm:grid-cols-3">
              <div class="rounded-2xl bg-ink p-5 text-white sm:col-span-1">
                <p class="text-xs font-semibold tracking-wide text-white/60 uppercase">{a.nextPayment}</p>
                {next ? (
                  <>
                    <p class="mt-2 font-display text-5xl tracking-wide">{money(next.amount, lang)}</p>
                    <p class="mt-1 text-sm text-lavender">{date(next.date, lang)}</p>
                  </>
                ) : (
                  <p class="mt-2 text-sm text-white/70">{a.noUpcoming}</p>
                )}
              </div>
              <dl class="grid content-center gap-4 rounded-2xl bg-paper p-5 sm:col-span-2 sm:grid-cols-2">
                <Field label={a.monthly} value={<span class="font-semibold">{money(agent.monthlySalary, lang)}</span>} />
                <Field label={a.bank} value={agent.bankAccount} />
              </dl>
            </div>

            <h3 class="mt-7 text-sm">{a.history}</h3>
            <div class="mt-3 overflow-x-auto">
              <table class="w-full min-w-[28rem] text-left text-sm">
                <thead class="text-xs text-muted uppercase">
                  <tr class="border-b border-ink/10">
                    <th class="py-2 font-semibold">{a.date}</th>
                    <th class="py-2 font-semibold">{a.concept}</th>
                    <th class="py-2 text-right font-semibold">{a.amount}</th>
                    <th class="py-2 text-right font-semibold">{a.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {agent.payments.map((p) => (
                    <tr key={p.id} class="border-b border-ink/5">
                      <td class="py-3 whitespace-nowrap">{date(p.date, lang)}</td>
                      <td class="py-3">{loc(p.concept, lang)}</td>
                      <td class="py-3 text-right font-semibold whitespace-nowrap">{money(p.amount, lang)}</td>
                      <td class="py-3 text-right">
                        <Badge tone={paymentTone[p.status]}>{t.common.paymentStatus[p.status]}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* VirtualLlama-defined fields */}
          <Card title={a.custom} icon="sliders">
            <p class="-mt-2 mb-5 text-sm text-muted">{a.customLead}</p>
            <dl class="grid gap-4">
              {db.customFields.map((f) => (
                <Field key={f.id} label={loc(f.label, lang)} value={agent.custom[f.id] || t.common.noValue} />
              ))}
            </dl>
          </Card>

          {/* Documents & contract */}
          <Card title={a.docs} icon="file" class="lg:col-span-3">
            <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {agent.documents.map((d) => (
                <li key={d.id} class="flex items-center gap-3 rounded-2xl bg-paper p-4">
                  <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-primary ring-1 ring-ink/5">
                    <Icon name="file" class="size-5" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold text-ink">{loc(d.name, lang)}</p>
                    <div class="mt-1 flex items-center gap-2">
                      <Badge tone={docTone[d.status]}>{t.common.docStatus[d.status]}</Badge>
                      <span class="text-xs text-muted">{date(d.date, lang)}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setToast(a.downloadDemo)} class="grid size-9 place-items-center rounded-full text-muted hover:bg-white hover:text-ink" aria-label={a.download}>
                    <Icon name="download" class="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </main>

      {toast && (
        <div class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm text-white shadow-xl" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
