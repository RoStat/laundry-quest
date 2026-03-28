// ============================================================
// DEVICE INTERACTIONS HOOK
// Handles all smartphone-specific interactions:
// - Touch scrubbing (frotter pour détacher)
// - Microphone blow detection (souffler pour sécher)
// - Device shake (secouer pour essorer)
// - Device tilt (incliner pour trier)
// - Gyroscope (étendre le linge)
// - Vibration feedback
// ============================================================
import { useState, useEffect, useRef, useCallback } from 'react'

// ---- VIBRATION ----
// Kept light to avoid overwhelming the user.
// All durations in ms. Short = subtle, long = noticeable.
let _hapticsEnabled = true
export function setHapticsEnabled(v) { _hapticsEnabled = v }

export function vibrate(pattern = 20) {
  if (_hapticsEnabled && 'vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

export function vibrateSuccess() { vibrate(20) }           // single short tap
export function vibrateError() { vibrate([40, 30, 40]) }   // double tap (lighter than before)
export function vibrateTap() { vibrate(8) }                 // barely perceptible

// ---- SHAKE DETECTION ----
export function useShakeDetection(onShake, threshold = 25) {
  const lastAccel = useRef({ x: 0, y: 0, z: 0 })
  const shakeTimeout = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      const { x, y, z } = e.accelerationIncludingGravity || {}
      if (x == null) return

      const dx = Math.abs(x - lastAccel.current.x)
      const dy = Math.abs(y - lastAccel.current.y)
      const dz = Math.abs(z - lastAccel.current.z)

      if (dx + dy + dz > threshold) {
        if (!shakeTimeout.current) {
          onShake()
          vibrate(30)
          shakeTimeout.current = setTimeout(() => {
            shakeTimeout.current = null
          }, 400)
        }
      }
      lastAccel.current = { x, y, z }
    }

    window.addEventListener('devicemotion', handler)
    return () => {
      window.removeEventListener('devicemotion', handler)
      if (shakeTimeout.current) clearTimeout(shakeTimeout.current)
    }
  }, [onShake, threshold])
}

// ---- TILT DETECTION (4 directions) ----
export function useTiltDetection(onTilt) {
  const [tilt, setTilt] = useState({ beta: 0, gamma: 0 })
  const tiltTimeout = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      const beta = e.beta || 0   // front/back tilt (-180 to 180)
      const gamma = e.gamma || 0 // left/right tilt (-90 to 90)
      setTilt({ beta, gamma })

      if (tiltTimeout.current) return

      const threshold = 25
      let direction = null

      // Determine dominant tilt direction
      if (Math.abs(gamma) > Math.abs(beta - 45)) {
        // Left/Right is dominant (beta ~45 is natural hold angle)
        if (gamma > threshold) direction = 'right'
        else if (gamma < -threshold) direction = 'left'
      } else {
        // Forward/Back is dominant
        const adjustedBeta = beta - 45 // offset for natural phone hold
        if (adjustedBeta > threshold) direction = 'down'
        else if (adjustedBeta < -threshold) direction = 'up'
      }

      if (direction) {
        onTilt(direction, { beta, gamma })
        vibrateTap()
        tiltTimeout.current = setTimeout(() => {
          tiltTimeout.current = null
        }, 600)
      }
    }

    window.addEventListener('deviceorientation', handler)
    return () => {
      window.removeEventListener('deviceorientation', handler)
      if (tiltTimeout.current) clearTimeout(tiltTimeout.current)
    }
  }, [onTilt])

  return tilt
}

// ---- MICROPHONE BLOW DETECTION ----
export function useBlowDetection(onBlow, enabled = true) {
  const [isListening, setIsListening] = useState(false)
  const [blowIntensity, setBlowIntensity] = useState(0)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)

  const startListening = useCallback(async () => {
    if (isListening || !enabled) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      audioCtxRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser
      setIsListening(true)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      let blowCooldown = false

      const checkBlow = () => {
        analyser.getByteFrequencyData(dataArray)
        // Focus on low frequencies (breath = low freq noise)
        const lowFreqAvg = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10
        const intensity = Math.min(100, Math.round(lowFreqAvg / 1.5))
        setBlowIntensity(intensity)

        if (intensity > 50 && !blowCooldown) {
          onBlow(intensity)
          vibrate(40)
          blowCooldown = true
          setTimeout(() => { blowCooldown = false }, 300)
        }
        rafRef.current = requestAnimationFrame(checkBlow)
      }
      checkBlow()
    } catch (err) {
      console.log('Micro non disponible:', err.message)
    }
  }, [isListening, onBlow, enabled])

  const stopListening = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    if (audioCtxRef.current) audioCtxRef.current.close()
    setIsListening(false)
    setBlowIntensity(0)
  }, [])

  useEffect(() => {
    return () => stopListening()
  }, [stopListening])

  return { isListening, blowIntensity, startListening, stopListening }
}

