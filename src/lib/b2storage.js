/**
 * Legacy re-exports — all uploads go to B2 via `mediaStorage`.
 */
import {
  uploadToB2Folder,
  uploadToB2AtPath,
  uploadAdminFile,
  buildStoragePath,
  safeFileName,
} from './mediaStorage';

export const uploadToB2 = uploadToB2Folder;
export { uploadToB2AtPath, uploadAdminFile, buildStoragePath, safeFileName };

export async function deleteFromB2() {
  throw new Error('deleteFromB2 not yet implemented.');
}

export async function listB2Files() {
  throw new Error('listB2Files not yet implemented.');
}

export default {
  uploadToB2,
  deleteFromB2,
  listB2Files,
};
