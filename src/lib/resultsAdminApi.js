import { supabase } from './supabase';

function resolveApiBase() {
  const raw = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (!raw) return '';
  if (typeof window !== 'undefined') {
    const onLocal =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!onLocal && /localhost|127\.0\.0\.1/i.test(raw)) return '';
  }
  return raw;
}

const API_BASE = resolveApiBase();

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.access_token) {
    throw new Error('Not authenticated. Please log in to the admin panel again.');
  }
  return data.session.access_token;
}

async function adminResultsRequest(method, { id, body } = {}) {
  const token = await getAccessToken();
  const qs = id != null ? `?id=${encodeURIComponent(id)}` : '';
  const url = `${API_BASE || ''}/api/admin-results${qs}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || `Request failed (${response.status})`);
  }
  return result;
}

export async function createResultAdmin(payload) {
  const result = await adminResultsRequest('POST', { body: payload });
  return result.data;
}

export async function updateResultAdmin(id, payload) {
  const result = await adminResultsRequest('PATCH', { id, body: payload });
  return result.data;
}

export async function deleteResultAdmin(id) {
  await adminResultsRequest('DELETE', { id });
}
