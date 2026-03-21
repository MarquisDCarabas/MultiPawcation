interface GameBoardProps {
  boardLength: number
  playerPosition: number
  aiPosition: number
}

export function GameBoard({ boardLength, playerPosition, aiPosition }: GameBoardProps) {
  const spaces = Array.from({ length: boardLength }, (_, i) => i + 1)

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-1 min-w-max px-2">
        {spaces.map((space) => {
          const isPlayer = space === playerPosition
          const isAi = space === aiPosition
          const isBoth = isPlayer && isAi
          const isFinish = space === boardLength

          return (
            <div
              key={space}
              className={`relative w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold
                         transition-all duration-300 shrink-0
                         ${isFinish ? 'bg-yellow-500/30 border-2 border-yellow-400/50' : 'bg-indigo-900/40 border border-indigo-600/30'}
                         ${isPlayer && !isBoth ? 'ring-2 ring-emerald-400' : ''}
                         ${isAi && !isBoth ? 'ring-2 ring-rose-400' : ''}
                         ${isBoth ? 'ring-2 ring-yellow-400' : ''}`}
            >
              {isBoth ? (
                <span className="text-sm">👥</span>
              ) : isPlayer ? (
                <span className="text-sm">🟢</span>
              ) : isAi ? (
                <span className="text-sm">🔴</span>
              ) : isFinish ? (
                <span className="text-sm">🏁</span>
              ) : (
                <span className="text-indigo-500/60">{space}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
