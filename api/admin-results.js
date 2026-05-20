import { getSupabaseAdmin, setCorsHeaders, verifyAdminToken } from './lib/helpers.js';

const ALLOWED_FIELDS = [
  'name',
  'achievement',
  'rank',
  'college',
  'exam',
  'section',
  'photo',
  'remark',
  'image_url',
  'score',
  'year',
];

function pickPayload(body = {}) {
  const out = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks);
  if (!raw.length) return {};
  return JSON.parse(raw.toString('utf8'));
}

function getBearer(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
}

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  setCorsHeaders(res);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const token = getBearer(req);
    if (!token) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const authResult = await verifyAdminToken(token);
    if (!authResult.ok) {
      return res.status(authResult.reason === 'Invalid token' ? 401 : 403).json({
        error: authResult.reason,
      });
    }

    const sb = getSupabaseAdmin();
    if (!sb) {
      return res.status(500).json({ error: 'Supabase service role not configured on server' });
    }

    const query = req.query || {};
    const id = query.id != null ? query.id : null;

    if (req.method === 'POST') {
      const body = pickPayload(await readJsonBody(req));
      if (!body.name?.trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }
      const { data, error } = await sb.from('results').insert([body]).select();
      if (error) throw error;
      if (!data?.length) {
        return res.status(500).json({ error: 'Insert failed — no row returned' });
      }
      return res.status(200).json({ success: true, data: data[0] });
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      if (id == null || id === '') {
        return res.status(400).json({ error: 'Missing id query parameter' });
      }
      const body = pickPayload(await readJsonBody(req));
      if (Object.keys(body).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const { data, error } = await sb.from('results').update(body).eq('id', id).select();
      if (error) throw error;
      if (!data?.length) {
        return res.status(404).json({
          error: `No result found with id ${id}. Row may not exist.`,
        });
      }
      return res.status(200).json({ success: true, data: data[0] });
    }

    if (req.method === 'DELETE') {
      if (id == null || id === '') {
        return res.status(400).json({ error: 'Missing id query parameter' });
      }
      const { data, error } = await sb.from('results').delete().eq('id', id).select();
      if (error) throw error;
      if (!data?.length) {
        return res.status(404).json({ error: `No result found with id ${id}` });
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('admin-results error:', error);
    return res.status(500).json({
      error: error.message || 'Server error',
    });
  }
}
