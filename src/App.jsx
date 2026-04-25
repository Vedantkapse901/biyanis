import { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Atom, Heart, Phone } from 'lucide-react'
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
}

function AppContent({ appData, updateAppData, isSupabaseConnected, loadAppData, reviewModalOpen, setReviewModalOpen }) {
  const location = useLocation()
  const isAdminPage = location.pathname === '/admin'

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Connection Status Indicator */}
      {!isSupabaseConnected && (
        <div className="bg-yellow-50 px-4 py-2 text-center text-sm text-yellow-800 border-b border-yellow-200">
          ⚠️ Using fallback data. Supabase connection not available.{' '}
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
        <footer className="border-t border-slate-200 bg-[#0A0F2C] py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* About */}
              <div>
                <h3 className="text-lg font-bold text-white">Biyanis</h3>
                <p className="mt-2 text-sm text-slate-400">
                  {appData.settings.tagline}
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-sm font-semibold text-white">Quick Links</h4>
                <ul className="mt-4 space-y-2">
                  <li>
                    <a href="#/courses" className="text-sm text-slate-400 hover:text-white">
                      Courses
                    </a>
                  </li>
                  <li>
                    <a href="#/gallery" className="text-sm text-slate-400 hover:text-white">
                      Gallery
                    </a>
                  </li>
                  <li>
                    <a href="#/about" className="text-sm text-slate-400 hover:text-white">
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
              <div className="flex items-center justify-center gap-2 text-center text-sm text-slate-400">
                <span>{appData.settings.madeBy}</span>
                <Heart className="h-4 w-4 animate-pulse text-[#D90429]" />
              </div>
              <p className="mt-4 text-center text-xs text-slate-500">
                © 2020-{new Date().getFullYear()} Biyanis. All rights reserved. Powered by{' '}
                <span className="text-[#D90429] font-semibold">Supabase</span>
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
      ] = await Promise.all([
        supabase.from('settings').select('*').single(),
        supabase.from('slides').select('*').order('display_order', { ascending: true }),
        supabase.from('courses').select('*').order('display_order', { ascending: true }),
        supabase.from('results').select('*').order('year', { ascending: false }),
        supabase.from('branches').select('*').order('display_order', { ascending: true }),
        supabase.from('testimonials').select('*'),
        supabase
          .from('gallery_folders')
          .select('*, gallery_items(*)')
          .order('display_order', { ascending: true }),
        supabase.from('free_downloads').select('*').order('display_order', { ascending: true }),
      ])

      // Handle errors gracefully
      const newData = { ...defaultData }

      if (!settingsRes.error && settingsRes.data) {
        newData.settings = {
          ...newData.settings,
          ...settingsRes.data,
        }
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

      setAppData(newData)
      setIsSupabaseConnected(true)
      console.log('✅ Data loaded from Supabase successfully')
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
          <Atom className="mx-auto h-12 w-12 animate-spin text-[#D90429]" />
          <p className="mt-4 text-slate-300">Loading Biyanis EdTech Platform...</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{ data: appData, setData: updateAppData }}>
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
