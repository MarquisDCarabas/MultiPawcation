import { describe, it, expect } from 'vitest'
import {
  createDefaultProgress,
  recordGameResult,
  isAnimalUnlocked,
} from '../unlocks'
import { createInitialState, gameReducer } from '../gameState'
import type { GameState } from '../types'

function createWinState(overrides: Partial<GameState> = {}): GameState {
  const base = createInitialState()
  return {
    ...base,
    screen: 'playing',
    winner: 'player',
    totalProblems: 10,
    totalCorrect: 8,
    totalWrong: 2,
    longestStreak: 5,
    playerPosition: 20,
    boardLength: 20,
    problemHistory: Array(10).fill({
      problem: { a: 3, b: 7, answer: 21 },
      correct: true,
      responseTime: 3000,
      speedBonus: 1,
    }),
    ...overrides,
  }
}

describe('createDefaultProgress', () => {
  it('has 4 starter animals unlocked', () => {
    const progress = createDefaultProgress()
    expect(progress.unlockedAnimals).toContain('cat')
    expect(progress.unlockedAnimals).toContain('dog')
    expect(progress.unlockedAnimals).toContain('frog')
    expect(progress.unlockedAnimals).toContain('bear')
    expect(progress.unlockedAnimals).toHaveLength(4)
  })

  it('starts with 0 wins and 0 games', () => {
    const progress = createDefaultProgress()
    expect(progress.totalWins).toBe(0)
    expect(progress.totalGames).toBe(0)
  })
})

describe('recordGameResult', () => {
  it('increments total games and wins', () => {
    const state = createWinState()
    const { progress } = recordGameResult(createDefaultProgress(), state)
    expect(progress.totalGames).toBe(1)
    expect(progress.totalWins).toBe(1)
  })

  it('does not increment wins on loss', () => {
    const state = createWinState({ winner: 'ai' })
    const { progress } = recordGameResult(createDefaultProgress(), state)
    expect(progress.totalGames).toBe(1)
    expect(progress.totalWins).toBe(0)
  })

  it('tracks wins by difficulty', () => {
    const state = createWinState({
      settings: { boardSize: 'standard', difficulty: 'medium', numberSets: [2, 3] },
    })
    const { progress } = recordGameResult(createDefaultProgress(), state)
    expect(progress.winsByDifficulty.medium).toBe(1)
  })

  it('adds game to history', () => {
    const state = createWinState()
    const { progress } = recordGameResult(createDefaultProgress(), state)
    expect(progress.gameHistory).toHaveLength(1)
    expect(progress.gameHistory[0].won).toBe(true)
  })
})

describe('unlock conditions', () => {
  it('unlocks coyote after 3 wins', () => {
    let progress = createDefaultProgress()
    for (let i = 0; i < 3; i++) {
      const result = recordGameResult(progress, createWinState())
      progress = result.progress
      if (i === 2) {
        expect(result.newUnlocks).toContain('coyote')
      }
    }
    expect(isAnimalUnlocked(progress, 'coyote')).toBe(true)
  })

  it('unlocks mouse with perfect round (100% accuracy)', () => {
    const state = createWinState({
      totalProblems: 10,
      totalCorrect: 10,
      totalWrong: 0,
    })
    const { newUnlocks } = recordGameResult(createDefaultProgress(), state)
    expect(newUnlocks).toContain('mouse')
  })

  it('unlocks raccoon with 5+ speed bonuses', () => {
    const history = Array(10).fill(null).map((_, i) => ({
      problem: { a: 3, b: 7, answer: 21 },
      correct: true,
      responseTime: 2000,
      speedBonus: i < 6 ? 2 : 0, // 6 speed bonuses
    }))
    const state = createWinState({ problemHistory: history })
    const { newUnlocks } = recordGameResult(createDefaultProgress(), state)
    expect(newUnlocks).toContain('raccoon')
  })

  it('unlocks ferret with medium difficulty win', () => {
    const state = createWinState({
      settings: { boardSize: 'standard', difficulty: 'medium', numberSets: [2, 3] },
    })
    const { newUnlocks } = recordGameResult(createDefaultProgress(), state)
    expect(newUnlocks).toContain('ferret')
  })

  it('unlocks turtle with marathon win', () => {
    const state = createWinState({
      settings: { boardSize: 'marathon', difficulty: 'easy', numberSets: [2, 3] },
    })
    const { newUnlocks } = recordGameResult(createDefaultProgress(), state)
    expect(newUnlocks).toContain('turtle')
  })

  it('unlocks hyena with hard difficulty win', () => {
    const state = createWinState({
      settings: { boardSize: 'standard', difficulty: 'hard', numberSets: [2, 3] },
    })
    const { newUnlocks } = recordGameResult(createDefaultProgress(), state)
    expect(newUnlocks).toContain('hyena')
  })

  it('does not unlock on loss', () => {
    const state = createWinState({
      winner: 'ai',
      settings: { boardSize: 'standard', difficulty: 'hard', numberSets: [2, 3] },
    })
    const { newUnlocks } = recordGameResult(createDefaultProgress(), state)
    expect(newUnlocks).not.toContain('hyena')
  })

  it('does not double-unlock', () => {
    let progress = createDefaultProgress()
    progress.unlockedAnimals.push('ferret')
    const state = createWinState({
      settings: { boardSize: 'standard', difficulty: 'medium', numberSets: [2, 3] },
    })
    const { newUnlocks } = recordGameResult(progress, state)
    expect(newUnlocks).not.toContain('ferret')
  })
})

describe('mastery bonus in reducer', () => {
  it('adds +1 movement when mastery bonus is true', () => {
    let state = createInitialState()
    state = gameReducer(state, {
      type: 'START_GAME',
      settings: { boardSize: 'quick', difficulty: 'easy', numberSets: [2, 3] },
    })
    // Set position and override problem start time far in past (no speed bonus)
    state = { ...state, playerPosition: 5, problemStartTime: Date.now() - 20000 }
    const answer = state.currentProblem!.answer.toString()
    for (const digit of answer) {
      state = gameReducer(state, { type: 'INPUT_DIGIT', digit })
    }
    // Submit with mastery bonus
    state = gameReducer(state, { type: 'SUBMIT_ANSWER', masteryBonus: true })
    // Should move +1 base + 1 mastery = +2 total
    expect(state.playerPosition).toBe(7)
  })
})

describe('AI picks from unlocked animals only', () => {
  it('AI animal is from unlocked pool', () => {
    const unlockedIds = ['cat', 'dog', 'frog', 'bear']
    let state = createInitialState()
    state = gameReducer(state, { type: 'GO_TO_ANIMAL_SELECT' })
    for (let i = 0; i < 20; i++) {
      const s = gameReducer(state, {
        type: 'SELECT_ANIMAL',
        animalId: 'cat',
        unlockedIds,
      })
      expect(unlockedIds).toContain(s.aiAnimalId)
      expect(s.aiAnimalId).not.toBe('cat')
    }
  })
})
