import { describe, it, expect } from 'vitest'
import { generateBoard } from '../boardGenerator'

describe('generateBoard', () => {
  it('generates a board with the correct length', () => {
    const board = generateBoard(20)
    expect(board).toHaveLength(20)
    expect(board[0].position).toBe(1)
    expect(board[19].position).toBe(20)
  })

  it('first 3 spaces are always normal', () => {
    for (let i = 0; i < 20; i++) {
      const board = generateBoard(35)
      expect(board[0].specialType).toBeNull()
      expect(board[1].specialType).toBeNull()
      expect(board[2].specialType).toBeNull()
    }
  })

  it('last 3 spaces are always normal', () => {
    for (let i = 0; i < 20; i++) {
      const board = generateBoard(35)
      expect(board[34].specialType).toBeNull()
      expect(board[33].specialType).toBeNull()
      expect(board[32].specialType).toBeNull()
    }
  })

  it('special spaces are 20-25% of the board', () => {
    for (let i = 0; i < 20; i++) {
      const board = generateBoard(35)
      const specialCount = board.filter((s) => s.specialType !== null).length
      const percentage = specialCount / 35
      expect(percentage).toBeGreaterThanOrEqual(0.17) // slight tolerance
      expect(percentage).toBeLessThanOrEqual(0.28)
    }
  })

  it('no two special spaces are adjacent', () => {
    for (let i = 0; i < 30; i++) {
      const board = generateBoard(50)
      for (let j = 0; j < board.length - 1; j++) {
        if (board[j].specialType !== null) {
          expect(board[j + 1].specialType).toBeNull()
        }
      }
    }
  })

  it('works for all board sizes', () => {
    for (const size of [20, 35, 50]) {
      const board = generateBoard(size)
      expect(board).toHaveLength(size)
      const specialCount = board.filter((s) => s.specialType !== null).length
      expect(specialCount).toBeGreaterThan(0)
    }
  })

  it('uses all six special space types across multiple boards', () => {
    const allTypes = new Set<string>()
    for (let i = 0; i < 50; i++) {
      const board = generateBoard(50)
      board.forEach((s) => {
        if (s.specialType) allTypes.add(s.specialType)
      })
    }
    expect(allTypes.size).toBe(6)
  })
})
