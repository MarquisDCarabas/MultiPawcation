import { motion } from 'framer-motion'
import type { GameState, GameAction } from '../game/types'
import { getAnimalById } from '../data/animals'

interface GameOverScreenProps {
  state: GameState
  dispatch: React.Dispatch<GameAction>
}

export function GameOverScreen({ state, dispatch }: GameOverScreenProps) {
  const isWin = state.winner === 'player'
  const accuracy = state.totalProblems > 0
    ? Math.round((state.totalCorrect / state.totalProblems) * 100)
    : 0

  const avgTime = state.problemHistory.length > 0
    ? Math.round(
        state.problemHistory.reduce((sum, r) => sum + r.responseTime, 0) /
          state.problemHistory.length / 100
      ) / 10
    : 0

  const totalSpeedBonus = state.problemHistory.reduce((sum, r) => sum + r.speedBonus, 0)

  const playerAnimal = getAnimalById(state.playerAnimalId)
  const aiAnimal = getAnimalById(state.aiAnimalId)

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-6 h-full overflow-y-auto">
      {/* Win/Lose header with animal */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative"
      >
        {isWin ? (
          // Victory: celebratory dance animation
          <div className="relative">
            {playerAnimal && (
              <motion.img
                src={playerAnimal.image}
                alt=""
                className="w-28 h-28 object-contain drop-shadow-[0_0_16px_rgba(52,211,153,0.5)]"
                animate={{
                  y: [0, -12, 0, -8, 0],
                  rotate: [0, -5, 5, -3, 0],
                  scale: [1, 1.1, 1, 1.05, 1],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
            {/* Celebration sparkles around winner */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-lg"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                  x: Math.cos((Math.PI * 2 * i) / 6) * 50 - 8,
                  y: Math.sin((Math.PI * 2 * i) / 6) * 50 - 8,
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                {['✨', '⭐', '🌟', '💫', '✨', '⭐'][i]}
              </motion.div>
            ))}
          </div>
        ) : (
          // Defeat: encouraging animation - gentle sway with pat
          <div className="relative">
            {aiAnimal && (
              <img
                src={aiAnimal.image}
                alt=""
                className="w-20 h-20 object-contain opacity-60 drop-shadow-[0_0_12px_rgba(251,113,133,0.3)]"
              />
            )}
            {playerAnimal && (
              <motion.img
                src={playerAnimal.image}
                alt=""
                className="w-28 h-28 object-contain drop-shadow-[0_0_12px_rgba(129,140,248,0.4)]"
                animate={{
                  rotate: [-2, 2, -2],
                  y: [0, -2, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
            {/* Encouraging floating hearts */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-sm"
                style={{ bottom: '100%', left: `${30 + i * 20}%` }}
                animate={{
                  y: [0, -20, -40],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.6,
                }}
              >
                💪
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.h1
        className={`text-3xl font-bold ${isWin ? 'text-emerald-300' : 'text-rose-300'}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {isWin ? 'You Won!' : 'AI Wins!'}
      </motion.h1>
      <motion.p
        className="text-indigo-300 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {isWin ? 'Great job!' : "You're getting better every time!"}
      </motion.p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-2">
        <Stat label="Problems" value={state.totalProblems.toString()} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Correct" value={state.totalCorrect.toString()} color="text-emerald-300" />
        <Stat label="Wrong" value={state.totalWrong.toString()} color="text-rose-300" />
        <Stat label="Best Streak" value={state.longestStreak.toString()} color="text-yellow-300" />
        <Stat label="Avg Time" value={`${avgTime}s`} />
        <Stat label="Speed Bonuses" value={`+${totalSpeedBonus}`} color="text-cyan-300" />
        <Stat label="Final Position" value={`${state.playerPosition}/${state.boardLength}`} />
      </div>

      {/* Problem history */}
      {state.problemHistory.length > 0 && (
        <div className="w-full max-w-sm mt-2">
          <h2 className="text-lg font-semibold text-indigo-200 mb-2">Problem Review</h2>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {state.problemHistory.map((result, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm
                  ${result.correct ? 'bg-emerald-900/30' : 'bg-rose-900/30'}`}
              >
                <span>
                  {result.problem.a} × {result.problem.b} = {result.problem.answer}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-indigo-400">
                    {(result.responseTime / 1000).toFixed(1)}s
                  </span>
                  {result.correct ? (
                    <span className="text-emerald-400">✓</span>
                  ) : (
                    <span className="text-rose-400">✗</span>
                  )}
                  {result.speedBonus > 0 && (
                    <span className="text-cyan-300 text-xs">+{result.speedBonus}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges earned this game */}
      {(() => {
        const badges: { icon: string; label: string }[] = []
        if (isWin && accuracy === 100) badges.push({ icon: '💯', label: 'Perfect Round' })
        if (state.longestStreak >= 10) badges.push({ icon: '🔥', label: `${state.longestStreak} Streak!` })
        if (isWin && avgTime < 4) badges.push({ icon: '⚡', label: 'Speed Demon' })
        const speedBonusCount = state.problemHistory.filter(r => r.speedBonus > 0).length
        if (speedBonusCount >= 5) badges.push({ icon: '🏎️', label: `${speedBonusCount} Speed Bonuses` })
        if (badges.length === 0) return null
        return (
          <div className="flex gap-2 flex-wrap justify-center mt-1">
            {badges.map((b, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.15, type: 'spring' }}
                className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-xs text-purple-300 font-semibold"
              >
                {b.icon} {b.label}
              </motion.span>
            ))}
          </div>
        )
      })()}

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onPointerDown={() => dispatch({ type: 'GO_TO_TITLE' })}
          className="px-6 py-3 rounded-xl bg-indigo-700/50 hover:bg-indigo-600/50
                     text-white font-bold transition-all active:scale-95"
        >
          Home
        </button>
        <button
          onPointerDown={() => dispatch({ type: 'START_GAME', settings: state.settings })}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500
                     hover:from-emerald-400 hover:to-teal-400
                     text-white font-bold transition-all active:scale-95 shadow-lg"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-indigo-900/40 rounded-xl px-4 py-3 text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-indigo-400">{label}</div>
    </div>
  )
}
