import type { Problem } from '../game/types'

interface FlashCardProps {
  problem: Problem
  isCorrect: boolean | null
  correctAnswer: number | null
  showingResult: boolean
}

export function FlashCard({ problem, isCorrect, correctAnswer, showingResult }: FlashCardProps) {
  let bgColor = 'bg-indigo-800/80'
  let borderColor = 'border-indigo-400/30'

  if (showingResult) {
    if (isCorrect) {
      bgColor = 'bg-emerald-800/80'
      borderColor = 'border-emerald-400/50'
    } else {
      bgColor = 'bg-rose-800/80'
      borderColor = 'border-rose-400/50'
    }
  }

  return (
    <div className={`rounded-2xl ${bgColor} border-2 ${borderColor} px-8 py-5
                     shadow-lg transition-colors duration-300`}>
      <div className="text-4xl font-bold text-white text-center">
        {problem.a} × {problem.b}
      </div>

      {showingResult && !isCorrect && correctAnswer !== null && (
        <div className="mt-3 text-center">
          <div className="text-lg text-rose-200">
            {problem.a} × {problem.b} = {correctAnswer}
          </div>
        </div>
      )}

      {showingResult && isCorrect && (
        <div className="mt-2 text-center text-2xl text-emerald-300 font-bold">
          Correct!
        </div>
      )}
    </div>
  )
}
