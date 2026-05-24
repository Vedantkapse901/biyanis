/**
 * Resolve stored B2 references to display URLs (EYE10-style proxy).
 * Store: b2ref://results/123-photo.jpg or plain path results/123-photo.jpg
 * Display: /api/download?path=...&inline=1
 */

const CACHE_MS = 55 * 60 * 1000;
const cache = new Map();

function normalizeKey(key) {
  const k = String(key || '')
    .trim()
    .replace(/^\/+/, '');
  if (!k || k.includes('..')) return null;
  return k;
}

/** Derive B2 object key from DB value, b2ref, proxy URL, or full B2 URL. */
export function extractB2ObjectKey(stored) {
  const s = String(stored || '').trim();
  if (!s || s.includes('..')) return null;

  if (s.startsWith('b2ref://')) {
    return normalizeKey(s.slice('b2ref://'.length));
  }

  if (s.startsWith('/api/download') || s.includes('/api/download?')) {
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
      const u = new URL(s, base);
      const path = u.searchParams.get('path');
      return path ? normalizeKey(decodeURIComponent(path)) : null;
    } catch {
      return null;
    }
  }

  if (/^(results|gallery|slides|courses|study-materials|student-portal|documents|uploads)\//.test(s)) {
    return normalizeKey(s);
  }

  try {
    const u = new URL(s);
    if (!u.hostname.includes('backblazeb2.com')) return null;
    const marker = '/file/';
    const i = u.pathname.indexOf(marker);
    if (i === -1) return null;
    const rest = u.pathname.slice(i + marker.length);
    const parts = rest.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return normalizeKey(parts.slice(1).join('/'));
  } catch {
    return null;
  }
}

function siteOrigin() {
  if (typeof window !== 'undefined') return window.location.origin;
  const site = String(import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '');
  return site || '';
}

/** Build same-origin /api/download proxy URL (private B2 bucket). */
export function buildB2ProxyUrl(stored, { inline = false, download = false } = {}) {
  const key = extractB2ObjectKey(stored);
  if (!key) return '';

  const params = new URLSearchParams({ path: key });
  if (download) params.set('download', '1');
  else if (inline) params.set('inline', '1');

  const origin = siteOrigin();
  const path = `/api/download?${params.toString()}`;
  return origin ? `${origin}${path}` : path;
}

/** Build same-origin proxy URL for <img src> (works for private B2 buckets). */
export function buildB2DisplayUrl(stored) {
  const key = extractB2ObjectKey(stored);
  if (!key) return String(stored || '');
  return buildB2ProxyUrl(stored, { inline: true });
}

/** Full site URL to view PDF in browser (new tab). */
export function buildB2PdfViewUrl(stored) {
  const key = extractB2ObjectKey(stored);
  if (key) return buildB2ProxyUrl(stored, { inline: true });
  const s = String(stored || '').trim();
  if (/^https?:\/\//i.test(s) && !s.includes('backblazeb2.com')) return s;
  return '';
}

/** Full site URL that forces file download via proxy. */
export function buildB2PdfDownloadUrl(stored) {
  const key = extractB2ObjectKey(stored);
  if (key) return buildB2ProxyUrl(stored, { download: true });
  return buildB2PdfViewUrl(stored);
}

/** Open PDF in a new tab and trigger download (B2 proxy or external link). */
export function openPdfViewAndDownload(stored, title = 'document') {
  const viewUrl = buildB2PdfViewUrl(stored);
  if (!viewUrl) return false;

  window.open(viewUrl, '_blank', 'noopener,noreferrer');

  const downloadUrl = buildB2PdfDownloadUrl(stored) || viewUrl;
  const safeName = String(title || 'document')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .slice(0, 80);
  const fileName = safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName}.pdf`;

  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  return true;
}

/** Cached display URL resolver (EYE10 pattern). */
export function resolveB2MediaUrl(stored) {
  const s = String(stored || '').trim();
  if (!s) return Promise.resolve('');

  const key = extractB2ObjectKey(s);
  if (!key) return Promise.resolve(s);

  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) return Promise.resolve(hit.url);

  const url = buildB2DisplayUrl(`b2ref://${key}`);
  cache.set(key, { url, expiresAt: now + CACHE_MS });
  return Promise.resolve(url);
}

/** Value to save in Supabase after B2 upload. */
export function toB2StorageRef(fileNameOrPath) {
  const key = extractB2ObjectKey(fileNameOrPath) || normalizeKey(fileNameOrPath);
  if (!key) return '';
  return `b2ref://${key}`;
}
