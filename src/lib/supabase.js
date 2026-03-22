// ============================================================
// SUPABASE CLIENT
// Configure with your Supabase project URL and anon key
// ============================================================
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Only create client if credentials are provided
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// ============================================================
// AUTH HELPERS (ready for when Supabase is connected)
// ============================================================
export async function signInWithGoogle() {
  if (!supabase) return { error: 'Supabase non configuré' }
  return supabase.auth.signInWithOAuth({ provider: 'google' })
}

export async function signOut() {
  if (!supabase) return
  return supabase.auth.signOut()
}

export async function getUser() {
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data?.user || null
}

// ============================================================
// GAME DATA HELPERS
// ============================================================
export async function saveGameSession(userId, sessionData) {
  if (!supabase) {
    console.log('[Supabase] Mode hors-ligne — session sauvegardée localement')
    return null
  }
  return supabase.from('game_sessions').insert({
    user_id: userId,
    score: sessionData.score,
    grade: sessionData.grade,
    level: sessionData.level,
    details: sessionData,
  })
}

export async function getLeaderboard(limit = 20) {
  if (!supabase) return []
  const { data } = await supabase
    .from('leaderboard')
    .select('*')
    .order('all_time_score', { ascending: false })
    .limit(limit)
  return data || []
}

export async function fetchClothesLibrary() {
  if (!supabase) return null // fallback to local data
  const { data } = await supabase
    .from('clothes')
    .select('*')
    .order('name')
  return data
}

// ============================================================
// FUTURE: User profile, achievements, seasons, etc.
// ============================================================
/*
export async function getUserProfile(userId) { ... }
export async function updateUserXP(userId, xp) { ... }
export async function getAchievements(userId) { ... }
export async function getCurrentSeason() { ... }
export async function getBattlePass(userId) { ... }
*/
