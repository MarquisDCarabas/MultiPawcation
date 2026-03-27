import { motion, AnimatePresence } from 'framer-motion'
import type { SpecialSpaceType } from '../data/specialSpaces'

interface SpecialSpaceEffectProps {
  activeEffect: SpecialSpaceType | null
}

export function SpecialSpaceEffect({ activeEffect }: SpecialSpaceEffectProps) {
  return (
    <AnimatePresence>
      {activeEffect && (
        <motion.div
          key={activeEffect}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
        >
          {activeEffect === 'bonus_sprint' && <LightningFlash />}
          {activeEffect === 'mud_pit' && <MudSplatter />}
          {activeEffect === 'shortcut' && <RainbowArc />}
          {activeEffect === 'banana_peel' && <BananaSpin />}
          {activeEffect === 'challenge_card' && <StarBurst />}
          {activeEffect === 'shield' && <ShieldShimmer />}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function LightningFlash() {
  return (
    <>
      {/* Flash overlay */}
      <motion.div
        className="absolute inset-0 bg-amber-300/20"
        animate={{ opacity: [0, 0.4, 0, 0.2, 0] }}
        transition={{ duration: 0.5 }}
      />
      {/* Lightning bolts */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-5xl"
          initial={{ opacity: 0, scale: 0, y: -50 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.3, 1.2, 1, 0.5],
            y: [-50, 0, 10, 30],
          }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          style={{
            left: `${30 + i * 20}%`,
            top: '30%',
          }}
        >
          ⚡
        </motion.div>
      ))}
    </>
  )
}

function MudSplatter() {
  return (
    <>
      <motion.div
        className="absolute inset-0 bg-orange-900/10"
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.8 }}
      />
      {[...Array(8)].map((_, i) => {
        const angle = (Math.PI * 2 * i) / 8
        const dist = 40 + Math.random() * 30
        return (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full bg-amber-800/70"
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1.5, 1],
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.7, delay: i * 0.03 }}
          />
        )
      })}
      <motion.div
        className="text-5xl"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1], rotate: [0, -10, 0] }}
        transition={{ duration: 0.5 }}
      >
        💩
      </motion.div>
    </>
  )
}

function RainbowArc() {
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']
  return (
    <>
      {colors.map((color, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-4"
          style={{
            borderColor: color,
            width: 120 + i * 20,
            height: 60 + i * 10,
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
          }}
          initial={{ opacity: 0, scale: 0.3, y: 30 }}
          animate={{
            opacity: [0, 0.8, 0.8, 0],
            scale: [0.3, 1, 1, 1.1],
            y: [30, -10, -10, -20],
          }}
          transition={{ duration: 1, delay: i * 0.05 }}
        />
      ))}
      <motion.div
        className="absolute text-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: [0, 1, 0], y: [20, -30, -50] }}
        transition={{ duration: 1 }}
      >
        🌈
      </motion.div>
    </>
  )
}

function BananaSpin() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl"
          initial={{ opacity: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            rotate: [0, 360, 720],
            x: Math.cos((Math.PI * 2 * i) / 4) * 50,
            y: Math.sin((Math.PI * 2 * i) / 4) * 50,
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{ duration: 0.8, delay: i * 0.1 }}
        >
          🍌
        </motion.div>
      ))}
    </>
  )
}

function StarBurst() {
  return (
    <>
      <motion.div
        className="absolute inset-0 bg-purple-500/10"
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.6 }}
      />
      {[...Array(8)].map((_, i) => {
        const angle = (Math.PI * 2 * i) / 8
        return (
          <motion.div
            key={i}
            className="absolute text-2xl"
            initial={{ scale: 0 }}
            animate={{
              scale: [0, 1.3, 0],
              x: Math.cos(angle) * 60,
              y: Math.sin(angle) * 60,
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
          >
            ✨
          </motion.div>
        )
      })}
      <motion.div
        className="text-5xl"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: [0, 1.4, 1], rotate: [-30, 10, 0] }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        ⭐
      </motion.div>
    </>
  )
}

function ShieldShimmer() {
  return (
    <>
      <motion.div
        className="absolute w-32 h-32 rounded-full border-4 border-sky-400/50"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: [0.5, 1.5, 2],
          opacity: [0, 0.6, 0],
        }}
        transition={{ duration: 0.8 }}
      />
      <motion.div
        className="absolute w-24 h-24 rounded-full border-2 border-sky-300/40"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: [0.5, 1.3, 1.8],
          opacity: [0, 0.4, 0],
        }}
        transition={{ duration: 0.8, delay: 0.15 }}
      />
      <motion.div
        className="text-5xl"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.8] }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        🛡️
      </motion.div>
    </>
  )
}
