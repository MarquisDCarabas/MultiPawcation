import { useState } from 'react'
import type { GameSettings as GameSettingsType, BoardSize, Difficulty, GameAction } from '../game/types'

interface GameSettingsProps {
  dispatch: React.Dispatch<GameAction>
}

const BOARD_SIZE_LABELS: Record<BoardSize, { label: string; desc: string }> = {
  quick: { label: 'Quick Race', desc: '~5 min' },
  standard: { label: 'Standard', desc: '~10 min' },
  marathon: { label: 'Marathon', desc: '~15 min' },
}

const DIFFICULTY_LABELS: Record<Difficulty, { label: string; desc: string }> = {
  easy: { label: 'Easy', desc: 'Relaxed AI' },
  medium: { label: 'Medium', desc: 'Fair challenge' },
  hard: { label: 'Hard', desc: 'Tough opponent' },
}

export function GameSettings({ dispatch }: GameSettingsProps) {
  // useState is fine here — this is UI form state, not game state
  const [boardSize, setBoardSize] = useState<BoardSize>('standard')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [numberSets, setNumberSets] = useState<number[]>([2, 3, 4, 5, 6, 7, 8, 9, 10])

  const toggleNumber = (n: number) => {
    if (numberSets.includes(n)) {
      if (numberSets.length <= 2) return // must have at least 2
      setNumberSets(numberSets.filter((x) => x !== n))
    } else {
      setNumberSets([...numberSets, n].sort((a, b) => a - b))
    }
  }

  const allSelected = numberSets.length === 9

  const handleStart = () => {
    const settings: GameSettingsType = { boardSize, difficulty, numberSets }
    dispatch({ type: 'START_GAME', settings })
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
        Game Setup
      </h1>

      {/* Board Size */}
      <div className="w-full max-w-sm">
        <h2 className="text-lg font-semibold text-indigo-200 mb-2">Board Length</h2>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(BOARD_SIZE_LABELS) as [BoardSize, { label: string; desc: string }][]).map(
            ([key, { label, desc }]) => (
              <button
                key={key}
                onPointerDown={() => setBoardSize(key)}
                className={`rounded-xl py-3 px-2 text-center transition-all
                  ${boardSize === key
                    ? 'bg-indigo-500 border-2 border-indigo-300'
                    : 'bg-indigo-900/50 border-2 border-indigo-700/30 hover:border-indigo-500/50'}`}
              >
                <div className="font-bold text-sm">{label}</div>
                <div className="text-xs text-indigo-300">{desc}</div>
              </button>
            )
          )}
        </div>
      </div>

      {/* Difficulty */}
      <div className="w-full max-w-sm">
        <h2 className="text-lg font-semibold text-indigo-200 mb-2">Difficulty</h2>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(DIFFICULTY_LABELS) as [Difficulty, { label: string; desc: string }][]).map(
            ([key, { label, desc }]) => (
              <button
                key={key}
                onPointerDown={() => setDifficulty(key)}
                className={`rounded-xl py-3 px-2 text-center transition-all
                  ${difficulty === key
                    ? 'bg-indigo-500 border-2 border-indigo-300'
                    : 'bg-indigo-900/50 border-2 border-indigo-700/30 hover:border-indigo-500/50'}`}
              >
                <div className="font-bold text-sm">{label}</div>
                <div className="text-xs text-indigo-300">{desc}</div>
              </button>
            )
          )}
        </div>
      </div>

      {/* Number Sets */}
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-indigo-200">Times Tables</h2>
          <button
            onPointerDown={() =>
              setNumberSets(allSelected ? [2, 5] : [2, 3, 4, 5, 6, 7, 8, 9, 10])
            }
            className="text-sm text-indigo-400 hover:text-indigo-200"
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              onPointerDown={() => toggleNumber(n)}
              className={`w-14 h-14 rounded-xl text-lg font-bold transition-all
                ${numberSets.includes(n)
                  ? 'bg-indigo-500 border-2 border-indigo-300'
                  : 'bg-indigo-900/50 border-2 border-indigo-700/30 text-indigo-500'}`}
            >
              {n}×
            </button>
          ))}
        </div>
        <p className="text-xs text-indigo-400 mt-1">Select at least 2</p>
      </div>

      {/* Start Button */}
      <button
        onPointerDown={handleStart}
        className="mt-2 px-12 py-4 bg-gradient-to-r from-emerald-500 to-teal-500
                   hover:from-emerald-400 hover:to-teal-400
                   active:scale-95 rounded-2xl text-xl font-bold text-white
                   shadow-lg shadow-emerald-500/25 transition-all"
      >
        Start Race!
      </button>
    </div>
  )
}
