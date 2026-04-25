/**
 * B2 Storage Service
 * Handles file uploads via backend API
 * Backend authenticates with B2 securely
 */

import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Upload file to B2 via backend API
 * @param {File} file - The file to upload
 * @param {string} folder - Optional folder path (e.g., 'slides/', 'gallery/')
 * @returns {Promise<{fileName: string, fileId: string, publicUrl: string}>}
 */
export async function uploadToB2(file, folder = 'slides/') {
  try {
    // Get auth token from Supabase session
    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session) {
      throw new Error('Not authenticated. Please login first.');
    }

    const token = data.session.access_token;

    // Convert file to base64 safely (in chunks to avoid stack overflow)
    const fileBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(fileBuffer);
    let fileBase64 = '';
    const chunkSize = 0x8000; // 32KB chunks
    for (let i = 0; i < bytes.length; i += chunkSize) {
      fileBase64 += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    fileBase64 = btoa(fileBase64);

    console.log('Uploading to B2:', file.name);

    // Send to backend API
    const response = await fetch(`${API_URL}/api/upload-to-b2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        file: fileBase64,
        folder,
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
    }

    const result = await response.json();

    console.log('Upload successful:', result.fileName);

    // Use backend download proxy URL instead of direct B2 URL
    return {
      fileName: result.fileName,
      fileId: result.fileId,
      contentSha1: result.contentSha1,
      publicUrl: result.downloadUrl || result.publicUrl, // Falls back to publicUrl if available
    };
  } catch (error) {
    console.error('B2 Upload Error:', error);
    throw error;
  }
}

/**
 * Delete file from B2
 */
export async function deleteFromB2(fileName, fileId) {
  throw new Error('deleteFromB2 not yet implemented.');
}

/**
 * List files in B2 bucket
 */
export async function listB2Files(folder = '', limit = 100) {
  throw new Error('listB2Files not yet implemented.');
}

export default {
  uploadToB2,
  deleteFromB2,
  listB2Files,
};
