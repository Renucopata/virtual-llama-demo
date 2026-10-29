import { useState } from 'preact/hooks';
import type { Lang } from '@/i18n';
import { fmt, type PortalDict } from '@/i18n/portal';
import { DEMO_ACCOUNTS } from './data';
import { login } from './store';
import { Avatar, Badge, Icon, inputCls } from './ui';

interface Props {
  lang: Lang;
  t: PortalDict;
  paths: { home: string; agent: string; admin: string };
}

export default function LoginApp({ t, paths }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: Event) => {
    e.preventDefault();
    const acc = login(email, password);
    if (!acc) return setError(true);
    location.href = acc.kind === 'agent' ? paths.agent : paths.admin;
  };

  return (
    <div class="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <form onSubmit={submit} class="rounded-3xl bg-white p-6 shadow-xl shadow-ink/5 ring-1 ring-ink/5 sm:p-10">
        <span class="grid size-12 place-items-center rounded-2xl bg-ink text-white">
          <Icon name="lock" class="size-6" />
        </span>
        <h1 class="mt-6 text-5xl">{t.login.title}</h1>
        <p class="mt-2 text-sm text-muted">{t.login.lead}</p>

        <label class="mt-8 grid gap-1.5 text-sm">
          <span>{t.login.email}</span>
          <input type="email" required autocomplete="username" value={email} onInput={(e) => (setEmail(e.currentTarget.value), setError(false))} class={inputCls} />
        </label>
        <label class="mt-4 grid gap-1.5 text-sm">
          <span>{t.login.password}</span>
          <input
            type="password"
            required
            autocomplete="current-password"
            value={password}
            onInput={(e) => (setPassword(e.currentTarget.value), setError(false))}
            class={inputCls}
          />
        </label>
        {error && (
          <p class="mt-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800" role="alert">
            {t.login.error}
          </p>
        )}
        <button type="submit" class="btn-primary mt-6 w-full justify-center">
          {t.login.submit}
          <Icon name="arrow" class="size-4" />
        </button>
        <a href={paths.home} class="mt-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <Icon name="arrow" class="size-4 rotate-180" />
          {t.login.back}
        </a>
      </form>

      <aside class="rounded-3xl bg-ink p-6 text-white sm:p-10">
        <p class="eyebrow text-lavender">{t.login.demoTitle}</p>
        <p class="mt-3 text-sm text-white/70">{fmt(t.login.demoHint, { password: DEMO_ACCOUNTS[0].password })}</p>
        <ul class="mt-6 space-y-3">
          {DEMO_ACCOUNTS.map((acc) => (
            <li key={acc.email}>
              <button
                type="button"
                onClick={() => (setEmail(acc.email), setPassword(acc.password), setError(false))}
                class="flex w-full items-center gap-4 rounded-2xl bg-white/5 p-4 text-left ring-1 ring-white/10 transition hover:bg-white/10 hover:ring-lavender"
              >
                <Avatar name={acc.label} />
                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-semibold">{acc.label}</span>
                  <span class="block truncate text-xs text-white/60">{acc.email}</span>
                </span>
                <Badge tone={acc.kind === 'agent' ? 'sky' : 'lavender'}>{acc.kind === 'agent' ? t.login.agent : t.login.admin}</Badge>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
