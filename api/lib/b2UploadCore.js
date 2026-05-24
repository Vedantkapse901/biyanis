import crypto from 'crypto';
import { authorizeB2, b2ApiCall, B2_BUCKET_ID, B2_BUCKET_NAME } from './helpers.js';

function getHeader(req, name) {
  const key = name.toLowerCase();
  const h = req.headers || {};
  return h[key] ?? h[name] ?? '';
}

export async function readUploadBody(req) {
  if (Buffer.isBuffer(req.body) && req.body.length > 0) {
    return req.body;
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function parseUploadRequest(req) {
  const rawBody = await readUploadBody(req);
  const requestContentType = getHeader(req, 'content-type');

  if (requestContentType.includes('application/json')) {
    const body = JSON.parse(rawBody.length ? rawBody.toString('utf8') : '{}');
    if (!body.file) {
      throw new Error('Missing file data');
    }
    return {
      fileName: body.fileName,
      folder: body.folder || 'uploads/',
      contentType: body.contentType || 'application/octet-stream',
      fileBuffer: Buffer.from(body.file, 'base64'),
    };
  }

  const fileName = getHeader(req, 'x-file-name');
  const folder = getHeader(req, 'x-folder') || 'uploads/';
  const contentType = getHeader(req, 'x-content-type') || 'application/octet-stream';

  return {
    fileName,
    folder,
    contentType,
    fileBuffer: rawBody,
  };
}

export async function uploadBufferToB2({ fileName, folder, contentType, fileBuffer }) {
  if (!fileName || !fileBuffer || fileBuffer.length === 0) {
    throw new Error('Missing file data');
  }

  const auth = await authorizeB2();
  const uploadUrlData = await b2ApiCall('POST', 'b2_get_upload_url', auth, {
    bucketId: B2_BUCKET_ID,
  });

  const sha1 = crypto.createHash('sha1').update(fileBuffer).digest('hex');
  const fullFileName = `${folder}${fileName}`;
  const encodedFileName = fullFileName
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: uploadUrlData.authorizationToken,
      'X-Bz-File-Name': encodedFileName,
      'Content-Type': contentType,
      'X-Bz-Content-Sha1': sha1,
    },
    body: fileBuffer,
  });

  const uploadResult = await uploadResponse.json();
  if (!uploadResponse.ok) {
    throw new Error(uploadResult.message || `Upload failed (${uploadResponse.status})`);
  }

  const publicUrl = `${auth.downloadUrl}/file/${encodeURIComponent(B2_BUCKET_NAME)}/${encodeURIComponent(fullFileName)}`;

  return {
    fileName: uploadResult.fileName,
    fileId: uploadResult.fileId,
    publicUrl,
    downloadUrl: `/api/download?path=${encodeURIComponent(uploadResult.fileName)}`,
  };
}
