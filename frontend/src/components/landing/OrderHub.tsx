import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Wand2,
  Sparkles,
  PartyPopper,
  MapPin,
  Calendar,
  Users,
  User,
  Truck,
  UtensilsCrossed,
  Phone,
  Mail,
} from 'lucide-react';
import { api, getApiErrorMessage } from '@/lib/api';
import {
  buildCreateRequestPayload,
  clearRfqDraft,
  loadRfqDraft,
  requestCaptureSchema,
  saveRfqDraft,
  type RequestCaptureValues,
} from '@/lib/requestCapture';
import { myRequestsQueryKey } from '@/hooks/useRequests';
import { useAuth } from '@/stores/auth';
import { Button, Input } from '@/components/ui';
import { RequestReceived } from '@/components/request/RequestReceived';
import { cn } from '@/lib/utils';

const RFQ_EVENTS = [
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'BIRTHDAY', label: 'Birthday' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'OFFICE_MEALS', label: 'Office meals' },
  { value: 'TEAM_BUILDING', label: 'Team building' },
  { value: 'CEREMONY', label: 'Ceremony' },
];

export function OrderHub() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const autoSubmitted = useRef(false);

  const form = useForm<RequestCaptureValues>({
    resolver: zodResolver(requestCaptureSchema),
    defaultValues: {
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      eventType: 'WEDDING',
      fulfillmentType: 'DELIVERY',
      location: '',
      eventDate: '',
      guestCount: 50,
      cuisinePrefs: [],
      notes: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue('contactName', user.fullName || form.getValues('contactName'));
      form.setValue('contactEmail', user.email || form.getValues('contactEmail'));
    }
  }, [user, form]);

  useEffect(() => {
    const draft = loadRfqDraft();
    if (draft) {
      form.reset({ ...form.getValues(), ...draft });
    }
  }, [form]);

  const create = useMutation({
    mutationFn: (data: RequestCaptureValues) =>
      api.requests.createRequest(buildCreateRequestPayload(data)),
    onSuccess: (request) => {
      clearRfqDraft();
      qc.invalidateQueries({ queryKey: myRequestsQueryKey() });
      setSubmittedId(request.id);
    },
  });

  const { data: areas = [] } = useQuery({
    queryKey: ['meta', 'areas'],
    queryFn: api.meta.areas,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!user || autoSubmitted.current || submittedId) return;
    const draft = loadRfqDraft();
    if (!draft || !requestCaptureSchema.safeParse(draft).success) return;
    autoSubmitted.current = true;
    create.mutate(draft);
  }, [user, submittedId, create]);

  function submit(data: RequestCaptureValues) {
    if (!user) {
      saveRfqDraft(data);
      nav('/login', { state: { from: { pathname: '/', hash: '#order' } } });
      return;
    }
    create.mutate(data);
  }

  if (submittedId) {
    return (
      <section id="order" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-2 pt-6">
        <div className="mx-auto max-w-xl">
          <RequestReceived requestId={submittedId} />
        </div>
      </section>
    );
  }

  const fulfillment = form.watch('fulfillmentType');

  return (
    <section id="order" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-2 pt-6">
      <div className="mx-auto max-w-xl">
        <div className="card overflow-hidden shadow-card">
          <div className="h-0.5 bg-gold" />

          <div className="border-b border-line/80 bg-white px-4 py-3 sm:px-5">
            <h2 className="flex items-center gap-1.5 font-display text-base font-semibold text-ink">
              <Sparkles size={16} className="text-gold-600" aria-hidden />
              Request a quote — get matched fast
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-muted sm:text-sm">
              Tell us your event details. We&apos;ll match you with vetted caterers across Asia,
              compare offers, and help you book.
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold sm:justify-start">
              <span className="rounded-full border border-gold/25 bg-gold-50 px-3 py-1 text-gold-700">
                ✓ No spam
              </span>
              <span className="rounded-full border border-gold/25 bg-gold-50 px-3 py-1 text-gold-700">
                ✓ Reply in 24h
              </span>
              <span className="rounded-full border border-gold/25 bg-gold-50 px-3 py-1 text-gold-700">
                ✓ Compare before you book
              </span>
            </div>
          </div>

          <form id="rfq-form" onSubmit={form.handleSubmit(submit)} className="space-y-5 p-4 sm:p-5">
            <FulfillmentToggle
              value={fulfillment}
              onChange={(fulfillmentType) =>
                form.setValue('fulfillmentType', fulfillmentType, { shouldValidate: true })
              }
            />

            <div className="rounded-2xl border border-line/80 bg-gradient-to-b from-white to-gold-50/20 p-4">
              <div className="mb-3">
                <p className="text-sm font-semibold text-ink">Contact details</p>
                <p className="mt-1 text-xs text-muted">So we can confirm your request and send the best offers.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field icon={<User size={12} />} label="Your name *">
                <Input
                  className="input-soft"
                  placeholder="Full name"
                  error={form.formState.errors.contactName?.message}
                  {...form.register('contactName')}
                />
              </Field>
                <Field icon={<Phone size={12} />} label="Phone *">
                <Input
                  className="input-soft"
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  error={form.formState.errors.contactPhone?.message}
                  {...form.register('contactPhone')}
                />
              </Field>
                <Field icon={<Mail size={12} />} label="Email *" className="sm:col-span-2">
                <Input
                  className="input-soft"
                  type="email"
                  placeholder="you@example.com"
                  error={form.formState.errors.contactEmail?.message}
                  {...form.register('contactEmail')}
                />
              </Field>
              </div>
            </div>

            <div className="rounded-2xl border border-line/80 bg-gradient-to-b from-white to-gold-50/20 p-4">
              <div className="mb-3">
                <p className="text-sm font-semibold text-ink">Event details</p>
                <p className="mt-1 text-xs text-muted">A few details help us match the right kitchens faster.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field icon={<PartyPopper size={12} />} label="Event type">
                <select className="input input-soft appearance-none" {...form.register('eventType')}>
                  {RFQ_EVENTS.map((ev) => (
                    <option key={ev.value} value={ev.value}>
                      {ev.label}
                    </option>
                  ))}
                </select>
              </Field>
                <Field icon={<MapPin size={12} />} label="Location *">
                <select className="input input-soft appearance-none" {...form.register('location')}>
                  <option value="">Select area</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
                {form.formState.errors.location?.message ? (
                  <p className="mt-1 text-xs text-red-600">{form.formState.errors.location.message}</p>
                ) : null}
              </Field>
                <Field icon={<Calendar size={12} />} label="Event date *">
                <Input
                  className="input-soft"
                  type="date"
                  error={form.formState.errors.eventDate?.message}
                  {...form.register('eventDate')}
                />
              </Field>
                <Field icon={<Users size={12} />} label="Guests *" className="sm:col-span-2">
                <Input
                  className="input-soft"
                  type="number"
                  min={1}
                  placeholder="50"
                  error={form.formState.errors.guestCount?.message}
                  {...form.register('guestCount', { valueAsNumber: true })}
                />
              </Field>
              </div>
            </div>

            {create.isError ? (
              <p className="text-sm text-red-600">
                {getApiErrorMessage(create.error, 'Could not submit your request. Please try again.')}
              </p>
            ) : null}
          </form>

          <div className="border-t border-line/80 bg-gradient-to-b from-gold-50/40 to-white px-4 py-4 sm:px-5 sm:py-5">
            {!user ? (
              <p className="mb-3 text-center text-xs leading-relaxed text-muted">
                Sign in when you submit — your request and offers stay saved in one place.
              </p>
            ) : null}

            <Button
              type="submit"
              form="rfq-form"
              variant="accent"
              className="w-full rounded-xl py-3.5 text-sm shadow-lift sm:text-[15px]"
              loading={create.isPending}
            >
              <Wand2 size={17} aria-hidden /> Get matching offers
            </Button>

            <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-medium text-muted sm:text-xs">
              <li className="flex items-center gap-1.5">
                <span className="text-gold-600" aria-hidden>
                  ✓
                </span>
                Free, no obligation
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-gold-600" aria-hidden>
                  ✓
                </span>
                Support within 24h
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-gold-600" aria-hidden>
                  ✓
                </span>
                Compare before you book
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FulfillmentToggle({
  value,
  onChange,
}: {
  value: 'DELIVERY' | 'DINEOUT' | 'ONSITE';
  onChange: (v: 'DELIVERY' | 'DINEOUT') => void;
}) {
  return (
    <div className="rounded-2xl border border-line/80 bg-white p-2 shadow-sm">
      <div className="mb-2 px-2 pt-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">Service style</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
      {(
        [
          { id: 'DELIVERY' as const, label: 'Delivery catering', icon: <Truck size={14} /> },
          { id: 'DINEOUT' as const, label: 'Dine-out', icon: <UtensilsCrossed size={14} /> },
        ] as const
      ).map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-all motion-reduce:transition-none',
            value === opt.id
              ? 'border-gold/50 bg-gradient-to-r from-gold-100 to-gold-50 text-gold-800 shadow-sm'
              : 'border-line bg-white text-muted hover:border-gold/30 hover:bg-gold-50/50',
          )}
        >
          <span className={value === opt.id ? 'text-gold-600' : ''} aria-hidden>
            {opt.icon}
          </span>
          {opt.label}
        </button>
      ))}
    </div>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-700">
        <span aria-hidden>{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}
