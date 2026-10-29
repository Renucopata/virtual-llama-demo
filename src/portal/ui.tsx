// Small shared UI pieces for the demo portal islands.
import type { ComponentChildren } from 'preact';
import { iconPaths } from '@/components/icons';
import { initials } from './store';

export function Icon({ name, class: cls = 'size-5' }: { name: string; class?: string }) {
  return (
    <svg class={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d={iconPaths[name] ?? iconPaths.plus} />
    </svg>
  );
}

export function Avatar({ name, size = 'size-10' }: { name: string; size?: string }) {
  return (
    <span class={`${size} grid shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

const tones = {
  primary: 'bg-primary/10 text-primary',
  lavender: 'bg-lavender/50 text-ink',
  sky: 'bg-sky text-ink',
  amber: 'bg-amber-100 text-amber-900',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-ink/5 text-muted',
};
export type Tone = keyof typeof tones;

export function Badge({ tone, children }: { tone: Tone; children: ComponentChildren }) {
  return <span class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${tones[tone]}`}>{children}</span>;
}

export const statusTone = { active: 'primary', onboarding: 'lavender', inactive: 'gray' } as const;
export const paymentTone = { paid: 'sky', scheduled: 'lavender', pending: 'amber' } as const;
export const docTone = { signed: 'sky', valid: 'sky', pending: 'amber', expired: 'red' } as const;

export function Card({ title, icon, action, children, class: cls = '' }: { title?: string; icon?: string; action?: ComponentChildren; children: ComponentChildren; class?: string }) {
  return (
    <section class={`rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:p-7 ${cls}`}>
      {(title || action) && (
        <header class="mb-5 flex items-center justify-between gap-4">
          <h2 class="flex items-center gap-3 text-lg">
            {icon && (
              <span class="grid size-9 place-items-center rounded-xl bg-ink text-white">
                <Icon name={icon} class="size-5" />
              </span>
            )}
            {title}
          </h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Field({ label, value }: { label: string; value: ComponentChildren }) {
  return (
    <div>
      <dt class="text-xs font-semibold tracking-wide text-muted uppercase">{label}</dt>
      <dd class="mt-1 text-sm text-ink">{value}</dd>
    </div>
  );
}

/** Top bar shared by the agent and admin apps. */
export function AppBar({
  home,
  altHref,
  altLabel,
  userName,
  userMeta,
  logoutLabel,
  onLogout,
}: {
  home: string;
  altHref: string;
  altLabel: string;
  userName: string;
  userMeta: string;
  logoutLabel: string;
  onLogout: () => void;
}) {
  return (
    <>
      <header class="bg-ink text-white">
        <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href={home} aria-label="Virtual Llama">
            <img src="/brand/logo-white.png" alt="Virtual Llama" class="h-9 w-auto" width={1492} height={631} />
          </a>
          <div class="flex items-center gap-3">
            <div class="hidden items-center gap-3 sm:flex">
              <Avatar name={userName} size="size-9" />
              <div class="leading-tight">
                <p class="text-sm font-semibold">{userName}</p>
                <p class="text-xs text-white/60">{userMeta}</p>
              </div>
            </div>
            <a href={altHref} class="rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold tracking-wider uppercase hover:border-white">
              {altLabel}
            </a>
            <button type="button" onClick={onLogout} class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20">
              <Icon name="logout" class="size-4" />
              <span class="hidden sm:inline">{logoutLabel}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

export const inputCls =
  'w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none disabled:bg-ink/5 disabled:text-muted';
