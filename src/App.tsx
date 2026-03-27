import { useState, useReducer, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { gameReducer, createInitialState } from './game/gameState'
import { useAIOpponent } from './hooks/useAIOpponent'
import { useSaveState, loadSavedState } from './hooks/useSaveState'
import { usePreloadAssets } from './hooks/usePreloadAssets'
import { useAudio } from './hooks/useAudio'
import {
  loadFactProfile,
  saveFactProfile,
  recordAnswer,
  selectWeightedProblem,
  selectChallengeProblem,
  isMasteryBonusEligible,
} from './game/adaptiveLearning'
import type { FactProfile } from './game/adaptiveLearning'
import { loadProgress, saveProgress, recordGameResult, createDefaultProgress } from './game/unlocks'
import type { ProgressData } from './game/unlocks'
import { countMasteredFacts } from './game/adaptiveLearning'
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
import { ResetProgress } from './components/ResetProgress'
import { ProgressMinimap } from './components/ProgressMinimap'
import { TitleAnimation } from './components/TitleAnimation'
import { SpecialSpaceEffect } from './components/SpecialSpaceEffect'
import { useParticles } from './components/ParticleCanvas'
import type { SpecialSpaceType } from './data/specialSpaces'

function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)

  const assetsLoaded = usePreloadAssets()
  const audio = useAudio()
  const particles = useParticles()

  useAIOpponent(state, dispatch)
  useSaveState(state)

  // Persistent data refs
  const factProfileRef = useRef<FactProfile>(loadFactProfile())
  const progressRef = useRef<ProgressData>(loadProgress())

  const [showReset, setShowReset] = useState(false)
  const savedState = loadSavedState()

  // ─── Screen shake ───
  const [shakeClass, setShakeClass] = useState('')

  // ─── Character expression state ───
  const [charExpression, setCharExpression] = useState<'idle' | 'happy' | 'sad' | 'speed' | 'hop'>('idle')

  // ─── Special space effect overlay ───
  const [activeSpecialEffect, setActiveSpecialEffect] = useState<SpecialSpaceType | null>(null)

  // ─── Audio triggers ───

  // Play sound on correct/wrong answer + trigger particles & expressions
  const prevShowingResult = useRef(false)
  useEffect(() => {
    if (state.showingResult && !prevShowingResult.current) {
      if (state.isCorrect) {
        audio.playCorrect()
        setCharExpression('happy')

        // Confetti burst at center of screen
        particles.confettiBurst(window.innerWidth / 2, window.innerHeight * 0.35)

        // Speed bonus expression
        const lastResult = state.problemHistory[state.problemHistory.length - 1]
        if (lastResult?.speedBonus > 0) {
          setTimeout(() => {
            audio.playSpeedBonus()
            setCharExpression('speed')
          }, 200)
        }
      } else {
        audio.playWrong()
        setCharExpression('sad')

        // Screen shake on wrong answer
        setShakeClass('animate-shake')
        setTimeout(() => setShakeClass(''), 200)
      }

      // Reset expression after delay
      const delay = state.isCorrect ? 800 : 2500
      setTimeout(() => setCharExpression('idle'), delay)
    }
    prevShowingResult.current = state.showingResult
  }, [state.showingResult, state.isCorrect, state.problemHistory, audio, particles])

  // Player position change - trigger hop + dust
  const prevPlayerPos = useRef(state.playerPosition)
  useEffect(() => {
    if (state.playerPosition !== prevPlayerPos.current && state.screen === 'playing') {
      setCharExpression('hop')
      setTimeout(() => setCharExpression('idle'), 400)

      // Dust puff at approximate board area
      particles.dustPuff(window.innerWidth / 2, 120)
    }
    prevPlayerPos.current = state.playerPosition
  }, [state.playerPosition, state.screen, particles])

  // Play sound on special space landing + trigger special effects & particles
  const prevSpecialMsg = useRef<string | null>(null)
  useEffect(() => {
    if (state.specialMessage && state.specialMessage !== prevSpecialMsg.current) {
      audio.playSpecialSpace()

      // Determine which special space type and trigger effects
      const cx = window.innerWidth / 2
      const cy = window.innerHeight * 0.4
      let spaceType: SpecialSpaceType | null = null

      if (state.specialMessage.includes('⚡')) {
        spaceType = 'bonus_sprint'
        particles.lightningFlash(cx, cy)
      } else if (state.specialMessage.includes('💩')) {
        spaceType = 'mud_pit'
        particles.mudSplatter(cx, cy)
      } else if (state.specialMessage.includes('🌈')) {
        spaceType = 'shortcut'
        particles.rainbowArc(cx, cy)
      } else if (state.specialMessage.includes('🍌')) {
        spaceType = 'banana_peel'
        particles.bananaSpin(cx, cy)
      } else if (state.specialMessage.includes('⭐')) {
        spaceType = 'challenge_card'
        particles.sparkleBurst(cx, cy)
      } else if (state.specialMessage.includes('🛡')) {
        spaceType = 'shield'
        particles.shieldShimmer(cx, cy)
      }

      if (spaceType) {
        setActiveSpecialEffect(spaceType)
        setTimeout(() => setActiveSpecialEffect(null), 1200)
      }
    }
    prevSpecialMsg.current = state.specialMessage
  }, [state.specialMessage, audio, particles])

  // Play sound on AI movement
  const prevAiPos = useRef(state.aiPosition)
  useEffect(() => {
    if (state.aiPosition !== prevAiPos.current && state.screen === 'playing') {
      audio.playAiMove()
    }
    prevAiPos.current = state.aiPosition
  }, [state.aiPosition, state.screen, audio])

  // Play victory/defeat on game end
  const prevWinner = useRef<string | null>(null)
  useEffect(() => {
    if (state.winner && !prevWinner.current) {
      if (state.winner === 'player') {
        audio.playVictory()
        // Victory confetti explosion
        particles.confettiBurst(window.innerWidth / 2, window.innerHeight / 3)
        setTimeout(() => particles.confettiBurst(window.innerWidth * 0.3, window.innerHeight / 4), 300)
        setTimeout(() => particles.confettiBurst(window.innerWidth * 0.7, window.innerHeight / 4), 500)
      } else {
        audio.playDefeat()
      }
      audio.stopMusic()
    }
    prevWinner.current = state.winner
  }, [state.winner, audio, particles])

  // Start/stop background music with gameplay
  const prevScreen = useRef(state.screen)
  useEffect(() => {
    if (state.screen === 'playing' && prevScreen.current !== 'playing') {
      audio.startMusic()
    } else if (state.screen !== 'playing' && prevScreen.current === 'playing') {
      audio.stopMusic()
    }
    prevScreen.current = state.screen
  }, [state.screen, audio])

  // Music tempo shift near finish
  useEffect(() => {
    if (state.screen === 'playing') {
      const nearFinish =
        state.playerPosition >= state.boardLength - 5 ||
        state.aiPosition >= state.boardLength - 5
      audio.setMusicTempo(nearFinish)
    }
  }, [state.playerPosition, state.aiPosition, state.boardLength, state.screen, audio])

  // Pause/resume music
  useEffect(() => {
    if (state.isPaused) {
      audio.stopMusic()
    } else if (state.screen === 'playing' && !state.winner) {
      audio.startMusic()
    }
  }, [state.isPaused, state.screen, state.winner, audio])

  // ─── Fact tracking ───

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

  // ─── Game end: record result, check unlocks ───

  const gameEndProcessed = useRef(false)
  useEffect(() => {
    if (state.winner && !gameEndProcessed.current) {
      gameEndProcessed.current = true
      const mastered = countMasteredFacts(factProfileRef.current)
      const { progress: updated, newUnlocks } = recordGameResult(
        progressRef.current,
        state,
        mastered,
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

  // ─── Auto-advance timers ───

  useEffect(() => {
    if (state.showingResult && !state.winner) {
      const delay = state.isCorrect ? 800 : 3000
      const timer = setTimeout(() => dispatch({ type: 'CLEAR_RESULT' }), delay)
      return () => clearTimeout(timer)
    }
  }, [state.showingResult, state.isCorrect, state.winner])

  useEffect(() => {
    if (state.isSkippingTurn && !state.showingResult && !state.winner) {
      const timer = setTimeout(() => dispatch({ type: 'CLEAR_RESULT' }), 2000)
      return () => clearTimeout(timer)
    }
  }, [state.isSkippingTurn, state.showingResult, state.winner])

  useEffect(() => {
    if (state.specialMessage && !state.showingResult) {
      const timer = setTimeout(() => dispatch({ type: 'DISMISS_SPECIAL_MESSAGE' }), 2000)
      return () => clearTimeout(timer)
    }
  }, [state.specialMessage, state.showingResult])

  // Adaptive learning: replace generated problems with weighted selection
  useEffect(() => {
    if (state.currentProblem && !state.showingResult && state.screen === 'playing' && !state.winner) {
      const profile = factProfileRef.current
      const problem = state.isChallenge
        ? selectChallengeProblem(state.settings.numberSets, profile)
        : selectWeightedProblem(state.settings.numberSets, profile)
      if (problem.a !== state.currentProblem.a || problem.b !== state.currentProblem.b) {
        dispatch({ type: 'GENERATE_PROBLEM' })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePause = useCallback(() => dispatch({ type: 'TOGGLE_PAUSE' }), [])

  // ─── Screens ───

  if (!assetsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-5xl animate-bounce">🐾</div>
        <p className="text-indigo-300 text-lg animate-pulse">Loading...</p>
      </div>
    )
  }

  if (state.screen === 'title' && showReset) {
    return (
      <ResetProgress
        onReset={() => {
          // Clear all localStorage data
          localStorage.clear()
          // Restore defaults
          progressRef.current = createDefaultProgress()
          factProfileRef.current = { facts: {} }
          setShowReset(false)
        }}
        onCancel={() => setShowReset(false)}
      />
    )
  }

  if (state.screen === 'title') {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center gap-6">
        <motion.h1
          className="text-5xl font-bold bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          MultiPawcation
        </motion.h1>
        <motion.p
          className="text-lg text-indigo-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Times Tables Race!
        </motion.p>
        <motion.div
          className="text-6xl"
          animate={{ rotate: [0, -10, 10, -5, 0], scale: [1, 1.1, 1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          🐾
        </motion.div>

        <TitleAnimation />

        <div className="flex flex-col gap-3 mt-2">
          <button
            onPointerDown={() => {
              audio.unlock() // Safari audio unlock on first interaction
              dispatch({ type: 'GO_TO_ANIMAL_SELECT' })
            }}
            className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-teal-500
                       hover:from-emerald-400 hover:to-teal-400
                       active:scale-95 rounded-2xl text-xl font-bold text-white
                       shadow-lg shadow-emerald-500/25 transition-all"
          >
            Play
          </button>

          {savedState && (
            <button
              onPointerDown={() => {
                audio.unlock()
                dispatch({ type: 'RESUME_GAME', state: savedState })
              }}
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

        {/* Mute toggle on title screen */}
        <button
          onPointerDown={() => {
            audio.unlock()
            audio.toggleMute()
          }}
          className="mt-2 text-sm text-indigo-400 hover:text-indigo-200 transition-colors"
        >
          {audio.isMuted ? '🔇 Sound Off' : '🔊 Sound On'}
        </button>

        {/* Reset Progress */}
        <button
          onPointerDown={() => setShowReset(true)}
          className="mt-1 text-xs text-indigo-600 hover:text-red-400 transition-colors"
        >
          Reset Progress
        </button>
      </div>
    )
  }

  if (state.screen === 'progress') {
    return (
      <ProgressScreen
        progress={progressRef.current}
        factProfile={factProfileRef.current}
        onBack={() => dispatch({ type: 'GO_TO_TITLE' })}
      />
    )
  }

  if (state.screen === 'unlockReveal' && state.newUnlocks.length > 0) {
    return (
      <UnlockReveal
        unlockedAnimalIds={state.newUnlocks}
        onContinue={() => dispatch({ type: 'SET_NEW_UNLOCKS', unlocks: [] })}
        onReveal={() => audio.playUnlock()}
      />
    )
  }

  if (state.winner) {
    return <GameOverScreen state={state} dispatch={dispatch} />
  }

  if (state.screen === 'animalSelect') {
    return (
      <AnimalSelect
        dispatch={dispatch}
        unlockedAnimalIds={progressRef.current.unlockedAnimals}
      />
    )
  }

  if (state.screen === 'settings') {
    return <GameSettings dispatch={dispatch} />
  }

  if (state.screen === 'playing') {
    const masteryEligible = state.currentProblem
      ? isMasteryBonusEligible(factProfileRef.current, state.currentProblem)
      : false

    const playDispatch: typeof dispatch = (action) => {
      if (action.type === 'SUBMIT_ANSWER') {
        dispatch({ ...action, masteryBonus: masteryEligible })
      } else {
        dispatch(action)
      }
    }

    // Map charExpression to Framer Motion animate props for the player piece
    const expressionAnimate: Record<string, number[]> | undefined = (() => {
      switch (charExpression) {
        case 'happy':
          return { scale: [1, 1.25, 1], y: [0, -6, 0] } as Record<string, number[]>
        case 'sad':
          return { rotate: [0, -5, 5, -3, 3, 0], x: [0, -2, 2, -1, 1, 0] } as Record<string, number[]>
        case 'speed':
          return { x: [0, -1, 1, -1, 1, 0], scale: [1, 1.1, 1] } as Record<string, number[]>
        case 'hop':
          return { y: [0, -8, 0] } as Record<string, number[]>
        default:
          return undefined
      }
    })()

    return (
      <div className={`flex flex-col h-full ${shakeClass}`}>
        {/* Special space visual effect overlay */}
        <SpecialSpaceEffect activeEffect={activeSpecialEffect} />

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
          isMuted={audio.isMuted}
          onToggleMute={audio.toggleMute}
        />

        {/* Progress minimap */}
        <ProgressMinimap
          playerPosition={state.playerPosition}
          aiPosition={state.aiPosition}
          boardLength={state.boardLength}
          playerAnimalId={state.playerAnimalId}
          aiAnimalId={state.aiAnimalId}
        />

        <div className="px-2 py-1">
          <GameBoard
            boardLength={state.boardLength}
            boardSpaces={state.boardSpaces}
            playerPosition={state.playerPosition}
            aiPosition={state.aiPosition}
            playerAnimalId={state.playerAnimalId}
            aiAnimalId={state.aiAnimalId}
            expressionAnimate={expressionAnimate}
          />
        </div>

        {state.isPaused && (
          <PauseMenu onResume={handlePause} onQuit={() => dispatch({ type: 'GO_TO_TITLE' })} />
        )}

        {!state.isPaused && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4">
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

            <SpecialSpaceNotification message={state.specialMessage} />

            {state.isSkippingTurn && !state.showingResult && (
              <div className="text-center py-4">
                <div className="text-2xl mb-2">💩</div>
                <p className="text-orange-300 font-bold">Mud Pit! Skipping turn...</p>
              </div>
            )}

            {!state.showingResult && !state.isSkippingTurn && (
              <Timer startTime={state.problemStartTime} active={!state.showingResult} />
            )}

            {state.currentProblem && !state.isSkippingTurn && (
              <FlashCard
                problem={state.currentProblem}
                isCorrect={state.isCorrect}
                correctAnswer={state.correctAnswer}
                showingResult={state.showingResult}
              />
            )}

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
