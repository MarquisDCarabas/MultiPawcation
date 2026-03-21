import type { Problem } from './types'

export function generateProblem(numberSets: number[]): Problem {
  const a = numberSets[Math.floor(Math.random() * numberSets.length)]
  const b = Math.floor(Math.random() * 9) + 2 // 2-10
  return { a, b, answer: a * b }
}

export function generateAllProblems(numberSets: number[]): Problem[] {
  const problems: Problem[] = []
  for (const a of numberSets) {
    for (let b = 2; b <= 10; b++) {
      problems.push({ a, b, answer: a * b })
    }
  }
  return problems
}

export function calculateSpeedBonus(responseTimeMs: number): number {
  if (responseTimeMs < 3000) return 2
  if (responseTimeMs <= 6000) return 1
  return 0
}
