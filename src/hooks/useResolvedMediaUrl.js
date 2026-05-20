import { useEffect, useState } from 'react';
import { resolveB2MediaUrl } from '../lib/b2MediaUrls';

/**
 * Resolves b2ref:// or B2 paths to /api/download proxy URLs for display.
 * @param {string} storedUrl
 * @returns {{ url: string, loading: boolean }}
 */
export function useResolvedMediaUrl(storedUrl) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = String(storedUrl || '').trim();
    if (!s) {
      setUrl('');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    resolveB2MediaUrl(s)
      .then((u) => {
        if (!cancelled) {
          setUrl(u);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUrl(s);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [storedUrl]);

  return { url, loading };
}
