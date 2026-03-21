interface HUDProps {
  playerPosition: number
  aiPosition: number
  boardLength: number
  totalCorrect: number
  totalWrong: number
  playerStreak: number
  isPaused: boolean
  onPause: () => void
}

export function HUD({
  playerPosition,
  aiPosition,
  boardLength,
  totalCorrect,
  totalWrong,
  playerStreak,
  isPaused,
  onPause,
}: HUDProps) {
  return (
    <div className="flex items-center justify-between w-full px-3 py-2 text-sm">
      <div className="flex gap-3">
        <div className="flex items-center gap-1">
          <span className="text-emerald-400">You:</span>
          <span className="font-bold">{playerPosition}/{boardLength}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-rose-400">AI:</span>
          <span className="font-bold">{aiPosition}/{boardLength}</span>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <div className="text-emerald-300">{totalCorrect}✓</div>
        <div className="text-rose-300">{totalWrong}✗</div>
        {playerStreak >= 2 && (
          <div className="text-yellow-300 font-bold">{playerStreak}🔥</div>
        )}
        <button
          onPointerDown={onPause}
          className="w-9 h-9 rounded-lg bg-indigo-700/50 hover:bg-indigo-600/50
                     flex items-center justify-center text-lg"
        >
          {isPaused ? '▶' : '⏸'}
        </button>
      </div>
    </div>
  )
}
