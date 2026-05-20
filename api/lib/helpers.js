import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env' });

// Environment variables
export const B2_KEY_ID = process.env.B2_KEY_ID || process.env.VITE_B2_KEY_ID;
export const B2_MASTER_KEY = process.env.B2_MASTER_KEY || process.env.VITE_B2_MASTER_KEY;
export const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME || process.env.VITE_B2_BUCKET_NAME;
export const B2_BUCKET_ID = process.env.B2_BUCKET_ID;
export const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let b2AuthCache = null;
let supabaseAdminClient = null;

/** Service-role client — bypasses RLS for trusted server routes */
export function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseAdminClient;
}

// Verify admin token
export async function verifyAdminToken(token) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { ok: false, reason: 'Supabase not configured' };
  }

  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await sb.auth.getUser(token);
    if (error || !data?.user) {
      return { ok: false, reason: 'Invalid token' };
    }

    return { ok: true, user: data.user };
  } catch (e) {
    console.error('Auth error:', e);
    return { ok: false, reason: 'Auth verification failed' };
  }
}

// B2 API call
export async function b2ApiCall(method, path, auth, body = null) {
  const url = `${auth.apiUrl}/b2api/v2/${path}`;
  const options = {
    method,
    headers: {
      Authorization: auth.authorizationToken,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `B2 API call failed: ${path} (${response.status})`);
  }

  return data;
}

// B2 Authorization
export async function authorizeB2() {
  const now = Date.now();
  if (b2AuthCache && b2AuthCache.expiresAt > now) {
    console.log('✓ Using cached B2 authorization');
    return b2AuthCache;
  }

  if (!B2_KEY_ID || !B2_MASTER_KEY) {
    console.error('✗ B2 credentials missing:', { B2_KEY_ID: !!B2_KEY_ID, B2_MASTER_KEY: !!B2_MASTER_KEY });
    throw new Error('B2 credentials not configured');
  }

  console.log('🔐 Authorizing with B2...');
  const credentials = Buffer.from(`${B2_KEY_ID}:${B2_MASTER_KEY}`).toString('base64');

  try {
    const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      method: 'GET',
      headers: { Authorization: `Basic ${credentials}` },
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('✗ B2 Auth Failed:', data);
      throw new Error(data.message || `B2 authorization failed (${response.status})`);
    }

    console.log('✓ B2 Authorization successful');

    b2AuthCache = {
      apiUrl: data.apiUrl,
      downloadUrl: data.downloadUrl,
      authorizationToken: data.authorizationToken,
      expiresAt: now + 23 * 60 * 60 * 1000,
    };

    return b2AuthCache;
  } catch (error) {
    console.error('✗ B2 Authorization error:', error.message);
    throw error;
  }
}

// CORS helper
export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-File-Name, X-Folder, X-Content-Type'
  );
}
