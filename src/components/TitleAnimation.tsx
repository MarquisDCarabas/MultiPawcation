import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ANIMALS } from '../data/animals'

const TRACK_ANIMALS = ANIMALS.filter(a => a.starter).slice(0, 3)
const TRACK_LENGTH = 8

interface RunnerState {
  position: number
  animal: typeof ANIMALS[number]
}

export function TitleAnimation() {
  const [runners, setRunners] = useState<RunnerState[]>(
    TRACK_ANIMALS.map((animal, i) => ({ position: i, animal }))
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setRunners(prev =>
        prev.map(r => ({
          ...r,
          position: r.position >= TRACK_LENGTH ? 0 : r.position + (Math.random() > 0.3 ? 1 : 0),
        }))
      )
    }, 800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full max-w-xs mx-auto mt-2 opacity-60">
      {/* Mini track */}
      <div className="flex gap-0.5 justify-center">
        {Array.from({ length: TRACK_LENGTH + 1 }, (_, i) => (
          <div
            key={i}
            className={`w-7 h-7 rounded-md flex items-center justify-center
              ${i === TRACK_LENGTH
                ? 'bg-yellow-500/20 border border-yellow-400/30'
                : 'bg-indigo-800/20 border border-indigo-700/15'}`}
          >
            {i === TRACK_LENGTH ? (
              <span className="text-[10px]">🏁</span>
            ) : (
              (() => {
                const here = runners.filter(r => r.position === i)
                if (here.length > 0) {
                  return (
                    <motion.img
                      key={here[0].animal.id}
                      src={here[0].animal.image}
                      alt=""
                      className="w-5 h-5 object-contain"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    />
                  )
                }
                return <span className="text-[8px] text-indigo-700/30">{i + 1}</span>
              })()
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
