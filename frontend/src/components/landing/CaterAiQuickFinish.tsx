import type { InputHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import type { CateringSearchCriteria } from '@/lib/cateringSearch';
import { CriteriaPreview } from '@/components/landing/CriteriaPreview';
import { Button } from '@/components/ui';

const CATERAI_RETURN = { pathname: '/', hash: '#caterai' } as const;

function Field({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return (
    <label className={className}>
      <span className="mb-1 block text-[11px] font-medium text-muted">{label}</span>
      <input className="input input-compact w-full" {...props} />
    </label>
  );
}

export type QuickFinishMissing = 'eventDate' | 'guestCount' | 'location';

export interface CaterAiQuickFinishProps {
  criteria: CateringSearchCriteria;
  provider?: string;
  processingMs?: number;
  fallbackUsed?: boolean;
  missing: QuickFinishMissing[];
  areas: string[];
  location: string;
  onLocationChange: (value: string) => void;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  onContactNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  manualEventDate: string;
  manualGuests: number | '';
  onEventDateChange: (value: string) => void;
  onGuestsChange: (value: number | '') => void;
  user: { fullName: string; email: string } | null;
  existingAccount: boolean;
  loginPassword: string;
  onLoginPasswordChange: (value: string) => void;
  submitting: boolean;
  onSend: () => void;
}

export function CaterAiQuickFinish({
  criteria,
  provider,
  processingMs,
  fallbackUsed,
  missing,
  areas,
  location,
  onLocationChange,
  contactName,
  contactPhone,
  contactEmail,
  onContactNameChange,
  onPhoneChange,
  onEmailChange,
  manualEventDate,
  manualGuests,
  onEventDateChange,
  onGuestsChange,
  user,
  existingAccount,
  loginPassword,
  onLoginPasswordChange,
  submitting,
  onSend,
}: CaterAiQuickFinishProps) {
  return (
    <div className="border-b border-gold/20 bg-gradient-to-b from-gold-50/35 to-honey-50/25 px-3 py-3 sm:px-4">
      <CriteriaPreview
        criteria={criteria}
        provider={provider}
        processingMs={processingMs}
        fallbackUsed={fallbackUsed}
      />

      {missing.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {missing.includes('eventDate') ? (
            <Field label="Event date" type="date" value={manualEventDate} onChange={(e) => onEventDateChange(e.target.value)} />
          ) : null}
          {missing.includes('guestCount') ? (
            <Field
              label="Guests"
              type="number"
              min={1}
              value={manualGuests}
              onChange={(e) => onGuestsChange(e.target.value === '' ? '' : Number(e.target.value))}
            />
          ) : null}
          {missing.includes('location') ? (
            <label className="col-span-2 sm:col-span-1">
              <span className="mb-1 block text-[11px] font-medium text-muted">Area</span>
              <select className="input input-compact w-full" value={location} onChange={(e) => onLocationChange(e.target.value)}>
                <option value="">Pick area</option>
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      ) : null}

      {user ? (
        <p className="mt-3 text-xs text-muted">
          Sending as <span className="font-medium text-ink">{user.fullName}</span> · {user.email}
        </p>
      ) : (
        <div className="mt-3">
          <p className="mb-2 text-[11px] font-medium text-ink/80">Where should caterers reach you?</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Field label="Your name" value={contactName} onChange={(e) => onContactNameChange(e.target.value)} autoComplete="name" />
            <Field label="Phone" type="tel" value={contactPhone} onChange={(e) => onPhoneChange(e.target.value)} autoComplete="tel" placeholder="+998…" />
            <Field label="Email" type="email" value={contactEmail} onChange={(e) => onEmailChange(e.target.value)} autoComplete="email" />
          </div>
          {existingAccount ? (
            <div className="mt-2 max-w-sm">
              <Field
                label="Password (you already have an account)"
                type="password"
                value={loginPassword}
                onChange={(e) => onLoginPasswordChange(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          ) : (
            <p className="mt-2 text-[10px] text-muted">
              We&apos;ll create a free account so you can track offers.{' '}
              <Link to="/login" state={{ from: CATERAI_RETURN, intent: 'rfq' }} className="font-medium text-gold-700 hover:underline">
                Sign in instead
              </Link>
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <Button type="button" variant="ghost" className="btn-lux-gold border-0 px-5 py-2 text-sm" loading={submitting} onClick={onSend}>
          Send my request
        </Button>
      </div>
    </div>
  );
}
