import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { getAnimalById } from '../data/animals'
import { SPECIAL_SPACES } from '../data/specialSpaces'
import type { BoardSpace } from '../game/boardGenerator'

interface GameBoardProps {
  boardLength: number
  boardSpaces: BoardSpace[]
  playerPosition: number
  aiPosition: number
  playerAnimalId: string
  aiAnimalId: string
}

const SPACES_PER_ROW = 10

export function GameBoard({ boardLength, boardSpaces, playerPosition, aiPosition, playerAnimalId, aiAnimalId }: GameBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)

  const playerAnimal = getAnimalById(playerAnimalId)
  const aiAnimal = getAnimalById(aiAnimalId)

  // Build rows for a snake/winding board layout
  const rows: number[][] = []
  for (let i = 0; i < boardLength; i += SPACES_PER_ROW) {
    const row = Array.from(
      { length: Math.min(SPACES_PER_ROW, boardLength - i) },
      (_, j) => i + j + 1
    )
    if (rows.length % 2 === 1) row.reverse()
    rows.push(row)
  }

  // Auto-scroll to keep player visible
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      })
    }
  }, [playerPosition])

  const playerRow = Math.floor((playerPosition - 1) / SPACES_PER_ROW)
  const aiRow = Math.floor((aiPosition - 1) / SPACES_PER_ROW)

  return (
    <div className="relative">
      <AiOffscreenIndicator
        aiPosition={aiPosition}
        playerPosition={playerPosition}
        aiRow={aiRow}
        playerRow={playerRow}
        boardLength={boardLength}
        aiAnimal={aiAnimal}
      />

      <div
        ref={boardRef}
        className="w-full max-h-44 overflow-y-auto overflow-x-hidden rounded-xl
                   bg-indigo-950/40 border border-indigo-700/20 p-2"
      >
        <div className="flex flex-col gap-1">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 justify-center">
              {row.map((space) => {
                const isPlayer = space === playerPosition
                const isAi = space === aiPosition
                const isBoth = isPlayer && isAi
                const isFinish = space === boardLength
                const isStart = space === 1
                const boardSpace = boardSpaces[space - 1]
                const specialType = boardSpace?.specialType
                const specialDef = specialType ? SPECIAL_SPACES[specialType] : null

                let bgClass = 'bg-indigo-800/30 border border-indigo-600/15'
                if (isFinish) bgClass = 'bg-yellow-500/25 border border-yellow-400/40'
                else if (isStart) bgClass = 'bg-emerald-500/20 border border-emerald-400/30'
                else if (specialDef) bgClass = `${specialDef.color} ${specialDef.borderColor} border`

                return (
                  <div
                    key={space}
                    ref={isPlayer ? playerRef : undefined}
                    className={`relative w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold
                               shrink-0 transition-colors duration-200 ${bgClass}`}
                  >
                    {/* Content: animal pieces take priority, then special icons, then space number */}
                    {isBoth ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.img
                          src={playerAnimal?.image}
                          alt=""
                          className="w-7 h-7 object-contain absolute -translate-x-1"
                          layoutId="player-piece"
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        />
                        <motion.img
                          src={aiAnimal?.image}
                          alt=""
                          className="w-6 h-6 object-contain absolute translate-x-1 opacity-80"
                          layoutId="ai-piece"
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        />
                      </div>
                    ) : isPlayer ? (
                      <motion.img
                        src={playerAnimal?.image}
                        alt=""
                        className="w-7 h-7 object-contain"
                        layoutId="player-piece"
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                    ) : isAi ? (
                      <motion.img
                        src={aiAnimal?.image}
                        alt=""
                        className="w-6 h-6 object-contain opacity-80"
                        layoutId="ai-piece"
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                    ) : isFinish ? (
                      <span className="text-sm">🏁</span>
                    ) : specialDef ? (
                      <span className="text-sm">{specialDef.icon}</span>
                    ) : (
                      <span className="text-indigo-600/40">{space}</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AiOffscreenIndicator({
  aiPosition,
  playerPosition,
  aiRow,
  playerRow,
  boardLength,
  aiAnimal,
}: {
  aiPosition: number
  playerPosition: number
  aiRow: number
  playerRow: number
  boardLength: number
  aiAnimal: ReturnType<typeof getAnimalById>
}) {
  if (aiRow === playerRow || aiPosition === playerPosition) return null

  const isAhead = aiPosition > playerPosition
  const aiProgress = Math.round((aiPosition / boardLength) * 100)

  return (
    <div
      className={`absolute z-10 flex items-center gap-1 px-2 py-1 rounded-lg
                  bg-rose-900/80 border border-rose-500/40 text-xs
                  ${isAhead ? 'top-0 right-1' : 'bottom-0 right-1'}`}
    >
      {aiAnimal && (
        <img src={aiAnimal.image} alt="" className="w-5 h-5 object-contain" />
      )}
      <span className="text-rose-300 font-bold">
        {isAhead ? '↑' : '↓'} {aiPosition}/{boardLength}
      </span>
      <span className="text-rose-400/60">({aiProgress}%)</span>
    </div>
  )
}
