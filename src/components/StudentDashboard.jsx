import { useState, useEffect } from 'react'
import { Download, LogOut, Loader } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'

const COURSES = [
  { id: 'JEE', name: 'JEE Main & Advanced', color: 'bg-blue-100 border-blue-300' },
  { id: 'NEET', name: 'NEET', color: 'bg-green-100 border-green-300' },
  { id: 'MHT-CET', name: 'MHT-CET', color: 'bg-purple-100 border-purple-300' },
]

const CLASS_LEVELS = [11, 12]

const API_URL = import.meta.env.VITE_API_URL || ''

export function StudentDashboard({ student, materials, onLogout }) {
  const [filteredMaterials, setFilteredMaterials] = useState([])
  const [signingUrl, setSigningUrl] = useState(null) // Track which material is getting signed URL
  const [signedUrls, setSignedUrls] = useState({}) // Cache signed URLs by material ID

  // Filter materials based on student's course (both class 11 and 12 available)
  useEffect(() => {
    if (student && materials) {
      const filtered = materials.filter(
        (m) => m.course === student.course // Show materials for both class 11 and 12
      )
      setFilteredMaterials(filtered)
    }
  }, [student, materials])

  // Get signed URL for downloading PDF
  const handleDownload = async (material) => {
    try {
      // Check if we already have a cached signed URL
      if (signedUrls[material.id]) {
        window.location.href = signedUrls[material.id]
        return
      }

      setSigningUrl(material.id)

      let filePath = material.pdf_url

      // Supabase Storage (or any full public HTTPS URL) — open directly, no backend
      if (filePath && /^https?:\/\//i.test(filePath)) {
        window.location.href = filePath
        setSigningUrl(null)
        return
      }

      // Legacy B2 paths
      if (filePath.includes('/file/Biyanisclasseswebsite/')) {
        // Full B2 URL format: https://f005.backblazeb2.com/file/Biyanisclasseswebsite/study-materials/...
        filePath = filePath.split('/file/Biyanisclasseswebsite/')[1]
      } else if (filePath.includes('?path=')) {
        // Proxy URL format: /api/download?path=...
        filePath = decodeURIComponent(filePath.split('path=')[1])
      }

      console.log('📥 Requesting signed URL for:', filePath)

      // Call backend to get signed URL
      const response = await fetch(`${API_URL}/api/get-signed-url?path=${encodeURIComponent(filePath)}`)

      if (!response.ok) {
        throw new Error('Failed to generate signed URL')
      }

      const data = await response.json()

      if (!data.signedUrl) {
        throw new Error('No signed URL received')
      }

      // Cache the signed URL
      setSignedUrls((prev) => ({
        ...prev,
        [material.id]: data.signedUrl,
      }))

      console.log('✅ Signed URL received, downloading...')

      // Trigger download
      window.location.href = data.signedUrl
    } catch (error) {
      console.error('❌ Download error:', error)
      alert('Failed to download PDF. Please try again.')
    } finally {
      setSigningUrl(null)
    }
  }

  if (!student) {
    return <div className="text-center text-slate-600">Loading...</div>
  }

  const studentCourse = COURSES.find((c) => c.id === student.course)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 pt-32 pb-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between rounded-lg bg-white p-6 shadow-md">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome, {student.name}!</h1>
            <p className="mt-2 text-slate-600">
              {studentCourse?.name} | Class {student.class_level}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>

        {/* Course Info Card */}
        <GlassCard className={`mb-8 border-2 p-6 ${studentCourse?.color}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{studentCourse?.name}</h2>
              <p className="mt-2 text-slate-700">Class {student.class_level} Study Materials</p>
            </div>
            <div className="text-5xl">
              {student.course === 'JEE' && '📐'}
              {student.course === 'NEET' && '🔬'}
              {student.course === 'MHT-CET' && '📊'}
            </div>
          </div>
        </GlassCard>

        {/* Study Materials */}
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
                      {material.file_size ? `${(material.file_size / 1024 / 1024).toFixed(2)} MB` : 'PDF'}
                    </p>

                    <button
                      onClick={() => handleDownload(material)}
                      disabled={signingUrl === material.id}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {signingUrl === material.id ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          Preparing...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Download PDF
                        </>
                      )}
                    </button>
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

        {/* Info Box */}
        <div className="mt-8 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm text-blue-800">
            <strong>📚 About Your Portal:</strong> You can download study materials specific to your course
            and class level. All PDFs are provided by your teachers. Contact your instructor if you need
            additional materials.
          </p>
        </div>
      </div>
    </div>
  )
}
