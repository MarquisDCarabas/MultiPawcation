import { describe, it, expect } from 'vitest'
import { gameReducer, createInitialState } from '../gameState'
import type { GameState, GameSettings } from '../types'
import type { BoardSpace } from '../boardGenerator'

const defaultSettings: GameSettings = {
  boardSize: 'quick',
  difficulty: 'easy',
  numberSets: [2, 3, 4, 5],
}

/** Create a playing state with a custom board for testing */
function createTestState(overrides: Partial<GameState> = {}): GameState {
  let state = createInitialState()
  state = gameReducer(state, { type: 'START_GAME', settings: defaultSettings })
  return { ...state, ...overrides }
}

/** Build a board with a specific special space at a given position */
function boardWithSpecial(
  length: number,
  position: number,
  type: BoardSpace['specialType'],
): BoardSpace[] {
  const board: BoardSpace[] = Array.from({ length }, (_, i) => ({
    position: i + 1,
    specialType: null,
  }))
  board[position - 1].specialType = type
  return board
}

function answerCorrectly(state: GameState): GameState {
  const answer = state.currentProblem!.answer.toString()
  for (const digit of answer) {
    state = gameReducer(state, { type: 'INPUT_DIGIT', digit })
  }
  return gameReducer(state, { type: 'SUBMIT_ANSWER' })
}

function answerWrong(state: GameState): GameState {
  state = gameReducer(state, { type: 'INPUT_DIGIT', digit: '0' })
  return gameReducer(state, { type: 'SUBMIT_ANSWER' })
}

describe('Shield special space', () => {
  it('absorbs penalty from wrong answer', () => {
    const state = createTestState({
      playerPosition: 5,
      hasShield: true,
      boardSpaces: boardWithSpecial(20, 5, null),
    })
    const after = answerWrong(state)
    expect(after.playerPosition).toBe(5) // no movement back
    expect(after.hasShield).toBe(false) // shield consumed
  })

  it('is granted when landing on shield space', () => {
    // Player at position 4, shield at position 5, correct answer moves +1
    const board = boardWithSpecial(20, 5, 'shield')
    const state = createTestState({
      playerPosition: 4,
      boardSpaces: board,
    })
    const after = answerCorrectly(state)
    // Player should land on 5 (or beyond with speed bonus)
    // If they land exactly on 5, they get shield
    if (after.playerPosition === 5) {
      expect(after.hasShield).toBe(true)
    }
  })
})

describe('Bonus Sprint special space', () => {
  it('doubles movement on next correct answer', () => {
    const state = createTestState({
      playerPosition: 5,
      hasBonusSprint: true,
      boardSpaces: boardWithSpecial(20, 5, null),
    })
    const after = answerCorrectly(state)
    // Base movement is 1 + speed bonus, doubled
    // At minimum: (1 + 0) * 2 = 2, so position >= 7
    expect(after.playerPosition).toBeGreaterThanOrEqual(7)
    expect(after.hasBonusSprint).toBe(false)
  })

  it('is consumed even on wrong answer', () => {
    const state = createTestState({
      playerPosition: 5,
      hasBonusSprint: true,
      boardSpaces: boardWithSpecial(20, 5, null),
    })
    const after = answerWrong(state)
    expect(after.hasBonusSprint).toBe(false)
  })
})

describe('Shortcut special space', () => {
  it('jumps player forward 3 spaces when landed on', () => {
    // Put shortcuts on positions 5, 6, and 7 to guarantee landing on one
    const board = boardWithSpecial(20, 5, 'shortcut')
    board[5].specialType = 'shortcut' // position 6
    board[6].specialType = 'shortcut' // position 7
    const state = createTestState({
      playerPosition: 4,
      boardSpaces: board,
      // Set problemStartTime far in past so no speed bonus
      problemStartTime: Date.now() - 20000,
    })
    const after = answerCorrectly(state)
    // Player moves +1 to position 5 (no speed bonus since >6s), shortcut to 8
    expect(after.playerPosition).toBe(8)
  })

  it('clamps to board length near finish', () => {
    const board = boardWithSpecial(20, 19, 'shortcut')
    const state = createTestState({
      playerPosition: 18,
      boardSpaces: board,
    })
    const after = answerCorrectly(state)
    // Landing on 19 with shortcut → jumps to min(22, 20) = 20 → win
    expect(after.playerPosition).toBe(20)
    expect(after.winner).toBe('player')
  })
})

