import { verifyAdminToken, setCorsHeaders } from './lib/helpers.js';
import { parseUploadRequest, uploadBufferToB2 } from './lib/b2UploadCore.js';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!token) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const authResult = await verifyAdminToken(token);
    if (!authResult.ok) {
      return res.status(authResult.reason === 'Invalid token' ? 401 : 403).json({
        error: authResult.reason,
      });
    }

    const uploadInput = await parseUploadRequest(req);
    const result = await uploadBufferToB2(uploadInput);

    res.json({
      success: true,
      fileName: result.fileName,
      fileId: result.fileId,
      downloadUrl: result.downloadUrl,
      publicUrl: result.publicUrl,
      b2Url: result.publicUrl,
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({
      error: error.message || 'Upload failed',
    });
  }
}
