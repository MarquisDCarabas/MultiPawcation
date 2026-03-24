import { useReducer, useEffect, useCallback, useRef } from 'react'
import { gameReducer, createInitialState } from './game/gameState'
import { useAIOpponent } from './hooks/useAIOpponent'
import { useSaveState, loadSavedState } from './hooks/useSaveState'
import { usePreloadAssets } from './hooks/usePreloadAssets'
import {
  loadFactProfile,
  saveFactProfile,
  recordAnswer,
  selectWeightedProblem,
  selectChallengeProblem,
  isMasteryBonusEligible,
} from './game/adaptiveLearning'
import type { FactProfile } from './game/adaptiveLearning'
import { loadProgress, saveProgress, recordGameResult } from './game/unlocks'
import type { ProgressData } from './game/unlocks'
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
import { UnlockReveal } from './components/UnlockReveal'
import { ProgressScreen } from './components/ProgressScreen'

function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)

  const assetsLoaded = usePreloadAssets()

  useAIOpponent(state, dispatch)
  useSaveState(state)

  // Persistent data refs (loaded from localStorage)
  const factProfileRef = useRef<FactProfile>(loadFactProfile())
  const progressRef = useRef<ProgressData>(loadProgress())

  // Check for saved game on mount
  const savedState = loadSavedState()

  // Record answers to fact profile when a result is shown
  useEffect(() => {
    if (state.showingResult && state.problemHistory.length > 0) {
      const lastResult = state.problemHistory[state.problemHistory.length - 1]
      factProfileRef.current = recordAnswer(
        factProfileRef.current,
        lastResult.problem,
        lastResult.correct,
        lastResult.responseTime,
      )
      saveFactProfile(factProfileRef.current)
    }
  }, [state.showingResult, state.problemHistory.length])

  // When game ends (winner set), record result and check unlocks
  const gameEndProcessed = useRef(false)
  useEffect(() => {
    if (state.winner && !gameEndProcessed.current) {
      gameEndProcessed.current = true
      const { progress: updated, newUnlocks } = recordGameResult(
        progressRef.current,
        state,
      )
      progressRef.current = updated
      saveProgress(updated)

      if (newUnlocks.length > 0) {
        dispatch({ type: 'SET_NEW_UNLOCKS', unlocks: newUnlocks })
      }
    }
    if (!state.winner) {
      gameEndProcessed.current = false
    }
  }, [state.winner, state])

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

  // Override problem generation with adaptive learning
  // When CLEAR_RESULT generates a new problem, replace it with weighted selection
  useEffect(() => {
    if (state.currentProblem && !state.showingResult && state.screen === 'playing' && !state.winner) {
      const profile = factProfileRef.current
      const problem = state.isChallenge
        ? selectChallengeProblem(state.settings.numberSets, profile)
        : selectWeightedProblem(state.settings.numberSets, profile)

      // Only replace if problem differs (to avoid infinite loop)
      if (
        problem.a !== state.currentProblem.a ||
        problem.b !== state.currentProblem.b
      ) {
        dispatch({ type: 'GENERATE_PROBLEM' })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only on mount — subsequent problems handled below

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

          <button
            onPointerDown={() => dispatch({ type: 'GO_TO_PROGRESS' })}
            className="px-12 py-3 bg-indigo-800/50 hover:bg-indigo-700/50
                       border border-indigo-500/20
                       active:scale-95 rounded-2xl text-lg font-bold text-indigo-300
                       transition-all"
          >
            My Progress
          </button>
        </div>
      </div>
    )
  }

  // Progress screen
  if (state.screen === 'progress') {
    return (
      <ProgressScreen
        progress={progressRef.current}
        factProfile={factProfileRef.current}
        onBack={() => dispatch({ type: 'GO_TO_TITLE' })}
      />
    )
  }

  // Unlock reveal screen (shown after game end, before scorecard)
  if (state.screen === 'unlockReveal' && state.newUnlocks.length > 0) {
    return (
      <UnlockReveal
        unlockedAnimalIds={state.newUnlocks}
        onContinue={() => dispatch({ type: 'SET_NEW_UNLOCKS', unlocks: [] })}
      />
    )
  }

  // Game over screen
  if (state.winner) {
    return <GameOverScreen state={state} dispatch={dispatch} />
  }

  // Animal select screen
  if (state.screen === 'animalSelect') {
    return (
      <AnimalSelect
        dispatch={dispatch}
        unlockedAnimalIds={progressRef.current.unlockedAnimals}
      />
    )
  }

  // Settings screen
  if (state.screen === 'settings') {
    return <GameSettings dispatch={dispatch} />
  }

  // Playing screen
  if (state.screen === 'playing') {
    // Check mastery bonus eligibility for current problem
    const masteryEligible = state.currentProblem
      ? isMasteryBonusEligible(factProfileRef.current, state.currentProblem)
      : false

    // Wrap dispatch to inject mastery bonus into SUBMIT_ANSWER
    const playDispatch: typeof dispatch = (action) => {
      if (action.type === 'SUBMIT_ANSWER') {
        dispatch({ ...action, masteryBonus: masteryEligible })
      } else {
        dispatch(action)
      }
    }

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
              {masteryEligible && !state.showingResult && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-xs text-emerald-300">
                  📈 Mastery bonus available!
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

            {/* Speed bonus + mastery bonus feedback */}
            {state.showingResult && state.isCorrect && state.problemHistory.length > 0 && (
              <div className="text-center flex flex-col gap-1">
                {(() => {
                  const lastResult = state.problemHistory[state.problemHistory.length - 1]
                  const parts: React.ReactNode[] = []
                  if (lastResult.speedBonus > 0) {
                    parts.push(
                      <span key="speed" className="text-cyan-300 font-bold text-lg">
                        +{lastResult.speedBonus} speed bonus!
                      </span>
                    )
                  }
                  if (masteryEligible) {
                    parts.push(
                      <span key="mastery" className="text-emerald-300 font-bold text-sm">
                        +1 mastery bonus!
                      </span>
                    )
                  }
                  return parts.length > 0 ? parts : null
                })()}
              </div>
            )}

            {/* Number pad */}
            {!state.isSkippingTurn && (
              <NumberPad
                input={state.playerInput}
                dispatch={playDispatch}
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
