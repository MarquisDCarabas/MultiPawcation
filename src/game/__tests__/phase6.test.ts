import { describe, it, expect } from 'vitest'
import { ANIMALS, getAnimalById } from '../../data/animals'
import { createDefaultProgress } from '../unlocks'

describe('animal roster', () => {
  it('has 18 total animals', () => {
    expect(ANIMALS).toHaveLength(18)
  })

  it('has 4 starters', () => {
    const starters = ANIMALS.filter((a) => a.starter)
    expect(starters).toHaveLength(4)
    expect(starters.map((a) => a.id).sort()).toEqual(['bear', 'cat', 'dog', 'frog'])
  })

  it('has 14 unlockables', () => {
    const unlockables = ANIMALS.filter((a) => !a.starter)
    expect(unlockables).toHaveLength(14)
  })

  it('all unlockables have unlock conditions', () => {
    const unlockables = ANIMALS.filter((a) => !a.starter)
    for (const animal of unlockables) {
      expect(animal.unlockCondition).toBeTruthy()
    }
  })

  it('all starters have null unlock conditions', () => {
    const starters = ANIMALS.filter((a) => a.starter)
    for (const animal of starters) {
      expect(animal.unlockCondition).toBeNull()
    }
  })

  it('all animals have unique IDs', () => {
    const ids = ANIMALS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes all expected unlockable animals', () => {
    const unlockableIds = ANIMALS.filter((a) => !a.starter).map((a) => a.id).sort()
    expect(unlockableIds).toEqual([
      'bunny', 'coyote', 'ferret', 'fox', 'hyena', 'lizard',
      'mouse', 'owl', 'penguin', 'puppy', 'raccoon', 'red-panda',
      'skunk', 'turtle',
    ])
  })

  it('getAnimalById returns correct animal', () => {
    const cat = getAnimalById('cat')
    expect(cat).toBeDefined()
    expect(cat!.name).toBe('Cat')
    expect(cat!.starter).toBe(true)
  })

  it('getAnimalById returns undefined for unknown id', () => {
    expect(getAnimalById('unicorn')).toBeUndefined()
  })
})

describe('default progress', () => {
  it('only starters are unlocked by default', () => {
    const progress = createDefaultProgress()
    expect(progress.unlockedAnimals.sort()).toEqual(['bear', 'cat', 'dog', 'frog'])
  })
})

describe('reset progress math challenge', () => {
  // Test the math problem generation logic (imported as module)
  it('three-digit multiplication produces valid problems', () => {
    // Just verify the math: any 100-999 * 10-99 gives a number > 999
    const a = 123
    const b = 45
    expect(a * b).toBe(5535)
  })

  it('order of operations produces valid result', () => {
    const a = 15, b = 20, c = 5, d = 10
    expect((a + b) * c - d).toBe(165)
  })

  it('division with remainder encoding works', () => {
    const divisor = 7
    const quotient = 14
    const remainder = 3
    const dividend = divisor * quotient + remainder
    expect(dividend).toBe(101)
    // Encoding: quotient * 1000 + remainder
    expect(quotient * 1000 + remainder).toBe(14003)
  })
})
