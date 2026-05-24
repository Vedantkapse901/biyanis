import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, LogOut, Plus, Trash2, Bot, AlertTriangle, Save, Edit2, X, Upload, Eye, EyeOff } from 'lucide-react'
import { useSlides, useCourses, useResults, useBranches, useStudentPortalMaterials, useStudents, useSupabaseMutation, useAdminAuth, useSupabaseTable, useStudyMaterials } from '../hooks/useSupabaseData'
import { GlassCard } from './ui/GlassCard'
import { ThemeButton } from './ui/ThemeButton'
import { AdminNavbar } from './AdminNavbar'
import { SlideForm } from './SlideForm'
import { ResultsManagement } from './ResultsManagement'
import { StudentPortalManagement } from './StudentPortalManagement'
import { StudentManagementPanel } from './StudentManagementPanel'
import { BranchesManagement } from './BranchesManagement'
import { CoursesManagement } from './CoursesManagement'
import { GalleryManagement } from './GalleryManagement'
import { ColorChangePanel } from './ColorChangePanel'
import { SettingsPanelEditor } from './SettingsPanelEditor'
import { StudyMaterialsManagement } from './StudyMaterialsManagement'
import { uploadToB2 } from '../lib/mediaStorage'
import { friendlyError, isErrorStatus, userMessages } from '../lib/userMessages'
import { createResultAdmin, deleteResultAdmin, updateResultAdmin } from '../lib/resultsAdminApi'
import { supabase } from '../lib/supabase'
import { sanitizeBranchPayload } from '../lib/branchHelpers'
import { getSlideCtaText, getSlideCtaUrl, sanitizeSlidePayload } from '../lib/slideHelpers'

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

  // Auto-dismiss save status message after 5 seconds
  useEffect(() => {
    if (saveStatus) {
      const timer = setTimeout(() => {
        setSaveStatus('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [saveStatus])

  // Fetch all data
  const { data: slides, refetch: refetchSlides } = useSlides()
  const { data: courses, refetch: refetchCourses } = useCourses()
  const { data: results, refetch: refetchResults } = useResults()
  const { data: branches, refetch: refetchBranches } = useBranches()
  const { data: gallery, refetch: refetchGallery } = useSupabaseTable('gallery_items', { orderBy: 'display_order', ascending: true })
  const { data: portalMaterials, refetch: refetchPortalMaterials } = useStudentPortalMaterials()
  const { data: students, refetch: refetchStudents } = useStudents()
  const { data: studyMaterials, refetch: refetchStudyMaterials } = useStudyMaterials()

  // Mutations
  const { insert, update, remove, loading: mutationLoading } = useSupabaseMutation()

  // Draft states
  const [draftSlides, setDraftSlides] = useState([])
  const [draftCourses, setDraftCourses] = useState([])
  const [draftResults, setDraftResults] = useState([])
  const [draftBranches, setDraftBranches] = useState([])
  const [draftGallery, setDraftGallery] = useState([])
  const [draftPortalMaterials, setDraftPortalMaterials] = useState([])
  const [draftStudents, setDraftStudents] = useState([])
  const [draftStudyMaterials, setDraftStudyMaterials] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [slideEditDraft, setSlideEditDraft] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  // Sync data with drafts
  useEffect(() => {
    setDraftSlides(slides)
    setDraftCourses(courses)
    setDraftResults(results)
    setDraftBranches(branches)
    setDraftGallery(gallery)
    setDraftPortalMaterials(portalMaterials)
    setDraftStudents(students)
    setDraftStudyMaterials(studyMaterials)
  }, [slides, courses, results, branches, gallery, portalMaterials, students, studyMaterials])

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
      setError(friendlyError(result.error, userMessages.loginInvalid))
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
  const startEditSlide = (slide) => {
    setEditingId(slide.id)
    setSlideEditDraft({
      ...slide,
      cta_text: getSlideCtaText(slide),
      cta_url: getSlideCtaUrl(slide),
    })
  }

  const cancelEditSlide = () => {
    setEditingId(null)
    setSlideEditDraft(null)
  }

  const updateSlideDraft = (field, value) => {
    setSlideEditDraft((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleSaveSlide = async () => {
    if (!slideEditDraft?.id) return
    const result = await update('slides', slideEditDraft.id, sanitizeSlidePayload(slideEditDraft))
    if (result.success) {
      setSaveStatus('Slide saved!')
      cancelEditSlide()
      await refetchSlides()
    } else {
      setSaveStatus(userMessages.saveFailed)
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

  // ==================== RESULTS ====================
  const handleAddResult = async () => {
    const newResult = {
      name: 'Student Name',
      score: 'Score/Rank',
      exam: 'JEE Adv',
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

  // ==================== COURSES ====================
  const handleAddCourse = async (courseData) => {
    const result = await insert('courses', courseData)
    if (result.success) {
      setSaveStatus('✅ Course added successfully!')
      setTimeout(() => refetchCourses(), 500)
    } else {
      setSaveStatus('❌ Failed to add course')
    }
  }

  const handleUpdateCourse = async (id, courseData) => {
    const result = await update('courses', id, courseData)
    if (result.success) {
      setSaveStatus('✅ Course updated!')
      setTimeout(() => refetchCourses(), 500)
    } else {
      setSaveStatus('❌ Failed to update course')
    }
  }

  const handleDeleteCourse = async (id) => {
    const result = await remove('courses', id)
    if (result.success) {
      setSaveStatus('✅ Course deleted!')
      setTimeout(() => refetchCourses(), 500)
    } else {
      setSaveStatus('❌ Failed to delete course')
    }
  }

  // ==================== BRANCHES ====================
  const handleAddBranchRecord = async (data) => {
    const result = await insert('branches', sanitizeBranchPayload(data))
    if (result.success) {
      setSaveStatus('Branch added!')
      await refetchBranches()
      return result.data?.[0] || null
    }
    const message = friendlyError(result.error, userMessages.saveFailed)
    setSaveStatus(message)
    throw new Error(message)
  }

  const handleUpdateBranchRecord = async (id, data) => {
    const result = await update('branches', id, sanitizeBranchPayload(data))
    if (result.success) {
      setSaveStatus('Branch updated!')
      await refetchBranches()
      return
    }
    const message = friendlyError(result.error, userMessages.saveFailed)
    setSaveStatus(message)
    throw new Error(message)
  }

  const handleDeleteBranchRecord = async (id) => {
    const result = await remove('branches', id)
    if (result.success) {
      setSaveStatus('Branch deleted!')
      await refetchBranches()
      return
    }
    const message = friendlyError(result.error, userMessages.deleteFailed)
    setSaveStatus(message)
    throw new Error(message)
  }


  // Handle adding slide with file upload to B2
  const handleAddSlideWithFile = async (formData) => {
    try {
      setAddingSlide(true)
      setSaveStatus(userMessages.uploading)

      const b2Result = await uploadToB2(formData.file, 'slides/')

      if (!b2Result.storageRef && !b2Result.publicUrl) {
        throw new Error(userMessages.uploadFailed)
      }

      // Store B2 ref; frontend resolves to /api/download proxy URL
      const newSlide = {
        type: formData.type,
        url: b2Result.storageRef || b2Result.publicUrl,
        cta: formData.cta,
        cta_url: formData.ctaUrl,
        display_order: draftSlides.length,
      }

      const result = await insert('slides', newSlide)
      if (result.success) {
        setSaveStatus(userMessages.slideAdded)
        setShowSlideForm(false)
        setTimeout(() => refetchSlides(), 500)
      } else {
        setSaveStatus(userMessages.slideSaveFailed)
      }
    } catch (error) {
      console.error('Error adding slide:', error)
      setSaveStatus(friendlyError(error, userMessages.slideSaveFailed))
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
      <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8 sm:py-16">
        <div className="mx-auto w-full max-w-md">
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

                <p className="mt-4 text-center text-xs text-slate-400">
                  Secure admin login for Biyanis staff only.
                </p>
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

      <section className="admin-shell bg-[#F8F9FA]">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
          {/* Status Message */}
          {saveStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-4 rounded-lg px-4 py-3 font-semibold ${
                isErrorStatus(saveStatus)
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {isErrorStatus(saveStatus) ? '❌' : '✅'} {saveStatus}
            </motion.div>
          )}

        {/* Slides Tab */}
        {activeTab === 'slides' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Hero Slides</h2>
              <button
                onClick={handleAddSlide}
                disabled={mutationLoading}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50 sm:w-auto"
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
                          type="button"
                          onClick={() =>
                            editingId === slide.id ? cancelEditSlide() : startEditSlide(slide)
                          }
                          className="tap-target text-blue-600 hover:text-blue-800"
                        >
                          {editingId === slide.id ? <X /> : <Edit2 className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(slide.id)}
                          className="tap-target text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {editingId === slide.id && slideEditDraft ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-semibold mb-1">Type</label>
                          <select
                            value={slideEditDraft.type}
                            onChange={(e) => updateSlideDraft('type', e.target.value)}
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
                            value={slideEditDraft.headline || ''}
                            onChange={(e) => updateSlideDraft('headline', e.target.value)}
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">Subheadline</label>
                          <textarea
                            value={slideEditDraft.subheadline || ''}
                            onChange={(e) => updateSlideDraft('subheadline', e.target.value)}
                            className="w-full rounded border border-slate-300 px-3 py-2"
                            rows="2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">CTA Button Text</label>
                          <input
                            type="text"
                            value={slideEditDraft.cta_text || ''}
                            onChange={(e) => updateSlideDraft('cta_text', e.target.value)}
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-1">CTA Button Link</label>
                          <input
                            type="text"
                            value={slideEditDraft.cta_url || ''}
                            onChange={(e) => updateSlideDraft('cta_url', e.target.value)}
                            placeholder="e.g., /courses or https://..."
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Media link</label>
                          <input
                            type="url"
                            value={slideEditDraft.url || ''}
                            onChange={(e) => updateSlideDraft('url', e.target.value)}
                            placeholder="Paste a link or use Add Slide to upload"
                            className="w-full rounded border border-slate-300 px-3 py-2"
                          />
                          <p className="text-xs text-slate-500 mt-1">Use Add Slide to upload new images or videos</p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={cancelEditSlide}
                            className="flex-1 rounded border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveSlide}
                            disabled={mutationLoading}
                            className="flex-1 rounded bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
                          >
                            Save Slide
                          </button>
                        </div>
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
                          <strong>CTA:</strong> {getSlideCtaText(slide)}
                        </p>
                        {getSlideCtaUrl(slide) && (
                          <p>
                            <strong>Link:</strong> {getSlideCtaUrl(slide)}
                          </p>
                        )}
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
          <CoursesManagement
            courses={draftCourses}
            onAdd={handleAddCourse}
            onUpdate={handleUpdateCourse}
            onDelete={handleDeleteCourse}
            loading={mutationLoading}
          />
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <ResultsManagement
            results={draftResults}
            onAdd={async (data) => {
              const saved = await createResultAdmin(data);
              setDraftResults((prev) => [saved, ...prev]);
              setSaveStatus('Student added!');
              await refetchResults();
            }}
            onUpdate={async (id, data) => {
              const saved = await updateResultAdmin(id, data);
              setDraftResults((prev) =>
                prev.map((row) =>
                  String(row.id) === String(id) ? { ...row, ...saved } : row
                )
              );
              setSaveStatus('Student updated!');
              await refetchResults();
            }}
            onDelete={async (id) => {
              await deleteResultAdmin(id);
              setDraftResults((prev) => prev.filter((row) => String(row.id) !== String(id)));
              setSaveStatus('Student deleted!');
              await refetchResults();
            }}
            loading={mutationLoading}
          />
        )}

        {/* Branches Tab */}
        {activeTab === 'branches' && (
          <BranchesManagement
            branches={draftBranches}
            onAdd={handleAddBranchRecord}
            onUpdate={handleUpdateBranchRecord}
            onDelete={handleDeleteBranchRecord}
            isLoading={mutationLoading}
          />
        )}

        {/* Color Change Tab */}
        {activeTab === 'colorChange' && (
          <ColorChangePanel />
        )}

        {activeTab === 'settings' && (
          <SettingsPanelEditor />
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <GalleryManagement
            items={draftGallery}
            onAdd={(data) => insert('gallery_items', data).then(() => refetchGallery())}
            onUpdate={(id, data) => update('gallery_items', id, data).then(() => refetchGallery())}
            onDelete={(id) => remove('gallery_items', id).then(() => refetchGallery())}
            loading={mutationLoading}
          />
        )}

        {/* Study Materials Tab */}
        {activeTab === 'studentPortal' && (
          <StudyMaterialsManagement
            materials={draftStudyMaterials}
            onAdd={(data) => insert('study_materials', data).then(() => refetchStudyMaterials())}
            onDelete={(id) => remove('study_materials', id).then(() => refetchStudyMaterials())}
            isLoading={mutationLoading}
          />
        )}

        {/* Manage Students Tab */}
        {activeTab === 'studentPortalStudents' && (
          <StudentManagementPanel
            students={draftStudents}
            onAdd={(data) => insert('students', data).then(() => refetchStudents())}
            onUpdate={(id, data) => update('students', id, data).then(() => refetchStudents())}
            onDelete={(id) => remove('students', id).then(() => refetchStudents())}
            isLoading={mutationLoading}
          />
        )}

        </div>
      </section>
    </>
  )
}
