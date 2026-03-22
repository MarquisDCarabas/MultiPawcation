import { getAnimalById } from '../data/animals'

interface HUDProps {
  playerPosition: number
  aiPosition: number
  boardLength: number
  totalCorrect: number
  totalWrong: number
  playerStreak: number
  isPaused: boolean
  onPause: () => void
  playerAnimalId: string
  aiAnimalId: string
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
  playerAnimalId,
  aiAnimalId,
}: HUDProps) {
  const playerAnimal = getAnimalById(playerAnimalId)
  const aiAnimal = getAnimalById(aiAnimalId)

  return (
    <div className="flex items-center justify-between w-full px-3 py-2 text-sm
                    bg-indigo-950/40 border-b border-indigo-700/20">
      <div className="flex gap-3 items-center">
        <div className="flex items-center gap-1">
          {playerAnimal && (
            <img src={playerAnimal.image} alt="" className="w-6 h-6 object-contain" />
          )}
          <span className="font-bold text-emerald-300">{playerPosition}/{boardLength}</span>
        </div>
        <div className="flex items-center gap-1">
          {aiAnimal && (
            <img src={aiAnimal.image} alt="" className="w-5 h-5 object-contain opacity-70" />
          )}
          <span className="font-bold text-rose-300">{aiPosition}/{boardLength}</span>
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
