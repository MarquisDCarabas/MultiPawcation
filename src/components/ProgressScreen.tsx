import { motion } from 'framer-motion'
import type { ProgressData } from '../game/unlocks'
import type { FactProfile } from '../game/adaptiveLearning'
import { countMasteredFacts, getOverallAccuracy } from '../game/adaptiveLearning'
import { ANIMALS } from '../data/animals'

interface ProgressScreenProps {
  progress: ProgressData
  factProfile: FactProfile
  onBack: () => void
}

export function ProgressScreen({ progress, factProfile, onBack }: ProgressScreenProps) {
  const mastered = countMasteredFacts(factProfile)
  const overallAcc = Math.round(getOverallAccuracy(factProfile) * 100)
  const totalFacts = Object.keys(factProfile.facts).length

  // Accuracy trend from last 20 games
  const historyAccuracies = progress.gameHistory.map((g) =>
    Math.round(g.accuracy * 100)
  )

  return (
    <div className="flex flex-col items-center h-full px-4 py-6 overflow-y-auto gap-4">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
        My Progress
      </h1>

      {/* Overview stats */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        <StatCard label="Games Played" value={progress.totalGames.toString()} />
        <StatCard label="Wins" value={progress.totalWins.toString()} color="text-emerald-300" />
        <StatCard label="Overall Accuracy" value={`${overallAcc}%`} />
        <StatCard label="Facts Mastered" value={`${mastered}`} color="text-yellow-300" />
        <StatCard label="Facts Practiced" value={`${totalFacts}`} />
        <StatCard label="Badges" value={progress.badges.length.toString()} color="text-purple-300" />
      </div>

      {/* Wins by difficulty */}
      <div className="w-full max-w-sm">
        <h2 className="text-sm font-semibold text-indigo-300 mb-2">Wins by Difficulty</h2>
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <div key={d} className="flex-1 bg-indigo-900/40 rounded-xl px-3 py-2 text-center">
              <div className="text-lg font-bold">{progress.winsByDifficulty[d]}</div>
              <div className="text-xs text-indigo-400 capitalize">{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Accuracy trend graph */}
      {historyAccuracies.length > 1 && (
        <div className="w-full max-w-sm">
          <h2 className="text-sm font-semibold text-indigo-300 mb-2">
            Accuracy Trend (Last {historyAccuracies.length} Games)
          </h2>
          <div className="bg-indigo-900/40 rounded-xl p-3 h-24 flex items-end gap-1">
            {historyAccuracies.map((acc, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(acc, 5)}%` }}
                transition={{ delay: i * 0.05 }}
                className={`flex-1 rounded-t-sm min-w-1 ${
                  acc >= 80 ? 'bg-emerald-400' : acc >= 50 ? 'bg-yellow-400' : 'bg-rose-400'
                }`}
                title={`Game ${i + 1}: ${acc}%`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-indigo-500 mt-1 px-1">
            <span>Oldest</span>
            <span>Newest</span>
          </div>
        </div>
      )}

      {/* Character unlock progress */}
      <div className="w-full max-w-sm">
        <h2 className="text-sm font-semibold text-indigo-300 mb-2">
          Characters: {progress.unlockedAnimals.length} / {ANIMALS.length}
        </h2>
        <div className="grid grid-cols-5 gap-2">
          {ANIMALS.map((animal) => {
            const unlocked = progress.unlockedAnimals.includes(animal.id)
            return (
              <div key={animal.id} className="flex flex-col items-center gap-0.5">
                <img
                  src={animal.image}
                  alt={animal.name}
                  className={`w-12 h-12 object-contain ${
                    unlocked ? '' : 'grayscale brightness-50'
                  }`}
                />
                <span className={`text-[10px] ${unlocked ? 'text-indigo-200' : 'text-indigo-600'}`}>
                  {animal.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Badges */}
      {progress.badges.length > 0 && (
        <div className="w-full max-w-sm">
          <h2 className="text-sm font-semibold text-indigo-300 mb-2">Badges Earned</h2>
          <div className="flex gap-2 flex-wrap">
            {progress.badges.includes('perfect_round') && (
              <Badge icon="💯" label="Perfect Round" />
            )}
            {progress.badges.includes('streak_10') && (
              <Badge icon="🔥" label="10 Streak" />
            )}
          </div>
        </div>
      )}

      <button
        onPointerDown={onBack}
        className="mt-4 px-10 py-3 bg-indigo-700/50 hover:bg-indigo-600/50
                   rounded-xl text-white font-bold transition-all active:scale-95"
      >
        Back
      </button>
    </div>
  )
}

function StatCard({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-indigo-900/40 rounded-xl px-4 py-3 text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-indigo-400">{label}</div>
    </div>
  )
}

function Badge({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30">
      <span>{icon}</span>
      <span className="text-xs text-purple-300 font-semibold">{label}</span>
    </div>
  )
}
