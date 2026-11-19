const timeFmt = new Intl.DateTimeFormat('uk-UA', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Kyiv' });
const dayTimeFmt = new Intl.DateTimeFormat('uk-UA', { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Kyiv' });
const fullFmt = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Kyiv' });

export const fmtTime = (iso: string) => timeFmt.format(new Date(iso));
export const fmtDayTime = (iso: string) => dayTimeFmt.format(new Date(iso));
export const fmtFull = (iso: string) => fullFmt.format(new Date(iso));

/** «5 хв тому», «2 год тому» */
export function ago(iso: string, now = Date.now()): string {
  const m = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (m < 1) return 'щойно';
  if (m < 60) return `${m} хв тому`;
  return `${Math.round(m / 60)} год тому`;
}
