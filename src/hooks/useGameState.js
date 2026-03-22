// ============================================================
// GAME STATE MANAGER
// Central state management with useReducer
// ============================================================
import { useReducer, useCallback, useRef } from 'react'

const INITIAL_STATE = {
  // Game flow
  phase: 'start', // start | sort | wash | stains | dry | fold | iron | results
  level: 1,

  // Player stats
  score: 0,
  lives: 3,
  combo: 1,
  maxCombo: 1,

  // Sort phase
  sortCorrect: 0,
  sortWrong: 0,
  sortTotal: 0,

  // Wash phase
  selectedSoap: null,
  selectedTemp: null,
  washPenalty: false,
  stainScore: 0,

  // Dry phase
  dryPercent: 0,
  blowCount: 0,
  flipCount: 0,

  // Fold phase
  foldScore: 0,
  foldTotal: 0,
  ironScore: 0,
  ironTotal: 5,

  // Events
  events: 0,
  sockLost: 0,

  // UI
  toast: null,
  eventPopup: null,
  tipCard: null,
  quizActive: null,
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.payload }

    case 'ADD_SCORE': {
      const pts = action.payload * state.combo
      return { ...state, score: Math.max(0, state.score + pts) }
    }

    case 'SET_COMBO':
      return {
        ...state,
        combo: Math.min(action.payload, 8),
        maxCombo: Math.max(state.maxCombo, Math.min(action.payload, 8)),
      }

    case 'INCREMENT_COMBO':
      return {
        ...state,
        combo: Math.min(state.combo + 1, 8),
        maxCombo: Math.max(state.maxCombo, Math.min(state.combo + 1, 8)),
      }

    case 'RESET_COMBO':
      return { ...state, combo: 1 }

    case 'LOSE_LIFE':
      return { ...state, lives: Math.max(0, state.lives - 1) }

    case 'SORT_CORRECT':
      return { ...state, sortCorrect: state.sortCorrect + 1 }

    case 'SORT_WRONG':
      return { ...state, sortWrong: state.sortWrong + 1 }

    case 'SET_SORT_TOTAL':
      return { ...state, sortTotal: action.payload }

    case 'SET_SOAP':
      return { ...state, selectedSoap: action.payload }

    case 'SET_TEMP':
      return { ...state, selectedTemp: action.payload }

    case 'SET_WASH_PENALTY':
      return { ...state, washPenalty: action.payload }

    case 'ADD_STAIN_SCORE':
      return { ...state, stainScore: state.stainScore + 1 }

    case 'SET_DRY_PERCENT':
      return { ...state, dryPercent: Math.min(100, action.payload) }

    case 'ADD_DRY':
      return { ...state, dryPercent: Math.min(100, state.dryPercent + action.payload) }

    case 'BLOW':
      return { ...state, blowCount: state.blowCount + 1 }

    case 'FLIP':
      return { ...state, flipCount: state.flipCount + 1 }

    case 'FOLD_SUCCESS':
      return { ...state, foldScore: state.foldScore + 1 }

    case 'SET_FOLD_TOTAL':
      return { ...state, foldTotal: action.payload }

    case 'IRON_HIT':
      return { ...state, ironScore: state.ironScore + 1 }

    case 'ADD_EVENT':
      return { ...state, events: state.events + 1 }

    case 'LOSE_SOCK':
      return { ...state, sockLost: state.sockLost + 1 }

    case 'SHOW_TOAST':
      return { ...state, toast: action.payload }

    case 'HIDE_TOAST':
      return { ...state, toast: null }

    case 'SHOW_EVENT':
      return { ...state, eventPopup: action.payload }

    case 'HIDE_EVENT':
      return { ...state, eventPopup: null }

    case 'SHOW_TIP':
      return { ...state, tipCard: action.payload }

    case 'HIDE_TIP':
      return { ...state, tipCard: null }

    case 'SHOW_QUIZ':
      return { ...state, quizActive: action.payload }

    case 'HIDE_QUIZ':
      return { ...state, quizActive: null }

    case 'LEVEL_UP':
      return { ...state, level: state.level + 1 }

    case 'RESET':
      return { ...INITIAL_STATE, level: action.payload?.level || 1 }

    default:
      return state
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE)
  const toastTimer = useRef(null)

  const toast = useCallback((message, type = 'info', duration = 2500) => {
    dispatch({ type: 'SHOW_TOAST', payload: { message, type } })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), duration)
  }, [])

  return { state, dispatch, toast }
}
