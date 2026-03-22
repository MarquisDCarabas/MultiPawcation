import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PauseMenuProps {
  onResume: () => void
  onQuit: () => void
}

export function PauseMenu({ onResume, onQuit }: PauseMenuProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div className="flex-1 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {showConfirm ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center bg-indigo-900/80 border border-indigo-500/30 rounded-2xl px-8 py-6"
          >
            <h2 className="text-xl font-bold text-rose-300 mb-2">Quit Race?</h2>
            <p className="text-sm text-indigo-300 mb-5">Your progress will be lost.</p>
            <div className="flex gap-3 justify-center">
              <button
                onPointerDown={() => setShowConfirm(false)}
                className="px-6 py-3 rounded-xl bg-indigo-700/50 hover:bg-indigo-600/50
                           text-white font-bold transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onPointerDown={onQuit}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500
                           text-white font-bold transition-all active:scale-95"
              >
                Quit
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <div className="text-4xl mb-4">⏸</div>
            <h2 className="text-2xl font-bold text-indigo-200 mb-5">Paused</h2>
            <div className="flex flex-col gap-3">
              <button
                onPointerDown={onResume}
                className="px-10 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500
                           text-white font-bold transition-all active:scale-95"
              >
                Resume
              </button>
              <button
                onPointerDown={() => setShowConfirm(true)}
                className="px-10 py-3 rounded-xl bg-indigo-800/50 hover:bg-indigo-700/50
                           border border-indigo-500/20
                           text-indigo-300 font-bold transition-all active:scale-95"
              >
                Quit Race
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
