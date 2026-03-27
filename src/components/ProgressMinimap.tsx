import { getAnimalById } from '../data/animals'

interface ProgressMinimapProps {
  playerPosition: number
  aiPosition: number
  boardLength: number
  playerAnimalId: string
  aiAnimalId: string
}

export function ProgressMinimap({
  playerPosition,
  aiPosition,
  boardLength,
  playerAnimalId,
  aiAnimalId,
}: ProgressMinimapProps) {
  const playerPct = Math.min(((playerPosition - 1) / (boardLength - 1)) * 100, 100)
  const aiPct = Math.min(((aiPosition - 1) / (boardLength - 1)) * 100, 100)

  const playerAnimal = getAnimalById(playerAnimalId)
  const aiAnimal = getAnimalById(aiAnimalId)

  return (
    <div className="w-full px-3 py-1.5">
      <div className="relative h-5 bg-indigo-900/50 rounded-full border border-indigo-700/30 overflow-visible">
        {/* Track line */}
        <div className="absolute inset-y-0 left-2 right-2 flex items-center">
          <div className="w-full h-0.5 bg-indigo-700/40 rounded-full" />
        </div>

        {/* Start marker */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] text-indigo-500">▶</div>
        {/* Finish marker */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px]">🏁</div>

        {/* AI dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
          style={{ left: `calc(8px + ${aiPct}% * (100% - 16px) / 100%)`, marginLeft: '-10px' }}
        >
          {aiAnimal ? (
            <img src={aiAnimal.image} alt="" className="w-5 h-5 object-contain opacity-70 drop-shadow-sm" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-rose-400 border-2 border-rose-300 shadow-sm" />
          )}
        </div>

        {/* Player dot (on top) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out z-10"
          style={{ left: `calc(8px + ${playerPct}% * (100% - 16px) / 100%)`, marginLeft: '-10px' }}
        >
          {playerAnimal ? (
            <img src={playerAnimal.image} alt="" className="w-5 h-5 object-contain drop-shadow-md" />
          ) : (
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-emerald-300 shadow-sm" />
          )}
        </div>
      </div>
    </div>
  )
}
