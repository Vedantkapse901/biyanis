import { Readable } from 'node:stream';
import { authorizeB2, B2_BUCKET_NAME } from './helpers.js';

const IMAGE_TYPES = /^image\//i;
const VIDEO_TYPES = /^video\//i;
const PDF_TYPES = /^application\/pdf/i;

function encodeB2Path(decodedPath) {
  return decodedPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

/**
 * Proxy a B2 object to the client with Range support (required for HTML5 video).
 */
export async function proxyB2Download(req, res) {
  const filePath = req.query?.path;
  if (!filePath) {
    res.status(400).json({ error: 'Missing path parameter' });
    return;
  }

  const inline = String(req.query?.inline || '') === '1';
  const forceDownload = String(req.query?.download || '') === '1';
  const decodedPath = decodeURIComponent(String(filePath));
  const encodedPath = encodeB2Path(decodedPath);
  const rangeHeader = req.headers?.range || req.headers?.Range;

  const auth = await authorizeB2();
  const fileUrl = `${auth.downloadUrl}/file/${encodeURIComponent(B2_BUCKET_NAME)}/${encodedPath}`;

  const fetchHeaders = { Authorization: auth.authorizationToken };
  if (rangeHeader) fetchHeaders.Range = rangeHeader;

  const method = req.method === 'HEAD' ? 'HEAD' : 'GET';
  const fileResponse = await fetch(fileUrl, { method, headers: fetchHeaders });

  if (!fileResponse.ok && fileResponse.status !== 206) {
    console.error(`B2 download failed: ${fileResponse.status}`, decodedPath);
    res.status(fileResponse.status).json({ error: 'File not found' });
    return;
  }

  const contentType =
    fileResponse.headers.get('content-type') || 'application/octet-stream';
  const contentLength = fileResponse.headers.get('content-length');
  const contentRange = fileResponse.headers.get('content-range');
  const fileName = decodedPath.split('/').pop() || 'file';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Accept-Ranges', 'bytes');

  if (forceDownload) {
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  } else if (
    inline ||
    IMAGE_TYPES.test(contentType) ||
    VIDEO_TYPES.test(contentType) ||
    PDF_TYPES.test(contentType)
  ) {
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
  } else {
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  }

  if (fileResponse.status === 206) {
    res.status(206);
    if (contentRange) res.setHeader('Content-Range', contentRange);
  }

  if (contentLength) {
    res.setHeader('Content-Length', contentLength);
  }

  if (method === 'HEAD') {
    res.end();
    return;
  }

  if (fileResponse.body) {
    const nodeStream = Readable.fromWeb(fileResponse.body);
    await new Promise((resolve, reject) => {
      nodeStream.on('error', reject);
      res.on('error', reject);
      res.on('finish', resolve);
      nodeStream.pipe(res);
    });
    return;
  }

  const buffer = await fileResponse.arrayBuffer();
  res.send(Buffer.from(buffer));
}
