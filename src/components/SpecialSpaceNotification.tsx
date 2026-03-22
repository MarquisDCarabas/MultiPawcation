import { motion, AnimatePresence } from 'framer-motion'

interface SpecialSpaceNotificationProps {
  message: string | null
}

export function SpecialSpaceNotification({ message }: SpecialSpaceNotificationProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-indigo-800/90 border border-indigo-400/30 rounded-xl px-4 py-2
                     text-center text-sm font-semibold text-white shadow-lg"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
