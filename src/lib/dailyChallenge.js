// ============================================================
// LESSIVE DU JOUR — Daily Challenge System
//
// Same clothes for everyone each day (seeded random).
// 3 attempts per day (stored in Supabase or localStorage fallback).
// Daily leaderboard separate from all-time.
// ============================================================
import { CLOTHES, getClothesForLevel } from '../data/clothes'
import { supabase } from './supabase'

// ---- SEEDED RANDOM (deterministic per day) ----
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

// Get today's date string as YYYY-MM-DD in local timezone
export function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Convert date key to numeric seed
function dateToSeed(dateKey) {
  let hash = 0
  for (let i = 0; i < dateKey.length; i++) {
    hash = ((hash << 5) - hash) + dateKey.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// ---- GENERATE DAILY CLOTHES QUEUE ----
// Returns the same sequence for all players on the same day
export function getDailyClothes(dateKey = getTodayKey()) {
  const seed = dateToSeed(dateKey)
  const rand = seededRandom(seed)
  const pool = getClothesForLevel(3) // Medium difficulty for daily
  const count = 12 // Fixed 12 items per daily
  const items = []

  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rand() * pool.length)
    items.push(pool[idx])
  }

  return items
}

// ---- GET DAILY CHALLENGE INFO ----
// Returns { dateKey, clothes, attemptsUsed, attemptsMax, bestScore, canPlay }
export async function getDailyChallengeInfo(userId) {
  const dateKey = getTodayKey()
  const clothes = getDailyClothes(dateKey)
  const attemptsMax = 3

  if (supabase && userId) {
    // Fetch from Supabase
    const { data } = await supabase
      .from('daily_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('date_key', dateKey)

    const attempts = data || []
    const bestScore = attempts.reduce((max, a) => Math.max(max, a.score), 0)

    return {
      dateKey,
      clothes,
      attemptsUsed: attempts.length,
      attemptsMax,
      bestScore,
      canPlay: attempts.length < attemptsMax,
      attempts,
    }
  }

  // Fallback: use in-memory (no persistence without Supabase)
  const stored = window.__dailyAttempts || {}
  const todayAttempts = stored[dateKey] || []

  return {
    dateKey,
    clothes,
    attemptsUsed: todayAttempts.length,
    attemptsMax,
    bestScore: todayAttempts.reduce((max, a) => Math.max(max, a.score), 0),
    canPlay: todayAttempts.length < attemptsMax,
    attempts: todayAttempts,
  }
}

// ---- SAVE DAILY ATTEMPT ----
export async function saveDailyAttempt(userId, score, grade, details) {
  const dateKey = getTodayKey()

  if (supabase && userId) {
    return supabase.from('daily_attempts').insert({
      user_id: userId,
      date_key: dateKey,
      score,
      grade,
      details,
    })
  }

  // Fallback: in-memory
  if (!window.__dailyAttempts) window.__dailyAttempts = {}
  if (!window.__dailyAttempts[dateKey]) window.__dailyAttempts[dateKey] = []
  window.__dailyAttempts[dateKey].push({ score, grade, details, created_at: new Date().toISOString() })
}

// ---- GET DAILY LEADERBOARD ----
export async function getDailyLeaderboard(dateKey = getTodayKey(), limit = 20) {
  if (!supabase) return []

  const { data } = await supabase
    .from('daily_attempts')
    .select('user_id, score, grade, profiles(username, avatar_url)')
    .eq('date_key', dateKey)
    .order('score', { ascending: false })
    .limit(limit)

  return data || []
}
