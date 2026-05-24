/** Resolve map URL from any branch column naming used in the app or DB. */
export function getBranchMapLink(branch) {
  return branch?.google_maps_link || branch?.map_link || branch?.mapLink || ''
}

/** Strip read-only / unknown fields before Supabase insert or update. */
export function sanitizeBranchPayload(raw) {
  const mapLink = getBranchMapLink(raw).trim()
  const payload = {
    name: String(raw?.name || 'New Branch').trim() || 'New Branch',
    address: String(raw?.address || 'Address pending').trim() || 'Address pending',
    phone: String(raw?.phone || '').trim() || null,
    display_order: Number.isFinite(Number(raw?.display_order)) ? Number(raw.display_order) : 0,
  }

  if (mapLink) {
    payload.map_link = mapLink
  }

  const city = raw?.city != null ? String(raw.city).trim() : ''
  const email = raw?.email != null ? String(raw.email).trim() : ''
  if (city) payload.city = city
  if (email) payload.email = email

  return payload
}

export function newBranchTemplate(displayOrder = 0) {
  return {
    name: 'New Branch',
    city: '',
    address: 'Address pending',
    phone: '',
    email: '',
    map_link: '',
    display_order: displayOrder,
  }
}
