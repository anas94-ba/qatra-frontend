import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../api/client';
import type { PublicDonor } from '../../api/types';

/**
 * Donor logos strip: one image per donor, no visible text or amounts. The marquee is pure CSS and pauses on
 * hover/focus, with a manual pause button, and stops entirely for prefers-reduced-motion users.
 */
export function DonorStrip() {
  const [paused, setPaused] = useState(false);
  const { data } = useQuery({ queryKey: ['public', 'donors'], queryFn: () => api.public<PublicDonor[]>('/public/donors') });
  if (!data?.length) return null;
  // Few donors: static images, no motion (nothing to scroll)
  const animate = data.length > 4;
  const list = animate ? [...data, ...data] : data;

  return (
    <section aria-label="شركاء ومانحون">
      <div className="row between" style={{ marginBottom: '.5rem' }}>
        <h2 style={{ margin: 0 }}>شكرًا لداعمينا</h2>
        {animate && <button type="button" className="btn ghost sm" onClick={() => setPaused((p) => !p)}>{paused ? 'تشغيل الحركة' : 'إيقاف الحركة'}</button>}
      </div>
      <div className={`donor-strip ${paused ? 'paused' : ''}`}>
        <div className="donor-track" style={animate ? undefined : { animation: 'none', width: 'auto', justifyContent: 'center', flexWrap: 'wrap' }}>
          {list.map((d, i) => <img key={`${d.order}-${i}`} src={d.imageUrl} alt={d.altText} loading="lazy" />)}
        </div>
      </div>
    </section>
  );
}
