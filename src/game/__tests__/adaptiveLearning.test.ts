import { describe, it, expect } from 'vitest'
import {
  recordAnswer,
  selectWeightedProblem,
  selectChallengeProblem,
  isMasteryBonusEligible,
  countMasteredFacts,
  getOverallAccuracy,
} from '../adaptiveLearning'
import type { FactProfile } from '../adaptiveLearning'

function emptyProfile(): FactProfile {
  return { facts: {} }
}

describe('recordAnswer', () => {
  it('creates a new fact record on first answer', () => {
    const profile = recordAnswer(emptyProfile(), { a: 3, b: 7, answer: 21 }, true, 2000)
    const fact = profile.facts['3x7']
    expect(fact).toBeDefined()
    expect(fact.timesPresented).toBe(1)
    expect(fact.timesCorrect).toBe(1)
    expect(fact.timesWrong).toBe(0)
  })

  it('increments wrong count on incorrect answer', () => {
    let profile = recordAnswer(emptyProfile(), { a: 3, b: 7, answer: 21 }, false, 5000)
    expect(profile.facts['3x7'].timesWrong).toBe(1)
    expect(profile.facts['3x7'].timesCorrect).toBe(0)

    profile = recordAnswer(profile, { a: 3, b: 7, answer: 21 }, true, 3000)
    expect(profile.facts['3x7'].timesCorrect).toBe(1)
    expect(profile.facts['3x7'].timesPresented).toBe(2)
  })

  it('accumulates response time', () => {
    let profile = recordAnswer(emptyProfile(), { a: 5, b: 5, answer: 25 }, true, 2000)
    profile = recordAnswer(profile, { a: 5, b: 5, answer: 25 }, true, 3000)
    expect(profile.facts['5x5'].totalResponseTime).toBe(5000)
  })
})

describe('isMasteryBonusEligible', () => {
  it('returns false for unseen facts', () => {
    expect(isMasteryBonusEligible(emptyProfile(), { a: 3, b: 7, answer: 21 })).toBe(false)
  })

  it('returns false for facts with no wrong answers', () => {
    const profile = recordAnswer(emptyProfile(), { a: 3, b: 7, answer: 21 }, true, 2000)
    expect(isMasteryBonusEligible(profile, { a: 3, b: 7, answer: 21 })).toBe(false)
  })

  it('returns true for facts with previous wrong answers', () => {
    const profile = recordAnswer(emptyProfile(), { a: 3, b: 7, answer: 21 }, false, 5000)
    expect(isMasteryBonusEligible(profile, { a: 3, b: 7, answer: 21 })).toBe(true)
  })
})

describe('selectWeightedProblem', () => {
  it('returns a valid problem from the number sets', () => {
    const sets = [2, 5]
    for (let i = 0; i < 50; i++) {
      const problem = selectWeightedProblem(sets, emptyProfile())
      expect(sets).toContain(problem.a)
      expect(problem.b).toBeGreaterThanOrEqual(2)
      expect(problem.b).toBeLessThanOrEqual(10)
      expect(problem.answer).toBe(problem.a * problem.b)
    }
  })

  it('weights lower-accuracy facts more heavily', () => {
    // Create a profile where 3x7 has 0% accuracy and 5x5 has 100%
    let profile = emptyProfile()
    for (let i = 0; i < 10; i++) {
      profile = recordAnswer(profile, { a: 3, b: 7, answer: 21 }, false, 3000)
      profile = recordAnswer(profile, { a: 5, b: 5, answer: 25 }, true, 2000)
    }

    // Run 500 selections and count how often 3x7 appears vs 5x5
    let count3x7 = 0
    let count5x5 = 0
    for (let i = 0; i < 500; i++) {
      const p = selectWeightedProblem([3, 5], profile)
      if (p.a === 3 && p.b === 7) count3x7++
      if (p.a === 5 && p.b === 5) count5x5++
    }

    // 3x7 should appear significantly more often than 5x5
    expect(count3x7).toBeGreaterThan(count5x5)
  })
})

describe('selectChallengeProblem', () => {
  it('draws from weakest facts', () => {
    let profile = emptyProfile()
    // Use a small number set [3] so only 9 facts exist (3x2..3x10)
    // Make 3x7 very weak (0% accuracy)
    for (let i = 0; i < 10; i++) {
      profile = recordAnswer(profile, { a: 3, b: 7, answer: 21 }, false, 5000)
    }
    // Make everything else strong (100% accuracy)
    for (let b = 2; b <= 10; b++) {
      if (b === 7) continue
      for (let i = 0; i < 10; i++) {
        profile = recordAnswer(profile, { a: 3, b, answer: 3 * b }, true, 2000)
      }
    }

    // With 9 facts and bottom 20% = max(3, 1.8) = 3 candidates,
    // 3x7 should always be among the weakest and frequently selected
    let count3x7 = 0
    for (let i = 0; i < 100; i++) {
      const p = selectChallengeProblem([3], profile)
      if (p.a === 3 && p.b === 7) count3x7++
    }
    expect(count3x7).toBeGreaterThan(20) // should be selected often (~33% of the time)
  })
})

describe('countMasteredFacts', () => {
  it('counts facts with 90%+ accuracy over 5+ attempts', () => {
    let profile = emptyProfile()
    // 3x7: 5 correct out of 5 = 100%
    for (let i = 0; i < 5; i++) {
      profile = recordAnswer(profile, { a: 3, b: 7, answer: 21 }, true, 2000)
    }
    // 5x5: 4 correct, 1 wrong out of 5 = 80%
    for (let i = 0; i < 4; i++) {
      profile = recordAnswer(profile, { a: 5, b: 5, answer: 25 }, true, 2000)
    }
    profile = recordAnswer(profile, { a: 5, b: 5, answer: 25 }, false, 5000)

    // 2x2: only 3 attempts (not enough)
    for (let i = 0; i < 3; i++) {
      profile = recordAnswer(profile, { a: 2, b: 2, answer: 4 }, true, 2000)
    }

    expect(countMasteredFacts(profile)).toBe(1) // only 3x7 qualifies
  })
})

describe('getOverallAccuracy', () => {
  it('returns 0 for empty profile', () => {
    expect(getOverallAccuracy(emptyProfile())).toBe(0)
  })

  it('calculates correct accuracy', () => {
    let profile = emptyProfile()
    profile = recordAnswer(profile, { a: 3, b: 7, answer: 21 }, true, 2000)
    profile = recordAnswer(profile, { a: 3, b: 7, answer: 21 }, false, 3000)
    expect(getOverallAccuracy(profile)).toBe(0.5)
  })
})
