import type { GameState, Difficulty, BoardSize } from './types'

export interface ProgressData {
  totalWins: number
  totalGames: number
  winsByDifficulty: Record<Difficulty, number>
  winsByBoardSize: Record<BoardSize, number>
  badges: string[] // earned badge IDs
  unlockedAnimals: string[] // animal IDs
  gameHistory: GameHistoryEntry[] // last 20 games
  speedDemonBadges: number // count of games with avg response time under 4s
  masteredFactsCount: number // count of facts with 90%+ accuracy over 5+ attempts
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
      // Ensure new fields exist for migrated data
      if (data.speedDemonBadges === undefined) data.speedDemonBadges = 0
      if (data.masteredFactsCount === undefined) data.masteredFactsCount = 0
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
    speedDemonBadges: 0,
    masteredFactsCount: 0,
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
  masteredFactsCount?: number,
): { progress: ProgressData; newUnlocks: string[] } {
  const won = state.winner === 'player'
  const accuracy = state.totalProblems > 0
    ? state.totalCorrect / state.totalProblems
    : 0
  const speedBonusCount = state.problemHistory.filter((r) => r.speedBonus > 0).length

  // Calculate average response time for Speed Demon badge
  const totalResponseTime = state.problemHistory.reduce((sum, r) => sum + r.responseTime, 0)
  const avgResponseTime = state.totalProblems > 0 ? totalResponseTime / state.totalProblems : Infinity
  const isSpeedDemon = avgResponseTime < 4000 && state.totalProblems >= 5

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
    speedDemonBadges: progress.speedDemonBadges + (isSpeedDemon ? 1 : 0),
    masteredFactsCount: masteredFactsCount ?? progress.masteredFactsCount,
  }

  // Check badges
  if (won && accuracy === 1 && !updated.badges.includes('perfect_round')) {
    updated.badges.push('perfect_round')
  }
  if (won && state.longestStreak >= 10 && !updated.badges.includes('streak_10')) {
    updated.badges.push('streak_10')
  }
  if (isSpeedDemon && !updated.badges.includes('speed_demon')) {
    updated.badges.push('speed_demon')
  }

  // Check unlocks
  const newUnlocks: string[] = []

  // Puppy: Play 3 games (win or lose)
  if (!updated.unlockedAnimals.includes('puppy') && updated.totalGames >= 3) {
    updated.unlockedAnimals.push('puppy')
    newUnlocks.push('puppy')
  }

  // Fox: Win 3 races
  if (!updated.unlockedAnimals.includes('fox') && updated.totalWins >= 3) {
    updated.unlockedAnimals.push('fox')
    newUnlocks.push('fox')
  }

  // Coyote: Win 5 races
  if (!updated.unlockedAnimals.includes('coyote') && updated.totalWins >= 5) {
    updated.unlockedAnimals.push('coyote')
    newUnlocks.push('coyote')
  }

  // Bunny: Win a race with speed bonus on 5+ problems
  if (!updated.unlockedAnimals.includes('bunny') && won && speedBonusCount >= 5) {
    updated.unlockedAnimals.push('bunny')
    newUnlocks.push('bunny')
  }

  // Mouse: Perfect Round badge (100% accuracy in one game)
  if (!updated.unlockedAnimals.includes('mouse') && won && accuracy === 1) {
    updated.unlockedAnimals.push('mouse')
    newUnlocks.push('mouse')
  }

  // Raccoon: Earn 3 Speed Demon badges (avg time under 4s)
  if (!updated.unlockedAnimals.includes('raccoon') && updated.speedDemonBadges >= 3) {
    updated.unlockedAnimals.push('raccoon')
    newUnlocks.push('raccoon')
  }

  // Ferret: Win on Medium difficulty
  if (!updated.unlockedAnimals.includes('ferret') && won && state.settings.difficulty === 'medium') {
    updated.unlockedAnimals.push('ferret')
    newUnlocks.push('ferret')
  }

  // Turtle: Play 10 total games (win or lose)
  if (!updated.unlockedAnimals.includes('turtle') && updated.totalGames >= 10) {
    updated.unlockedAnimals.push('turtle')
    newUnlocks.push('turtle')
  }

  // Skunk: Win a race with all number sets selected (2s through 10s)
  const allNumberSets = [2, 3, 4, 5, 6, 7, 8, 9, 10]
  const hasAllSets = allNumberSets.every((n) => state.settings.numberSets.includes(n))
  if (!updated.unlockedAnimals.includes('skunk') && won && hasAllSets) {
    updated.unlockedAnimals.push('skunk')
    newUnlocks.push('skunk')
  }

  // Owl: Master 10 facts (90%+ accuracy across 5+ attempts)
  if (!updated.unlockedAnimals.includes('owl') && updated.masteredFactsCount >= 10) {
    updated.unlockedAnimals.push('owl')
    newUnlocks.push('owl')
  }

  // Red Panda: Win a Marathon race
  if (!updated.unlockedAnimals.includes('red-panda') && won && state.settings.boardSize === 'marathon') {
    updated.unlockedAnimals.push('red-panda')
    newUnlocks.push('red-panda')
  }

  // Lizard: Win on Hard difficulty
  if (!updated.unlockedAnimals.includes('lizard') && won && state.settings.difficulty === 'hard') {
    updated.unlockedAnimals.push('lizard')
    newUnlocks.push('lizard')
  }

  // Hyena: Win a Marathon on Hard difficulty
  if (!updated.unlockedAnimals.includes('hyena') && won && state.settings.boardSize === 'marathon' && state.settings.difficulty === 'hard') {
    updated.unlockedAnimals.push('hyena')
    newUnlocks.push('hyena')
  }

  // Penguin: Win a Marathon on Hard with 90%+ accuracy
  if (!updated.unlockedAnimals.includes('penguin') && won && state.settings.boardSize === 'marathon' && state.settings.difficulty === 'hard' && accuracy >= 0.9) {
    updated.unlockedAnimals.push('penguin')
    newUnlocks.push('penguin')
  }

  return { progress: updated, newUnlocks }
}
