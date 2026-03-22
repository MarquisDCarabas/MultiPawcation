export interface AnimalDef {
  id: string
  name: string
  image: string
  starter: boolean
  unlockCondition: string | null // null = starter, string = description for locked tooltip
}

const BASE = import.meta.env.BASE_URL

export const ANIMALS: AnimalDef[] = [
  // Starters
  { id: 'cat', name: 'Cat', image: `${BASE}assets/animals/cat.png`, starter: true, unlockCondition: null },
  { id: 'dog', name: 'Dog', image: `${BASE}assets/animals/dog.png`, starter: true, unlockCondition: null },
  { id: 'frog', name: 'Frog', image: `${BASE}assets/animals/frog.png`, starter: true, unlockCondition: null },
  { id: 'bear', name: 'Bear', image: `${BASE}assets/animals/bear.png`, starter: true, unlockCondition: null },
  // Unlockables
  { id: 'coyote', name: 'Coyote', image: `${BASE}assets/animals/coyote.png`, starter: false, unlockCondition: 'Win 3 races' },
  { id: 'mouse', name: 'Mouse', image: `${BASE}assets/animals/mouse.png`, starter: false, unlockCondition: 'Earn a Perfect Round badge' },
  { id: 'raccoon', name: 'Raccoon', image: `${BASE}assets/animals/raccoon.png`, starter: false, unlockCondition: 'Get speed bonus on 5+ problems in one race' },
  { id: 'ferret', name: 'Ferret', image: `${BASE}assets/animals/ferret.png`, starter: false, unlockCondition: 'Win a race on Medium difficulty' },
  { id: 'turtle', name: 'Turtle', image: `${BASE}assets/animals/turtle.png`, starter: false, unlockCondition: 'Win a Marathon race' },
  { id: 'hyena', name: 'Hyena', image: `${BASE}assets/animals/hyena.png`, starter: false, unlockCondition: 'Win a race on Hard difficulty' },
]

export function getAnimalById(id: string): AnimalDef | undefined {
  return ANIMALS.find((a) => a.id === id)
}
