import { describe, it, expect } from 'vitest'
import { BOARD_THEMES, getThemeForBoardSize, getThemedSpecialSpaceClasses } from '../../data/boardThemes'
import { SPECIAL_SPACES } from '../../data/specialSpaces'
import type { BoardSize } from '../types'

describe('Board Themes', () => {
  const boardSizes: BoardSize[] = ['quick', 'standard', 'marathon']

  it('defines a theme for each board size', () => {
    for (const size of boardSizes) {
      const theme = BOARD_THEMES[size]
      expect(theme).toBeDefined()
      expect(theme.id).toBe(size)
      expect(theme.name).toBeTruthy()
      expect(theme.label).toBeTruthy()
    }
  })

  it('each theme has all required styling properties', () => {
    const requiredProps = [
      'containerBg', 'containerBorder',
      'spaceBg', 'spaceBorder', 'spaceShape', 'spaceNumberColor',
      'startBg', 'startBorder',
      'finishBg', 'finishBorder', 'finishIcon',
      'boardGradient', 'pathAccent', 'specialRing',
    ] as const

    for (const size of boardSizes) {
      const theme = BOARD_THEMES[size]
      for (const prop of requiredProps) {
        expect(theme[prop], `${size} theme missing ${prop}`).toBeTruthy()
      }
    }
  })

  it('assigns distinct theme names per board size', () => {
    const names = boardSizes.map((s) => BOARD_THEMES[s].name)
    expect(new Set(names).size).toBe(3)
  })

  it('quick = Park, standard = Forest, marathon = Mountain', () => {
    expect(BOARD_THEMES.quick.name).toBe('park')
    expect(BOARD_THEMES.standard.name).toBe('forest')
    expect(BOARD_THEMES.marathon.name).toBe('mountain')
  })

  it('each theme has a distinct finish icon', () => {
    const icons = boardSizes.map((s) => BOARD_THEMES[s].finishIcon)
    expect(new Set(icons).size).toBe(3)
  })

  it('each theme uses a distinct space shape', () => {
    const shapes = boardSizes.map((s) => BOARD_THEMES[s].spaceShape)
    expect(new Set(shapes).size).toBe(3)
  })

  describe('getThemeForBoardSize', () => {
    it('returns the correct theme for each size', () => {
      expect(getThemeForBoardSize('quick')).toBe(BOARD_THEMES.quick)
      expect(getThemeForBoardSize('standard')).toBe(BOARD_THEMES.standard)
      expect(getThemeForBoardSize('marathon')).toBe(BOARD_THEMES.marathon)
    })
  })

  describe('getThemedSpecialSpaceClasses', () => {
    it('includes the special space colors and theme ring', () => {
      for (const size of boardSizes) {
        const theme = BOARD_THEMES[size]
        for (const [, def] of Object.entries(SPECIAL_SPACES)) {
          const classes = getThemedSpecialSpaceClasses(def.color, def.borderColor, theme)
          expect(classes).toContain(def.color)
          expect(classes).toContain(def.borderColor)
          expect(classes).toContain('border')
          expect(classes).toContain(theme.specialRing)
        }
      }
    })
  })

  describe('special space contrast on themed backgrounds', () => {
    it('special spaces use distinct color families from regular themed spaces', () => {
      for (const size of boardSizes) {
        const theme = BOARD_THEMES[size]
        for (const [, def] of Object.entries(SPECIAL_SPACES)) {
          // Special space bg should differ from theme regular space bg
          expect(def.color).not.toBe(theme.spaceBg)
          // Special space border should differ from theme regular space border
          expect(def.borderColor).not.toBe(theme.spaceBorder)
        }
      }
    })

    it('special spaces get an extra ring for visibility on themed boards', () => {
      for (const size of boardSizes) {
        const theme = BOARD_THEMES[size]
        expect(theme.specialRing).toContain('ring')
      }
    })

    it('special space colors use opacity for readability against any background', () => {
      for (const [, def] of Object.entries(SPECIAL_SPACES)) {
        // All special space colors include opacity (/) to blend with backgrounds
        expect(def.color).toMatch(/\/\d+/)
        expect(def.borderColor).toMatch(/\/\d+/)
      }
    })
  })

  describe('theme visual consistency', () => {
    it('start and finish spaces differ from regular spaces in each theme', () => {
      for (const size of boardSizes) {
        const theme = BOARD_THEMES[size]
        expect(theme.startBg).not.toBe(theme.spaceBg)
        expect(theme.finishBg).not.toBe(theme.spaceBg)
        expect(theme.startBg).not.toBe(theme.finishBg)
      }
    })

    it('container styling differs between themes', () => {
      const containerBgs = boardSizes.map((s) => BOARD_THEMES[s].containerBg)
      expect(new Set(containerBgs).size).toBe(3)
    })
  })
})
