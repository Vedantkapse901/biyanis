import { useState, useEffect } from 'react'
import { Download, LogOut, Loader, ExternalLink } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'
import { buildB2PdfViewUrl, openPdfViewAndDownload } from '../lib/b2MediaUrls'
import { userMessages } from '../lib/userMessages'

const COURSES = [
  { id: 'JEE', name: 'JEE Main & Advanced', color: 'bg-blue-100 border-blue-300' },
  { id: 'NEET', name: 'NEET', color: 'bg-green-100 border-green-300' },
  { id: 'MHT-CET', name: 'MHT-CET', color: 'bg-purple-100 border-purple-300' },
]

export function StudentDashboard({ student, materials, onLogout }) {
  const [filteredMaterials, setFilteredMaterials] = useState([])
  const [downloadingId, setDownloadingId] = useState(null)

  useEffect(() => {
    if (student && materials) {
      const filtered = materials.filter((m) => m.course === student.course)
      setFilteredMaterials(filtered)
    }
  }, [student, materials])

  const handleDownload = async (material) => {
    if (!material?.pdf_url) {
      alert(userMessages.pdfUnavailable)
      return
    }

    try {
      setDownloadingId(material.id)
      const ok = openPdfViewAndDownload(material.pdf_url, material.title)
      if (!ok) {
        throw new Error('Could not open PDF link')
      }
    } catch (error) {
      console.error('PDF download error:', error)
      alert(userMessages.pdfDownloadFailed)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleView = (material) => {
    const viewUrl = buildB2PdfViewUrl(material.pdf_url)
    if (!viewUrl) {
      alert(userMessages.pdfUnavailable)
      return
    }
    window.open(viewUrl, '_blank', 'noopener,noreferrer')
  }

  if (!student) {
    return <div className="text-center text-slate-600">Loading...</div>
  }

  const studentCourse = COURSES.find((c) => c.id === student.course)

  return (
    <div className="page-shell bg-gradient-to-br from-slate-50 to-slate-100 px-3 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Welcome, {student.name}!</h1>
            <p className="mt-2 text-slate-600">
              {studentCourse?.name} | Class {student.class_level}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 font-semibold text-white hover:bg-red-600 transition-colors sm:w-auto"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>

        <GlassCard className={`mb-8 border-2 p-4 sm:p-6 ${studentCourse?.color}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{studentCourse?.name}</h2>
              <p className="mt-2 text-slate-700">Class {student.class_level} Study Materials</p>
            </div>
            <div className="text-4xl sm:text-5xl">
              {student.course === 'JEE' && '📐'}
              {student.course === 'NEET' && '🔬'}
              {student.course === 'MHT-CET' && '📊'}
            </div>
          </div>
        </GlassCard>

        <div>
          <h3 className="mb-6 text-2xl font-bold text-slate-900">Your Study Materials</h3>

          {filteredMaterials.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMaterials.map((material) => (
                <GlassCard key={material.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-slate-900 flex-1">{material.title}</h4>
                      <span className="text-xs font-semibold bg-[#D90429]/10 text-[#D90429] px-2 py-1 rounded whitespace-nowrap ml-2">
                        Class {material.class_level}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {material.file_size
                        ? `${(material.file_size / 1024 / 1024).toFixed(2)} MB`
                        : 'PDF'}
                    </p>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleView(material)}
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[#D90429] px-4 py-2.5 text-sm font-semibold text-[#D90429] hover:bg-[#D90429]/5 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(material)}
                        disabled={downloadingId === material.id}
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#D90429] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#b00320] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloadingId === material.id ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Opening…
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Download PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="p-8 text-center">
              <p className="text-slate-600">
                No study materials available yet for {studentCourse?.name} Class {student.class_level}.
              </p>
              <p className="mt-2 text-sm text-slate-500">Check back soon!</p>
            </GlassCard>
          )}
        </div>

        <div className="mt-8 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm text-blue-800">
            <strong>About your portal:</strong> View opens the PDF in a new tab. Download saves a copy to
            your device. All files are served securely through the Biyanis website.
          </p>
        </div>
      </div>
    </div>
  )
}
