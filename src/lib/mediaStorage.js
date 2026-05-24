/**
 * B2-only admin uploads (Backblaze bucket from .env B2_BUCKET_NAME).
 * Browser → /api/upload-to-b2 → B2. Supabase is only used for admin login token.
 */
import { supabase } from './supabase';
import { buildB2DisplayUrl, buildB2PdfDownloadUrl, buildB2PdfViewUrl, toB2StorageRef } from './b2MediaUrls';
import { friendlyError, userMessages } from './userMessages';

function resolveApiBase() {
  const raw = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (!raw) return '';
  if (typeof window !== 'undefined') {
    const onLocalSite =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!onLocalSite && /localhost|127\.0\.0\.1/i.test(raw)) {
      return '';
    }
  }
  return raw;
}

const API_BASE = resolveApiBase();

export function canUseAdminStorage() {
  return Boolean(supabase);
}

/** @deprecated Always B2 — kept for callers that check this */
export function isB2StorageBackend() {
  return true;
}

export function safeFileName(name) {
  return String(name || 'file').replace(/[^a-zA-Z0-9._-]+/g, '_');
}

export function buildStoragePath(folder, fileName) {
  const prefix = String(folder || 'uploads/').replace(/\/?$/, '/');
  return `${prefix}${Date.now()}-${safeFileName(fileName)}`;
}

function splitStoragePath(storagePath) {
  const path = String(storagePath || '').replace(/^\/+/, '');
  const i = path.lastIndexOf('/');
  if (i < 0) return { folder: '', fileName: path };
  return { folder: path.slice(0, i + 1), fileName: path.slice(i + 1) };
}

async function getAccessToken() {
  if (!supabase) throw new Error(userMessages.loginInvalid);
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.access_token) {
    throw new Error('Please log in to the admin panel and try again.');
  }
  return data.session.access_token;
}

/**
 * @param {{ storagePath: string, file: File | Blob, contentType?: string }} opts
 */
export async function uploadAdminFile({ storagePath, file, contentType }) {
  const token = await getAccessToken();
  const { folder, fileName } = splitStoragePath(storagePath);
  const ct = contentType || file.type || 'application/octet-stream';
  const body = await file.arrayBuffer();

  const uploadUrl = API_BASE ? `${API_BASE}/api/upload-to-b2` : '/api/upload-to-b2';
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-File-Name': fileName,
      'X-Folder': folder,
      'X-Content-Type': ct,
    },
    body,
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(friendlyError(result.error, userMessages.uploadFailed));
  }

  const key = result.fileName || storagePath;
  const storageRef = toB2StorageRef(key);
  const displayUrl = buildB2DisplayUrl(storageRef);

  if (!storageRef) throw new Error(userMessages.uploadFailed);

  return {
    url: displayUrl,
    viewUrl: buildB2PdfViewUrl(storageRef),
    downloadUrl: buildB2PdfDownloadUrl(storageRef),
    storageRef,
    storagePath: key,
    fileName: result.fileName,
  };
}

export async function uploadToB2AtPath(file, storagePath) {
  const { url, storageRef, fileName, storagePath: saved } = await uploadAdminFile({
    storagePath,
    file,
    contentType: file.type,
  });
  return {
    publicUrl: url,
    storageRef,
    fileName: fileName || saved,
  };
}

export async function uploadToB2Folder(file, folder = 'uploads/') {
  return uploadToB2AtPath(file, buildStoragePath(folder, file.name));
}

export const uploadToB2 = uploadToB2Folder;

export async function deleteAdminFile() {
  throw new Error('File delete is not available here yet.');
}

export async function listAdminFiles() {
  throw new Error('File list is not available here yet.');
}

export default {
  uploadAdminFile,
  uploadToB2AtPath,
  uploadToB2Folder,
  uploadToB2,
  buildStoragePath,
  safeFileName,
  canUseAdminStorage,
  isB2StorageBackend,
};
