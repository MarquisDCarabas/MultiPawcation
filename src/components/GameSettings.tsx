import { useState } from 'react'
import { BOARD_THEMES } from '../data/boardThemes'
import { SPECIAL_SPACES } from '../data/specialSpaces'
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

function ThemePreview({ boardSize }: { boardSize: BoardSize }) {
  const theme = BOARD_THEMES[boardSize]
  // Show a mini preview of the board theme: 2 rows of 5 spaces
  const specialTypes = ['bonus_sprint', 'shield', 'challenge_card'] as const
  const previewSpaces = [
    { type: 'start' },
    { type: 'normal' },
    { type: 'special', special: specialTypes[0] },
    { type: 'normal' },
    { type: 'normal' },
    { type: 'normal' },
    { type: 'special', special: specialTypes[1] },
    { type: 'normal' },
    { type: 'special', special: specialTypes[2] },
    { type: 'finish' },
  ] as const

  return (
    <div
      className={`rounded-xl ${theme.containerBg} ${theme.containerBorder} border p-2 mt-2`}
      data-testid="theme-preview"
      data-theme={theme.name}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs font-semibold text-white/70">{theme.label} Theme</span>
        <span className="text-xs text-white/40">— {theme.finishIcon}</span>
      </div>
      <div className="flex flex-col gap-1">
        {[0, 1].map((rowIdx) => (
          <div key={rowIdx} className={`flex gap-1 justify-center ${theme.pathAccent} rounded-lg px-0.5`}>
            {previewSpaces.slice(rowIdx * 5, rowIdx * 5 + 5).map((space, i) => {
              const idx = rowIdx * 5 + i
              let bgClass = `${theme.spaceBg} border ${theme.spaceBorder}`

              if (space.type === 'start') {
                bgClass = `${theme.startBg} border ${theme.startBorder}`
              } else if (space.type === 'finish') {
                bgClass = `${theme.finishBg} border ${theme.finishBorder}`
              } else if (space.type === 'special') {
                const def = SPECIAL_SPACES[space.special]
                bgClass = `${def.color} ${def.borderColor} border ${theme.specialRing}`
              }

              return (
                <div
                  key={idx}
                  className={`w-7 h-7 ${theme.spaceShape} flex items-center justify-center text-[9px] font-bold shrink-0 ${bgClass}`}
                >
                  {space.type === 'start' ? (
                    <span className="text-[9px]">🐾</span>
                  ) : space.type === 'finish' ? (
                    <span className="text-[9px]">{theme.finishIcon}</span>
                  ) : space.type === 'special' ? (
                    <span className="text-[9px]">{SPECIAL_SPACES[space.special].icon}</span>
                  ) : (
                    <span className={theme.spaceNumberColor}>{idx + 1}</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export function GameSettings({ dispatch }: GameSettingsProps) {
  // useState is fine here — this is UI form state, not game state
  const [boardSize, setBoardSize] = useState<BoardSize>('standard')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
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
        <ThemePreview boardSize={boardSize} />
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
