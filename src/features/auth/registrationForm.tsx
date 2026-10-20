import { lazy, Suspense } from 'react';
import type { EntityType, RegistrationRequest } from '../../api/types';
import { SelectField, TextArea, TextField } from '../../components/Field';
import { Spinner } from '../../components/State';

const LocationPicker = lazy(() => import('../../components/LocationPicker'));

export const REGIONS = ['شمال غزة', 'غزة', 'الوسطى', 'خان يونس', 'رفح'];

/** Flat string state for the registration form; converted to the API payload on submit */
export interface EntityValues {
  name: string; region: string; lat: string; lng: string; description: string;
  families: string; population: string; repTitle: string;
  registrationNumber: string; hqCountry: string; referenceBody: string; regionsText: string; capacity: string; contactLink: string;
  contactName: string; phone: string;
}

export const emptyValues = (): EntityValues => ({
  name: '', region: '', lat: '', lng: '', description: '', families: '', population: '', repTitle: '',
  registrationNumber: '', hqCountry: '', referenceBody: '', regionsText: '', capacity: '', contactLink: '', contactName: '', phone: '',
});

/** Rebuilds form values from an existing request (used when a rejected applicant edits and resubmits) */
export function valuesFromRequest(r: RegistrationRequest): EntityValues {
  const d = r.details as Record<string, unknown>;
  const s = (v: unknown) => (v == null ? '' : String(v));
  return {
    ...emptyValues(), name: r.name, region: r.region ?? '', lat: s(r.lat), lng: s(r.lng), description: r.description ?? '',
    contactName: r.contactName, phone: r.phone, families: s(d.families), population: s(d.population), repTitle: s(d.repTitle),
    registrationNumber: s(d.registrationNumber), hqCountry: s(d.hqCountry), referenceBody: s(d.referenceBody),
    regionsText: Array.isArray(d.regions) ? (d.regions as string[]).join('، ') : '', capacity: s(d.capacityLitersPerDay), contactLink: s(d.contactLink),
  };
}

/** Builds the type-specific payload; the backend rejects fields that belong to another type */
export function toPayload(type: EntityType, v: EntityValues) {
  const base = { name: v.name, contactName: v.contactName, phone: v.phone };
  if (type === 'CAMP') {
    return {
      ...base, region: v.region, lat: Number(v.lat), lng: Number(v.lng),
      details: { families: Number(v.families), population: Number(v.population), repTitle: v.repTitle },
    };
  }
  const details: Record<string, unknown> = {};
  if (v.registrationNumber) details.registrationNumber = v.registrationNumber;
  if (v.contactLink) details.contactLink = v.contactLink;
  if (type === 'INTERNATIONAL_ORG') details.hqCountry = v.hqCountry;
  if (type === 'INITIATIVE') details.referenceBody = v.referenceBody;
  const regions = v.regionsText.split(/[,،]/).map((x) => x.trim()).filter(Boolean);
  if (regions.length) details.regions = regions;
  if (v.capacity) details.capacityLitersPerDay = Number(v.capacity);
  return { ...base, description: v.description, details };
}

interface Props { type: EntityType; values: EntityValues; onChange: (patch: Partial<EntityValues>) => void }

/** Fields that change with the entity type (camp vs organization / initiative) */
export function EntityFields({ type, values: v, onChange }: Props) {
  const bind = (key: keyof EntityValues) => ({ value: v[key], onChange: (e: { target: { value: string } }) => onChange({ [key]: e.target.value }) });
  return (
    <>
      <TextField label={type === 'CAMP' ? 'اسم المخيم' : 'اسم الجهة'} required {...bind('name')} />
      {type === 'CAMP' ? (
        <>
          <div className="form-grid">
            <SelectField label="المحافظة" required {...bind('region')}>
              <option value="">اختر...</option>
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </SelectField>
            <TextField label="صفة المسؤول" required {...bind('repTitle')} />
            <TextField label="عدد الأسر (تقديري)" type="number" min={1} required {...bind('families')} />
            <TextField label="عدد السكان (تقديري)" type="number" min={1} required {...bind('population')} />
          </div>
          <p className="small muted">حدّد موقع المخيم على الخريطة بالضغط عليها:</p>
          <Suspense fallback={<Spinner />}>
            <LocationPicker lat={Number(v.lat) || undefined} lng={Number(v.lng) || undefined} onPick={(lat, lng) => onChange({ lat: String(lat), lng: String(lng) })} />
          </Suspense>
          <div className="form-grid" style={{ marginTop: '.75rem' }}>
            <TextField label="خط العرض" type="number" step="any" required {...bind('lat')} />
            <TextField label="خط الطول" type="number" step="any" required {...bind('lng')} />
          </div>
        </>
      ) : (
        <>
          <TextArea label="وصف النشاط" required minLength={10} {...bind('description')} />
          <div className="form-grid">
            {type === 'INTERNATIONAL_ORG' && <TextField label="بلد المقر" required {...bind('hqCountry')} />}
            {type === 'INITIATIVE' && <TextField label="الجهة المرجعية" required {...bind('referenceBody')} />}
            <TextField label="رقم التسجيل (اختياري)" {...bind('registrationNumber')} />
            <TextField label="القدرة التقريبية (لتر/يوم)" type="number" min={1} {...bind('capacity')} />
            <TextField label="المناطق التي تعمل بها" hint="افصل بينها بفاصلة" {...bind('regionsText')} />
            <TextField label="رابط تواصل (اختياري)" {...bind('contactLink')} />
          </div>
        </>
      )}
      <div className="form-grid">
        <TextField label="اسم المسؤول" required {...bind('contactName')} />
        <TextField label="رقم الهاتف" type="tel" required dir="ltr" {...bind('phone')} />
      </div>
    </>
  );
}
