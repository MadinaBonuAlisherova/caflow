import { useEffect, useRef, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {

  Banknote,

  CalendarDays,

  Leaf,

  MapPin,

  Navigation,

  PartyPopper,

  Search,

  Send,

  Users,

} from 'lucide-react';

import { api, getApiErrorMessage } from '@/lib/api';

import {

  buildSearchUrlFromCriteria,

  type CateringSearchCriteria,

} from '@/lib/cateringSearch';

import { CATER_AI_EXAMPLE_PROMPTS, buildLocalCriteriaFromPrompt, isFutureDateString, parseCaterAiPrompt } from '@/lib/caterAiParser';

import { mapCriteriaToRequestValues } from '@/lib/mapCriteriaToRequest';

import {

  applyRfqDefaults,

  buildCreateRequestPayload,

  clearRfqDraft,

  getMissingEventFields,

  loadRfqDraft,

  loadRfqDraftPartial,

  mergeRfqDraftWithUser,

  requestCaptureSchema,

  saveRfqDraftPartial,

  type RequestCaptureValues,

} from '@/lib/requestCapture';

import { myRequestsQueryKey } from '@/hooks/useRequests';

import { useAuth } from '@/stores/auth';

import { Button } from '@/components/ui';

import { CaterAiQuickFinish } from '@/components/landing/CaterAiQuickFinish';

import { RequestReceived } from '@/components/request/RequestReceived';



const HINTS = [
  { icon: CalendarDays, label: 'Date & time' },
  { icon: Users, label: 'Headcount' },
  { icon: Banknote, label: 'Budget' },
  { icon: Leaf, label: 'Dietary needs' },
] as const;

const PROMPT_PLACEHOLDER = CATER_AI_EXAMPLE_PROMPTS[0]!;

const EVENT_TYPES = [
  { value: '', label: 'Event type' },
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'BIRTHDAY', label: 'Birthday' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'OFFICE_MEALS', label: 'Office meals' },
  { value: 'TEAM_BUILDING', label: 'Team building' },
  { value: 'CEREMONY', label: 'Ceremony' },
] as const;

function guestPassword() {
  return `${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}Aa1!`;
}



