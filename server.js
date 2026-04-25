import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// Environment variables
const B2_KEY_ID = process.env.B2_KEY_ID || process.env.VITE_B2_KEY_ID;
const B2_MASTER_KEY = process.env.B2_MASTER_KEY || process.env.VITE_B2_MASTER_KEY;
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME || process.env.VITE_B2_BUCKET_NAME;
const B2_BUCKET_ID = process.env.B2_BUCKET_ID;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let b2AuthCache = null;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.raw({ type: '*/*', limit: '100mb' }));

// Verify admin token
async function verifyAdminToken(token) {
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

// B2 Authorization
async function authorizeB2() {
  const now = Date.now();
  if (b2AuthCache && b2AuthCache.expiresAt > now) {
    return b2AuthCache;
  }

  if (!B2_KEY_ID || !B2_MASTER_KEY) {
    throw new Error('B2 credentials not configured');
  }

  const credentials = Buffer.from(`${B2_KEY_ID}:${B2_MASTER_KEY}`).toString('base64');
  const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    method: 'GET',
    headers: { Authorization: `Basic ${credentials}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `B2 authorization failed (${response.status})`);
  }

  b2AuthCache = {
    apiUrl: data.apiUrl,
    downloadUrl: data.downloadUrl,
    authorizationToken: data.authorizationToken,
    expiresAt: now + 23 * 60 * 60 * 1000,
  };

  return b2AuthCache;
}

// B2 API call
async function b2ApiCall(method, path, auth, body = null) {
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

// Download endpoint - proxy B2 files for private buckets
app.get('/api/download', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    console.log('Downloading from B2:', filePath);

    // Authorize with B2
    const auth = await authorizeB2();

    // Get download authorization token
    const tokenData = await b2ApiCall('POST', 'b2_get_download_authorization', auth, {
      bucketId: B2_BUCKET_ID,
      fileNamePrefix: filePath,
      validDurationInSeconds: 3600,
    });

    // Construct B2 file URL
    const fileUrl = `${auth.downloadUrl}/file/${encodeURIComponent(B2_BUCKET_NAME)}/${encodeURIComponent(filePath)}`;

    console.log('B2 URL:', fileUrl);

    // Fetch file from B2 with authorization
    const fileResponse = await fetch(fileUrl, {
      headers: { Authorization: tokenData.authorizationToken },
    });

    if (!fileResponse.ok) {
      console.error(`B2 returned ${fileResponse.status}`);
      return res.status(fileResponse.status).json({ error: 'File not found' });
    }

    // Set appropriate headers
    const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream';
    const contentLength = fileResponse.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    // Stream file to client
    const buffer = await fileResponse.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message || 'Download failed' });
  }
});

// Upload endpoint
app.post('/api/upload-to-b2', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!token) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    // Verify admin
    const authResult = await verifyAdminToken(token);
    if (!authResult.ok) {
      return res.status(authResult.reason === 'Invalid token' ? 401 : 403).json({
        error: authResult.reason,
      });
    }

    const { file, folder = 'slides/', fileName: originalFileName } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Decode base64 file
    const fileBuffer = Buffer.from(file, 'base64');
    const contentType = req.body.contentType || 'application/octet-stream';

    // Generate filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fullFileName = `${folder}${timestamp}-${randomStr}-${originalFileName}`;

    // Authorize with B2
    const auth = await authorizeB2();

    // Get upload URL
    const uploadUrlData = await b2ApiCall('POST', 'b2_get_upload_url', auth, {
      bucketId: B2_BUCKET_ID,
    });

    // Calculate SHA1
    const sha1 = crypto.createHash('sha1').update(fileBuffer).digest('hex');

    // Upload to B2
    const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: uploadUrlData.authorizationToken,
        'X-Bz-File-Name': encodeURIComponent(fullFileName),
        'Content-Type': contentType,
        'X-Bz-Content-Sha1': sha1,
      },
      body: fileBuffer,
    });

    const uploadResult = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(uploadResult.message || `Upload failed (${uploadResponse.status})`);
    }

    // Return full backend URL for file download (not relative)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const downloadUrl = `${backendUrl}/api/download?path=${encodeURIComponent(fullFileName)}`;

    res.json({
      success: true,
      fileName: uploadResult.fileName,
      fileId: uploadResult.fileId,
      filePath: fullFileName,
      downloadUrl,
      contentSha1: uploadResult.contentSha1,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`B2 Storage API running on http://localhost:${PORT}`);
  console.log(`Make sure B2 credentials are set in .env`);
});
