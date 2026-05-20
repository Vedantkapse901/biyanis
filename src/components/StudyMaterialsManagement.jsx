import { useState } from 'react'
import { Upload, Trash2, Plus, Download } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'
import { uploadAdminFile } from '../lib/mediaStorage'

const COURSES = [
  { id: 'JEE', name: 'JEE Main & Advanced' },
  { id: 'NEET', name: 'NEET' },
  { id: 'MHT-CET', name: 'MHT-CET' },
]

const CLASS_LEVELS = [11, 12]

export function StudyMaterialsManagement({ materials, onAdd, onDelete, isLoading }) {
  const [selectedCourse, setSelectedCourse] = useState('JEE')
  const [selectedClass, setSelectedClass] = useState(11)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingFile, setEditingFile] = useState(null)
  const [addingNew, setAddingNew] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)

  const courseName = COURSES.find(c => c.id === selectedCourse)?.name
  const filteredMaterials = materials.filter(
    m => m.course === selectedCourse && m.class_level === selectedClass
  )

  const handleFileChange = (e) => {
    setEditingFile(e.target.files?.[0] || null)
  }

  const handleAddMaterial = async () => {
    if (!editingTitle.trim() || !editingFile) {
      alert('Please enter a title and select a file')
      return
    }

    setUploadProgress('🔄 Uploading...')
    setUploadLoading(true)

    try {
      const timestamp = Date.now()
      const fileName = `${timestamp}_${editingFile.name}`
      const storagePath = `study-materials/${selectedCourse}/class-${selectedClass}/${fileName}`

      const { url } = await uploadAdminFile({
        storagePath,
        file: editingFile,
        contentType: editingFile.type || 'application/pdf',
      })

      if (!url) {
        alert('❌ Upload failed: Could not get public URL')
        setUploadProgress('')
        setUploadLoading(false)
        return
      }

      setUploadProgress('✅ Upload successful! Saving to database...')

      const newMaterial = {
        title: editingTitle,
        course: selectedCourse,
        class_level: selectedClass,
        pdf_url: url,
        file_size: editingFile.size,
        display_order: filteredMaterials.length,
      }

      await onAdd(newMaterial)

      setUploadProgress('✅ Material uploaded and saved!')
      setTimeout(() => {
        setEditingTitle('')
        setEditingFile(null)
        setAddingNew(false)
        setUploadProgress('')
        setUploadLoading(false)
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      alert('❌ Error: ' + error.message)
      setUploadProgress('')
      setUploadLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Upload className="h-8 w-8 text-[#D90429]" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">📚 Study Materials Management</h2>
          <p className="text-sm text-slate-600">Upload PDFs for each course and class combination</p>
        </div>
      </div>

      {/* Course & Class Selection */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Select Course & Class</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-900 focus:border-[#D90429] focus:outline-none"
            >
              {COURSES.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(parseInt(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-900 focus:border-[#D90429] focus:outline-none"
            >
              {CLASS_LEVELS.map(level => (
                <option key={level} value={level}>
                  Class {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-800">
          <strong>📖 Active Selection:</strong> {courseName} - Class {selectedClass}
        </p>
      </div>

      {/* Materials List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">
            Materials ({filteredMaterials.length})
          </h3>
          {!addingNew && (
            <button
              onClick={() => setAddingNew(true)}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Material
            </button>
          )}
        </div>

        {/* Add New Material Form */}
        {addingNew && (
          <GlassCard className="p-6 border-2 border-[#D90429]">
            <h4 className="font-bold text-slate-900 mb-4">Upload New Material</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Material Title
                </label>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  placeholder="e.g., Physics Chapter 1 Notes"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-[#D90429] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  PDF File
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 file:mr-3 file:rounded file:border-0 file:bg-[#D90429] file:px-3 file:py-1 file:font-semibold file:text-white hover:file:bg-[#b00320]"
                />
              </div>

              {editingFile && (
                <p className="text-sm text-slate-600">
                  📄 {editingFile.name} ({(editingFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}

              {uploadProgress && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800 font-semibold">
                  {uploadProgress}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleAddMaterial}
                  disabled={isLoading || uploadLoading || !editingTitle || !editingFile}
                  className="flex-1 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50 transition-colors"
                >
                  {uploadLoading ? '🔄 Uploading...' : '⬆️ Upload to B2'}
                </button>
                <button
                  onClick={() => {
                    setAddingNew(false)
                    setEditingTitle('')
                    setEditingFile(null)
                    setUploadProgress('')
                  }}
                  disabled={uploadLoading}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-900 hover:border-[#D90429] hover:text-[#D90429] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Materials Grid */}
        {filteredMaterials.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredMaterials.map((material) => (
              <GlassCard key={material.id} className="p-4">
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900">{material.title}</h4>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Download className="h-4 w-4" />
                    {material.file_size
                      ? `${(material.file_size / 1024 / 1024).toFixed(2)} MB`
                      : 'PDF'}
                  </div>

                  {material.created_at && (
                    <p className="text-xs text-slate-500">
                      Added: {new Date(material.created_at).toLocaleDateString()}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {material.pdf_url && (
                      <div className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-center text-xs font-semibold text-blue-600">
                        📄 {material.pdf_url.split('/').pop()}
                      </div>
                    )}
                    <button
                      onClick={() => onDelete(material.id)}
                      disabled={isLoading}
                      className="rounded-lg bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="p-8 text-center">
            <p className="text-slate-600">
              No materials uploaded yet for {courseName} Class {selectedClass}
            </p>
            <p className="mt-2 text-sm text-slate-500">Click "Add Material" to upload a PDF</p>
          </GlassCard>
        )}
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-green-50 border border-green-200 p-4">
        <p className="text-sm text-green-800">
          <strong>💡 How it works:</strong> Upload PDFs for each course and class. Files go to Supabase Storage (direct from the browser, like EYE10) and save to the database. Students only see materials for their course.
        </p>
      </div>

      {/* Storage Info */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
        <p className="text-sm text-amber-800">
          <strong>☁️ Storage path:</strong> PDFs are stored under: <br />
          <code className="bg-white px-2 py-1 rounded text-xs font-mono">study-materials/{'{course}'}/class-{'{class}'}/{'{filename}'}</code>
        </p>
      </div>
    </div>
  )
}