export function CaterAiHub() {
  const nav = useNavigate();
  const qc = useQueryClient();

  const { user, register, login } = useAuth();

  const autoSubmitted = useRef(false);



  const [prompt, setPrompt] = useState('');

  const [location, setLocation] = useState('');

  const [eventType, setEventType] = useState('');

  const [phase, setPhase] = useState<'compose' | 'finish'>('compose');

  const [contactName, setContactName] = useState('');

  const [contactPhone, setContactPhone] = useState('');

  const [contactEmail, setContactEmail] = useState('');

  const [loginPassword, setLoginPassword] = useState('');

  const [existingAccount, setExistingAccount] = useState(false);

  const [parseError, setParseError] = useState<string | null>(null);

  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const [manualEventDate, setManualEventDate] = useState('');

  const [manualGuests, setManualGuests] = useState<number | ''>('');

  const [parsedCriteria, setParsedCriteria] = useState<CateringSearchCriteria | null>(null);

  const [parseMeta, setParseMeta] = useState<{ provider: string; processingMs: number; fallbackUsed: boolean } | null>(null);

  const [isResolving, setIsResolving] = useState(false);

  const { data: areas = [] } = useQuery({

    queryKey: ['meta', 'areas'],

    queryFn: api.meta.areas,

    staleTime: 60_000,

  });



  useEffect(() => {

    if (user) {

      setContactName(user.fullName || '');

      setContactEmail(user.email || '');

    }

  }, [user]);



  useEffect(() => {

    const draft = loadRfqDraft();

    const partial = loadRfqDraftPartial();

    const saved = draft ?? partial;

    if (saved) {

      setLocation(saved.location || '');

      setContactName(saved.contactName || '');

      setContactPhone(saved.contactPhone || '');

      setContactEmail(saved.contactEmail || '');

      setManualEventDate(saved.eventDate || '');

      setManualGuests(saved.guestCount ?? '');

      if (saved.notes) setPrompt(saved.notes);

      if (partial && !draft) setPhase('finish');

    }

  }, []);



  useEffect(() => {

    if (!parsedCriteria) return;

    if (parsedCriteria.eventDate && !manualEventDate) setManualEventDate(parsedCriteria.eventDate);

    if (parsedCriteria.guestCount != null && manualGuests === '') setManualGuests(parsedCriteria.guestCount);

    if (parsedCriteria.location && !location) setLocation(parsedCriteria.location);

    if (parsedCriteria.eventType && !eventType) setEventType(parsedCriteria.eventType);

  }, [parsedCriteria, manualEventDate, manualGuests, location, eventType]);



  const create = useMutation({

    mutationFn: (data: RequestCaptureValues) =>

      api.requests.createRequest(buildCreateRequestPayload(data)),

    onSuccess: (request) => {

      clearRfqDraft();

      qc.invalidateQueries({ queryKey: myRequestsQueryKey() });

      setSubmittedId(request.id);

    },

  });



  useEffect(() => {

    if (!user || autoSubmitted.current || submittedId) return;

    const partial = loadRfqDraftPartial();

    if (!partial) return;



    const merged = applyRfqDefaults(mergeRfqDraftWithUser(partial, user), location);

    merged.eventDate = merged.eventDate || manualEventDate || undefined;

    merged.guestCount = merged.guestCount ?? (manualGuests === '' ? undefined : Number(manualGuests));



    const result = requestCaptureSchema.safeParse(merged);

    if (!result.success) return;

    if (!isFutureDateString(result.data.eventDate)) return;



    autoSubmitted.current = true;

    create.mutate(result.data);

  }, [user, submittedId, create, location, manualEventDate, manualGuests]);



  async function resolveCriteria(): Promise<CateringSearchCriteria | null> {
    setParseError(null);
    setIsResolving(true);

    try {
      if (!prompt.trim()) {
        if (location || manualEventDate || manualGuests !== '' || eventType) {
          const structured: CateringSearchCriteria = {
            location: location || undefined,
            eventDate: manualEventDate || undefined,
            guestCount: manualGuests === '' ? undefined : Number(manualGuests),
            eventType: eventType || undefined,
          };
          setParsedCriteria(structured);
          setParseMeta({ provider: 'structured', processingMs: 0, fallbackUsed: false });
          return structured;
        }
        setParseError('Describe your event or fill in the search fields.');
        return null;
      }

      if (!location) {
        setParseError('Pick a delivery area for better matches.');
      }

      try {
        const res = await api.ai.parseCateringSearch({
          text: prompt,
          locationHint: location || undefined,
        });

        setParsedCriteria(res.criteria);
        setParseMeta({
          provider: res.provider,
          processingMs: res.processingMs,
          fallbackUsed: res.fallbackUsed,
        });

        return res.criteria;
      } catch {
        const local = parseCaterAiPrompt(prompt, {
          areas,
          location,
          contact: { contactName, contactPhone, contactEmail },
        });

        const fallback: CateringSearchCriteria = {
          eventType: local.values.eventType,
          location: local.values.location || location || undefined,
          eventDate: local.values.eventDate || manualEventDate || undefined,
          guestCount: local.values.guestCount ?? (manualGuests === '' ? undefined : Number(manualGuests)),
          cuisines: local.values.cuisinePrefs,
          budgetAmount: local.values.budgetPerPersonSom,
          budgetType: 'PER_PERSON',
          fulfillmentType: local.values.fulfillmentType,
        };

        setParsedCriteria(fallback);
        setParseMeta({ provider: 'local-fallback', processingMs: 0, fallbackUsed: true });

        return fallback;
      }
    } finally {
      setIsResolving(false);
    }
  }



  function buildMergedPartial(criteria: CateringSearchCriteria): Partial<RequestCaptureValues> {

    return applyRfqDefaults(

      {

        ...mapCriteriaToRequestValues(
          { ...criteria, eventType: criteria.eventType || eventType || undefined },
          prompt,
          {

          contactName,

          contactPhone,

          contactEmail: user?.email ?? contactEmail,

        }),

        location: criteria.location || location,

        eventDate: criteria.eventDate || manualEventDate || undefined,

        guestCount: criteria.guestCount ?? (manualGuests === '' ? undefined : Number(manualGuests)),

        contactName: user?.fullName ?? contactName,

        contactPhone,

        contactEmail: user?.email ?? contactEmail,

        notes: prompt.length > 20 ? prompt : undefined,

      },

      location,

    );

  }



  function buildFinalValues(criteria: CateringSearchCriteria): RequestCaptureValues | null {

    const merged = buildMergedPartial(criteria);

    const result = requestCaptureSchema.safeParse(merged);

    if (!result.success) {

      const issues = result.error.flatten().fieldErrors;

      setParseError(Object.values(issues).flat()[0] ?? 'Add the missing details below.');

      return null;

    }

    if (!isFutureDateString(result.data.eventDate)) {

      setParseError('Event date must be today or in the future.');

      return null;

    }

    return result.data;

  }



  async function ensureGuestSession(values: RequestCaptureValues) {

    if (user) return;



    if (existingAccount) {

      if (!loginPassword.trim()) {

        setParseError('Enter your password to continue.');

        throw new Error('password-required');

      }

      await login(values.contactEmail, loginPassword);

      return;

    }



    try {

      await register(values.contactName, values.contactEmail, values.contactPhone, guestPassword(), 'CUSTOMER');

    } catch (err) {

      const status = (err as { response?: { status?: number } })?.response?.status;

      const message = getApiErrorMessage(err, '');

      if (status === 409 || /already registered/i.test(message)) {

        setExistingAccount(true);

        setParseError('You already have an account — enter your password below.');

        throw new Error('existing-account');

      }

      throw err;

    }

  }



  async function sendRequest() {

    setParseError(null);

    const criteria = parsedCriteria ?? (await resolveCriteria());

    if (!criteria) return;



    const values = buildFinalValues(criteria);

    if (!values) return;



    try {

      await ensureGuestSession(values);

      create.mutate(values);

    } catch (err) {

      if (err instanceof Error && (err.message === 'password-required' || err.message === 'existing-account')) return;

      setParseError(getApiErrorMessage(err, 'Could not send your request. Try again.'));

    }

  }



  async function onGetOffersClick() {

    setParseError(null);

    const criteria = parsedCriteria ?? (await resolveCriteria());

    if (!criteria) return;



    const merged = buildMergedPartial(criteria);

    const canInstantSubmit =

      user &&

      getMissingEventFields(merged).length === 0 &&

      requestCaptureSchema.safeParse(merged).success &&

      isFutureDateString(String(merged.eventDate));



    if (canInstantSubmit) {

      await sendRequest();

      return;

    }



    setPhase('finish');

    saveRfqDraftPartial(merged);

  }



  function buildStructuredSearchUrl(): string {
    const params = new URLSearchParams();
    if (location.trim()) params.set('area', location.trim());
    if (eventType) params.set('event', eventType);
    if (manualEventDate) params.set('date', manualEventDate);
    if (manualGuests !== '') params.set('guests', String(manualGuests));
    return `/search?${params.toString()}`;
  }

  async function browseCatering() {
    setParseError(null);

    if (prompt.trim()) {
      const criteria =
        parsedCriteria ??
        buildLocalCriteriaFromPrompt(prompt, {
          areas,
          location,
          manualEventDate,
          manualGuests,
        });

      const area = criteria.location || location.trim();
      if (!area) {
        setParseError('Pick a delivery area first, then browse.');
        return;
      }

      nav(
        buildSearchUrlFromCriteria({
          ...criteria,
          location: area,
          eventType: eventType || criteria.eventType,
          eventDate: manualEventDate || criteria.eventDate,
          guestCount:
            manualGuests !== '' ? Number(manualGuests) : criteria.guestCount,
        }),
      );
      return;
    }

    if (!location.trim()) {
      setParseError('Pick a delivery area to browse caterers.');
      return;
    }

    nav(buildStructuredSearchUrl());
  }



  if (submittedId) {

    return (

      <section id="caterai" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-2 pt-3">

        <RequestReceived requestId={submittedId} />

      </section>

    );

  }



  const finishCriteria = parsedCriteria;

  const finishMerged = finishCriteria ? buildMergedPartial(finishCriteria) : null;

  const missingFields = finishMerged ? getMissingEventFields(finishMerged) : [];



  return (

    <section id="caterai" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-1 pt-2 md:pt-3">

      <div className="overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-white via-honey-50/35 to-gold-50/40 shadow-warm ring-1 ring-gold/15">

        <div className="h-1 bg-gradient-to-r from-gold-400 via-gold to-apricot/90" aria-hidden />

        {/* Location */}
        <div className="flex items-stretch border-b border-gold/20 bg-gradient-to-r from-gold-50/70 via-honey-50/50 to-white">
          <label className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 sm:px-4">
            <MapPin size={16} className="shrink-0 text-gold-600" aria-hidden />
            <select
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink outline-none"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setParsedCriteria(null);
                setPhase('compose');
              }}
              aria-label="Delivery area"
            >
              <option value="">Enter your delivery area</option>
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1 border-l border-gold/20 bg-gold-50/40 px-3 py-2.5 text-[11px] font-semibold text-gold-700 transition-colors hover:bg-gold-100/80 sm:px-4 sm:text-xs"
            onClick={() => setLocation('Tashkent')}
          >
            <Navigation size={14} className="text-gold-600" aria-hidden />
            <span className="hidden sm:inline">Use my location</span>
            <span className="sm:hidden">Tashkent</span>
          </button>
        </div>

        {/* Structured fields — primary data for vendor search */}
        <div className="grid grid-cols-3 divide-x divide-gold/15 border-b border-gold/20 bg-gradient-to-b from-white/90 to-gold-50/30">
          <HubCell label="Event date" icon={<CalendarDays size={12} className="text-gold-600" />}>
            <input
              type="date"
              className="hub-input w-full"
              value={manualEventDate}
              onChange={(e) => {
                setManualEventDate(e.target.value);
                setParsedCriteria(null);
                setPhase('compose');
              }}
              aria-label="Event date"
            />
          </HubCell>
          <HubCell label="Guests" icon={<Users size={12} className="text-gold-600" />}>
            <input
              type="number"
              min={1}
              className="hub-input w-full"
              placeholder="60"
              value={manualGuests}
              onChange={(e) => {
                const v = e.target.value;
                setManualGuests(v === '' ? '' : Number(v));
                setParsedCriteria(null);
                setPhase('compose');
              }}
              aria-label="Guest count"
            />
          </HubCell>
          <HubCell label="Occasion" icon={<PartyPopper size={12} className="text-gold-600" />}>
            <select
              className="hub-input w-full"
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value);
                setParsedCriteria(null);
                setPhase('compose');
              }}
              aria-label="Event type"
            >
              {EVENT_TYPES.map(({ value, label }) => (
                <option key={value || 'any'} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </HubCell>
        </div>

        {/* CaterAi prompt */}
        <div className="border-b border-gold/15 bg-gradient-to-b from-gold-50/25 to-transparent px-3 py-2.5 sm:px-4">
          <div className="rounded-lg border border-gold/30 bg-gradient-to-br from-white via-honey-50/60 to-gold-50/50 px-3 py-2.5 shadow-sm ring-1 ring-gold/10">
            <textarea
              className="hub-prompt max-h-20 min-h-[2.75rem] w-full resize-none bg-transparent text-[13px] leading-snug text-ink focus:outline-none"
              value={prompt}
              rows={2}
              placeholder={PROMPT_PLACEHOLDER}
              onChange={(e) => {
                setPrompt(e.target.value);
                setParsedCriteria(null);
                setParseMeta(null);
                setPhase('compose');
              }}
              aria-label="Describe your catering event"
            />
          </div>
        </div>

        {phase === 'finish' && finishCriteria ? (
          <CaterAiQuickFinish
            criteria={finishCriteria}
            provider={parseMeta?.provider}
            processingMs={parseMeta?.processingMs}
            fallbackUsed={parseMeta?.fallbackUsed}
            missing={missingFields}
            areas={areas}
            location={location}
            onLocationChange={setLocation}
            contactName={contactName}
            contactPhone={contactPhone}
            contactEmail={contactEmail}
            onContactNameChange={setContactName}
            onPhoneChange={setContactPhone}
            onEmailChange={setContactEmail}
            manualEventDate={manualEventDate}
            manualGuests={manualGuests}
            onEventDateChange={setManualEventDate}
            onGuestsChange={setManualGuests}
            user={user}
            existingAccount={existingAccount}
            loginPassword={loginPassword}
            onLoginPasswordChange={setLoginPassword}
            submitting={create.isPending || isResolving}
            onSend={sendRequest}
          />
        ) : null}

        {/* Actions — both CTAs always visible */}
        <div className="bg-gradient-to-b from-gold-50/50 via-honey-50/40 to-gold-100/30 px-3 py-3 sm:px-4">
          <div className="mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-gold-700">Include:</span>
            {HINTS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-full border border-gold/25 bg-white/80 px-2 py-0.5 text-[10px] font-medium text-gold-800 shadow-sm"
              >
                <Icon size={10} className="text-gold-600" aria-hidden />
                {label}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="btn-lux-gold flex-1 border-0 py-2.5 text-sm sm:flex-[1.2]"
              loading={create.isPending || isResolving}
              onClick={phase === 'finish' ? sendRequest : onGetOffersClick}
            >
              <Send size={15} aria-hidden />
              Get offers
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="btn-lux-outline flex-1 bg-white/90 py-2.5 text-sm"
              loading={isResolving}
              onClick={browseCatering}
            >
              <Search size={15} aria-hidden />
              Browse caterers
            </Button>
          </div>
          <p className="mt-2 text-center text-[10px] font-medium text-gold-700/80">
            Free · No commitment · Replies in 24h
          </p>
        </div>
      </div>

      {(parseError || create.isError) && (
        <p className="mt-2 text-center text-xs text-red-600" role="alert">
          {parseError ?? getApiErrorMessage(create.error, 'Could not submit your request. Please try again.')}
        </p>
      )}

      <p className="mt-1.5 text-center text-[10px] text-muted">
        <Link to="/app/requests/new" className="font-semibold text-gold-700 hover:underline">
          Step-by-step form
        </Link>
        {' · '}
        structured search on browse
      </p>
    </section>

  );

}



function HubCell({

  label,

  icon,

  children,

}: {

  label: string;

  icon: React.ReactNode;

  children: React.ReactNode;

}) {

  return (

    <label className="hub-cell flex min-w-0 flex-col gap-0.5 px-2 py-2 sm:px-3 sm:py-2.5">

      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-gold-700 sm:text-[10px]">

        {icon}

        {label}

      </span>

      {children}

    </label>

  );

}


