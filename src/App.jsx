import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Heart, Phone } from 'lucide-react'
import { AppContext } from './context/AppContext'
import { supabase } from './lib/supabase'
import { Navbar } from './components/Navbar'
import { AnimatedRoutes } from './components/AnimatedRoutes'
import { GlobalWhatsApp } from './components/GlobalWhatsApp'
import { DoubtChatbot } from './components/DoubtChatbot'
import { SmartReviewModal } from './components/SmartReviewModal'

const appVersion = '2.0-supabase'

// Default data structure for fallback
const defaultData = {
  settings: {
    tagline: 'Building confidence, consistency & character since 2020.',
    whatsapp: '917208324505',
    reviewLink: 'https://maps.app.goo.gl/Aqxz5M7ZpJ9Vir3XA',
    geminiApiKey: '',
    madeBy: 'Made with love by Vedant Kapse and Bhushan Naikwade',
  },
  slides: [],
  courses: [],
  results: [],
  branches: [],
  testimonials: [],
  gallery: [],
  freeDownloads: [],
  studentPortal: [],
  studentPortalStudents: [],
  studyMaterials: [],
}

function normalizeSettings(row) {
  if (!row) return {};
  return {
    tagline: row.tagline ?? '',
    whatsapp: row.whatsapp ?? '',
    reviewLink: row.review_link ?? row.reviewLink ?? '',
    geminiApiKey: row.gemini_api_key ?? row.geminiApiKey ?? '',
    madeBy: row.made_by ?? row.madeBy ?? '',
  };
}

