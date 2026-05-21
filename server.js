import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fileUpload from 'express-fileupload';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env
dotenv.config({ path: '.env' });

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

// Special handler for binary uploads BEFORE other middleware
app.post('/api/upload-to-b2-fast', express.raw({ type: '*/*', limit: '500mb' }), async (req, res) => {
  try {
    console.log('🚀 Fast upload request received');

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

    // Get file info from headers
    const fileName = req.headers['x-file-name'];
    const folder = req.headers['x-folder'] || 'study-materials/';
    const contentType = req.headers['x-content-type'] || 'application/octet-stream';
    let fileBuffer = req.body; // Raw binary data

    // Ensure it's a Buffer
    if (!(fileBuffer instanceof Buffer)) {
      console.log('Converting to Buffer:', typeof fileBuffer);
      if (typeof fileBuffer === 'string') {
        fileBuffer = Buffer.from(fileBuffer, 'utf-8');
      } else if (fileBuffer && typeof fileBuffer === 'object') {
        fileBuffer = Buffer.from(JSON.stringify(fileBuffer));
      } else {
        fileBuffer = Buffer.from(fileBuffer);
      }
    }

    console.log('📄 Received:', fileName, `(${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

    if (!fileName || !fileBuffer || fileBuffer.length === 0) {
      console.error('✗ Missing file data or name');
      console.error('Debug:', { fileName: !!fileName, bufferLength: fileBuffer?.length, bufferType: typeof fileBuffer });
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
      console.error('✗ B2 upload failed:', uploadResult);
      throw new Error(uploadResult.message || `Upload failed (${uploadResponse.status})`);
    }

    console.log('✓ File uploaded successfully to B2');

    // Return public URL directly
    const publicUrl = `${auth.downloadUrl}/file/${encodeURIComponent(B2_BUCKET_NAME)}/${encodeURIComponent(fullFileName)}`;

    res.json({
      success: true,
      fileName: uploadResult.fileName,
      fileId: uploadResult.fileId,
      publicUrl,
    });
  } catch (error) {
    console.error('❌ Fast upload error:', error.message);
    res.status(500).json({
      error: error.message || 'Upload failed',
    });
  }
});

app.use(fileUpload({ limits: { fileSize: 500 * 1024 * 1024 } })); // 500MB max

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

// Signed URL endpoint - Generate temporary B2 authorization URLs
app.get('/api/get-signed-url', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    console.log('🔑 Generating signed URL for:', filePath);

    // Authorize with B2
    const auth = await authorizeB2();

    // Generate signed authorization URL valid for 7 days (604800 seconds)
    const validDurationSeconds = 7 * 24 * 60 * 60; // 7 days

    const signedUrlData = await b2ApiCall('POST', 'b2_get_download_authorization', auth, {
      bucketId: B2_BUCKET_ID,
      fileNamePrefix: filePath,
      validDurationInSeconds: validDurationSeconds,
    });

    // Construct signed URL with authorization
    const signedUrl = `${auth.downloadUrl}/file/${encodeURIComponent(B2_BUCKET_NAME)}/${encodeURIComponent(filePath)}?Authorization=${encodeURIComponent(signedUrlData.authorizationToken)}`;

    console.log('✓ Signed URL generated successfully');

    res.json({
      success: true,
      signedUrl,
      expiresIn: validDurationSeconds,
      fileName: filePath.split('/').pop(),
    });
  } catch (error) {
    console.error('❌ Signed URL generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate signed URL' });
  }
});

// Download endpoint - proxy B2 files with authentication
app.get('/api/download', async (req, res) => {
  try {
    let filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    // Decode URL-encoded paths (handle double encoding)
    filePath = decodeURIComponent(filePath);

    console.log('📥 Downloading from B2:', filePath);

    // Authorize with B2
    const auth = await authorizeB2();

    // Get signed URL for the file (valid for 7 days)
    const signedUrlData = await b2ApiCall('POST', 'b2_get_download_authorization', auth, {
      bucketId: B2_BUCKET_ID,
      fileNamePrefix: filePath,
      validDurationInSeconds: 7 * 24 * 60 * 60, // 7 days
    });

    // Construct signed URL with authorization
    const signedUrl = `${auth.downloadUrl}/file/${encodeURIComponent(B2_BUCKET_NAME)}/${encodeURIComponent(filePath)}?Authorization=${encodeURIComponent(signedUrlData.authorizationToken)}`;

    console.log('🔗 B2 Signed URL generated');

    // Fetch file from B2 with authentication
    const fileResponse = await fetch(signedUrl);

    if (!fileResponse.ok) {
      console.error(`❌ B2 returned ${fileResponse.status}:`, await fileResponse.text());
      return res.status(fileResponse.status).json({ error: 'File not found' });
    }

    // Get file info
    const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream';
    const contentLength = fileResponse.headers.get('content-length');

    // Set download headers
    const fileName = filePath.split('/').pop(); // Get filename from path
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Only set attachment for downloads, inline for images
    const isInline = req.query.inline === '1';
    if (isInline) {
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    }

    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    console.log('✅ Sending file:', fileName);

    // Stream file to client
    const buffer = await fileResponse.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('❌ Download error:', error.message);
    res.status(500).json({ error: error.message || 'Download failed' });
  }
});

// Upload endpoint
app.post('/api/upload-to-b2', async (req, res) => {
  try {
    console.log('📤 Upload request received');

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

    const { file, folder = 'slides/', fileName: originalFileName } = req.body;

    if (!file) {
      console.error('✗ No file data provided');
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log(`📁 Processing file: ${originalFileName}, folder: ${folder}`);

    // Decode base64 file
    const fileBuffer = Buffer.from(file, 'base64');
    const contentType = req.body.contentType || 'application/octet-stream';
    console.log(`📦 File size: ${fileBuffer.length} bytes, type: ${contentType}`);

    // Generate filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    // Sanitize filename: remove non-ASCII characters and replace spaces
    const sanitizedFileName = originalFileName
      .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9._-]/g, ''); // Keep only safe characters
    const fullFileName = `${folder}${timestamp}-${randomStr}-${sanitizedFileName}`;
    console.log(`📝 Generated filename: ${fullFileName}`);

    // Authorize with B2
    console.log('🔐 Authorizing B2...');
    const auth = await authorizeB2();

    // Get upload URL
    console.log('🌐 Getting B2 upload URL...');
    const uploadUrlData = await b2ApiCall('POST', 'b2_get_upload_url', auth, {
      bucketId: B2_BUCKET_ID,
    });
    console.log('✓ Got upload URL from B2');

    // Calculate SHA1
    const sha1 = crypto.createHash('sha1').update(fileBuffer).digest('hex');
    console.log(`✓ SHA1 calculated: ${sha1.substring(0, 8)}...`);

    // Upload to B2
    console.log('📤 Uploading to B2...');
    console.log('   Upload URL:', uploadUrlData.uploadUrl);
    console.log('   Headers:', {
      'X-Bz-File-Name': encodeURIComponent(fullFileName),
      'Content-Type': contentType,
      'X-Bz-Content-Sha1': sha1.substring(0, 8) + '...',
    });

    let uploadResponse;
    try {
      uploadResponse = await fetch(uploadUrlData.uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: uploadUrlData.authorizationToken,
          'X-Bz-File-Name': fullFileName,
          'Content-Type': contentType,
          'X-Bz-Content-Sha1': sha1,
        },
        body: fileBuffer,
      });
    } catch (fetchError) {
      console.error('✗ Fetch error during B2 upload:', fetchError.message);
      console.error('   Cause:', fetchError.cause);
      throw fetchError;
    }

    console.log('   Response status:', uploadResponse.status);
    const uploadResult = await uploadResponse.json();

    if (!uploadResponse.ok) {
      console.error('✗ B2 upload failed:', uploadResult);
      throw new Error(uploadResult.message || `Upload failed (${uploadResponse.status})`);
    }

    console.log('✓ File uploaded successfully to B2');

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
    console.error('❌ Upload error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Fast Upload endpoint (Binary data - no FormData!)
app.post('/api/upload-to-b2-fast', async (req, res) => {
  try {
    console.log('🚀 Fast upload request received');

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

    // Get file info from headers
    const fileName = req.headers['x-file-name'];
    const folder = req.headers['x-folder'] || 'study-materials/';
    const contentType = req.headers['x-content-type'] || 'application/octet-stream';
    const fileBuffer = req.body; // Raw binary data

    if (!fileName || !fileBuffer) {
      console.error('✗ Missing file data or name');
      return res.status(400).json({ error: 'Missing file data' });
    }
    const fullFileName = `${folder}${fileName}`;

    console.log(`📄 File: ${fileName} (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

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
      console.error('✗ B2 upload failed:', uploadResult);
      throw new Error(uploadResult.message || `Upload failed (${uploadResponse.status})`);
    }

    console.log('✓ File uploaded successfully to B2');

    // Return public URL directly
    const publicUrl = `${auth.downloadUrl}/file/${encodeURIComponent(B2_BUCKET_NAME)}/${encodeURIComponent(fullFileName)}`;

    res.json({
      success: true,
      fileName: uploadResult.fileName,
      fileId: uploadResult.fileId,
      publicUrl,
    });
  } catch (error) {
    console.error('❌ Fast upload error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: error.message || 'Upload failed',
      details: error.stack
    });
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
