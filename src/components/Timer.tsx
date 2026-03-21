import { useState, useEffect } from 'react'

interface TimerProps {
  startTime: number | null
  active: boolean
}

export function Timer({ startTime, active }: TimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startTime || !active) {
      setElapsed(0)
      return
    }

    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime)
    }, 100)

    return () => clearInterval(interval)
  }, [startTime, active])

  const seconds = Math.floor(elapsed / 1000)
  const tenths = Math.floor((elapsed % 1000) / 100)

  let color = 'text-emerald-400' // under 3s
  if (elapsed >= 6000) color = 'text-indigo-400' // over 6s, no bonus
  else if (elapsed >= 3000) color = 'text-yellow-400' // 3-6s

  // Progress bar width (maxes out at 10s)
  const progress = Math.min(elapsed / 10000, 1) * 100

  return (
    <div className="w-full max-w-xs">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className={`font-mono font-bold ${color}`}>
          {seconds}.{tenths}s
        </span>
        <span className="text-xs text-indigo-400">
          {elapsed < 3000 ? '+2 bonus' : elapsed < 6000 ? '+1 bonus' : 'no bonus'}
        </span>
      </div>
      <div className="h-1.5 bg-indigo-900/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-100
            ${elapsed < 3000 ? 'bg-emerald-400' : elapsed < 6000 ? 'bg-yellow-400' : 'bg-indigo-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