function AppContent({ appData, updateAppData, isSupabaseConnected, loadAppData, reviewModalOpen, setReviewModalOpen }) {
  const location = useLocation()
  const isAdminPage = location.pathname === '/admin'

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Connection Status Indicator */}
      {!isSupabaseConnected && (
        <div className="bg-yellow-50 px-4 py-2 text-center text-sm text-yellow-800 border-b border-yellow-200">
          ⚠️ Unable to load the latest content right now.{' '}
          <button
            onClick={loadAppData}
            className="underline font-semibold hover:text-yellow-900"
          >
            Retry
          </button>
        </div>
      )}

      {!isAdminPage && <Navbar />}
      <AnimatedRoutes />
      {!isAdminPage && <GlobalWhatsApp />}
      {!isAdminPage && <DoubtChatbot />}
      <SmartReviewModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} />

      {!isAdminPage && (
        <footer className="safe-bottom border-t border-slate-200 bg-[#0A0F2C] py-10 sm:py-12" id="main-footer">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* About */}
              <div>
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="BJNP logo" className="h-10 w-10 rounded-full object-contain" />
                  <h3 className="text-lg font-bold text-white">Biyanis</h3>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {appData.settings.tagline}
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-sm font-semibold text-white">Quick Links</h4>
                <ul className="mt-4 space-y-2">
                  <li>
                    <a href="/courses" className="text-sm text-slate-400 hover:text-white">
                      Courses
                    </a>
                  </li>
                  <li>
                    <a href="/gallery" className="text-sm text-slate-400 hover:text-white">
                      Gallery
                    </a>
                  </li>
                  <li>
                    <a href="/about" className="text-sm text-slate-400 hover:text-white">
                      About Us
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-sm font-semibold text-white">Contact</h4>
                <div className="mt-4 flex gap-4">
                  <a
                    href={`tel:${appData.settings.whatsapp}`}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
                  >
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Credits */}
            <div className="mt-8 border-t border-slate-700 pt-8">
              <div className="flex flex-wrap items-center justify-center gap-2 px-2 text-center text-sm text-slate-400">
                <span>{appData.settings.madeBy}</span>
                <Heart className="h-4 w-4 animate-pulse text-[#D90429]" />
              </div>
              <p className="mt-4 text-center text-xs text-slate-500">
                © @{new Date().getFullYear()} Biyanis
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export default function App() {
  const [appData, setAppData] = useState(defaultData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false)

  // Apply color variable globally
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      :root {
        --primary-color: #D90429;
      }

      /* Override hardcoded colors with CSS variable */
      .text-\\[\\#D90429\\],
      [style*="color: #D90429"],
      [style*="color:#D90429"] {
        color: var(--primary-color) !important;
      }

      .bg-\\[\\#D90429\\],
      [style*="background-color: #D90429"],
      [style*="background-color:#D90429"] {
        background-color: var(--primary-color) !important;
      }

      .border-\\[\\#D90429\\],
      [style*="border-color: #D90429"],
      [style*="border-color:#D90429"] {
        border-color: var(--primary-color) !important;
      }

      /* For hover states */
      .hover\\:bg-\\[\\#D90429\\]:hover,
      .hover\\:text-\\[\\#D90429\\]:hover {
        color: var(--primary-color) !important;
        background-color: var(--primary-color) !important;
      }
    `
    document.head.appendChild(style)
    return () => {
      try {
        document.head.removeChild(style)
      } catch (e) {
        // Element already removed
      }
    }
  }, [])

  // Load saved color on mount
  useEffect(() => {
    const savedColor = localStorage.getItem('website_primary_color')
    const colorExpiry = localStorage.getItem('website_color_expiry')

    if (savedColor && colorExpiry) {
      const expiryTime = new Date(colorExpiry).getTime()
      const now = new Date().getTime()

      if (now < expiryTime) {
        // Color is still valid, apply it
        document.documentElement.style.setProperty('--primary-color', savedColor)
      }
    }
  }, [])

  // Load all data from Supabase on mount
  useEffect(() => {
    loadAppData()

    // Set up real-time listener for slides
    const slidesSubscription = supabase
      .channel('slides-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'slides' },
        () => {
          console.log('Slides updated, refetching...')
          loadAppData()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      slidesSubscription.unsubscribe()
    }
  }, [])

  async function loadAppData() {
    try {
      setLoading(true)
      setError(null)

      const [
        settingsRes,
        slidesRes,
        coursesRes,
        resultsRes,
        branchesRes,
        testimonialsRes,
        galleryFoldersRes,
        downloadsRes,
        studyMaterialsRes,
        studentsRes,
      ] = await Promise.all([
        supabase.from('settings').select('*').single(),
        supabase.from('slides').select('*').order('display_order', { ascending: true }),
        supabase.from('courses').select('*').order('display_order', { ascending: true }),
        supabase.from('results').select('*').order('created_at', { ascending: false }),
        supabase.from('branches').select('*').order('display_order', { ascending: true }),
        supabase.from('testimonials').select('*'),
        supabase
          .from('gallery_folders')
          .select('*, gallery_items(*)')
          .order('display_order', { ascending: true }),
        supabase.from('free_downloads').select('*').order('display_order', { ascending: true }),
        supabase.from('study_materials').select('*').order('created_at', { ascending: false }),
        supabase.from('students').select('*'),
      ])

      // Handle errors gracefully
      const newData = { ...defaultData }

      if (!settingsRes.error && settingsRes.data) {
        newData.settings = {
          ...newData.settings,
          ...normalizeSettings(settingsRes.data),
        };
      }

      if (!slidesRes.error && slidesRes.data) {
        newData.slides = slidesRes.data
      }

      if (!coursesRes.error && coursesRes.data) {
        newData.courses = coursesRes.data
      }

      if (!resultsRes.error && resultsRes.data) {
        newData.results = resultsRes.data
      }

      if (!branchesRes.error && branchesRes.data) {
        newData.branches = branchesRes.data
      }

      if (!testimonialsRes.error && testimonialsRes.data) {
        newData.testimonials = testimonialsRes.data
      }

      if (!galleryFoldersRes.error && galleryFoldersRes.data) {
        // Transform gallery folders structure
        newData.gallery = galleryFoldersRes.data.flatMap(folder =>
          (folder.gallery_items || []).map(item => ({
            ...item,
            folder: folder.folder_name,
            eventDate: folder.event_date,
          }))
        )
      }

      if (!downloadsRes.error && downloadsRes.data) {
        newData.freeDownloads = downloadsRes.data
      }

      if (!studyMaterialsRes.error && studyMaterialsRes.data) {
        newData.studyMaterials = studyMaterialsRes.data
      }

      if (!studentsRes.error && studentsRes.data) {
        newData.studentPortalStudents = studentsRes.data
        console.log('✅ Students loaded:', studentsRes.data)
      } else {
        console.warn('⚠️ Students error:', studentsRes.error)
      }

      setAppData(newData)
      setIsSupabaseConnected(true)
      console.log('✅ Data loaded from Supabase successfully')
      console.log('📚 Total students in app:', newData.studentPortalStudents?.length || 0)
    } catch (err) {
      console.error('Error loading data from Supabase:', err)
      setError('Failed to load data. Using fallback.')
      setAppData(defaultData)
      setIsSupabaseConnected(false)
    } finally {
      setLoading(false)
    }
  }

  // Update app data (used by admin panel)
  async function updateAppData(newData) {
    // This would need to be implemented based on which tables changed
    // For now, just update local state
    setAppData(newData)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full border-4 border-slate-700 border-t-[#D90429] animate-spin"></div>
          <p className="mt-4 text-slate-300">Loading Biyanis EdTech Platform...</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{ data: appData, setData: updateAppData, loadAppData }}>
      <Router>
        <AppContent
          appData={appData}
          updateAppData={updateAppData}
          isSupabaseConnected={isSupabaseConnected}
          loadAppData={loadAppData}
          reviewModalOpen={reviewModalOpen}
          setReviewModalOpen={setReviewModalOpen}
        />
      </Router>
    </AppContext.Provider>
  )
}
