import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Generic hook to fetch data from Supabase table
 * @param {string} table - Table name
 * @param {object} options - Query options (filters, ordering, etc.)
 * @returns {object} - { data, loading, error, refetch }
 */
export function useSupabaseTable(table, options = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)

      let query = supabase.from(table).select(options.select || '*')

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.ascending !== false,
        })
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data: result, error: err } = await query

      if (err) throw err
      setData(result || [])
    } catch (err) {
      console.error(`Error fetching from ${table}:`, err)
      setError(err.message)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [table, JSON.stringify(options)])

  return { data, loading, error, refetch: fetchData }
}

/**
 * Hook to fetch all slides (ordered by display_order)
 */
export function useSlides() {
  return useSupabaseTable('slides', {
    orderBy: 'display_order',
    ascending: true,
  })
}

/**
 * Hook to fetch all courses (ordered by display_order)
 */
export function useCourses() {
  return useSupabaseTable('courses', {
    orderBy: 'display_order',
    ascending: true,
  })
}

/**
 * Hook to fetch all results
 */
export function useResults() {
  return useSupabaseTable('results', {
    orderBy: 'year',
    ascending: false,
  })
}

/**
 * Hook to fetch all branches (ordered by display_order)
 */
export function useBranches() {
  return useSupabaseTable('branches', {
    orderBy: 'display_order',
    ascending: true,
  })
}

/**
 * Hook to fetch all testimonials
 */
export function useTestimonials() {
  return useSupabaseTable('testimonials')
}

/**
 * Hook to fetch gallery folders with items
 */
export function useGalleryFolders() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true)
        const { data: folders, error: err } = await supabase
          .from('gallery_folders')
          .select('*, gallery_items(*)')
          .order('display_order', { ascending: true })

        if (err) throw err
        setData(folders || [])
      } catch (err) {
        console.error('Error fetching gallery:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  return { data, loading, error }
}

/**
 * Hook to fetch free downloads
 */
export function useFreeDownloads() {
  return useSupabaseTable('free_downloads', {
    orderBy: 'display_order',
    ascending: true,
  })
}

/**
 * Hook to fetch settings
 */
export function useSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true)
        const { data, error: err } = await supabase
          .from('settings')
          .select('*')
          .single()

        if (err) throw err
        setSettings(data)
      } catch (err) {
        console.error('Error fetching settings:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  return { settings, loading, error }
}

/**
 * Hook for mutation operations (INSERT, UPDATE, DELETE)
 */
export function useSupabaseMutation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function insert(table, data) {
    try {
      setLoading(true)
      setError(null)
      const { data: result, error: err } = await supabase
        .from(table)
        .insert([data])
        .select()

      if (err) throw err
      return { success: true, data: result }
    } catch (err) {
      console.error(`Error inserting into ${table}:`, err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  async function update(table, id, data) {
    try {
      setLoading(true)
      setError(null)
      const { data: result, error: err } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()

      if (err) throw err
      return { success: true, data: result }
    } catch (err) {
      console.error(`Error updating ${table}:`, err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  async function remove(table, id) {
    try {
      setLoading(true)
      setError(null)
      const { error: err } = await supabase.from(table).delete().eq('id', id)

      if (err) throw err
      return { success: true }
    } catch (err) {
      console.error(`Error deleting from ${table}:`, err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { insert, update, remove, loading, error }
}

/**
 * Hook for storage operations
 */
export function useSupabaseStorage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function uploadFile(bucket, path, file) {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (err) throw err

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      return { success: true, url: publicUrl.publicUrl, path: data.path }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  async function deleteFile(bucket, path) {
    try {
      setLoading(true)
      setError(null)

      const { error: err } = await supabase.storage.from(bucket).remove([path])

      if (err) throw err
      return { success: true }
    } catch (err) {
      console.error('Delete error:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { uploadFile, deleteFile, loading, error }
}

/**
 * Hook for Supabase Auth - Admin authentication
 * Uses Supabase Auth service for secure credential validation
 */
export function useAdminAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function loginWithSupabase(email, password) {
    try {
      setLoading(true)
      setError(null)

      console.log('🔐 Attempting Supabase Auth login...')
      console.log('Email:', email)

      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (err) {
        console.error('❌ Supabase Auth error:', err.message)
        setError(err.message || 'Login failed')
        return { success: false, user: null }
      }

      if (!data.user) {
        console.error('❌ No user returned from Supabase Auth')
        setError('Authentication failed')
        return { success: false, user: null }
      }

      console.log('✅ Supabase Auth successful for:', data.user.email)
      console.log('✅ Session token:', data.session?.access_token.substring(0, 20) + '...')

      // Fetch user profile with custom UID
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('uid, role, full_name')
        .eq('id', data.user.id)
        .single()

      if (profileErr) {
        console.warn('⚠️ Could not fetch profile:', profileErr.message)
      }

      console.log('✅ User UID:', profileData?.uid || 'N/A')

      return {
        success: true,
        user: {
          id: data.user.id,
          uid: profileData?.uid,
          email: data.user.email,
          fullName: profileData?.full_name,
          role: profileData?.role || 'admin'
        },
        session: data.session
      }
    } catch (err) {
      console.error('❌ Auth exception:', err)
      setError(err.message || 'Authentication failed')
      return { success: false, user: null }
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    try {
      const { error: err } = await supabase.auth.signOut()
      if (err) {
        console.error('❌ Logout error:', err)
        return { success: false }
      }
      console.log('✅ Logged out successfully')
      return { success: true }
    } catch (err) {
      console.error('❌ Logout exception:', err)
      return { success: false }
    }
  }

  async function getSession() {
    try {
      const { data, error: err } = await supabase.auth.getSession()
      if (err) throw err
      return data.session
    } catch (err) {
      console.error('❌ Get session error:', err)
      return null
    }
  }

  return { loginWithSupabase, logout, getSession, loading, error }
}
