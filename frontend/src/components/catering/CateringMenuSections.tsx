import { Link } from 'react-router-dom';

import {

  UtensilsCrossed,

  Building2,

  ChefHat,

  Truck,

  Sparkles,

  ShieldCheck,

  Users,

  Leaf,

  ArrowRight,

} from 'lucide-react';

import { cn } from '@/lib/utils';



const SERVICE_TYPES = [

  {

    icon: Building2,

    title: 'Corporate catering',

    desc: 'Office lunches, all-hands, and client meetings — scaled for teams.',

    href: '/search?type=CATERER&area=Tashkent&event=CORPORATE',

  },

  {

    icon: UtensilsCrossed,

    title: 'Event & banquet',

    desc: 'Weddings, ceremonies, and celebrations with full-service menus.',

    href: '/search?type=CATERER&area=Tashkent&event=WEDDING',

  },

  {

    icon: ChefHat,

    title: 'Private chef',

    desc: 'On-site cooking and intimate dining at your venue or home.',

    href: '/search?type=CHEF&area=Tashkent',

  },

  {

    icon: Truck,

    title: 'Drop-off delivery',

    desc: 'Restaurant-quality trays and buffets delivered to your door.',

    href: '/search?type=RESTAURANT&area=Tashkent',

  },

] as const;



const WHY_POINTS = [

  { icon: ShieldCheck, label: 'Vetted partners only' },

  { icon: Sparkles, label: 'Tailored menus & quotes' },

  { icon: Users, label: 'Any headcount, any occasion' },

  { icon: Leaf, label: 'Dietary needs welcome' },

] as const;



const KEY_ELEMENTS = [

  'Fresh ingredients & consistent quality',

  'Clear pricing before you commit',

  'Reliable delivery and on-site timing',

  'Professional presentation every time',

] as const;



const TRENDS = [

  'Interactive food stations & live cooking',

  'Global fusion and local Uzbek flavors',

  'Sustainable packaging & zero-waste buffets',

  'Corporate wellness & balanced menus',

] as const;



export interface CateringMenuSectionsProps {

  className?: string;

  compact?: boolean;

}



/** Slide-deck inspired catering menus — warm cream + gold */

export function CateringMenuSections({ className, compact }: CateringMenuSectionsProps) {

  return (

    <section

      className={cn(

        'border-t border-gold/15 bg-gradient-to-b from-cream via-honey-50/50 to-white',

        className,

      )}

    >

      <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">

        <div className="mx-auto mb-10 h-px max-w-xs bg-gold-line" aria-hidden />



        {!compact ? (

          <div className="mb-12 text-center">

            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-600">Food catering</p>

            <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">

              What is food catering?

            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">

              Professional food service for events of every size — from office lunches to weddings.

              CaterFlow connects you with vetted restaurants, caterers, and private chefs in one place.

            </p>

          </div>

        ) : null}



        <div className="mb-12">

          <SectionLabel title="Types of catering services" />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            {SERVICE_TYPES.map(({ icon: Icon, title, desc, href }) => (

              <Link

                key={href}

                to={href}

                className="group account-card flex gap-4 p-4 transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-warm sm:p-5"

              >

                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold/25 bg-gold-50 text-gold-700">

                  <Icon size={20} aria-hidden />

                </span>

                <div className="min-w-0">

                  <p className="font-display text-base font-semibold text-ink group-hover:text-gold-700">{title}</p>

                  <p className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">{desc}</p>

                </div>

                <ArrowRight

                  size={16}

                  className="ml-auto shrink-0 self-center text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-gold-600"

                  aria-hidden

                />

              </Link>

            ))}

          </div>

        </div>



        <div className="mb-12 grid gap-8 lg:grid-cols-2">

          <div>

            <SectionLabel title="Why catering matters" />

            <p className="mt-3 text-sm leading-relaxed text-muted">

              Great food sets the tone for every gathering. The right partner saves hours of calls,

              reduces risk on event day, and lets you focus on your guests.

            </p>

            <ul className="mt-5 grid grid-cols-2 gap-2">

              {WHY_POINTS.map(({ icon: Icon, label }) => (

                <li

                  key={label}

                  className="flex items-center gap-2 rounded-xl border border-gold/15 bg-white/80 px-3 py-2.5 text-xs font-medium text-ink shadow-sm sm:text-sm"

                >

                  <Icon size={15} className="shrink-0 text-gold-600" aria-hidden />

                  {label}

                </li>

              ))}

            </ul>

          </div>



          <div>

            <SectionLabel title="Key elements of success" />

            <ul className="mt-5 space-y-2.5">

              {KEY_ELEMENTS.map((item, i) => (

                <li

                  key={item}

                  className="flex items-start gap-3 border-b border-gold/15 pb-2.5 text-sm text-muted last:border-0"

                >

                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold-100 text-[10px] font-bold text-gold-700">

                    {i + 1}

                  </span>

                  {item}

                </li>

              ))}

            </ul>

          </div>

        </div>



        <div className="account-card p-5 sm:p-6">

          <SectionLabel title="Trends in modern catering" />

          <div className="mt-4 flex flex-wrap gap-2">

            {TRENDS.map((t) => (

              <span

                key={t}

                className="rounded-full border border-gold/25 bg-gold-50/80 px-3 py-1.5 text-xs font-medium text-gold-800"

              >

                {t}

              </span>

            ))}

          </div>

          <Link

            to="/#caterai"

            className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white px-5 py-2.5 text-sm font-semibold text-gold-700 transition-colors hover:border-gold/55 hover:bg-gold-50"

          >

            <Sparkles size={15} aria-hidden />

            Get matched with CaterAi

          </Link>

        </div>



        <div className="mx-auto mt-12 h-px max-w-xs bg-gold-line" aria-hidden />

      </div>

    </section>

  );

}



function SectionLabel({ title }: { title: string }) {

  return (

    <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-gold-700 sm:text-xl">

      {title}

    </h3>

  );

}


