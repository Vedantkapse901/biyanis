import { useResolvedMediaUrl } from '../hooks/useResolvedMediaUrl';

/**
 * <img> that resolves b2ref:// and B2 paths via /api/download proxy (EYE10-style).
 */
export function ResolvedImage({ src, alt, className, fallback = null, ...rest }) {
  const { url, loading } = useResolvedMediaUrl(src);

  if (!src) return fallback;

  if (loading) {
    return (
      <div
        className={`animate-pulse bg-slate-200 ${className || ''}`}
        aria-hidden
      />
    );
  }

  if (!url) return fallback;

  return (
    <img
      src={url}
      alt={alt || ''}
      className={className}
      loading="lazy"
      onError={(e) => {
        e.target.style.display = 'none';
      }}
      {...rest}
    />
  );
}
