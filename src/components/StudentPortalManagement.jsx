import { useState } from 'react'
import { Plus, Trash2, Edit2, X, FileText, Upload, Loader } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'
import { uploadAdminFile, buildStoragePath } from '../lib/mediaStorage'
import { buildB2PdfDownloadUrl, buildB2PdfViewUrl } from '../lib/b2MediaUrls'
import { friendlyError, userMessages } from '../lib/userMessages'

const EXAM_TYPES = [
  { id: 'jee', label: '🔬 JEE', color: 'bg-blue-100' },
  { id: 'neet', label: '💊 NEET', color: 'bg-green-100' },
  { id: 'mht-cet', label: '📚 MHT-CET', color: 'bg-purple-100' },
]

const SECTION_TEMPLATES = {
  jee: [
    'Physics - Theory',
    'Physics - Problems',
    'Chemistry - Theory',
    'Chemistry - Problems',
    'Mathematics - Theory',
    'Mathematics - Problems',
    'Mock Tests',
    'Previous Year Papers',
  ],
  neet: [
    'Biology - Theory',
    'Biology - Diagrams',
    'Chemistry - Theory',
    'Chemistry - Problems',
    'Physics - Theory',
    'Physics - Problems',
    'Mock Tests',
    'Previous Year Papers',
  ],
  'mht-cet': [
    'Physics - Concepts',
    'Physics - Problems',
    'Chemistry - Theory',
    'Chemistry - Practicals',
    'Biology - Theory',
    'Mathematics - Concepts',
    'Mock Tests',
    'Previous Year Papers',
  ],
}

export function StudentPortalManagement({ materials = [], onAdd, onUpdate, onDelete, isLoading }) {
  const [selectedExam, setSelectedExam] = useState('jee')
  const [editingId, setEditingId] = useState(null)
  const [pdfUploadingId, setPdfUploadingId] = useState(null)

  const examMaterials = materials.filter(m => m.exam_type === selectedExam)

  const handleAddMaterial = (section) => {
    onAdd({
      exam_type: selectedExam,
      section,
      title: `New ${section} Material`,
      description: '',
      pdf_url: '',
      uploaded_at: new Date().toISOString(),
    })
  }

  const handleUpdateMaterial = (id, updatedData) => {
    onUpdate(id, updatedData)
  }

  const handleDeleteMaterial = (id) => {
    if (window.confirm('Delete this material?')) {
      onDelete(id)
    }
  }

  const handlePdfUpload = async (materialId, file) => {
    if (!file) return
    try {
      setPdfUploadingId(materialId)
      const storagePath = buildStoragePath(`student-portal/${selectedExam}`, file.name)
      const { storageRef, viewUrl } = await uploadAdminFile({
        storagePath,
        file,
        contentType: file.type || 'application/pdf',
      })
      const material = materials.find((m) => m.id === materialId)
      if (material) {
        await onUpdate(materialId, { ...material, pdf_url: storageRef })
        alert(userMessages.uploadSuccess)
      }
    } catch (err) {
      console.error('PDF upload failed:', err)
      alert(friendlyError(err, userMessages.uploadFailed))
    } finally {
      setPdfUploadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Exam Type Tabs */}
      <div className="flex gap-3 flex-wrap">
        {EXAM_TYPES.map((exam) => (
          <button
            key={exam.id}
            onClick={() => setSelectedExam(exam.id)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              selectedExam === exam.id
                ? 'bg-[#D90429] text-white'
                : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
            }`}
          >
            {exam.label}
          </button>
        ))}
      </div>

      {/* Materials by Section */}
      <div className="space-y-6">
        {SECTION_TEMPLATES[selectedExam].map((section) => {
          const sectionMaterials = examMaterials.filter(m => m.section === section)

          return (
            <div key={section}>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#D90429]" />
                  {section}
                </h3>
                <button
                  onClick={() => handleAddMaterial(section)}
                  disabled={isLoading}
                  className="flex items-center gap-1 rounded-lg bg-[#D90429] px-3 py-1 text-sm font-semibold text-white hover:bg-[#b00320] disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" /> Add PDF
                </button>
              </div>

              {sectionMaterials.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {sectionMaterials.map((material) => (
                    <GlassCard key={material.id} className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-slate-900 flex-1">{material.title}</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingId(editingId === material.id ? null : material.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {editingId === material.id ? <X /> : <Edit2 className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteMaterial(material.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Edit Mode */}
                        {editingId === material.id ? (
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs font-semibold mb-1">Title</label>
                              <input
                                type="text"
                                value={material.title}
                                onChange={(e) =>
                                  handleUpdateMaterial(material.id, { ...material, title: e.target.value })
                                }
                                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold mb-1">Description</label>
                              <textarea
                                value={material.description || ''}
                                onChange={(e) =>
                                  handleUpdateMaterial(material.id, { ...material, description: e.target.value })
                                }
                                placeholder="Add details about this material"
                                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                                rows="2"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold mb-1">PDF link</label>
                              <input
                                type="text"
                                value={material.pdf_url || ''}
                                onChange={(e) =>
                                  handleUpdateMaterial(material.id, { ...material, pdf_url: e.target.value })
                                }
                                placeholder="Paste Google Drive link or upload a PDF below"
                                className="w-full rounded border border-slate-300 px-2 py-1 font-mono text-xs"
                              />
                              {material.pdf_url && buildB2PdfViewUrl(material.pdf_url) && (
                                <p className="mt-1 text-xs text-green-700 font-semibold">
                                  PDF uploaded — use View PDF below to check it.
                                </p>
                              )}
                              <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded border border-dashed border-slate-300 px-2 py-2 text-xs font-semibold text-slate-600 hover:border-[#D90429]">
                                {pdfUploadingId === material.id ? (
                                  <>
                                    <Loader className="h-3 w-3 animate-spin text-[#D90429]" />
                                    Uploading…
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-3 w-3" />
                                    Or upload a PDF file
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="application/pdf,.pdf"
                                  className="hidden"
                                  disabled={pdfUploadingId === material.id}
                                  onChange={(e) => {
                                    handlePdfUpload(material.id, e.target.files?.[0])
                                    e.target.value = ''
                                  }}
                                />
                              </label>
                            </div>

                            <button
                              onClick={() => setEditingId(null)}
                              className="w-full rounded bg-green-600 px-3 py-1 text-sm text-white font-semibold hover:bg-green-700"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          /* View Mode */
                          <div className="space-y-2 text-sm">
                            {material.description && (
                              <p className="text-slate-600">{material.description}</p>
                            )}
                            {material.pdf_url && buildB2PdfViewUrl(material.pdf_url) && (
                              <div className="flex flex-wrap gap-3">
                                <a
                                  href={buildB2PdfViewUrl(material.pdf_url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[#D90429] hover:underline font-semibold"
                                >
                                  📄 View PDF
                                </a>
                                <a
                                  href={buildB2PdfDownloadUrl(material.pdf_url)}
                                  className="inline-flex items-center gap-1 text-slate-700 hover:underline font-semibold"
                                >
                                  ⬇️ Download
                                </a>
                              </div>
                            )}
                            <p className="text-xs text-slate-500">
                              Added: {new Date(material.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm py-4">No materials added for this section yet</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
