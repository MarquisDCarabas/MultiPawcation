import { useEffect } from 'react'
import type { GameState } from '../game/types'

const SAVE_KEY = 'multipawcation-save'

export function useSaveState(state: GameState) {
  useEffect(() => {
    if (state.screen === 'playing' && !state.winner) {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state))
      } catch {
        // localStorage full or unavailable — ignore
      }
    }

    // Clear save when game ends or returns to title
    if (state.winner || state.screen === 'title') {
      localStorage.removeItem(SAVE_KEY)
    }
  }, [state])
}

export function loadSavedState(): GameState | null {
  try {
    const saved = localStorage.getItem(SAVE_KEY)
    if (!saved) return null
    return JSON.parse(saved)
  } catch {
    return null
  }
}

export function clearSavedState() {
  localStorage.removeItem(SAVE_KEY)
}
