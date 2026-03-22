import { describe, it, expect } from 'vitest'
import { gameReducer, createInitialState } from '../gameState'
import { generateProblem, calculateSpeedBonus } from '../problems'
import type { GameState, GameSettings } from '../types'
import { BOARD_SIZES } from '../types'

const defaultSettings: GameSettings = {
  boardSize: 'quick',
  difficulty: 'easy',
  numberSets: [2, 3, 4, 5],
}

function startGame(settings = defaultSettings): GameState {
  return gameReducer(createInitialState(), { type: 'START_GAME', settings })
}

describe('createInitialState', () => {
  it('starts on title screen at position 1', () => {
    const state = createInitialState()
    expect(state.screen).toBe('title')
    expect(state.playerPosition).toBe(1)
    expect(state.aiPosition).toBe(1)
    expect(state.winner).toBeNull()
  })
})

describe('START_GAME', () => {
  it('sets up the game with correct board length', () => {
    const state = startGame()
    expect(state.screen).toBe('playing')
    expect(state.boardLength).toBe(BOARD_SIZES.quick) // 20
    expect(state.playerPosition).toBe(1)
    expect(state.aiPosition).toBe(1)
    expect(state.currentProblem).not.toBeNull()
    expect(state.aiTimerActive).toBe(true)
  })

  it('uses correct board sizes', () => {
    expect(startGame({ ...defaultSettings, boardSize: 'quick' }).boardLength).toBe(20)
    expect(startGame({ ...defaultSettings, boardSize: 'standard' }).boardLength).toBe(35)
    expect(startGame({ ...defaultSettings, boardSize: 'marathon' }).boardLength).toBe(50)
  })
})

describe('INPUT_DIGIT and DELETE_DIGIT', () => {
  it('appends digits to input', () => {
    let state = startGame()
    state = gameReducer(state, { type: 'INPUT_DIGIT', digit: '5' })
    expect(state.playerInput).toBe('5')
    state = gameReducer(state, { type: 'INPUT_DIGIT', digit: '6' })
    expect(state.playerInput).toBe('56')
  })

  it('limits input to 3 digits', () => {
    let state = startGame()
    state = gameReducer(state, { type: 'INPUT_DIGIT', digit: '1' })
    state = gameReducer(state, { type: 'INPUT_DIGIT', digit: '0' })
    state = gameReducer(state, { type: 'INPUT_DIGIT', digit: '0' })
    state = gameReducer(state, { type: 'INPUT_DIGIT', digit: '1' }) // should be ignored
    expect(state.playerInput).toBe('100')
  })

  it('deletes last digit', () => {
    let state = startGame()
    state = gameReducer(state, { type: 'INPUT_DIGIT', digit: '5' })
    state = gameReducer(state, { type: 'INPUT_DIGIT', digit: '6' })
    state = gameReducer(state, { type: 'DELETE_DIGIT' })
    expect(state.playerInput).toBe('5')
  })
})

describe('SUBMIT_ANSWER', () => {
  it('moves forward on correct answer', () => {
    let state = startGame()
    const answer = state.currentProblem!.answer.toString()
    for (const digit of answer) {
      state = gameReducer(state, { type: 'INPUT_DIGIT', digit })
    }
    state = gameReducer(state, { type: 'SUBMIT_ANSWER' })
    expect(state.isCorrect).toBe(true)
    expect(state.playerPosition).toBeGreaterThanOrEqual(2) // at least +1
    expect(state.totalCorrect).toBe(1)
    expect(state.showingResult).toBe(true)
  })

  it('moves backward on wrong answer (minimum position 1)', () => {
    let state = startGame()
    // Enter wrong answer
    state = gameReducer(state, { type: 'INPUT_DIGIT', digit: '0' })
    state = gameReducer(state, { type: 'SUBMIT_ANSWER' })
    expect(state.isCorrect).toBe(false)
    expect(state.playerPosition).toBe(1) // can't go below 1
    expect(state.totalWrong).toBe(1)
    expect(state.correctAnswer).toBe(state.problemHistory[0].problem.answer)
  })

  it('does not submit when input is empty', () => {
    let state = startGame()
    const before = { ...state }
    state = gameReducer(state, { type: 'SUBMIT_ANSWER' })
    expect(state.totalProblems).toBe(before.totalProblems)
  })

  it('does not submit while showing result', () => {
    let state = startGame()
    state = gameReducer(state, { type: 'INPUT_DIGIT', digit: '0' })
    state = gameReducer(state, { type: 'SUBMIT_ANSWER' })
    expect(state.showingResult).toBe(true)
    // Try to submit again
    state = gameReducer(state, { type: 'INPUT_DIGIT', digit: '1' })
    expect(state.playerInput).toBe('') // input blocked during result
  })

  it('tracks streak correctly', () => {
    let state = startGame()

    // Answer correctly twice
    for (let i = 0; i < 2; i++) {
      const answer = state.currentProblem!.answer.toString()
      for (const digit of answer) {
        state = gameReducer(state, { type: 'INPUT_DIGIT', digit })
      }
      state = gameReducer(state, { type: 'SUBMIT_ANSWER' })
      state = gameReducer(state, { type: 'CLEAR_RESULT' })
    }
    expect(state.playerStreak).toBe(2)
    expect(state.longestStreak).toBe(2)

    // Answer wrong
    state = gameReducer(state, { type: 'INPUT_DIGIT', digit: '0' })
    state = gameReducer(state, { type: 'SUBMIT_ANSWER' })
    expect(state.playerStreak).toBe(0)
    expect(state.longestStreak).toBe(2) // longest preserved
  })
})

