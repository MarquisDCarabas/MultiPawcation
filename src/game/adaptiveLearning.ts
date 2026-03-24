import type { Problem } from './types'

export interface FactRecord {
  key: string // e.g. "3x7"
  a: number
  b: number
  timesPresented: number
  timesCorrect: number
  timesWrong: number
  totalResponseTime: number
  lastSeen: number // timestamp
}

export interface FactProfile {
  facts: Record<string, FactRecord>
}

const STORAGE_KEY = 'multipawcation-facts'

export function loadFactProfile(): FactProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { facts: {} }
}

export function saveFactProfile(profile: FactProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch { /* ignore */ }
}

function factKey(a: number, b: number): string {
  // Normalize so 3x7 and 7x3 are different (they test different recall)
  return `${a}x${b}`
}

export function getOrCreateFact(profile: FactProfile, a: number, b: number): FactRecord {
  const key = factKey(a, b)
  if (profile.facts[key]) return profile.facts[key]
  return {
    key,
    a,
    b,
    timesPresented: 0,
    timesCorrect: 0,
    timesWrong: 0,
    totalResponseTime: 0,
    lastSeen: 0,
  }
}

export function recordAnswer(
  profile: FactProfile,
  problem: Problem,
  correct: boolean,
  responseTime: number,
): FactProfile {
  const key = factKey(problem.a, problem.b)
  const existing = profile.facts[key] ?? {
    key, a: problem.a, b: problem.b,
    timesPresented: 0, timesCorrect: 0, timesWrong: 0,
    totalResponseTime: 0, lastSeen: 0,
  }
  return {
    facts: {
      ...profile.facts,
      [key]: {
        ...existing,
        timesPresented: existing.timesPresented + 1,
        timesCorrect: existing.timesCorrect + (correct ? 1 : 0),
        timesWrong: existing.timesWrong + (correct ? 0 : 1),
        totalResponseTime: existing.totalResponseTime + responseTime,
        lastSeen: Date.now(),
      },
    },
  }
}

/** Check if a fact was previously missed (has wrong answers) and is now answered correctly */
export function isMasteryBonusEligible(profile: FactProfile, problem: Problem): boolean {
  const key = factKey(problem.a, problem.b)
  const fact = profile.facts[key]
  return !!fact && fact.timesWrong > 0
}

function getAccuracy(fact: FactRecord): number {
  if (fact.timesPresented === 0) return 0.5 // neutral for unseen
  return fact.timesCorrect / fact.timesPresented
}

/**
 * Select a problem using inverse-accuracy weighting.
 * Facts with lower accuracy get higher weight (appear more often).
 * Unseen facts get a neutral weight.
 */
export function selectWeightedProblem(
  numberSets: number[],
  profile: FactProfile,
): Problem {
  // Build all possible facts
  const allFacts: { a: number; b: number; weight: number }[] = []
  for (const a of numberSets) {
    for (let b = 2; b <= 10; b++) {
      const key = factKey(a, b)
      const record = profile.facts[key]
      let weight: number
      if (!record || record.timesPresented === 0) {
        weight = 2.0 // neutral-high weight for unseen facts
      } else {
        const accuracy = getAccuracy(record)
        weight = Math.max(0.2, 1.0 / (accuracy + 0.1)) // inverse accuracy, min 0.2
      }
      allFacts.push({ a, b, weight })
    }
  }

  // Weighted random selection
  const totalWeight = allFacts.reduce((sum, f) => sum + f.weight, 0)
  let r = Math.random() * totalWeight
  for (const fact of allFacts) {
    r -= fact.weight
    if (r <= 0) {
      return { a: fact.a, b: fact.b, answer: fact.a * fact.b }
    }
  }

  // Fallback
  const f = allFacts[allFacts.length - 1]
  return { a: f.a, b: f.b, answer: f.a * f.b }
}

/**
 * Select from the player's weakest facts (lowest accuracy) for Challenge Cards.
 */
export function selectChallengeProblem(
  numberSets: number[],
  profile: FactProfile,
): Problem {
  const allFacts: { a: number; b: number; accuracy: number }[] = []
  for (const a of numberSets) {
    for (let b = 2; b <= 10; b++) {
      const key = factKey(a, b)
      const record = profile.facts[key]
      const accuracy = record ? getAccuracy(record) : 0.5
      allFacts.push({ a, b, accuracy })
    }
  }

  // Sort by accuracy ascending (weakest first)
  allFacts.sort((x, y) => x.accuracy - y.accuracy)

  // Pick from the bottom 20% (weakest)
  const bottomCount = Math.max(3, Math.floor(allFacts.length * 0.2))
  const candidates = allFacts.slice(0, bottomCount)
  const pick = candidates[Math.floor(Math.random() * candidates.length)]
  return { a: pick.a, b: pick.b, answer: pick.a * pick.b }
}

/** Count facts with 90%+ accuracy over 5+ attempts */
export function countMasteredFacts(profile: FactProfile): number {
  return Object.values(profile.facts).filter(
    (f) => f.timesPresented >= 5 && getAccuracy(f) >= 0.9
  ).length
}

/** Get average accuracy across all seen facts */
export function getOverallAccuracy(profile: FactProfile): number {
  const seen = Object.values(profile.facts).filter((f) => f.timesPresented > 0)
  if (seen.length === 0) return 0
  const totalCorrect = seen.reduce((sum, f) => sum + f.timesCorrect, 0)
  const totalPresented = seen.reduce((sum, f) => sum + f.timesPresented, 0)
  return totalPresented > 0 ? totalCorrect / totalPresented : 0
}
