import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ANIMALS } from '../data/animals'
import type { AnimalDef } from '../data/animals'
import type { GameAction } from '../game/types'

interface AnimalSelectProps {
  dispatch: React.Dispatch<GameAction>
  unlockedAnimalIds: string[]
}

export function AnimalSelect({ dispatch, unlockedAnimalIds }: AnimalSelectProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tooltipAnimal, setTooltipAnimal] = useState<AnimalDef | null>(null)

  const handleAnimalTap = (animal: AnimalDef) => {
    const isUnlocked = unlockedAnimalIds.includes(animal.id)
    if (!isUnlocked) {
      // Show unlock tooltip, don't select
      setTooltipAnimal(animal)
      setTimeout(() => setTooltipAnimal(null), 2500)
      return
    }
    setSelectedId(animal.id)
  }

  const handleNext = () => {
    if (selectedId) {
      dispatch({ type: 'SELECT_ANIMAL', animalId: selectedId, unlockedIds: unlockedAnimalIds })
    }
  }

  return (
    <div className="flex flex-col items-center h-full px-4 py-6 overflow-y-auto">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-1">
        Choose Your Animal
      </h1>
      <p className="text-sm text-indigo-300 mb-4">Pick your racer!</p>

      {/* Animal grid */}
      <div className="grid grid-cols-5 gap-3 w-full max-w-md mb-4">
        {ANIMALS.map((animal) => {
          const isSelected = selectedId === animal.id
          const isUnlocked = unlockedAnimalIds.includes(animal.id)

          return (
            <motion.button
              key={animal.id}
              onPointerDown={() => handleAnimalTap(animal)}
              whileTap={{ scale: 0.92 }}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all
                ${isSelected
                  ? 'bg-indigo-500/60 border-2 border-yellow-400 shadow-lg shadow-yellow-400/20'
                  : 'bg-indigo-900/40 border-2 border-indigo-700/30 hover:border-indigo-500/50'}`}
            >
              {/* Animal image */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <motion.img
                  src={animal.image}
                  alt={animal.name}
                  className={`w-full h-full object-contain
                    ${!isUnlocked ? 'grayscale brightness-50' : ''}
                    ${isSelected ? 'drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' : ''}`}
                  animate={isUnlocked ? {
                    y: [0, -3, 0],
                  } : undefined}
                  transition={{
                    duration: 1.5 + (ANIMALS.indexOf(animal) % 3) * 0.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: (ANIMALS.indexOf(animal) % 5) * 0.2,
                  }}
                />
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl drop-shadow-lg">🔒</span>
                  </div>
                )}
              </div>

              {/* Animal name */}
              <span className={`text-xs font-semibold
                ${isSelected ? 'text-yellow-300' : !isUnlocked ? 'text-indigo-500' : 'text-indigo-200'}`}>
                {animal.name}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Unlock tooltip */}
      <AnimatePresence>
        {tooltipAnimal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-indigo-800/90 border border-indigo-400/30 rounded-xl px-4 py-3 mb-3 max-w-xs text-center"
          >
            <p className="text-sm text-yellow-300 font-semibold">{tooltipAnimal.name}</p>
            <p className="text-xs text-indigo-200 mt-1">{tooltipAnimal.unlockCondition}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected preview */}
      {selectedId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-2 mb-4"
        >
          <div className="w-24 h-24">
            <img
              src={ANIMALS.find((a) => a.id === selectedId)!.image}
              alt=""
              className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(129,140,248,0.5)]"
            />
          </div>
          <span className="text-lg font-bold text-white">
            {ANIMALS.find((a) => a.id === selectedId)!.name}
          </span>
        </motion.div>
      )}

      {/* Next button */}
      <button
        onPointerDown={handleNext}
        disabled={!selectedId}
        className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-teal-500
                   hover:from-emerald-400 hover:to-teal-400
                   active:scale-95 rounded-2xl text-xl font-bold text-white
                   shadow-lg shadow-emerald-500/25 transition-all
                   disabled:opacity-40 disabled:active:scale-100"
      >
        Next
      </button>
    </div>
  )
}
