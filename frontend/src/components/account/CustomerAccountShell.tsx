import type { ReactNode } from 'react';

import { Link } from 'react-router-dom';

import { ArrowLeft } from 'lucide-react';

import { cn } from '@/lib/utils';

import { CateringMenuSections } from '@/components/catering/CateringMenuSections';



export type AccountThemeKey = 'apricot' | 'basil' | 'honey';



export interface AccountStat {

  value: string | number;

  label: string;

}



export interface CustomerAccountShellProps {

  eyebrow: string;

  title: string;

  description?: ReactNode;

  action?: ReactNode;

  stats?: AccountStat[];

  backLink?: { to: string; label: string };

  theme?: AccountThemeKey;

  children: ReactNode;

  contentClassName?: string;

  showCateringMenu?: boolean;

}



const THEME: Record<

  AccountThemeKey,

  { stat: string; heroGlow: string; link: string }

> = {

  apricot: {

    stat: 'text-apricot-600',

    heroGlow:

      'radial-gradient(ellipse at 15% 0%, rgba(232,133,58,0.14), transparent 50%), radial-gradient(ellipse at 85% 10%, rgba(212,175,55,0.18), transparent 45%)',

    link: 'text-apricot-700 hover:text-apricot-600',

  },

  basil: {

    stat: 'text-basil-600',

    heroGlow:

      'radial-gradient(ellipse at 20% 0%, rgba(107,155,94,0.1), transparent 45%), radial-gradient(ellipse at 80% 0%, rgba(212,175,55,0.16), transparent 40%)',

    link: 'text-basil-600 hover:text-basil',

  },

  honey: {

    stat: 'text-gold-600',

    heroGlow: 'radial-gradient(ellipse at 50% 0%, rgba(240,215,140,0.35), transparent 55%)',

    link: 'text-gold-700 hover:text-gold-600',

  },

};



export function CustomerAccountShell({

  eyebrow,

  title,

  description,

  action,

  stats,

  backLink,

  theme = 'apricot',

  children,

  contentClassName,

  showCateringMenu = true,

}: CustomerAccountShellProps) {

  const accent = THEME[theme];



  return (

    <div className="min-h-full bg-gradient-to-b from-honey-50/80 via-cream to-white text-ink">

      <header className="relative overflow-hidden border-b border-gold/15 bg-gradient-to-br from-honey-50 via-peach/30 to-cream">

        <div

          className="pointer-events-none absolute inset-0"

          aria-hidden

          style={{ backgroundImage: accent.heroGlow }}

        />

        <div className="relative mx-auto max-w-4xl px-4 py-6 sm:py-9">

          {backLink ? (

            <Link

              to={backLink.to}

              className={cn(

                'mb-4 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors',

                accent.link,

              )}

            >

              <ArrowLeft size={16} aria-hidden />

              {backLink.label}

            </Link>

          ) : null}



          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div className="min-w-0 max-w-xl">

              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-600">{eyebrow}</p>

              <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl md:text-4xl">{title}</h1>

              {description ? (

                <div className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{description}</div>

              ) : null}

            </div>

            {action ? <div className="shrink-0">{action}</div> : null}

          </div>



          {stats && stats.length > 0 ? (

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">

              {stats.map((s) => (

                <div key={s.label} className="account-card px-4 py-3.5 text-center sm:py-4">

                  <p className={cn('font-display text-xl font-semibold tabular-nums sm:text-2xl', accent.stat)}>

                    {s.value}

                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted sm:text-[11px]">

                    {s.label}

                  </p>

                </div>

              ))}

            </div>

          ) : null}



          <div className="mx-auto mt-6 h-px max-w-[8rem] bg-gold-line opacity-70" aria-hidden />

        </div>

      </header>



      <div className={cn('mx-auto max-w-4xl px-4 py-6 sm:py-8', contentClassName)}>{children}</div>



      {showCateringMenu ? <CateringMenuSections compact /> : null}

    </div>

  );

}



export const ACCOUNT_PANEL = {

  apricot:

    'rounded-2xl border border-apricot/20 bg-gradient-to-r from-apricot-50/80 via-white to-peach/30 px-4 py-3.5 text-sm text-ink shadow-sm',

  honey:

    'rounded-2xl border border-gold/25 bg-gradient-to-r from-honey-50/90 via-white to-gold-50/40 px-4 py-3.5 text-sm text-ink shadow-sm',

  basil:

    'rounded-2xl border border-basil/20 bg-gradient-to-r from-basil-50/70 via-white to-honey-50/40 px-4 py-3.5 text-sm text-ink shadow-sm',

  success:

    'rounded-2xl border border-basil/25 bg-gradient-to-r from-basil-50/60 to-white px-4 py-3.5 text-sm text-basil-600 shadow-sm',

  payment:

    'overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-honey-50 via-white to-cream shadow-warm',

  notice:

    'rounded-xl border border-gold/25 bg-gold-50/70 px-4 py-3 text-sm text-ink/90',

} as const;


