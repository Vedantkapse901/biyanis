import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, X, MapPin } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'
import { getBranchMapLink, newBranchTemplate, sanitizeBranchPayload } from '../lib/branchHelpers'

export function BranchesManagement({ branches = [], onAdd, onUpdate, onDelete, isLoading }) {
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (editingId == null) {
      setEditDraft(null)
      return
    }
    const branch = branches.find((b) => b.id === editingId)
    if (!branch) return
    setEditDraft({
      ...branch,
      map_link: getBranchMapLink(branch),
    })
  }, [editingId, branches])

  const startEditing = (branch) => {
    setActionError('')
    setEditingId(branch.id)
  }

  const handleAddBranch = async () => {
    setActionError('')
    try {
      const created = await onAdd(newBranchTemplate(branches.length))
      if (created?.id) {
        setEditingId(created.id)
      }
    } catch (err) {
      setActionError(err?.message || 'Failed to add branch')
    }
  }

  const handleSaveBranch = async () => {
    if (!editDraft?.id) return
    setActionError('')
    try {
      await onUpdate(editDraft.id, sanitizeBranchPayload(editDraft))
      setEditingId(null)
    } catch (err) {
      setActionError(err?.message || 'Failed to save branch')
    }
  }

  const handleDeleteBranch = async (id) => {
    if (!window.confirm('Delete this branch?')) return
    setActionError('')
    try {
      await onDelete(id)
      if (editingId === id) setEditingId(null)
    } catch (err) {
      setActionError(err?.message || 'Failed to delete branch')
    }
  }

  const updateDraft = (field, value) => {
    setEditDraft((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Branch Management</h2>
        <button
          type="button"
          onClick={handleAddBranch}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50"
        >
          <Plus className="h-5 w-5" /> Add Branch
        </button>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {actionError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {branches.map((branch) => (
          <GlassCard key={branch.id} className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {editingId === branch.id && editDraft ? (
                    <input
                      type="text"
                      value={editDraft.name}
                      onChange={(e) => updateDraft('name', e.target.value)}
                      className="w-full rounded border border-slate-300 px-3 py-2 font-bold text-slate-900"
                    />
                  ) : (
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[#D90429]" />
                      {branch.name}
                    </h3>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => (editingId === branch.id ? setEditingId(null) : startEditing(branch))}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {editingId === branch.id ? <X /> : <Edit2 className="h-5 w-5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBranch(branch.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {editingId === branch.id && editDraft ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1">City</label>
                    <input
                      type="text"
                      value={editDraft.city || ''}
                      onChange={(e) => updateDraft('city', e.target.value)}
                      placeholder="e.g., Mumbai, Delhi"
                      className="w-full rounded border border-slate-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[#D90429]">📍 Address</label>
                    <textarea
                      value={editDraft.address || ''}
                      onChange={(e) => updateDraft('address', e.target.value)}
                      placeholder="Complete branch address with landmarks, building name, etc."
                      className="w-full rounded border-2 border-slate-300 px-3 py-2 focus:border-[#D90429]"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editDraft.phone || ''}
                      onChange={(e) => updateDraft('phone', e.target.value)}
                      placeholder="e.g., +91-9876543210"
                      className="w-full rounded border border-slate-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      value={editDraft.email || ''}
                      onChange={(e) => updateDraft('email', e.target.value)}
                      placeholder="branch@example.com"
                      className="w-full rounded border border-slate-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[#D90429]">🗺️ Google Maps Link</label>
                    <input
                      type="url"
                      value={editDraft.map_link || ''}
                      onChange={(e) => updateDraft('map_link', e.target.value)}
                      placeholder="Get from: right-click location on Google Maps → Copy link"
                      className="w-full rounded border-2 border-slate-300 px-3 py-2 text-sm focus:border-[#D90429]"
                    />
                    {editDraft.map_link && (
                      <p className="text-xs text-green-600 mt-1">✓ Maps link added</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveBranch}
                    disabled={isLoading}
                    className="w-full rounded bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    Save Branch
                  </button>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-slate-600">
                  {branch.city && (
                    <p>
                      <strong>City:</strong> {branch.city}
                    </p>
                  )}
                  {branch.address && (
                    <p>
                      <strong>Address:</strong> {branch.address}
                    </p>
                  )}
                  {branch.phone && (
                    <p>
                      <strong>Phone:</strong>{' '}
                      <a href={`tel:${branch.phone}`} className="text-[#D90429] hover:underline">
                        {branch.phone}
                      </a>
                    </p>
                  )}
                  {branch.email && (
                    <p>
                      <strong>Email:</strong>{' '}
                      <a href={`mailto:${branch.email}`} className="text-[#D90429] hover:underline">
                        {branch.email}
                      </a>
                    </p>
                  )}
                  {getBranchMapLink(branch) && (
                    <p>
                      <a
                        href={getBranchMapLink(branch)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#D90429] hover:underline font-semibold flex items-center gap-1"
                      >
                        <MapPin className="h-4 w-4" />
                        View on Google Maps
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      {branches.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 mb-4">No branches added yet</p>
          <button
            type="button"
            onClick={handleAddBranch}
            disabled={isLoading}
            className="rounded-lg bg-[#D90429] px-6 py-2 text-white font-semibold hover:bg-[#b00320] disabled:opacity-50"
          >
            Add First Branch
          </button>
        </div>
      )}
    </div>
  )
}
