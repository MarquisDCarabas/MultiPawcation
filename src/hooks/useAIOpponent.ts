import { useEffect, useRef } from 'react'
import type { GameAction, GameState } from '../game/types'
import { DIFFICULTY_CONFIGS } from '../game/types'

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
    const delay = config.aiSpeedMin + Math.random() * (config.aiSpeedMax - config.aiSpeedMin)

    timerRef.current = setTimeout(() => {
      const correct = Math.random() < config.aiAccuracy
      const spaces = correct
        ? config.aiMoveMin + Math.floor(Math.random() * (config.aiMoveMax - config.aiMoveMin + 1))
        : 1

      dispatch({ type: 'AI_MOVE', spaces, correct })
    }, delay)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [state.aiTimerActive, state.isPaused, state.winner, state.screen, state.aiPosition, dispatch, state.settings.difficulty])
}
