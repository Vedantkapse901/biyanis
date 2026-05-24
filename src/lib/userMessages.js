const TECHNICAL_PATTERN =
  /supabase|backblaze|\bb2\b|b2ref|service[_-]?role|\.env|\/api\/|rls|postgres|authorization token|internal server|fetch failed|network error|missing authorization|bad character|percent-encoded|npm run|vercel/i;

/** Turn backend/technical errors into plain language for users. */
export function friendlyError(error, fallback = 'Something went wrong. Please try again.') {
  const raw = String(error?.message || error || '').trim();
  if (!raw) return fallback;

  if (/not authenticated|please log in|log in to the admin/i.test(raw)) {
    return 'Please log in to the admin panel and try again.';
  }
  if (/upload failed|bad character|file too large|missing file/i.test(raw)) {
    return 'Upload failed. Try a smaller file or rename it using letters and numbers only.';
  }
  if (/401|403|invalid token|session expired|unauthorized/i.test(raw)) {
    return 'Your session expired. Please log in again.';
  }
  if (/network|failed to fetch|connection/i.test(raw)) {
    return 'Connection issue. Check your internet and try again.';
  }
  if (TECHNICAL_PATTERN.test(raw) || raw.length > 100 || raw.includes('{')) {
    return fallback;
  }

  return raw;
}

export function isErrorStatus(message) {
  const s = String(message || '').trim();
  return /^❌|^Failed|^Error|could not|unable to/i.test(s);
}

export const userMessages = {
  uploading: 'Uploading file…',
  saving: 'Saving…',
  preparing: 'Preparing file…',
  uploadSuccess: 'File uploaded successfully!',
  savingRecord: 'Saving to your website…',
  saveSuccess: 'Saved successfully!',
  saveFailed: 'Could not save changes. Please try again.',
  uploadFailed: 'Upload failed. Please try again.',
  deleteSuccess: 'Deleted successfully!',
  deleteFailed: 'Could not delete. Please try again.',
  connectionIssue: 'Unable to load the latest content right now.',
  loginInvalid: 'Invalid email or password.',
  pdfUnavailable: 'This PDF is not available right now.',
  pdfDownloadFailed: 'Could not open the PDF. Please try again.',
  noStudents: 'Student login is not set up yet. Please contact your institute.',
  slideSaveFailed: 'Could not save the slide. Please try again.',
  slideAdded: 'Slide added successfully!',
};
