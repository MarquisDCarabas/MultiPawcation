import type { GameState, GameAction } from './types'
import { BOARD_SIZES } from './types'
import { generateProblem, calculateSpeedBonus } from './problems'
import { generateBoard } from './boardGenerator'
import type { BoardSpace } from './boardGenerator'
import { ANIMALS } from '../data/animals'
import { SPECIAL_SPACES } from '../data/specialSpaces'

export function createInitialState(): GameState {
  return {
    screen: 'title',
    settings: {
      boardSize: 'standard',
      difficulty: 'easy',
      numberSets: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    playerAnimalId: 'cat',
    aiAnimalId: 'dog',
    boardLength: 35,
    boardSpaces: [],
    playerPosition: 1,
    aiPosition: 1,
    currentProblem: null,
    playerInput: '',
    isCorrect: null,
    correctAnswer: null,
    showingResult: false,
    problemStartTime: null,
    totalProblems: 0,
    totalCorrect: 0,
    totalWrong: 0,
    playerStreak: 0,
    longestStreak: 0,
    winner: null,
    aiTimerActive: false,
    isPaused: false,
    problemHistory: [],
    hasShield: false,
    hasBonusSprint: false,
    isSkippingTurn: false,
    isChallenge: false,
    specialMessage: null,
    aiHasShield: false,
    aiHasBonusSprint: false,
    aiIsSkippingTurn: false,
    masteryBonusEarned: false,
    newUnlocks: [],
  }
}

function getSpaceAt(board: BoardSpace[], position: number): BoardSpace | undefined {
  return board[position - 1]
}

/** Apply the effect of landing on a special space for the player. Returns partial state updates. */
function applyPlayerLanding(
  position: number,
  board: BoardSpace[],
  boardLength: number,
  _currentState: GameState,
): Partial<GameState> {
  const space = getSpaceAt(board, position)
  if (!space?.specialType) return {}

  const def = SPECIAL_SPACES[space.specialType]

  switch (space.specialType) {
    case 'bonus_sprint':
      return {
        hasBonusSprint: true,
        specialMessage: `⚡ ${def.name}: ${def.description}`,
      }
    case 'mud_pit':
      return {
        isSkippingTurn: true,
        specialMessage: `💩 ${def.name}: ${def.description}`,
      }
    case 'shortcut': {
      const newPos = Math.min(position + 3, boardLength)
      return {
        playerPosition: newPos,
        specialMessage: `🌈 ${def.name}: ${def.description}`,
        winner: newPos >= boardLength ? 'player' as const : null,
      }
    }
    case 'banana_peel': {
      const newPos = Math.max(position - 2, 1)
      return {
        playerPosition: newPos,
        specialMessage: `🍌 ${def.name}: ${def.description}`,
      }
    }
    case 'challenge_card':
      return {
        isChallenge: true,
        specialMessage: `⭐ ${def.name}: ${def.description}`,
      }
    case 'shield':
      return {
        hasShield: true,
        specialMessage: `🛡️ ${def.name}: ${def.description}`,
      }
    default:
      return {}
  }
}

/** Apply the effect of AI landing on a special space. Returns partial state updates. */
function applyAiLanding(
  position: number,
  board: BoardSpace[],
  boardLength: number,
  _currentState: GameState,
): Partial<GameState> {
  const space = getSpaceAt(board, position)
  if (!space?.specialType) return {}

  switch (space.specialType) {
    case 'bonus_sprint':
      return { aiHasBonusSprint: true }
    case 'mud_pit':
      return { aiIsSkippingTurn: true }
    case 'shortcut': {
      const newPos = Math.min(position + 3, boardLength)
      return {
        aiPosition: newPos,
        winner: newPos >= boardLength ? 'ai' as const : null,
      }
    }
    case 'banana_peel': {
      const newPos = Math.max(position - 2, 1)
      return { aiPosition: newPos }
    }
    case 'challenge_card':
      // AI doesn't answer challenge cards — treat as no effect
      return {}
    case 'shield':
      return { aiHasShield: true }
    default:
      return {}
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const settings = action.settings
      const boardLength = BOARD_SIZES[settings.boardSize]
      const board = generateBoard(boardLength)
      const problem = generateProblem(settings.numberSets)
      return {
        ...createInitialState(),
        screen: 'playing',
        settings,
        playerAnimalId: state.playerAnimalId,
        aiAnimalId: state.aiAnimalId,
        boardLength,
        boardSpaces: board,
        currentProblem: problem,
        problemStartTime: Date.now(),
        aiTimerActive: true,
      }
    }

    case 'GENERATE_PROBLEM': {
      const problem = generateProblem(state.settings.numberSets)
      return {
        ...state,
        currentProblem: problem,
        playerInput: '',
        isCorrect: null,
        correctAnswer: null,
        showingResult: false,
        problemStartTime: Date.now(),
      }
    }

    case 'INPUT_DIGIT': {
      if (state.showingResult || state.winner || state.isSkippingTurn) return state
      if (state.playerInput.length >= 3) return state
      return {
        ...state,
        playerInput: state.playerInput + action.digit,
      }
    }

    case 'DELETE_DIGIT': {
      if (state.showingResult || state.winner || state.isSkippingTurn) return state
      return {
        ...state,
        playerInput: state.playerInput.slice(0, -1),
      }
    }

    case 'SUBMIT_ANSWER': {
      if (!state.currentProblem || state.playerInput === '' || state.showingResult || state.winner) {
        return state
      }

      const answer = parseInt(state.playerInput, 10)
      const correct = answer === state.currentProblem.answer
      const responseTime = state.problemStartTime ? Date.now() - state.problemStartTime : 10000
      const speedBonus = correct ? calculateSpeedBonus(responseTime) : 0

      let newPosition = state.playerPosition
      let newStreak = state.playerStreak
      let newLongest = state.longestStreak
      let newShield = state.hasShield
      let newBonusSprint = state.hasBonusSprint

      if (correct) {
        let moveAmount = 1 + speedBonus
        // Mastery bonus: +1 for correctly answering a previously-missed fact
        if (action.masteryBonus) {
          moveAmount += 1
        }
        // Challenge card: +3 total instead of normal movement
        if (state.isChallenge) {
          moveAmount = 3
        }
        // Bonus sprint: double movement
        if (state.hasBonusSprint) {
          moveAmount *= 2
          newBonusSprint = false
        }
        newPosition = Math.min(state.playerPosition + moveAmount, state.boardLength)
        newStreak = state.playerStreak + 1
        newLongest = Math.max(newLongest, newStreak)
      } else {
        if (state.hasShield) {
          // Shield absorbs the penalty
          newShield = false
        } else {
          newPosition = Math.max(state.playerPosition - 1, 1)
        }
        newStreak = 0
        // Challenge card wrong: no extra penalty beyond normal
        if (state.hasBonusSprint) {
          newBonusSprint = false // consume bonus sprint even on wrong
        }
      }

      const winner = newPosition >= state.boardLength ? 'player' as const : null

      // Apply landing effects on the new position
      const landingEffects = winner
        ? {}
        : applyPlayerLanding(newPosition, state.boardSpaces, state.boardLength, state)

      // If landing on shortcut might change position further
      const finalPosition = (landingEffects.playerPosition as number | undefined) ?? newPosition
      const finalWinner = landingEffects.winner ?? (finalPosition >= state.boardLength ? 'player' as const : winner)

      return {
        ...state,
        playerPosition: finalPosition,
        playerInput: '',
        isCorrect: correct,
        correctAnswer: correct ? null : state.currentProblem.answer,
        showingResult: true,
        totalProblems: state.totalProblems + 1,
        totalCorrect: state.totalCorrect + (correct ? 1 : 0),
        totalWrong: state.totalWrong + (correct ? 0 : 1),
        playerStreak: newStreak,
        longestStreak: newLongest,
        winner: finalWinner,
        aiTimerActive: finalWinner ? false : state.aiTimerActive,
        hasShield: newShield,
        hasBonusSprint: newBonusSprint,
        isChallenge: false, // consume challenge
        specialMessage: landingEffects.specialMessage ?? null,
        ...(landingEffects.hasShield !== undefined ? { hasShield: landingEffects.hasShield } : {}),
        ...(landingEffects.hasBonusSprint !== undefined ? { hasBonusSprint: landingEffects.hasBonusSprint } : {}),
        ...(landingEffects.isSkippingTurn !== undefined ? { isSkippingTurn: landingEffects.isSkippingTurn } : {}),
        ...(landingEffects.isChallenge !== undefined ? { isChallenge: landingEffects.isChallenge } : {}),
        problemHistory: [
          ...state.problemHistory,
          {
            problem: state.currentProblem,
            correct,
            responseTime,
            speedBonus,
          },
        ],
      }
    }

    case 'CLEAR_RESULT': {
      if (state.winner) return state

      // If skipping turn, consume it and generate next problem without answering
      if (state.isSkippingTurn) {
        const problem = generateProblem(state.settings.numberSets)
        return {
          ...state,
          currentProblem: problem,
          playerInput: '',
          isCorrect: null,
          correctAnswer: null,
          showingResult: false,
          problemStartTime: Date.now(),
          isSkippingTurn: false,
          specialMessage: null,
        }
      }

      const problem = generateProblem(state.settings.numberSets)
      return {
        ...state,
        currentProblem: problem,
        playerInput: '',
        isCorrect: null,
        correctAnswer: null,
        showingResult: false,
        problemStartTime: Date.now(),
        specialMessage: null,
      }
    }

    case 'AI_MOVE': {
      if (state.winner || state.isPaused) return state

      // If AI is skipping turn, consume it
      if (state.aiIsSkippingTurn) {
        return {
          ...state,
          aiIsSkippingTurn: false,
        }
      }

      let newAiPos = state.aiPosition
      let moveAmount = action.spaces

      if (action.correct) {
        // Bonus sprint doubles AI movement
        if (state.aiHasBonusSprint) {
          moveAmount *= 2
        }
        newAiPos = Math.min(state.aiPosition + moveAmount, state.boardLength)
      } else {
        if (state.aiHasShield) {
          // Shield absorbs penalty — position unchanged
          return {
            ...state,
            aiHasShield: false,
          }
        }
        newAiPos = Math.max(state.aiPosition - 1, 1)
      }

      let winner = newAiPos >= state.boardLength ? 'ai' as const : null

      // Apply landing effects
      const landingEffects = winner
        ? {}
        : applyAiLanding(newAiPos, state.boardSpaces, state.boardLength, state)

      const finalAiPos = (landingEffects.aiPosition as number | undefined) ?? newAiPos
      const finalWinner = landingEffects.winner ?? (finalAiPos >= state.boardLength ? 'ai' as const : winner)

      return {
        ...state,
        aiPosition: finalAiPos,
        winner: finalWinner,
        aiTimerActive: finalWinner ? false : state.aiTimerActive,
        aiHasBonusSprint: landingEffects.aiHasBonusSprint ?? (action.correct ? false : state.aiHasBonusSprint),
        aiHasShield: landingEffects.aiHasShield ?? state.aiHasShield,
        aiIsSkippingTurn: landingEffects.aiIsSkippingTurn ?? state.aiIsSkippingTurn,
      }
    }

    case 'SET_AI_TIMER': {
      return { ...state, aiTimerActive: action.active }
    }

    case 'TOGGLE_PAUSE': {
      return {
        ...state,
        isPaused: !state.isPaused,
        aiTimerActive: state.isPaused,
      }
    }

    case 'GO_TO_TITLE': {
      return createInitialState()
    }

    case 'GO_TO_ANIMAL_SELECT': {
      return {
        ...createInitialState(),
        screen: 'animalSelect',
      }
    }

    case 'SELECT_ANIMAL': {
      // AI picks from unlocked animals only, excluding the player's choice
      const available = ANIMALS.filter(
        (a) => a.id !== action.animalId && action.unlockedIds.includes(a.id)
      )
      const fallback = ANIMALS.filter((a) => a.id !== action.animalId)
      const pool = available.length > 0 ? available : fallback
      const aiAnimal = pool[Math.floor(Math.random() * pool.length)]
      return {
        ...state,
        screen: 'settings',
        playerAnimalId: action.animalId,
        aiAnimalId: aiAnimal.id,
      }
    }

    case 'DISMISS_SPECIAL_MESSAGE': {
      return { ...state, specialMessage: null }
    }

    case 'GO_TO_PROGRESS': {
      return {
        ...createInitialState(),
        screen: 'progress',
      }
    }

    case 'SET_NEW_UNLOCKS': {
      return {
        ...state,
        newUnlocks: action.unlocks,
        screen: action.unlocks.length > 0 ? 'unlockReveal' : state.screen,
      }
    }

    case 'SHOW_SCORECARD': {
      return state // winner is already set; App.tsx handles the screen routing
    }

    case 'RESUME_GAME': {
      return {
        ...action.state,
        showingResult: false,
        problemStartTime: Date.now(),
        aiTimerActive: true,
        isPaused: false,
      }
    }

    default:
      return state
  }
}