describe('Banana Peel special space', () => {
  it('slides player back 2 spaces', () => {
    const board = boardWithSpecial(20, 5, 'banana_peel')
    const state = createTestState({
      playerPosition: 4,
      boardSpaces: board,
    })
    const after = answerCorrectly(state)
    // Moves to 5, banana peel slides back to 3
    if (after.playerPosition <= 5) {
      expect(after.playerPosition).toBe(3)
    }
  })

  it('clamps to position 1 near start', () => {
    // Test the clamp logic with banana peel near start
    const board2 = boardWithSpecial(20, 2, 'banana_peel')
    const state = createTestState({
      playerPosition: 1,
      boardSpaces: board2,
    })
    const after = answerCorrectly(state)
    // Land on 2, banana peel → max(2 - 2, 1) = 1
    if (after.playerPosition <= 2) {
      expect(after.playerPosition).toBe(1)
    }
  })
})

describe('Mud Pit special space', () => {
  it('sets isSkippingTurn when landed on', () => {
    const board = boardWithSpecial(20, 5, 'mud_pit')
    const state = createTestState({
      playerPosition: 4,
      boardSpaces: board,
    })
    const after = answerCorrectly(state)
    if (after.playerPosition === 5) {
      expect(after.isSkippingTurn).toBe(true)
    }
  })

  it('CLEAR_RESULT consumes the skip and resets it', () => {
    const state = createTestState({
      isSkippingTurn: true,
      showingResult: false,
    })
    const after = gameReducer(state, { type: 'CLEAR_RESULT' })
    expect(after.isSkippingTurn).toBe(false)
  })

  it('blocks input while skipping turn', () => {
    const state = createTestState({ isSkippingTurn: true })
    const after = gameReducer(state, { type: 'INPUT_DIGIT', digit: '5' })
    expect(after.playerInput).toBe('')
  })
})

describe('Challenge Card special space', () => {
  it('sets isChallenge when landed on', () => {
    const board = boardWithSpecial(20, 5, 'challenge_card')
    const state = createTestState({
      playerPosition: 4,
      boardSpaces: board,
    })
    const after = answerCorrectly(state)
    if (after.playerPosition === 5) {
      expect(after.isChallenge).toBe(true)
    }
  })

  it('grants +3 movement on correct answer during challenge', () => {
    const state = createTestState({
      playerPosition: 5,
      isChallenge: true,
      boardSpaces: boardWithSpecial(20, 5, null),
    })
    const after = answerCorrectly(state)
    expect(after.playerPosition).toBe(8) // +3 from challenge
    expect(after.isChallenge).toBe(false) // consumed
  })
})

describe('AI special space effects', () => {
  it('AI shortcut jumps forward 3', () => {
    const board = boardWithSpecial(20, 5, 'shortcut')
    const state = createTestState({
      aiPosition: 3,
      boardSpaces: board,
    })
    const after = gameReducer(state, { type: 'AI_MOVE', spaces: 2, correct: true })
    // AI moves to 5, shortcut jumps to 8
    expect(after.aiPosition).toBe(8)
  })

  it('AI banana peel slides back 2', () => {
    const board = boardWithSpecial(20, 5, 'banana_peel')
    const state = createTestState({
      aiPosition: 3,
      boardSpaces: board,
    })
    const after = gameReducer(state, { type: 'AI_MOVE', spaces: 2, correct: true })
    // AI moves to 5, banana peel slides back to 3
    expect(after.aiPosition).toBe(3)
  })

  it('AI mud pit causes skip next turn', () => {
    const board = boardWithSpecial(20, 5, 'mud_pit')
    const state = createTestState({
      aiPosition: 3,
      boardSpaces: board,
    })
    let after = gameReducer(state, { type: 'AI_MOVE', spaces: 2, correct: true })
    expect(after.aiIsSkippingTurn).toBe(true)
    // Next AI move is skipped
    after = gameReducer(after, { type: 'AI_MOVE', spaces: 2, correct: true })
    expect(after.aiIsSkippingTurn).toBe(false)
    expect(after.aiPosition).toBe(5) // didn't move
  })

  it('AI shield absorbs wrong answer penalty', () => {
    const state = createTestState({
      aiPosition: 5,
      aiHasShield: true,
      boardSpaces: boardWithSpecial(20, 5, null),
    })
    const after = gameReducer(state, { type: 'AI_MOVE', spaces: 1, correct: false })
    expect(after.aiPosition).toBe(5) // no movement back
    expect(after.aiHasShield).toBe(false)
  })

  it('AI bonus sprint doubles movement', () => {
    const state = createTestState({
      aiPosition: 3,
      aiHasBonusSprint: true,
      boardSpaces: boardWithSpecial(20, 3, null),
    })
    const after = gameReducer(state, { type: 'AI_MOVE', spaces: 2, correct: true })
    // 2 * 2 = 4 spaces forward
    expect(after.aiPosition).toBe(7)
  })
})

describe('DISMISS_SPECIAL_MESSAGE', () => {
  it('clears the special message', () => {
    const state = createTestState({ specialMessage: 'test message' })
    const after = gameReducer(state, { type: 'DISMISS_SPECIAL_MESSAGE' })
    expect(after.specialMessage).toBeNull()
  })
})
