import crypto from 'crypto';
import {
  verifyAdminToken,
  authorizeB2,
  b2ApiCall,
  B2_BUCKET_ID,
  B2_BUCKET_NAME,
  setCorsHeaders
} from './lib/helpers.js';

export const config = {
  api: { bodyParser: false },
};

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body) && req.body.length > 0) {
    return req.body;
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function getHeader(req, name) {
  const key = name.toLowerCase();
  const h = req.headers || {};
  return h[key] ?? h[name] ?? '';
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Upload request received');

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!token) {
      console.error('✗ No auth token provided');
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    // Verify admin
    console.log('🔑 Verifying admin token...');
    const authResult = await verifyAdminToken(token);
    if (!authResult.ok) {
      console.error('✗ Auth verification failed:', authResult.reason);
      return res.status(authResult.reason === 'Invalid token' ? 401 : 403).json({
        error: authResult.reason,
      });
    }
    console.log('✓ Admin verified');

    let fileName;
    let folder = 'uploads/';
    let contentType = 'application/octet-stream';
    let fileBuffer;

    const rawBody = await readRawBody(req);
    const requestContentType = getHeader(req, 'content-type');

    if (requestContentType.includes('application/json')) {
      const body = JSON.parse(rawBody.length ? rawBody.toString('utf8') : '{}');
      fileName = body.fileName;
      folder = body.folder || 'uploads/';
      contentType = body.contentType || 'application/octet-stream';
      if (!body.file) {
        return res.status(400).json({ error: 'Missing file data' });
      }
      fileBuffer = Buffer.from(body.file, 'base64');
    } else {
      fileName = getHeader(req, 'x-file-name');
      folder = getHeader(req, 'x-folder') || 'uploads/';
      contentType = getHeader(req, 'x-content-type') || 'application/octet-stream';
      fileBuffer = rawBody;
    }

    console.log('📄 Received:', fileName, `(${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

    if (!fileName || !fileBuffer || fileBuffer.length === 0) {
      console.error('✗ Missing file data or name');
      return res.status(400).json({ error: 'Missing file data' });
    }

    // Authorize with B2
    console.log('🔐 Authorizing with B2...');
    const auth = await authorizeB2();

    // Get upload URL
    console.log('🌐 Getting upload URL from B2...');
    const uploadUrlData = await b2ApiCall('POST', 'b2_get_upload_url', auth, {
      bucketId: B2_BUCKET_ID,
    });

    // Calculate SHA1
    const sha1 = crypto.createHash('sha1').update(fileBuffer).digest('hex');
    const fullFileName = `${folder}${fileName}`;

    // Upload to B2
    console.log('📤 Uploading to B2...');
    const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: uploadUrlData.authorizationToken,
        'X-Bz-File-Name': fullFileName,
        'Content-Type': contentType,
        'X-Bz-Content-Sha1': sha1,
      },
      body: fileBuffer,
    });

    const uploadResult = await uploadResponse.json();

    if (!uploadResponse.ok) {
      console.error('✗ B2 Upload failed:', uploadResult);
      throw new Error(uploadResult.message || `Upload failed (${uploadResponse.status})`);
    }

    console.log('✓ File uploaded successfully to B2');

    // Return public URL directly
    const publicUrl = `${auth.downloadUrl}/file/${encodeURIComponent(B2_BUCKET_NAME)}/${encodeURIComponent(fullFileName)}`;

    const proxyUrl = `/api/download?path=${encodeURIComponent(uploadResult.fileName)}`;

    res.json({
      success: true,
      fileName: uploadResult.fileName,
      fileId: uploadResult.fileId,
      downloadUrl: proxyUrl,
      publicUrl,
      b2Url: publicUrl,
    });
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    res.status(500).json({
      error: error.message || 'Upload failed',
      details: error.stack
    });
  }
}
