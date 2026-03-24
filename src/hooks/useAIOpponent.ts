import { useEffect, useRef } from 'react'
import type { GameAction, GameState } from '../game/types'
import { DIFFICULTY_CONFIGS } from '../game/types'

const RUBBER_BAND_THRESHOLD = 8

export function useAIOpponent(state: GameState, dispatch: React.Dispatch<GameAction>) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!state.aiTimerActive || state.isPaused || state.winner || state.screen !== 'playing') {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    const config = DIFFICULTY_CONFIGS[state.settings.difficulty]
    let baseDelay = config.aiSpeedMin + Math.random() * (config.aiSpeedMax - config.aiSpeedMin)

    // Rubber banding: adjust speed based on gap
    const gap = state.aiPosition - state.playerPosition
    if (gap >= RUBBER_BAND_THRESHOLD) {
      // AI is way ahead — slow down (multiply delay by 1.4)
      baseDelay *= 1.4
    } else if (gap <= -RUBBER_BAND_THRESHOLD) {
      // Player is way ahead — speed up (multiply delay by 0.7)
      baseDelay *= 0.7
    }

    timerRef.current = setTimeout(() => {
      const correct = Math.random() < config.aiAccuracy
      const spaces = correct
        ? config.aiMoveMin + Math.floor(Math.random() * (config.aiMoveMax - config.aiMoveMin + 1))
        : 1

      dispatch({ type: 'AI_MOVE', spaces, correct })
    }, baseDelay)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [state.aiTimerActive, state.isPaused, state.winner, state.screen, state.aiPosition, state.playerPosition, dispatch, state.settings.difficulty])
}
