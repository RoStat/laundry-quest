// ============================================================
// SOUND MANAGER
// Central audio system for Laundry Simulator 2026.
// All sound files go in /public/sounds/
// Uses Web Audio API for low-latency SFX + HTML5 Audio for music.
//
// USAGE:
//   import { SFX, playSound, playMusic, stopMusic } from '../lib/soundManager'
//   playSound(SFX.SORT_CORRECT)
//   playMusic('game')
// ============================================================

// ---- SOUND EFFECT CATALOG ----
// Each key maps to a file in /public/sounds/sfx/
// Provide .mp3 or .ogg files (mp3 for broadest compat)
export const SFX = {
  // === GLOBAL UI ===
  BUTTON_TAP:       'ui-tap',          // Short click/pop for any button press
  SCREEN_TRANSITION:'ui-transition',   // Whoosh when changing phase
  COUNTDOWN_TICK:   'ui-tick',         // Timer tick (last 5 seconds)
  COUNTDOWN_END:    'ui-time-up',      // Buzzer/alarm when timer runs out

  // === SCORING & FEEDBACK ===
  SCORE_UP:         'score-up',        // Coin/ding for gaining points
  SCORE_DOWN:       'score-down',      // Negative bloop for losing points
  COMBO_UP:         'combo-up',        // Rising chime for combo increment
  COMBO_BREAK:      'combo-break',     // Record scratch / break sound
  LEVEL_UP:         'level-up',        // Fanfare for leveling up
  LIFE_LOST:        'life-lost',       // Heart break / sad tone
  GAME_OVER:        'game-over',       // Game over jingle

  // === PHASE 1: TRI (SORTING) ===
  SORT_CORRECT:     'sort-correct',    // Satisfying "plop" into basket
  SORT_PARTIAL:     'sort-partial',    // Softer ding (acceptable but not perfect)
  SORT_WRONG:       'sort-wrong',      // Buzzer / error honk
  BASKET_FULL:      'basket-full',     // When a basket gets many items
  CONVEYOR_LOOP:    'conveyor-loop',   // Ambient conveyor belt hum (looping)
  TILT_ACTIVATE:    'tilt-activate',   // Subtle swoosh when phone tilt triggers

  // === PHASE 2: LAVAGE (WASHING) ===
  SOAP_SELECT:      'soap-select',     // Squirt/squeeze sound
  TEMP_SELECT:      'temp-select',     // Click/dial turn
  WASH_START:       'wash-start',      // Machine door closing + water filling
  WASH_LOOP:        'wash-loop',       // Machine spinning loop (ambient)
  WASH_DONE:        'wash-done',       // Machine beep when done
  STAIN_RUB:        'stain-rub',       // Scrubbing/friction sound (each rub)
  STAIN_REMOVED:    'stain-removed',   // Sparkle/clean sound
  SCRUB_LOOP:       'scrub-loop',      // Friction loop for big scrub minigame
  NUCLEAR_SOAP:     'nuclear-soap',    // Geiger counter / radioactive hum

  // === PHASE 3: SÉCHAGE (DRYING) ===
  BLOW_GUST:        'blow-gust',       // Wind gust (triggered by mic/button)
  SHAKE_WRING:      'shake-wring',     // Wringing/squeezing water out
  DRIP_DROP:        'drip-drop',       // Water drip (ambient while drying < 60%)
  CLOTHESLINE_SWING:'clothesline',     // Creaking clothesline
  FLIP_CLOTH:       'flip-cloth',      // Fabric flip sound
  SQUEEZE_CLOTH:    'squeeze-cloth',   // Squish sound when pressing clothes
  DRY_COMPLETE:     'dry-complete',    // Bright chime — all dry!

  // === PHASE 4: PLIAGE (FOLDING) ===
  FOLD_SHOW_ARROW:  'fold-show',       // Soft bip when arrow shown in sequence
  FOLD_INPUT_CORRECT:'fold-correct',   // Light snap/fold sound — correct direction
  FOLD_INPUT_WRONG: 'fold-wrong',      // Paper crumple — wrong direction
  FOLD_ROUND_DONE:  'fold-round',      // Satisfying stack/pat sound — round complete
  FOLD_SKIP:        'fold-skip',       // Quick swoosh — round skipped
  SPEED_FOLD:       'speed-fold',      // Rapid paper shuffle — speed fold bonus

  // === PHASE 5: REPASSAGE (IRONING) ===
  IRON_HIT:         'iron-hit',        // Steam hiss — hit the green zone
  IRON_MISS:        'iron-miss',       // Fabric burn / sizzle — missed
  IRON_GARMENT_DONE:'iron-done',       // Ding! Garment fully ironed
  IRON_SLIDE:       'iron-slide',      // Continuous iron sliding sound (ambient)
  STEAM_BURST:      'steam-burst',     // Steam burst on perfect hit

  // === EVENTS ALÉATOIRES ===
  EVENT_POPUP:      'event-popup',     // Dramatic reveal sound
  EVENT_GOOD:       'event-good',      // Lucky jingle (found money, etc.)
  EVENT_BAD:        'event-bad',       // Uh-oh sound (cat in machine, etc.)
  SOCK_LOST:        'sock-lost',       // Comedic "poof" — sock disappears

  // === RESULTS ===
  RESULTS_DRUMROLL: 'results-drumroll', // Drumroll before score reveal
  RESULTS_GRADE_S:  'results-grade-s',  // Fanfare for S+
  RESULTS_GRADE_A:  'results-grade-a',  // Good jingle for A
  RESULTS_GRADE_B:  'results-grade-b',  // Decent jingle for B
  RESULTS_GRADE_LOW:'results-grade-low',// Sad trombone for C/D/F
  STAR_APPEAR:      'star-appear',      // Each star popping in
}

