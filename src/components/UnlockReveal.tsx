import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAnimalById } from '../data/animals'

interface UnlockRevealProps {
  unlockedAnimalIds: string[]
  onContinue: () => void
}

export function UnlockReveal({ unlockedAnimalIds, onContinue }: UnlockRevealProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (unlockedAnimalIds.length === 0) {
    onContinue()
    return null
  }

  const currentAnimal = getAnimalById(unlockedAnimalIds[currentIndex])
  const isLast = currentIndex >= unlockedAnimalIds.length - 1

  const handleNext = () => {
    if (isLast) {
      onContinue()
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-center gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-2xl font-bold text-yellow-300"
      >
        New Character Unlocked!
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={unlockedAnimalIds[currentIndex]}
          initial={{ opacity: 0, scale: 0, filter: 'grayscale(100%) brightness(0.3)' }}
          animate={{
            opacity: 1,
            scale: 1,
            filter: 'grayscale(0%) brightness(1)',
            transition: { duration: 0.8, ease: 'easeOut' },
          }}
          className="relative"
        >
          {/* Glow background */}
          <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-2xl scale-150" />

          {currentAnimal && (
            <img
              src={currentAnimal.image}
              alt={currentAnimal.name}
              className="w-40 h-40 object-contain relative z-10
                         drop-shadow-[0_0_24px_rgba(250,204,21,0.5)]"
            />
          )}
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-3xl font-bold text-white"
      >
        {currentAnimal?.name}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-sm text-indigo-300"
      >
        {currentAnimal?.unlockCondition}
      </motion.p>

      {/* Confetti-like sparkles */}
      <div className="flex gap-2 text-2xl">
        {['✨', '🎉', '⭐', '🎊', '✨'].map((emoji, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onPointerDown={handleNext}
        className="mt-4 px-10 py-3 bg-gradient-to-r from-yellow-500 to-amber-500
                   hover:from-yellow-400 hover:to-amber-400
                   active:scale-95 rounded-2xl text-lg font-bold text-white
                   shadow-lg shadow-yellow-500/25 transition-all"
      >
        {isLast ? 'Continue' : 'Next Unlock'}
      </motion.button>

      {unlockedAnimalIds.length > 1 && (
        <p className="text-xs text-indigo-400">
          {currentIndex + 1} / {unlockedAnimalIds.length}
        </p>
      )}
    </div>
  )
}
