import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, LogOut, Plus, Trash2, Bot, AlertTriangle, Save, Edit2, X, Upload, Eye, EyeOff } from 'lucide-react'
import { useSlides, useCourses, useResults, useBranches, useTestimonials, useFreeDownloads, useSettings, useSupabaseMutation, useSupabaseStorage, useAdminAuth } from '../hooks/useSupabaseData'
import { GlassCard } from './ui/GlassCard'
import { ThemeButton } from './ui/ThemeButton'
import { AdminNavbar } from './AdminNavbar'
import { SlideForm } from './SlideForm'
import { uploadToB2 } from '../lib/b2storage'
import { supabase } from '../lib/supabase'

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function AdminPanel() {
  const navigate = useNavigate()
  const [auth, setAuth] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { loginWithSupabase, logout, getSession, loading: authLoading } = useAdminAuth()
  const [activeTab, setActiveTab] = useState('slides')
  const [saveStatus, setSaveStatus] = useState('')
  const [showSlideForm, setShowSlideForm] = useState(false)
  const [addingSlide, setAddingSlide] = useState(false)

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        setAuth(true)
      }
    }
    checkSession()
  }, [])

  // Fetch all data
  const { data: slides, refetch: refetchSlides } = useSlides()
  const { data: courses, refetch: refetchCourses } = useCourses()
  const { data: results, refetch: refetchResults } = useResults()
  const { data: branches, refetch: refetchBranches } = useBranches()
  const { data: testimonials, refetch: refetchTestimonials } = useTestimonials()
  const { data: downloads, refetch: refetchDownloads } = useFreeDownloads()
  const { settings } = useSettings()

  // Mutations
  const { insert, update, remove, loading: mutationLoading } = useSupabaseMutation()
  const { uploadFile, loading: uploadLoading } = useSupabaseStorage()

  // Draft states
  const [draftSlides, setDraftSlides] = useState([])
  const [draftCourses, setDraftCourses] = useState([])
  const [draftResults, setDraftResults] = useState([])
  const [draftBranches, setDraftBranches] = useState([])
  const [draftTestimonials, setDraftTestimonials] = useState([])
  const [draftDownloads, setDraftDownloads] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  // Sync data with drafts
  useEffect(() => {
    setDraftSlides(slides)
    setDraftCourses(courses)
    setDraftResults(results)
    setDraftBranches(branches)
    setDraftTestimonials(testimonials)
    setDraftDownloads(downloads)
  }, [slides, courses, results, branches, testimonials, downloads])

  const handleLogin = async (e) => {
    e.preventDefault()
    const result = await loginWithSupabase(email, password)

    if (result.success) {
      setAuth(true)
      // Store auth info in sessionStorage
      sessionStorage.setItem('adminAuth', 'true')
      sessionStorage.setItem('adminEmail', result.user.email)
      sessionStorage.setItem('adminUid', result.user.uid)
      sessionStorage.setItem('adminFullName', result.user.fullName)
      setEmail('')
      setPassword('')
      setError('')
    } else {
      setError(result.error || 'Invalid credentials')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleLogout = async () => {
    await logout()
    setAuth(false)
    sessionStorage.removeItem('adminAuth')
    sessionStorage.removeItem('adminEmail')
    sessionStorage.removeItem('adminUid')
    sessionStorage.removeItem('adminFullName')
    setEmail('')
    setPassword('')
    navigate('/')
  }

  // ==================== SLIDES ====================
  const handleUpdateSlide = async (id, updates) => {
    const result = await update('slides', id, updates)
    if (result.success) {
      setSaveStatus('Slide updated!')
      setEditingId(null)
      setTimeout(() => refetchSlides(), 500)
    }
  }

  const handleDeleteSlide = async (id) => {
    if (confirm('Delete this slide?')) {
      const result = await remove('slides', id)
      if (result.success) {
        setSaveStatus('Slide deleted!')
        setTimeout(() => refetchSlides(), 500)
      }
    }
  }

  // Slides now use B2 uploads via SlideForm modal - old Supabase upload removed
  // const handleUploadSlideMedia = async (file, slideId) => {
  //   Use SlideForm modal to upload new slides
  // }

  // ==================== COURSES ====================
  const handleAddCourse = async () => {
    const newCourse = {
      title: 'New Course',
      badge: 'New',
      duration: '1 Year',
      description: 'Course description',
      display_order: draftCourses.length,
    }
    const result = await insert('courses', newCourse)
    if (result.success) {
      setSaveStatus('Course added!')
      setTimeout(() => refetchCourses(), 500)
    }
  }

  const handleUpdateCourse = async (id, updates) => {
    const result = await update('courses', id, updates)
    if (result.success) {
      setSaveStatus('Course updated!')
      setEditingId(null)
      setTimeout(() => refetchCourses(), 500)
    }
  }

  const handleDeleteCourse = async (id) => {
    if (confirm('Delete this course?')) {
      const result = await remove('courses', id)
      if (result.success) {
        setSaveStatus('Course deleted!')
        setTimeout(() => refetchCourses(), 500)
      }
    }
  }

  // ==================== RESULTS ====================
  const handleAddResult = async () => {
    const newResult = {
      name: 'Student Name',
      score: 'Score/Rank',
      exam: 'JEE Adv',
      year: new Date().getFullYear(),
      image_url: '',
    }
    const result = await insert('results', newResult)
    if (result.success) {
      setSaveStatus('Result added!')
      setTimeout(() => refetchResults(), 500)
    }
  }

  const handleUpdateResult = async (id, updates) => {
    const result = await update('results', id, updates)
    if (result.success) {
      setSaveStatus('Result updated!')
      setEditingId(null)
      setTimeout(() => refetchResults(), 500)
    }
  }

  const handleDeleteResult = async (id) => {
    if (confirm('Delete this result?')) {
      const result = await remove('results', id)
      if (result.success) {
        setSaveStatus('Result deleted!')
        setTimeout(() => refetchResults(), 500)
      }
    }
  }

  const handleUploadResultImage = async (file, resultId) => {
    const result = await uploadFile('media', `results/${resultId}-${Date.now()}`, file)
    if (result.success) {
      await handleUpdateResult(resultId, { image_url: result.url })
      setSaveStatus('Image uploaded!')
    }
  }

  // ==================== BRANCHES ====================
  const handleAddBranch = async () => {
    const newBranch = {
      name: 'New Branch',
      phone: '+91',
      address: 'Address',
      map_link: '',
      display_order: draftBranches.length,
    }
    const result = await insert('branches', newBranch)
    if (result.success) {
      setSaveStatus('Branch added!')
      setTimeout(() => refetchBranches(), 500)
    }
  }

  const handleUpdateBranch = async (id, updates) => {
    const result = await update('branches', id, updates)
    if (result.success) {
      setSaveStatus('Branch updated!')
      setEditingId(null)
      setTimeout(() => refetchBranches(), 500)
    }
  }

  const handleDeleteBranch = async (id) => {
    if (confirm('Delete this branch?')) {
      const result = await remove('branches', id)
      if (result.success) {
        setSaveStatus('Branch deleted!')
        setTimeout(() => refetchBranches(), 500)
      }
    }
  }

  // ==================== TESTIMONIALS ====================
  const handleAddTestimonial = async () => {
    const newTestimonial = {
      name: 'Student Name',
      rating: 5,
      text: 'Great experience!',
    }
    const result = await insert('testimonials', newTestimonial)
    if (result.success) {
      setSaveStatus('Testimonial added!')
      setTimeout(() => refetchTestimonials(), 500)
    }
  }

  const handleUpdateTestimonial = async (id, updates) => {
    const result = await update('testimonials', id, updates)
    if (result.success) {
      setSaveStatus('Testimonial updated!')
      setEditingId(null)
      setTimeout(() => refetchTestimonials(), 500)
    }
  }

  const handleDeleteTestimonial = async (id) => {
    if (confirm('Delete this testimonial?')) {
      const result = await remove('testimonials', id)
      if (result.success) {
        setSaveStatus('Testimonial deleted!')
        setTimeout(() => refetchTestimonials(), 500)
      }
    }
  }

  // ==================== DOWNLOADS ====================
  const handleAddDownload = async () => {
    const newDownload = {
      title: 'New Resource',
      file_type: 'PDF',
      url: '',
      display_order: draftDownloads.length,
    }
    const result = await insert('free_downloads', newDownload)
    if (result.success) {
      setSaveStatus('Download added!')
      setTimeout(() => refetchDownloads(), 500)
    }
  }

  const handleUpdateDownload = async (id, updates) => {
    const result = await update('free_downloads', id, updates)
    if (result.success) {
      setSaveStatus('Download updated!')
      setEditingId(null)
      setTimeout(() => refetchDownloads(), 500)
    }
  }

  const handleDeleteDownload = async (id) => {
    if (confirm('Delete this download?')) {
      const result = await remove('free_downloads', id)
      if (result.success) {
        setSaveStatus('Download deleted!')
        setTimeout(() => refetchDownloads(), 500)
      }
    }
  }

  // Handle adding slide with file upload to B2
  const handleAddSlideWithFile = async (formData) => {
    try {
      setAddingSlide(true)
      setSaveStatus('Uploading to B2 storage...')

      console.log('Form data received:', formData)

      // Upload file to B2
      const b2Result = await uploadToB2(formData.file, 'slides/')

      if (!b2Result.publicUrl) {
        throw new Error('Failed to get public URL from B2')
      }

      // Insert slide into Supabase
      const newSlide = {
        type: formData.type,
        url: b2Result.publicUrl,
        cta: formData.cta,
        cta_url: formData.ctaUrl,
        display_order: draftSlides.length,
      }

      console.log('Slide object to save:', newSlide)

      const result = await insert('slides', newSlide)
      if (result.success) {
        setSaveStatus('✅ Slide added successfully!')
        setShowSlideForm(false)
        setTimeout(() => refetchSlides(), 500)
      } else {
        setSaveStatus('❌ Failed to save slide to database')
      }
    } catch (error) {
      console.error('Error adding slide:', error)
      setSaveStatus(`❌ Error: ${error.message}`)
    } finally {
      setAddingSlide(false)
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  const handleAddSlide = () => {
    setShowSlideForm(true)
  }

  if (!auth) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-16">
        <div className="mx-auto max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center">
              <Lock className="mx-auto h-12 w-12 text-[#D90429] mb-4" />
              <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
              <p className="mt-2 text-slate-400">Biyanis EdTech Management</p>
            </div>

            <GlassCard>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-lg border-2 px-4 py-2 bg-slate-900 text-white outline-none transition-colors ${
                      error ? 'border-red-500' : 'border-slate-600 focus:border-[#D90429]'
                    }`}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full rounded-lg border-2 px-4 py-2 bg-slate-900 text-white outline-none transition-colors ${
                        error ? 'border-red-500' : 'border-slate-600 focus:border-[#D90429]'
                      }`}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-sm text-red-500 font-semibold">❌ {error}</p>}

                <button
                  type="submit"
                  disabled={authLoading || !email || !password}
                  className="w-full rounded-lg bg-[#D90429] px-4 py-2 font-bold text-white hover:bg-[#b00320] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authLoading ? '🔄 Logging in...' : 'Login'}
                </button>

                <div className="mt-4 p-3 bg-slate-800/50 rounded border border-slate-700 text-xs text-slate-300">
                  <p>✅ Using Supabase Auth</p>
                  <p>Credentials verified from Supabase Authentication</p>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <>
      <AdminNavbar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

      {/* Slide Form Modal */}
      {showSlideForm && (
        <SlideForm
          onClose={() => setShowSlideForm(false)}
          onSubmit={handleAddSlideWithFile}
          isLoading={addingSlide}
        />
      )}

      <section className="min-h-screen bg-[#F8F9FA] pt-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Status Message */}
          {saveStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-green-800 font-semibold"
            >
              ✅ {saveStatus}
            </motion.div>
          )}

        {/* Slides Tab */}
        {activeTab === 'slides' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Hero Slides</h2>
              <button
                onClick={handleAddSlide}
                disabled={mutationLoading}
                className="flex items-center gap-2 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50"
              >
                <Plus className="h-5 w-5" /> Add Slide
              </button>
            </div>

            <div className="grid gap-4">
              {draftSlides.map((slide) => (
                <GlassCard key={slide.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-900">{slide.headline}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(editingId === slide.id ? null : slide.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {editingId === slide.id ? <X /> : <Edit2 className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(slide.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {editingId === slide.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-semibold mb-1">Type</label>
                          <select
                            value={slide.type}
                            onChange={(e) =>
                              handleUpdateSlide(slide.id, { ...slide, type: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          >
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">Headline</label>
                          <input
                            type="text"
                            value={slide.headline}
                            onChange={(e) =>
                              handleUpdateSlide(slide.id, { ...slide, headline: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">Subheadline</label>
                          <textarea
                            value={slide.subheadline}
                            onChange={(e) =>
                              handleUpdateSlide(slide.id, { ...slide, subheadline: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                            rows="2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">CTA Text</label>
                          <input
                            type="text"
                            value={slide.cta_text}
                            onChange={(e) =>
                              handleUpdateSlide(slide.id, { ...slide, cta_text: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Media URL</label>
                          <input
                            type="url"
                            value={slide.url || ''}
                            onChange={(e) =>
                              handleUpdateSlide(slide.id, { ...slide, url: e.target.value })
                            }
                            placeholder="https://... (B2 public URL)"
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                          <p className="text-xs text-slate-500 mt-1">Use SlideForm to upload new media to B2</p>
                        </div>

                        <button
                          onClick={() => setEditingId(null)}
                          className="w-full rounded bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-600 space-y-2">
                        <p>
                          <strong>Type:</strong> {slide.type}
                        </p>
                        <p>
                          <strong>Subheadline:</strong> {slide.subheadline}
                        </p>
                        <p>
                          <strong>CTA:</strong> {slide.cta_text}
                        </p>
                        {slide.url && (
                          <p>
                            <strong>Media:</strong> <a href={slide.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View</a>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Courses</h2>
              <button
                onClick={handleAddCourse}
                disabled={mutationLoading}
                className="flex items-center gap-2 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50"
              >
                <Plus className="h-5 w-5" /> Add Course
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {draftCourses.map((course) => (
                <GlassCard key={course.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-900">{course.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(editingId === course.id ? null : course.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {editingId === course.id ? <X /> : <Edit2 className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {editingId === course.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-semibold mb-1">Title</label>
                          <input
                            type="text"
                            value={course.title}
                            onChange={(e) =>
                              handleUpdateCourse(course.id, { ...course, title: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">Badge</label>
                          <input
                            type="text"
                            value={course.badge}
                            onChange={(e) =>
                              handleUpdateCourse(course.id, { ...course, badge: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">Duration</label>
                          <input
                            type="text"
                            value={course.duration}
                            onChange={(e) =>
                              handleUpdateCourse(course.id, { ...course, duration: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">Description</label>
                          <textarea
                            value={course.description}
                            onChange={(e) =>
                              handleUpdateCourse(course.id, { ...course, description: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                            rows="3"
                          />
                        </div>

                        <button
                          onClick={() => setEditingId(null)}
                          className="w-full rounded bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-600 space-y-2">
                        <p>
                          <strong>Badge:</strong> {course.badge}
                        </p>
                        <p>
                          <strong>Duration:</strong> {course.duration}
                        </p>
                        <p className="text-sm">{course.description}</p>
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Student Results</h2>
              <button
                onClick={handleAddResult}
                disabled={mutationLoading}
                className="flex items-center gap-2 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50"
              >
                <Plus className="h-5 w-5" /> Add Result
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {draftResults.map((result) => (
                <GlassCard key={result.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-900">{result.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(editingId === result.id ? null : result.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {editingId === result.id ? <X /> : <Edit2 className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteResult(result.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {editingId === result.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-semibold mb-1">Name</label>
                          <input
                            type="text"
                            value={result.name}
                            onChange={(e) =>
                              handleUpdateResult(result.id, { ...result, name: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">Score/Rank</label>
                          <input
                            type="text"
                            value={result.score}
                            onChange={(e) =>
                              handleUpdateResult(result.id, { ...result, score: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">Exam</label>
                          <input
                            type="text"
                            value={result.exam}
                            onChange={(e) =>
                              handleUpdateResult(result.id, { ...result, exam: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">Year</label>
                          <input
                            type="number"
                            value={result.year}
                            onChange={(e) =>
                              handleUpdateResult(result.id, { ...result, year: parseInt(e.target.value) })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Photo Upload</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleUploadResultImage(e.target.files[0], result.id)
                              }
                            }}
                            disabled={uploadLoading}
                            className="w-full"
                          />
                        </div>

                        <button
                          onClick={() => setEditingId(null)}
                          className="w-full rounded bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-600 space-y-2">
                        <p>
                          <strong>Score:</strong> {result.score}
                        </p>
                        <p>
                          <strong>Exam:</strong> {result.exam}
                        </p>
                        <p>
                          <strong>Year:</strong> {result.year}
                        </p>
                        {result.image_url && (
                          <img src={result.image_url} alt={result.name} className="h-24 w-24 rounded object-cover" />
                        )}
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Branches Tab */}
        {activeTab === 'branches' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Branches</h2>
              <button
                onClick={handleAddBranch}
                disabled={mutationLoading}
                className="flex items-center gap-2 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50"
              >
                <Plus className="h-5 w-5" /> Add Branch
              </button>
            </div>

            <div className="grid gap-4">
              {draftBranches.map((branch) => (
                <GlassCard key={branch.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-900">{branch.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(editingId === branch.id ? null : branch.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {editingId === branch.id ? <X /> : <Edit2 className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteBranch(branch.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {editingId === branch.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-semibold mb-1">Name</label>
                          <input
                            type="text"
                            value={branch.name}
                            onChange={(e) =>
                              handleUpdateBranch(branch.id, { ...branch, name: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">Phone</label>
                          <input
                            type="tel"
                            value={branch.phone}
                            onChange={(e) =>
                              handleUpdateBranch(branch.id, { ...branch, phone: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">Address</label>
                          <textarea
                            value={branch.address}
                            onChange={(e) =>
                              handleUpdateBranch(branch.id, { ...branch, address: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                            rows="3"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">Map Link</label>
                          <input
                            type="url"
                            value={branch.map_link}
                            onChange={(e) =>
                              handleUpdateBranch(branch.id, { ...branch, map_link: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                        </div>

                        <button
                          onClick={() => setEditingId(null)}
                          className="w-full rounded bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-600 space-y-2">
                        <p>
                          <strong>Phone:</strong> {branch.phone}
                        </p>
                        <p>
                          <strong>Address:</strong> {branch.address}
                        </p>
                        {branch.map_link && (
                          <a href={branch.map_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                            View on Map
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Testimonials</h2>
              <button
                onClick={handleAddTestimonial}
                disabled={mutationLoading}
                className="flex items-center gap-2 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50"
              >
                <Plus className="h-5 w-5" /> Add Testimonial
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {draftTestimonials.map((testimonial) => (
                <GlassCard key={testimonial.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-900">{testimonial.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(editingId === testimonial.id ? null : testimonial.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {editingId === testimonial.id ? <X /> : <Edit2 className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {editingId === testimonial.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-semibold mb-1">Name</label>
                          <input
                            type="text"
                            value={testimonial.name}
                            onChange={(e) =>
                              handleUpdateTestimonial(testimonial.id, { ...testimonial, name: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">Rating (1-5)</label>
                          <select
                            value={testimonial.rating}
                            onChange={(e) =>
                              handleUpdateTestimonial(testimonial.id, {
                                ...testimonial,
                                rating: parseInt(e.target.value),
                              })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>
                                {n} stars
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">Text</label>
                          <textarea
                            value={testimonial.text}
                            onChange={(e) =>
                              handleUpdateTestimonial(testimonial.id, { ...testimonial, text: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                            rows="3"
                          />
                        </div>

                        <button
                          onClick={() => setEditingId(null)}
                          className="w-full rounded bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-600 space-y-2">
                        <p>
                          <strong>Rating:</strong> {'⭐'.repeat(testimonial.rating)}
                        </p>
                        <p className="italic">"{testimonial.text}"</p>
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Downloads Tab */}
        {activeTab === 'downloads' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Free Downloads</h2>
              <button
                onClick={handleAddDownload}
                disabled={mutationLoading}
                className="flex items-center gap-2 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50"
              >
                <Plus className="h-5 w-5" /> Add Download
              </button>
            </div>

            <div className="grid gap-4">
              {draftDownloads.map((download) => (
                <GlassCard key={download.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-900">{download.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(editingId === download.id ? null : download.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {editingId === download.id ? <X /> : <Edit2 className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteDownload(download.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {editingId === download.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-semibold mb-1">Title</label>
                          <input
                            type="text"
                            value={download.title}
                            onChange={(e) =>
                              handleUpdateDownload(download.id, { ...download, title: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">File Type</label>
                          <input
                            type="text"
                            value={download.file_type}
                            onChange={(e) =>
                              handleUpdateDownload(download.id, { ...download, file_type: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                            placeholder="PDF, DOCX, ZIP, etc."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">File URL</label>
                          <input
                            type="url"
                            value={download.url}
                            onChange={(e) =>
                              handleUpdateDownload(download.id, { ...download, url: e.target.value })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2"
                            placeholder="https://..."
                          />
                        </div>

                        <button
                          onClick={() => setEditingId(null)}
                          className="w-full rounded bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-600 space-y-2">
                        <p>
                          <strong>Type:</strong> {download.file_type}
                        </p>
                        {download.url && (
                          <a href={download.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                            Download File
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
        </div>
      </section>
    </>
  )
}
