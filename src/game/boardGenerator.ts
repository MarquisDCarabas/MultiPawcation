import type { SpecialSpaceType } from '../data/specialSpaces'

export interface BoardSpace {
  position: number
  specialType: SpecialSpaceType | null
}

const SPECIAL_TYPES: SpecialSpaceType[] = [
  'bonus_sprint',
  'mud_pit',
  'shortcut',
  'banana_peel',
  'challenge_card',
  'shield',
]

/**
 * Generate a board with special spaces distributed at 20-25% density.
 * Rules:
 * - First 3 and last 3 spaces are always normal
 * - No two special spaces adjacent (no clusters)
 * - Target 20-25% special space coverage
 */
export function generateBoard(length: number): BoardSpace[] {
  const board: BoardSpace[] = Array.from({ length }, (_, i) => ({
    position: i + 1,
    specialType: null,
  }))

  // Eligible positions: not first 3, not last 3 (0-indexed: indices 3 to length-4)
  const eligibleStart = 3
  const eligibleEnd = length - 4 // inclusive
  if (eligibleEnd < eligibleStart) return board // board too small for specials

  const eligibleCount = eligibleEnd - eligibleStart + 1

  // Target 20-25% of total board
  const targetMin = Math.floor(length * 0.20)
  const targetMax = Math.ceil(length * 0.25)
  const targetCount = Math.min(
    targetMin + Math.floor(Math.random() * (targetMax - targetMin + 1)),
    Math.floor(eligibleCount / 2) // can't exceed half of eligible (no-cluster constraint)
  )

  // Collect eligible indices, then pick randomly while respecting no-cluster
  const candidates = Array.from({ length: eligibleCount }, (_, i) => eligibleStart + i)

  // Shuffle candidates
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }

  const selected: Set<number> = new Set()
  for (const idx of candidates) {
    if (selected.size >= targetCount) break
    // Check no adjacent special space
    if (selected.has(idx - 1) || selected.has(idx + 1)) continue
    selected.add(idx)
  }

  // Assign special types to selected positions
  const selectedArr = Array.from(selected)
  for (let i = 0; i < selectedArr.length; i++) {
    const type = SPECIAL_TYPES[i % SPECIAL_TYPES.length]
    board[selectedArr[i]].specialType = type
  }

  // Shuffle the types among selected positions for variety
  for (let i = selectedArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmpType = board[selectedArr[i]].specialType
    board[selectedArr[i]].specialType = board[selectedArr[j]].specialType
    board[selectedArr[j]].specialType = tmpType
  }

  return board
}
