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
  { id: 'puppy', name: 'Puppy', image: `${BASE}assets/animals/puppy.png`, starter: false, unlockCondition: 'Play 3 games' },
  { id: 'fox', name: 'Fox', image: `${BASE}assets/animals/fox.png`, starter: false, unlockCondition: 'Win 3 races' },
  { id: 'coyote', name: 'Coyote', image: `${BASE}assets/animals/coyote.png`, starter: false, unlockCondition: 'Win 5 races' },
  { id: 'bunny', name: 'Bunny', image: `${BASE}assets/animals/bunny.png`, starter: false, unlockCondition: 'Win a race with speed bonus on 5+ problems' },
  { id: 'mouse', name: 'Mouse', image: `${BASE}assets/animals/mouse.png`, starter: false, unlockCondition: 'Earn a Perfect Round badge' },
  { id: 'raccoon', name: 'Raccoon', image: `${BASE}assets/animals/raccoon.png`, starter: false, unlockCondition: 'Earn 3 Speed Demon badges' },
  { id: 'ferret', name: 'Ferret', image: `${BASE}assets/animals/ferret.png`, starter: false, unlockCondition: 'Win a race on Medium difficulty' },
  { id: 'turtle', name: 'Turtle', image: `${BASE}assets/animals/turtle.png`, starter: false, unlockCondition: 'Play 10 games' },
  { id: 'skunk', name: 'Skunk', image: `${BASE}assets/animals/skunk.png`, starter: false, unlockCondition: 'Win a race with all number sets selected' },
  { id: 'owl', name: 'Owl', image: `${BASE}assets/animals/owl.png`, starter: false, unlockCondition: 'Master 10 facts' },
  { id: 'red-panda', name: 'Red Panda', image: `${BASE}assets/animals/red-panda.png`, starter: false, unlockCondition: 'Win a Marathon race' },
  { id: 'lizard', name: 'Lizard', image: `${BASE}assets/animals/lizard.png`, starter: false, unlockCondition: 'Win a race on Hard difficulty' },
  { id: 'hyena', name: 'Hyena', image: `${BASE}assets/animals/hyena.png`, starter: false, unlockCondition: 'Win a Marathon on Hard difficulty' },
  { id: 'penguin', name: 'Penguin', image: `${BASE}assets/animals/penguin.png`, starter: false, unlockCondition: 'Win a Marathon on Hard with 90%+ accuracy' },
]

export function getAnimalById(id: string): AnimalDef | undefined {
  return ANIMALS.find((a) => a.id === id)
}
