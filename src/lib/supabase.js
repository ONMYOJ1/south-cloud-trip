import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const tripId = import.meta.env.VITE_TRIP_ID

export const isSupabaseConfigured = Boolean(url && anonKey && tripId)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null

export const config = { tripId }
