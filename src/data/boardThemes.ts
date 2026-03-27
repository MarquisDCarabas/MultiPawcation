import type { BoardSize } from '../game/types'

export interface BoardTheme {
  id: BoardSize
  name: string
  label: string
  // Board container
  containerBg: string
  containerBorder: string
  // Regular spaces
  spaceBg: string
  spaceBorder: string
  spaceShape: string // border-radius class
  spaceNumberColor: string
  // Start space
  startBg: string
  startBorder: string
  // Finish space
  finishBg: string
  finishBorder: string
  finishIcon: string
  // Background gradient for the board area
  boardGradient: string
  // Row connector styling (subtle path between rows)
  pathAccent: string
  // Special space overlay — extra ring/glow to ensure visibility
  specialRing: string
}

export const BOARD_THEMES: Record<BoardSize, BoardTheme> = {
  quick: {
    id: 'quick',
    name: 'park',
    label: 'Park',
    containerBg: 'bg-gradient-to-b from-sky-200/20 via-emerald-800/30 to-green-900/40',
    containerBorder: 'border-green-600/30',
    spaceBg: 'bg-green-800/35',
    spaceBorder: 'border-green-600/25',
    spaceShape: 'rounded-full',
    spaceNumberColor: 'text-green-500/50',
    startBg: 'bg-emerald-500/30',
    startBorder: 'border-emerald-400/50',
    finishBg: 'bg-yellow-500/30',
    finishBorder: 'border-yellow-400/50',
    finishIcon: '🏡',
    boardGradient: 'from-green-900/30 via-emerald-900/20 to-sky-900/20',
    pathAccent: 'bg-green-700/10',
    specialRing: 'ring-1 ring-white/20',
  },
  standard: {
    id: 'standard',
    name: 'forest',
    label: 'Forest',
    containerBg: 'bg-gradient-to-b from-green-950/40 via-emerald-950/50 to-green-950/60',
    containerBorder: 'border-emerald-800/30',
    spaceBg: 'bg-emerald-950/50',
    spaceBorder: 'border-emerald-700/20',
    spaceShape: 'rounded-lg',
    spaceNumberColor: 'text-emerald-600/40',
    startBg: 'bg-emerald-600/25',
    startBorder: 'border-emerald-400/40',
    finishBg: 'bg-amber-500/25',
    finishBorder: 'border-amber-400/40',
    finishIcon: '🌳',
    boardGradient: 'from-green-950/40 via-emerald-950/30 to-green-900/20',
    pathAccent: 'bg-emerald-800/10',
    specialRing: 'ring-1 ring-white/15',
  },
  marathon: {
    id: 'marathon',
    name: 'mountain',
    label: 'Mountain',
    containerBg: 'bg-gradient-to-b from-slate-800/40 via-stone-800/30 to-sky-900/30',
    containerBorder: 'border-stone-500/25',
    spaceBg: 'bg-stone-700/35',
    spaceBorder: 'border-stone-500/20',
    spaceShape: 'rounded-md',
    spaceNumberColor: 'text-stone-400/40',
    startBg: 'bg-green-700/25',
    startBorder: 'border-green-500/35',
    finishBg: 'bg-sky-400/25',
    finishBorder: 'border-sky-300/40',
    finishIcon: '🏔️',
    boardGradient: 'from-green-900/20 via-stone-800/30 to-slate-700/30',
    pathAccent: 'bg-stone-600/10',
    specialRing: 'ring-1 ring-white/20',
  },
}

/** Get the theme for a given board size */
export function getThemeForBoardSize(boardSize: BoardSize): BoardTheme {
  return BOARD_THEMES[boardSize]
}

/**
 * Get themed special space classes.
 * Special spaces keep their own colors but get an extra ring for contrast on themed boards.
 */
export function getThemedSpecialSpaceClasses(
  specialColor: string,
  specialBorderColor: string,
  theme: BoardTheme
): string {
  return `${specialColor} ${specialBorderColor} border ${theme.specialRing}`
}
