export type Difficulty = 'easy' | 'medium' | 'hard'
export type BoardSize = 'quick' | 'standard' | 'marathon'
export type GameScreen = 'title' | 'animalSelect' | 'settings' | 'playing' | 'gameOver'

export interface Problem {
  a: number
  b: number
  answer: number
}

export interface DifficultyConfig {
  aiSpeedMin: number
  aiSpeedMax: number
  aiAccuracy: number
  aiMoveMin: number
  aiMoveMax: number
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: { aiSpeedMin: 8000, aiSpeedMax: 12000, aiAccuracy: 0.6, aiMoveMin: 1, aiMoveMax: 2 },
  medium: { aiSpeedMin: 5000, aiSpeedMax: 8000, aiAccuracy: 0.75, aiMoveMin: 1, aiMoveMax: 3 },
  hard: { aiSpeedMin: 3000, aiSpeedMax: 5000, aiAccuracy: 0.9, aiMoveMin: 2, aiMoveMax: 3 },
}

export const BOARD_SIZES: Record<BoardSize, number> = {
  quick: 20,
  standard: 35,
  marathon: 50,
}

export interface GameSettings {
  boardSize: BoardSize
  difficulty: Difficulty
  numberSets: number[] // which times tables (2-10)
}

export interface GameState {
  screen: GameScreen
  settings: GameSettings
  playerAnimalId: string
  aiAnimalId: string
  boardLength: number
  playerPosition: number
  aiPosition: number
  currentProblem: Problem | null
  playerInput: string
  isCorrect: boolean | null // null = not answered yet
  correctAnswer: number | null // shown after wrong answer
  showingResult: boolean
  problemStartTime: number | null
  totalProblems: number
  totalCorrect: number
  totalWrong: number
  playerStreak: number
  longestStreak: number
  winner: 'player' | 'ai' | null
  aiTimerActive: boolean
  isPaused: boolean
  problemHistory: ProblemResult[]
}

export interface ProblemResult {
  problem: Problem
  correct: boolean
  responseTime: number
  speedBonus: number
}

export type GameAction =
  | { type: 'START_GAME'; settings: GameSettings }
  | { type: 'GENERATE_PROBLEM' }
  | { type: 'INPUT_DIGIT'; digit: string }
  | { type: 'DELETE_DIGIT' }
  | { type: 'SUBMIT_ANSWER' }
  | { type: 'CLEAR_RESULT' }
  | { type: 'AI_MOVE'; spaces: number; correct: boolean }
  | { type: 'SET_AI_TIMER'; active: boolean }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'GO_TO_TITLE' }
  | { type: 'GO_TO_ANIMAL_SELECT' }
  | { type: 'SELECT_ANIMAL'; animalId: string }
  | { type: 'RESUME_GAME'; state: GameState }
