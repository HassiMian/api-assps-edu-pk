/** The operational school date must be based on the school's timezone, not UTC rollover. */
export function schoolDateISO(timeZone = 'Asia/Karachi', instant: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone, day: '2-digit', month: '2-digit', year: 'numeric',
  }).formatToParts(instant);
  const get = (name: Intl.DateTimeFormatPartTypes) => parts.find(part=>part.type===name)?.value || '';
  const date = `${get('year')}-${get('month')}-${get('day')}`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('School date could not be resolved.');
  return date;
}
