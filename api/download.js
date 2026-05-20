import { authorizeB2, B2_BUCKET_NAME, setCorsHeaders } from './lib/helpers.js';

const IMAGE_TYPES = /^image\//i;

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    const inline = String(req.query.inline || '') === '1';
    const decodedPath = decodeURIComponent(String(filePath));
    const encodedPath = decodedPath
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    const auth = await authorizeB2();
    const fileUrl = `${auth.downloadUrl}/file/${encodeURIComponent(B2_BUCKET_NAME)}/${encodedPath}`;

    const fileResponse = await fetch(fileUrl, {
      headers: {
        Authorization: auth.authorizationToken,
      },
    });

    if (!fileResponse.ok) {
      console.error(`B2 download failed: ${fileResponse.status}`, decodedPath);
      return res.status(fileResponse.status).json({ error: 'File not found' });
    }

    const contentType =
      fileResponse.headers.get('content-type') || 'application/octet-stream';
    const contentLength = fileResponse.headers.get('content-length');
    const fileName = decodedPath.split('/').pop() || 'file';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    if (inline || IMAGE_TYPES.test(contentType)) {
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    }

    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    const buffer = await fileResponse.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message || 'Download failed' });
  }
}
