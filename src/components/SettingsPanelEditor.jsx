import { useEffect, useState } from 'react'
import { Save, AlertCircle, Check } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'
import { useSettings, useSupabaseMutation } from '../hooks/useSupabaseData'

export function SettingsPanelEditor() {
  const { settings, loading: settingsLoading } = useSettings()
  const { update, loading: updateLoading } = useSupabaseMutation()
  const [formData, setFormData] = useState({})
  const [saveStatus, setSaveStatus] = useState('')
  const [editMode, setEditMode] = useState(false)

  // Sync database settings to form
  useEffect(() => {
    if (settings) {
      setFormData(settings)
    }
  }, [settings])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaveStatus('Saving settings...')
      const result = await update('settings', settings.id, formData)

      if (result.success) {
        setSaveStatus('✅ Settings saved successfully!')
        setEditMode(false)
        setTimeout(() => setSaveStatus(''), 3000)
      } else {
        setSaveStatus('❌ Failed to save settings')
      }
    } catch (error) {
      setSaveStatus('Could not save settings. Please try again.')
    }
  }

  const handleCancel = () => {
    setFormData(settings || {})
    setEditMode(false)
  }

  if (settingsLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D90429] border-t-transparent"></div>
          <p className="ml-4 text-slate-600">Loading settings...</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {saveStatus && (
        <div className={`rounded-lg p-4 ${
          saveStatus.includes('✅')
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {saveStatus.includes('✅') ? (
              <Check className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            {saveStatus}
          </div>
        </div>
      )}

      {/* Website Settings Section */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#0A0F2C]">🌐 Website Settings</h3>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="rounded-lg bg-[#D90429] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b00320]"
            >
              Edit Settings
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={updateLoading}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                disabled={updateLoading}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#D90429]"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Tagline */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Website Tagline
            </label>
            <textarea
              disabled={!editMode}
              value={formData.tagline || ''}
              onChange={(e) => handleInputChange('tagline', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 disabled:bg-slate-50 disabled:text-slate-600"
              rows="2"
              placeholder="Enter your website tagline"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              WhatsApp Number
            </label>
            <input
              disabled={!editMode}
              type="tel"
              value={formData.whatsapp || ''}
              onChange={(e) => handleInputChange('whatsapp', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 disabled:bg-slate-50 disabled:text-slate-600"
              placeholder="e.g., 917208324505"
            />
          </div>

          {/* Review Link */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Google Review Link
            </label>
            <input
              disabled={!editMode}
              type="url"
              value={formData.review_link || ''}
              onChange={(e) => handleInputChange('review_link', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 disabled:bg-slate-50 disabled:text-slate-600"
              placeholder="https://maps.app.goo.gl/..."
            />
          </div>

          {/* Gemini API Key */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              AI Chatbot Key
            </label>
            <input
              disabled={!editMode}
              type="password"
              value={formData.gemini_api_key || ''}
              onChange={(e) => handleInputChange('gemini_api_key', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 disabled:bg-slate-50 disabled:text-slate-600"
              placeholder="Enter your chatbot key (optional)"
            />
          </div>

          {/* Made By */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Made By (Credits)
            </label>
            <input
              disabled={!editMode}
              type="text"
              value={formData.made_by || ''}
              onChange={(e) => handleInputChange('made_by', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 disabled:bg-slate-50 disabled:text-slate-600"
              placeholder="e.g., Made with love by Vedant & Bhushan"
            />
          </div>
        </div>
      </GlassCard>

      {/* Team Info Section */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-[#0A0F2C] mb-6">👥 Team Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vedant Info */}
          <div className="space-y-4 pb-6 border-b md:border-b-0 md:border-r md:pr-6">
            <h4 className="text-lg font-semibold text-slate-800">Vedant</h4>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Designation
              </label>
              <input
                disabled={!editMode}
                type="text"
                value={formData.vedant_designation || ''}
                onChange={(e) => handleInputChange('vedant_designation', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 disabled:bg-slate-50 disabled:text-slate-600"
                placeholder="e.g., Co-Founder"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                disabled={!editMode}
                type="email"
                value={formData.vedant_email || ''}
                onChange={(e) => handleInputChange('vedant_email', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 disabled:bg-slate-50 disabled:text-slate-600"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone
              </label>
              <input
                disabled={!editMode}
                type="tel"
                value={formData.vedant_phone || ''}
                onChange={(e) => handleInputChange('vedant_phone', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 disabled:bg-slate-50 disabled:text-slate-600"
                placeholder="91XXXXXXXXXX"
              />
            </div>
          </div>

          {/* Bhushan Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-800">Bhushan</h4>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Designation
              </label>
              <input
                disabled={!editMode}
                type="text"
                value={formData.bhushan_designation || ''}
                onChange={(e) => handleInputChange('bhushan_designation', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 disabled:bg-slate-50 disabled:text-slate-600"
                placeholder="e.g., Co-Founder"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                disabled={!editMode}
                type="email"
                value={formData.bhushan_email || ''}
                onChange={(e) => handleInputChange('bhushan_email', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 disabled:bg-slate-50 disabled:text-slate-600"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone
              </label>
              <input
                disabled={!editMode}
                type="tel"
                value={formData.bhushan_phone || ''}
                onChange={(e) => handleInputChange('bhushan_phone', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 disabled:bg-slate-50 disabled:text-slate-600"
                placeholder="91XXXXXXXXXX"
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
