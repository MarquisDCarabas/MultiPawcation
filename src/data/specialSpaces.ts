export type SpecialSpaceType =
  | 'bonus_sprint'
  | 'mud_pit'
  | 'shortcut'
  | 'banana_peel'
  | 'challenge_card'
  | 'shield'

export interface SpecialSpaceDef {
  type: SpecialSpaceType
  name: string
  icon: string
  description: string
  color: string // tailwind bg color class
  borderColor: string
}

export const SPECIAL_SPACES: Record<SpecialSpaceType, SpecialSpaceDef> = {
  bonus_sprint: {
    type: 'bonus_sprint',
    name: 'Bonus Sprint',
    icon: '⚡',
    description: 'Double movement on next correct answer!',
    color: 'bg-amber-500/30',
    borderColor: 'border-amber-400/50',
  },
  mud_pit: {
    type: 'mud_pit',
    name: 'Mud Pit',
    icon: '💩',
    description: 'Skip next turn!',
    color: 'bg-orange-800/30',
    borderColor: 'border-orange-600/40',
  },
  shortcut: {
    type: 'shortcut',
    name: 'Shortcut',
    icon: '🌈',
    description: 'Jump forward 3 spaces!',
    color: 'bg-cyan-500/25',
    borderColor: 'border-cyan-400/40',
  },
  banana_peel: {
    type: 'banana_peel',
    name: 'Banana Peel',
    icon: '🍌',
    description: 'Slide back 2 spaces!',
    color: 'bg-yellow-600/25',
    borderColor: 'border-yellow-500/40',
  },
  challenge_card: {
    type: 'challenge_card',
    name: 'Challenge Card',
    icon: '⭐',
    description: 'Harder problem, but worth +3 spaces if correct!',
    color: 'bg-purple-500/25',
    borderColor: 'border-purple-400/40',
  },
  shield: {
    type: 'shield',
    name: 'Shield',
    icon: '🛡️',
    description: 'Next wrong answer has no penalty!',
    color: 'bg-sky-500/25',
    borderColor: 'border-sky-400/40',
  },
}
