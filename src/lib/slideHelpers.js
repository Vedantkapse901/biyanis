/** Normalize CTA fields between DB / admin / frontend naming. */
export function getSlideCtaText(slide) {
  return slide?.cta_text || slide?.cta || ''
}

export function getSlideCtaUrl(slide) {
  return slide?.cta_url || slide?.ctaUrl || ''
}

/** Strip read-only fields before Supabase insert or update. */
export function sanitizeSlidePayload(raw) {
  const payload = {
    type: raw?.type === 'video' ? 'video' : 'image',
    url: String(raw?.url || '').trim(),
  }

  if (raw?.headline != null) payload.headline = String(raw.headline).trim()
  if (raw?.subheadline != null) payload.subheadline = String(raw.subheadline).trim()

  const ctaText = getSlideCtaText(raw).trim()
  const ctaUrl = getSlideCtaUrl(raw).trim()
  if (ctaText) payload.cta = ctaText
  if (ctaUrl) payload.cta_url = ctaUrl

  if (raw?.display_order != null) {
    payload.display_order = Number(raw.display_order) || 0
  }

  return payload
}