describe('win detection', () => {
  it('detects player win when reaching board end', () => {
    let state = startGame({ ...defaultSettings, boardSize: 'quick' })
    // Manually set position near end
    state = { ...state, playerPosition: 19 }
    const answer = state.currentProblem!.answer.toString()
    for (const digit of answer) {
      state = gameReducer(state, { type: 'INPUT_DIGIT', digit })
    }
    state = gameReducer(state, { type: 'SUBMIT_ANSWER' })
    expect(state.winner).toBe('player')
    expect(state.aiTimerActive).toBe(false)
  })

  it('detects AI win', () => {
    let state = startGame({ ...defaultSettings, boardSize: 'quick' })
    state = gameReducer(state, { type: 'AI_MOVE', spaces: 19, correct: true })
    expect(state.winner).toBe('ai')
    expect(state.aiTimerActive).toBe(false)
  })
})

describe('AI_MOVE', () => {
  it('moves AI forward on correct', () => {
    let state = startGame()
    state = gameReducer(state, { type: 'AI_MOVE', spaces: 2, correct: true })
    expect(state.aiPosition).toBe(3)
  })

  it('moves AI backward on wrong', () => {
    let state = startGame()
    state = gameReducer(state, { type: 'AI_MOVE', spaces: 2, correct: true })
    state = gameReducer(state, { type: 'AI_MOVE', spaces: 1, correct: false })
    expect(state.aiPosition).toBe(2)
  })

  it('AI cannot go below position 1', () => {
    let state = startGame()
    state = gameReducer(state, { type: 'AI_MOVE', spaces: 1, correct: false })
    expect(state.aiPosition).toBe(1)
  })

  it('does not move AI when paused', () => {
    let state = startGame()
    state = gameReducer(state, { type: 'TOGGLE_PAUSE' })
    state = gameReducer(state, { type: 'AI_MOVE', spaces: 3, correct: true })
    expect(state.aiPosition).toBe(1)
  })
})

describe('generateProblem', () => {
  it('generates problems from selected number sets', () => {
    const sets = [2, 5]
    for (let i = 0; i < 50; i++) {
      const problem = generateProblem(sets)
      expect(sets).toContain(problem.a)
      expect(problem.b).toBeGreaterThanOrEqual(2)
      expect(problem.b).toBeLessThanOrEqual(10)
      expect(problem.answer).toBe(problem.a * problem.b)
    }
  })
})

describe('calculateSpeedBonus', () => {
  it('gives +2 for under 3 seconds', () => {
    expect(calculateSpeedBonus(2000)).toBe(2)
    expect(calculateSpeedBonus(2999)).toBe(2)
  })

  it('gives +1 for 3-6 seconds', () => {
    expect(calculateSpeedBonus(3000)).toBe(1)
    expect(calculateSpeedBonus(6000)).toBe(1)
  })

  it('gives 0 for over 6 seconds', () => {
    expect(calculateSpeedBonus(6001)).toBe(0)
    expect(calculateSpeedBonus(10000)).toBe(0)
  })
})

describe('TOGGLE_PAUSE', () => {
  it('pauses and resumes', () => {
    let state = startGame()
    expect(state.isPaused).toBe(false)
    state = gameReducer(state, { type: 'TOGGLE_PAUSE' })
    expect(state.isPaused).toBe(true)
    expect(state.aiTimerActive).toBe(false)
    state = gameReducer(state, { type: 'TOGGLE_PAUSE' })
    expect(state.isPaused).toBe(false)
    expect(state.aiTimerActive).toBe(true)
  })
})

describe('navigation', () => {
  it('GO_TO_ANIMAL_SELECT changes screen', () => {
    let state = createInitialState()
    state = gameReducer(state, { type: 'GO_TO_ANIMAL_SELECT' })
    expect(state.screen).toBe('animalSelect')
  })

  it('GO_TO_TITLE resets to initial state', () => {
    let state = startGame()
    state = gameReducer(state, { type: 'GO_TO_TITLE' })
    expect(state.screen).toBe('title')
    expect(state.playerPosition).toBe(1)
  })
})

describe('animal selection', () => {
  it('SELECT_ANIMAL sets player animal and goes to settings', () => {
    let state = createInitialState()
    state = gameReducer(state, { type: 'GO_TO_ANIMAL_SELECT' })
    state = gameReducer(state, { type: 'SELECT_ANIMAL', animalId: 'frog' })
    expect(state.screen).toBe('settings')
    expect(state.playerAnimalId).toBe('frog')
    expect(state.aiAnimalId).not.toBe('frog') // AI picks different animal
  })

  it('preserves animal selection through START_GAME', () => {
    let state = createInitialState()
    state = gameReducer(state, { type: 'GO_TO_ANIMAL_SELECT' })
    state = gameReducer(state, { type: 'SELECT_ANIMAL', animalId: 'bear' })
    state = gameReducer(state, { type: 'START_GAME', settings: defaultSettings })
    expect(state.playerAnimalId).toBe('bear')
  })

  it('initial state has default animal IDs', () => {
    const state = createInitialState()
    expect(state.playerAnimalId).toBe('cat')
    expect(state.aiAnimalId).toBe('dog')
  })
})
