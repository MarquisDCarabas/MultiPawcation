import type { GameState, Difficulty, BoardSize } from './types'

export interface ProgressData {
  totalWins: number
  totalGames: number
  winsByDifficulty: Record<Difficulty, number>
  winsByBoardSize: Record<BoardSize, number>
  badges: string[] // earned badge IDs
  unlockedAnimals: string[] // animal IDs
  gameHistory: GameHistoryEntry[] // last 20 games
}

export interface GameHistoryEntry {
  date: number
  won: boolean
  accuracy: number
  difficulty: Difficulty
  boardSize: BoardSize
  totalProblems: number
  totalCorrect: number
  speedBonusCount: number
}

const STORAGE_KEY = 'multipawcation-progress'
const STARTER_ANIMALS = ['cat', 'dog', 'frog', 'bear']

export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      // Ensure starters are always unlocked
      if (!data.unlockedAnimals) data.unlockedAnimals = [...STARTER_ANIMALS]
      for (const s of STARTER_ANIMALS) {
        if (!data.unlockedAnimals.includes(s)) data.unlockedAnimals.push(s)
      }
      return data
    }
  } catch { /* ignore */ }
  return createDefaultProgress()
}

export function saveProgress(data: ProgressData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

export function createDefaultProgress(): ProgressData {
  return {
    totalWins: 0,
    totalGames: 0,
    winsByDifficulty: { easy: 0, medium: 0, hard: 0 },
    winsByBoardSize: { quick: 0, standard: 0, marathon: 0 },
    badges: [],
    unlockedAnimals: [...STARTER_ANIMALS],
    gameHistory: [],
  }
}

export function isAnimalUnlocked(progress: ProgressData, animalId: string): boolean {
  return progress.unlockedAnimals.includes(animalId)
}

export function getUnlockedAnimalIds(progress: ProgressData): string[] {
  return progress.unlockedAnimals
}

/** Record a completed game and check for new unlocks. Returns updated progress and list of newly unlocked animal IDs. */
export function recordGameResult(
  progress: ProgressData,
  state: GameState,
): { progress: ProgressData; newUnlocks: string[] } {
  const won = state.winner === 'player'
  const accuracy = state.totalProblems > 0
    ? state.totalCorrect / state.totalProblems
    : 0
  const speedBonusCount = state.problemHistory.filter((r) => r.speedBonus > 0).length

  const entry: GameHistoryEntry = {
    date: Date.now(),
    won,
    accuracy,
    difficulty: state.settings.difficulty,
    boardSize: state.settings.boardSize,
    totalProblems: state.totalProblems,
    totalCorrect: state.totalCorrect,
    speedBonusCount,
  }

  const updated: ProgressData = {
    ...progress,
    totalGames: progress.totalGames + 1,
    totalWins: progress.totalWins + (won ? 1 : 0),
    winsByDifficulty: {
      ...progress.winsByDifficulty,
      [state.settings.difficulty]: progress.winsByDifficulty[state.settings.difficulty] + (won ? 1 : 0),
    },
    winsByBoardSize: {
      ...progress.winsByBoardSize,
      [state.settings.boardSize]: progress.winsByBoardSize[state.settings.boardSize] + (won ? 1 : 0),
    },
    badges: [...progress.badges],
    unlockedAnimals: [...progress.unlockedAnimals],
    gameHistory: [...progress.gameHistory, entry].slice(-20), // keep last 20
  }

  // Check badges
  if (won && accuracy === 1 && !updated.badges.includes('perfect_round')) {
    updated.badges.push('perfect_round')
  }
  if (won && state.longestStreak >= 10 && !updated.badges.includes('streak_10')) {
    updated.badges.push('streak_10')
  }

  // Check unlocks
  const newUnlocks: string[] = []

  // Coyote: Win 3 races
  if (!updated.unlockedAnimals.includes('coyote') && updated.totalWins >= 3) {
    updated.unlockedAnimals.push('coyote')
    newUnlocks.push('coyote')
  }

  // Mouse: Perfect Round badge (100% accuracy in one game)
  if (!updated.unlockedAnimals.includes('mouse') && won && accuracy === 1) {
    updated.unlockedAnimals.push('mouse')
    newUnlocks.push('mouse')
  }

  // Raccoon: Speed bonus on 5+ problems in one race
  if (!updated.unlockedAnimals.includes('raccoon') && won && speedBonusCount >= 5) {
    updated.unlockedAnimals.push('raccoon')
    newUnlocks.push('raccoon')
  }

  // Ferret: Win on Medium difficulty
  if (!updated.unlockedAnimals.includes('ferret') && won && state.settings.difficulty === 'medium') {
    updated.unlockedAnimals.push('ferret')
    newUnlocks.push('ferret')
  }

  // Turtle: Win a Marathon race
  if (!updated.unlockedAnimals.includes('turtle') && won && state.settings.boardSize === 'marathon') {
    updated.unlockedAnimals.push('turtle')
    newUnlocks.push('turtle')
  }

  // Hyena: Win on Hard difficulty
  if (!updated.unlockedAnimals.includes('hyena') && won && state.settings.difficulty === 'hard') {
    updated.unlockedAnimals.push('hyena')
    newUnlocks.push('hyena')
  }

  return { progress: updated, newUnlocks }
}
