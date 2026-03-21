import { useReducer, useEffect, useCallback } from 'react'
import { gameReducer, createInitialState } from './game/gameState'
import { useAIOpponent } from './hooks/useAIOpponent'
import { useSaveState, loadSavedState } from './hooks/useSaveState'
import { GameSettings } from './components/GameSettings'
import { GameBoard } from './components/GameBoard'
import { FlashCard } from './components/FlashCard'
import { NumberPad } from './components/NumberPad'
import { HUD } from './components/HUD'
import { Timer } from './components/Timer'
import { GameOverScreen } from './components/GameOverScreen'

function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)

  useAIOpponent(state, dispatch)
  useSaveState(state)

  // Check for saved game on mount
  const savedState = loadSavedState()

  // Auto-advance after showing result
  useEffect(() => {
    if (state.showingResult && !state.winner) {
      const delay = state.isCorrect ? 800 : 3000
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_RESULT' })
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [state.showingResult, state.isCorrect, state.winner])

  const handlePause = useCallback(() => {
    dispatch({ type: 'TOGGLE_PAUSE' })
  }, [])

  // Title screen
  if (state.screen === 'title') {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center gap-6">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
          MultiPawcation
        </h1>
        <p className="text-lg text-indigo-200">Times Tables Race!</p>
        <div className="text-6xl">🐾</div>

        <div className="flex flex-col gap-3 mt-4">
          <button
            onPointerDown={() => dispatch({ type: 'GO_TO_SETTINGS' })}
            className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-teal-500
                       hover:from-emerald-400 hover:to-teal-400
                       active:scale-95 rounded-2xl text-xl font-bold text-white
                       shadow-lg shadow-emerald-500/25 transition-all"
          >
            Play
          </button>

          {savedState && (
            <button
              onPointerDown={() => dispatch({ type: 'RESUME_GAME', state: savedState })}
              className="px-12 py-3 bg-indigo-600 hover:bg-indigo-500
                         active:scale-95 rounded-2xl text-lg font-bold text-white
                         transition-all"
            >
              Resume Game
            </button>
          )}
        </div>
      </div>
    )
  }

  // Game over screen
  if (state.winner) {
    return <GameOverScreen state={state} dispatch={dispatch} />
  }

  // Settings screen
  if (state.screen === 'settings') {
    return <GameSettings dispatch={dispatch} />
  }

  // Playing screen
  if (state.screen === 'playing') {
    return (
      <div className="flex flex-col h-full">
        {/* HUD */}
        <HUD
          playerPosition={state.playerPosition}
          aiPosition={state.aiPosition}
          boardLength={state.boardLength}
          totalCorrect={state.totalCorrect}
          totalWrong={state.totalWrong}
          playerStreak={state.playerStreak}
          isPaused={state.isPaused}
          onPause={handlePause}
        />

        {/* Board */}
        <div className="px-2 py-1">
          <GameBoard
            boardLength={state.boardLength}
            playerPosition={state.playerPosition}
            aiPosition={state.aiPosition}
          />
        </div>

        {/* Pause overlay */}
        {state.isPaused && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">⏸</div>
              <h2 className="text-2xl font-bold text-indigo-200 mb-4">Paused</h2>
              <button
                onPointerDown={handlePause}
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500
                           text-white font-bold transition-all active:scale-95"
              >
                Resume
              </button>
            </div>
          </div>
        )}

        {/* Game content (flashcard + numpad) */}
        {!state.isPaused && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
            {/* Timer */}
            {!state.showingResult && (
              <Timer startTime={state.problemStartTime} active={!state.showingResult} />
            )}

            {/* Flash card */}
            {state.currentProblem && (
              <FlashCard
                problem={state.currentProblem}
                isCorrect={state.isCorrect}
                correctAnswer={state.correctAnswer}
                showingResult={state.showingResult}
              />
            )}

            {/* Speed bonus feedback */}
            {state.showingResult && state.isCorrect && state.problemHistory.length > 0 && (
              <div className="text-center">
                {(() => {
                  const lastResult = state.problemHistory[state.problemHistory.length - 1]
                  if (lastResult.speedBonus > 0) {
                    return (
                      <span className="text-cyan-300 font-bold text-lg">
                        +{lastResult.speedBonus} speed bonus!
                      </span>
                    )
                  }
                  return null
                })()}
              </div>
            )}

            {/* Number pad */}
            <NumberPad
              input={state.playerInput}
              dispatch={dispatch}
              disabled={state.showingResult}
            />
          </div>
        )}
      </div>
    )
  }

  return null
}

export default App
