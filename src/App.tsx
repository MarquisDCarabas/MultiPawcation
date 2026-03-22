import { useReducer, useEffect, useCallback } from 'react'
import { gameReducer, createInitialState } from './game/gameState'
import { useAIOpponent } from './hooks/useAIOpponent'
import { useSaveState, loadSavedState } from './hooks/useSaveState'
import { usePreloadAssets } from './hooks/usePreloadAssets'
import { AnimalSelect } from './components/AnimalSelect'
import { GameSettings } from './components/GameSettings'
import { GameBoard } from './components/GameBoard'
import { FlashCard } from './components/FlashCard'
import { NumberPad } from './components/NumberPad'
import { HUD } from './components/HUD'
import { Timer } from './components/Timer'
import { GameOverScreen } from './components/GameOverScreen'
import { PauseMenu } from './components/PauseMenu'
import { SpecialSpaceNotification } from './components/SpecialSpaceNotification'

function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)

  const assetsLoaded = usePreloadAssets()

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

  // Auto-advance when skipping turn (mud pit)
  useEffect(() => {
    if (state.isSkippingTurn && !state.showingResult && !state.winner) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_RESULT' })
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state.isSkippingTurn, state.showingResult, state.winner])

  // Auto-dismiss special space messages
  useEffect(() => {
    if (state.specialMessage && !state.showingResult) {
      const timer = setTimeout(() => {
        dispatch({ type: 'DISMISS_SPECIAL_MESSAGE' })
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state.specialMessage, state.showingResult])

  const handlePause = useCallback(() => {
    dispatch({ type: 'TOGGLE_PAUSE' })
  }, [])

  // Loading screen
  if (!assetsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-5xl animate-bounce">🐾</div>
        <p className="text-indigo-300 text-lg animate-pulse">Loading...</p>
      </div>
    )
  }

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
            onPointerDown={() => dispatch({ type: 'GO_TO_ANIMAL_SELECT' })}
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

  // Animal select screen
  if (state.screen === 'animalSelect') {
    return <AnimalSelect dispatch={dispatch} />
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
          playerAnimalId={state.playerAnimalId}
          aiAnimalId={state.aiAnimalId}
        />

        {/* Board */}
        <div className="px-2 py-1">
          <GameBoard
            boardLength={state.boardLength}
            boardSpaces={state.boardSpaces}
            playerPosition={state.playerPosition}
            aiPosition={state.aiPosition}
            playerAnimalId={state.playerAnimalId}
            aiAnimalId={state.aiAnimalId}
          />
        </div>

        {/* Pause overlay */}
        {state.isPaused && (
          <PauseMenu onResume={handlePause} onQuit={() => dispatch({ type: 'GO_TO_TITLE' })} />
        )}

        {/* Game content (flashcard + numpad) */}
        {!state.isPaused && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4">
            {/* Active effects badges */}
            <div className="flex gap-2 flex-wrap justify-center">
              {state.hasShield && (
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-xs text-sky-300">
                  🛡️ Shield Active
                </span>
              )}
              {state.hasBonusSprint && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-xs text-amber-300">
                  ⚡ Bonus Sprint
                </span>
              )}
              {state.isChallenge && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-xs text-purple-300">
                  ⭐ Challenge! +3 if correct
                </span>
              )}
            </div>

            {/* Special space notification */}
            <SpecialSpaceNotification message={state.specialMessage} />

            {/* Skipping turn display */}
            {state.isSkippingTurn && !state.showingResult && (
              <div className="text-center py-4">
                <div className="text-2xl mb-2">💩</div>
                <p className="text-orange-300 font-bold">Mud Pit! Skipping turn...</p>
              </div>
            )}

            {/* Timer */}
            {!state.showingResult && !state.isSkippingTurn && (
              <Timer startTime={state.problemStartTime} active={!state.showingResult} />
            )}

            {/* Flash card */}
            {state.currentProblem && !state.isSkippingTurn && (
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
            {!state.isSkippingTurn && (
              <NumberPad
                input={state.playerInput}
                dispatch={dispatch}
                disabled={state.showingResult}
              />
            )}
          </div>
        )}
      </div>
    )
  }

  return null
}

export default App
