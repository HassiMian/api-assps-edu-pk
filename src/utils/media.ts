const FALLBACK_LOGO = '/ilm-logo.svg';

export function resolveAssetUrl(src?: string | null) {
  if (!src) return FALLBACK_LOGO;
  const value = String(src).trim();
  if (!value || value === 'null' || value === 'undefined') return FALLBACK_LOGO;
  if (/^(data:image\/|https?:\/\/|blob:)/i.test(value)) return value;
  if (value.startsWith('/uploads/') || value.startsWith('uploads/')) {
    return value.startsWith('/') ? value : `/${value}`;
  }

  try {
    const parsed = new URL(value);
    if (parsed.pathname.startsWith('/uploads/')) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    // Not a parseable absolute URL; fall through.
  }

  return value;
}