// ---- SCRUB/RUB DETECTION (touch) ----
export function useScrubDetection(elementRef, onScrub) {
  const touchHistory = useRef([])
  const scrubCount = useRef(0)

  useEffect(() => {
    const el = elementRef?.current
    if (!el) return

    const handleMove = (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      if (!touch) return

      const point = { x: touch.clientX, y: touch.clientY, t: Date.now() }
      touchHistory.current.push(point)

      // Keep last 10 points
      if (touchHistory.current.length > 10) touchHistory.current.shift()

      // Detect direction changes (scrubbing = back and forth)
      if (touchHistory.current.length >= 3) {
        const pts = touchHistory.current
        const len = pts.length
        const dx1 = pts[len - 2].x - pts[len - 3].x
        const dx2 = pts[len - 1].x - pts[len - 2].x

        // Direction changed = one scrub
        if ((dx1 > 0 && dx2 < 0) || (dx1 < 0 && dx2 > 0)) {
          scrubCount.current++
          if (scrubCount.current % 2 === 0) {
            onScrub(scrubCount.current)
            vibrateTap()
          }
        }
      }
    }

    const handleEnd = () => {
      touchHistory.current = []
      scrubCount.current = 0
    }

    el.addEventListener('touchmove', handleMove, { passive: false })
    el.addEventListener('touchend', handleEnd)
    return () => {
      el.removeEventListener('touchmove', handleMove)
      el.removeEventListener('touchend', handleEnd)
    }
  }, [elementRef, onScrub])
}

// ---- SWIPE DETECTION (for ironing) ----
export function useSwipeDetection(elementRef, onSwipe) {
  const startPos = useRef(null)

  useEffect(() => {
    const el = elementRef?.current
    if (!el) return

    const handleStart = (e) => {
      const touch = e.touches[0]
      startPos.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleEnd = (e) => {
      if (!startPos.current) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - startPos.current.x
      const dy = touch.clientY - startPos.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > 40) {
        const angle = Math.atan2(dy, dx) * 180 / Math.PI
        let direction = 'right'
        if (angle > 135 || angle < -135) direction = 'left'
        else if (angle > 45) direction = 'down'
        else if (angle < -45) direction = 'up'

        onSwipe(direction, dist)
        vibrateTap()
      }
      startPos.current = null
    }

    el.addEventListener('touchstart', handleStart, { passive: true })
    el.addEventListener('touchend', handleEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', handleStart)
      el.removeEventListener('touchend', handleEnd)
    }
  }, [elementRef, onSwipe])
}

// ---- GYROSCOPE (for hanging clothes) ----
export function useGyroscope(onRotate) {
  const [rotation, setRotation] = useState({ alpha: 0, beta: 0, gamma: 0 })

  useEffect(() => {
    const handler = (e) => {
      setRotation({
        alpha: e.alpha || 0,
        beta: e.beta || 0,
        gamma: e.gamma || 0,
      })
      if (onRotate) onRotate(e)
    }

    window.addEventListener('deviceorientation', handler)
    return () => window.removeEventListener('deviceorientation', handler)
  }, [onRotate])

  return rotation
}

// ---- REQUEST DEVICE PERMISSIONS (iOS 13+) ----
export async function requestMotionPermission() {
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      const permission = await DeviceMotionEvent.requestPermission()
      return permission === 'granted'
    } catch (e) {
      return false
    }
  }
  return true // non-iOS or older
}

export async function requestOrientationPermission() {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const permission = await DeviceOrientationEvent.requestPermission()
      return permission === 'granted'
    } catch (e) {
      return false
    }
  }
  return true
}