// ---- MUSIC TRACKS ----
// Longer loops in /public/sounds/music/
export const MUSIC = {
  MENU:     'music-menu',      // Chill lo-fi / jazzy loop for menu screen
  GAME:     'music-game',      // Upbeat funky/electronic loop during gameplay
  RESULTS:  'music-results',   // Calm resolution music for results screen
  DAILY:    'music-daily',     // Special vibe for daily challenge (optional)
}

// ============================================================
// AUDIO ENGINE
// ============================================================

let audioContext = null
const sfxBuffers = new Map()  // Cached decoded audio buffers
let currentMusic = null       // Currently playing HTML5 Audio element
let musicVolume = 0.4
let sfxVolume = 0.7
let muted = false

/**
 * Initialize the audio context (must be called from a user gesture).
 */
export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
}

/**
 * Preload a set of SFX files into memory for instant playback.
 * Call this during loading screen or first user interaction.
 */
export async function preloadSounds(sfxKeys = []) {
  initAudio()
  const promises = sfxKeys.map(async (key) => {
    if (sfxBuffers.has(key)) return
    try {
      const url = `/sounds/sfx/${key}.mp3`
      const response = await fetch(url)
      if (!response.ok) return // File not yet created — silent fail
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      sfxBuffers.set(key, audioBuffer)
    } catch (e) {
      // Sound file not found — no crash, just no sound
    }
  })
  await Promise.allSettled(promises)
}

/**
 * Play a sound effect (instant, can overlap).
 * @param {string} sfxKey - One of the SFX.* values
 * @param {object} opts - { volume?: 0-1, playbackRate?: 0.5-2 }
 */
export function playSound(sfxKey, opts = {}) {
  if (muted || !audioContext) return

  const buffer = sfxBuffers.get(sfxKey)
  if (!buffer) return // Not preloaded or doesn't exist yet

  const source = audioContext.createBufferSource()
  source.buffer = buffer
  source.playbackRate.value = opts.playbackRate || 1

  const gain = audioContext.createGain()
  gain.gain.value = (opts.volume ?? 1) * sfxVolume
  source.connect(gain)
  gain.connect(audioContext.destination)

  source.start(0)
}

/**
 * Play a music track (looping, HTML5 Audio for long files).
 * Crossfades if another track is already playing.
 * @param {string} musicKey - One of the MUSIC.* values
 */
export function playMusic(musicKey) {
  if (muted) return

  // Stop previous track
  if (currentMusic) {
    const prev = currentMusic
    // Fade out
    const fadeOut = setInterval(() => {
      if (prev.volume > 0.05) {
        prev.volume = Math.max(0, prev.volume - 0.05)
      } else {
        clearInterval(fadeOut)
        prev.pause()
        prev.currentTime = 0
      }
    }, 50)
  }

  try {
    const audio = new Audio(`/sounds/music/${musicKey}.mp3`)
    audio.loop = true
    audio.volume = 0
    currentMusic = audio

    audio.play().then(() => {
      // Fade in
      const fadeIn = setInterval(() => {
        if (audio.volume < musicVolume - 0.05) {
          audio.volume = Math.min(musicVolume, audio.volume + 0.05)
        } else {
          audio.volume = musicVolume
          clearInterval(fadeIn)
        }
      }, 50)
    }).catch(() => {
      // Auto-play blocked — will play on next user interaction
    })
  } catch (e) {
    // Music file not found — silent fail
  }
}

/**
 * Stop current music with fade out.
 */
export function stopMusic() {
  if (!currentMusic) return
  const audio = currentMusic
  const fadeOut = setInterval(() => {
    if (audio.volume > 0.05) {
      audio.volume = Math.max(0, audio.volume - 0.05)
    } else {
      clearInterval(fadeOut)
      audio.pause()
      audio.currentTime = 0
      if (currentMusic === audio) currentMusic = null
    }
  }, 50)
}

/**
 * Set master volumes.
 */
export function setSFXVolume(v) { sfxVolume = Math.max(0, Math.min(1, v)) }
export function setMusicVolume(v) {
  musicVolume = Math.max(0, Math.min(1, v))
  if (currentMusic) currentMusic.volume = musicVolume
}
export function setMuted(v) {
  muted = v
  if (v && currentMusic) { currentMusic.pause() }
  if (!v && currentMusic) { currentMusic.play().catch(() => {}) }
}
export function isMuted() { return muted }
