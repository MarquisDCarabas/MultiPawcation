import { useState, useCallback } from 'react'

interface ResetProgressProps {
  onReset: () => void
  onCancel: () => void
}

type ProblemType = 'multiplication' | 'division' | 'order-of-operations'

interface MathChallenge {
  question: string
  answer: number
}

function generateChallenge(): MathChallenge {
  const types: ProblemType[] = ['multiplication', 'division', 'order-of-operations']
  const type = types[Math.floor(Math.random() * types.length)]

  switch (type) {
    case 'multiplication': {
      const a = 100 + Math.floor(Math.random() * 900) // 100-999
      const b = 10 + Math.floor(Math.random() * 90)   // 10-99
      return { question: `${a} × ${b}`, answer: a * b }
    }
    case 'division': {
      // Generate a division with remainder
      const divisor = 7 + Math.floor(Math.random() * 13) // 7-19
      const quotient = 10 + Math.floor(Math.random() * 90) // 10-99
      const remainder = 1 + Math.floor(Math.random() * (divisor - 1)) // 1 to divisor-1
      const dividend = divisor * quotient + remainder
      return {
        question: `${dividend} ÷ ${divisor} = ? remainder ?  (Enter as: quotient × 1000 + remainder, e.g. 14 r 3 → 14003)`,
        answer: quotient * 1000 + remainder,
      }
    }
    case 'order-of-operations': {
      // e.g. (a + b) × c - d
      const a = 10 + Math.floor(Math.random() * 40)
      const b = 10 + Math.floor(Math.random() * 40)
      const c = 3 + Math.floor(Math.random() * 8)
      const d = 5 + Math.floor(Math.random() * 50)
      return {
        question: `(${a} + ${b}) × ${c} − ${d}`,
        answer: (a + b) * c - d,
      }
    }
  }
}

export function ResetProgress({ onReset, onCancel }: ResetProgressProps) {
  const [challenge] = useState(() => generateChallenge())
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = useCallback(() => {
    const parsed = parseInt(input, 10)
    if (parsed === challenge.answer) {
      onReset()
    } else {
      setError(true)
      setInput('')
    }
  }, [input, challenge.answer, onReset])

  const handleDigit = (digit: string) => {
    setError(false)
    if (input.length < 10) {
      setInput(input + digit)
    }
  }

  const handleDelete = () => {
    setError(false)
    setInput(input.slice(0, -1))
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-center gap-4">
      <h2 className="text-2xl font-bold text-red-400">Reset All Progress</h2>
      <p className="text-indigo-200 max-w-sm text-sm">
        This will erase all game history, unlocked animals, and stats. This cannot be undone.
      </p>
      <p className="text-indigo-300 text-sm mt-2">
        To confirm, solve this problem:
      </p>
      <div className="bg-indigo-900/60 rounded-xl p-4 max-w-sm w-full">
        <p className="text-xl font-mono text-yellow-300 mb-2">{challenge.question}</p>
        <div className="bg-indigo-950 rounded-lg p-3 min-h-[2.5rem] text-2xl font-mono text-white text-center">
          {input || <span className="text-indigo-600">...</span>}
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm font-bold">Incorrect. Try again.</p>
      )}

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-2 max-w-[200px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onPointerDown={() => handleDigit(String(n))}
            className="w-14 h-14 rounded-xl bg-indigo-700 hover:bg-indigo-600
                       active:scale-95 text-lg font-bold text-white transition-all
                       touch-action-manipulation"
          >
            {n}
          </button>
        ))}
        <button
          onPointerDown={handleDelete}
          className="w-14 h-14 rounded-xl bg-indigo-800 hover:bg-indigo-700
                     active:scale-95 text-sm font-bold text-indigo-300 transition-all
                     touch-action-manipulation"
        >
          DEL
        </button>
        <button
          onPointerDown={() => handleDigit('0')}
          className="w-14 h-14 rounded-xl bg-indigo-700 hover:bg-indigo-600
                     active:scale-95 text-lg font-bold text-white transition-all
                     touch-action-manipulation"
        >
          0
        </button>
        <button
          onPointerDown={handleSubmit}
          disabled={input.length === 0}
          className="w-14 h-14 rounded-xl bg-emerald-600 hover:bg-emerald-500
                     active:scale-95 text-sm font-bold text-white transition-all
                     disabled:opacity-40 touch-action-manipulation"
        >
          OK
        </button>
      </div>

      <button
        onPointerDown={onCancel}
        className="mt-2 px-8 py-3 bg-indigo-800/50 hover:bg-indigo-700/50
                   border border-indigo-500/20 active:scale-95 rounded-2xl
                   text-lg font-bold text-indigo-300 transition-all"
      >
        Cancel
      </button>
    </div>
  )
}
