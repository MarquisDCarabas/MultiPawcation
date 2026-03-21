import type { GameState, GameAction } from './types'
import { BOARD_SIZES } from './types'
import { generateProblem, calculateSpeedBonus } from './problems'

export function createInitialState(): GameState {
  return {
    screen: 'title',
    settings: {
      boardSize: 'standard',
      difficulty: 'easy',
      numberSets: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    boardLength: 35,
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
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const settings = action.settings
      const boardLength = BOARD_SIZES[settings.boardSize]
      const problem = generateProblem(settings.numberSets)
      return {
        ...createInitialState(),
        screen: 'playing',
        settings,
        boardLength,
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
      if (state.showingResult || state.winner) return state
      if (state.playerInput.length >= 3) return state // max 3 digits (100)
      return {
        ...state,
        playerInput: state.playerInput + action.digit,
      }
    }

    case 'DELETE_DIGIT': {
      if (state.showingResult || state.winner) return state
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

      if (correct) {
        newPosition = Math.min(state.playerPosition + 1 + speedBonus, state.boardLength)
        newStreak = state.playerStreak + 1
        newLongest = Math.max(newLongest, newStreak)
      } else {
        newPosition = Math.max(state.playerPosition - 1, 1)
        newStreak = 0
      }

      const winner = newPosition >= state.boardLength ? 'player' as const : null

      return {
        ...state,
        playerPosition: newPosition,
        playerInput: '',
        isCorrect: correct,
        correctAnswer: correct ? null : state.currentProblem.answer,
        showingResult: true,
        totalProblems: state.totalProblems + 1,
        totalCorrect: state.totalCorrect + (correct ? 1 : 0),
        totalWrong: state.totalWrong + (correct ? 0 : 1),
        playerStreak: newStreak,
        longestStreak: newLongest,
        winner,
        aiTimerActive: winner ? false : state.aiTimerActive,
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

    case 'AI_MOVE': {
      if (state.winner || state.isPaused) return state
      let newAiPos = state.aiPosition
      if (action.correct) {
        newAiPos = Math.min(state.aiPosition + action.spaces, state.boardLength)
      } else {
        newAiPos = Math.max(state.aiPosition - 1, 1)
      }

      const winner = newAiPos >= state.boardLength ? 'ai' as const : null

      return {
        ...state,
        aiPosition: newAiPos,
        winner,
        aiTimerActive: winner ? false : state.aiTimerActive,
      }
    }

    case 'SET_AI_TIMER': {
      return { ...state, aiTimerActive: action.active }
    }

    case 'TOGGLE_PAUSE': {
      return {
        ...state,
        isPaused: !state.isPaused,
        aiTimerActive: state.isPaused, // resume AI when unpausing
      }
    }

    case 'GO_TO_TITLE': {
      return createInitialState()
    }

    case 'GO_TO_SETTINGS': {
      return {
        ...createInitialState(),
        screen: 'settings',
      }
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
