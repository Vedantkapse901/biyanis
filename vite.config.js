import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';

function readDotEnvValue(key) {
  try {
    const raw = fs.readFileSync('.env', 'utf8');
    const re = new RegExp(`^${key}=(.*)$`, 'm');
    const match = raw.match(re);
    if (!match) return '';
    return String(match[1] ?? '')
      .trim()
      .replace(/^['"]|['"]$/g, '');
  } catch {
    return '';
  }
}

function resolveServerEnvValue(env, key) {
  const fromDotEnv = readDotEnvValue(key);
  if (fromDotEnv) return fromDotEnv;
  return String(env[key] ?? '').trim();
}

function loadB2Env() {
  const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  const env = loadEnv(mode, process.cwd(), '');
  const keys = [
    'SUPABASE_URL',
    'VITE_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'B2_KEY_ID',
    'B2_MASTER_KEY',
    'B2_BUCKET_NAME',
    'B2_BUCKET_ID',
  ];
  for (const k of keys) {
    process.env[k] = resolveServerEnvValue(env, k);
  }
  if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
    process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  }
}

function patchRes(res) {
  if (typeof res.status !== 'function') {
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
  }
  if (typeof res.json !== 'function') {
    res.json = (payload) => {
      if (!res.headersSent) res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(payload));
    };
  }
  if (typeof res.send !== 'function') {
    res.send = (body) => {
      if (Buffer.isBuffer(body)) {
        res.end(body);
        return;
      }
      if (typeof body === 'string') {
        res.end(body);
        return;
      }
      res.end(JSON.stringify(body));
    };
  }
}

const API_ROUTES = {
  '/api/download': './api/download.js',
  '/api/upload-to-b2': './api/upload-to-b2.js',
  '/api/get-signed-url': './api/get-signed-url.js',
  '/api/health': './api/health.js',
};

/** Local dev: Vercel-style /api handlers without a separate Node server */
function apiDev() {
  return {
    name: 'api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] || '';
        const modulePath = API_ROUTES[url];
        if (!modulePath) {
          return next();
        }

        res.setHeader('Access-Control-Allow-Origin', '*');

        if (url === '/api/upload-to-b2') {
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization, X-File-Name, X-Folder, X-Content-Type'
          );
          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }
          loadB2Env();
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          req.body = Buffer.concat(chunks);
          req.headers['content-type'] =
            req.headers['content-type'] || req.headers['Content-Type'] || '';
        } else {
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }
          if (req.method !== 'GET') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }
          loadB2Env();
        }

        try {
          req.query = Object.fromEntries(new URL(req.url, 'http://localhost').searchParams);
          const { default: handler } = await import(modulePath);
          patchRes(res);
          await handler(req, res);
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: e?.message || 'Server error' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiDev()],
  base: '/',
});
