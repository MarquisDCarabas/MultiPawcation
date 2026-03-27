import { useEffect, useRef, useCallback, createContext, useContext, useState } from 'react'

// ─── Particle types ───

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  type: 'confetti' | 'sparkle' | 'dust' | 'lightning' | 'mud' | 'rainbow' | 'banana' | 'shield' | 'star'
  rotation: number
  rotationSpeed: number
  gravity: number
  opacity: number
  shape?: 'rect' | 'circle' | 'star' | 'arc'
}

export interface ParticleAPI {
  confettiBurst: (x: number, y: number) => void
  sparkleTrail: (x: number, y: number) => void
  dustPuff: (x: number, y: number) => void
  lightningFlash: (x: number, y: number) => void
  mudSplatter: (x: number, y: number) => void
  rainbowArc: (x: number, y: number) => void
  bananaSpin: (x: number, y: number) => void
  sparkleBurst: (x: number, y: number) => void
  shieldShimmer: (x: number, y: number) => void
}

const MAX_PARTICLES = 250

const ParticleContext = createContext<ParticleAPI | null>(null)

export function useParticles(): ParticleAPI {
  const ctx = useContext(ParticleContext)
  if (!ctx) {
    // Return no-ops if outside provider (e.g. tests)
    return {
      confettiBurst: () => {},
      sparkleTrail: () => {},
      dustPuff: () => {},
      lightningFlash: () => {},
      mudSplatter: () => {},
      rainbowArc: () => {},
      bananaSpin: () => {},
      sparkleBurst: () => {},
      shieldShimmer: () => {},
    }
  }
  return ctx
}

export function ParticleProvider({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const [api, setApi] = useState<ParticleAPI | null>(null)

  const addParticles = useCallback((newParticles: Particle[]) => {
    const particles = particlesRef.current
    // Cap total count
    const available = MAX_PARTICLES - particles.length
    if (available <= 0) return
    particles.push(...newParticles.slice(0, available))
  }, [])

  const confettiBurst = useCallback((x: number, y: number) => {
    const colors = ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#a78bfa', '#fb923c']
    const particles: Particle[] = []
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30 + (Math.random() - 0.5) * 0.5
      const speed = 2 + Math.random() * 4
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 60 + Math.random() * 30,
        maxLife: 90,
        size: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'confetti',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        gravity: 0.08,
        opacity: 1,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      })
    }
    addParticles(particles)
  }, [addParticles])

  const sparkleTrail = useCallback((x: number, y: number) => {
    const particles: Particle[] = []
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        life: 20 + Math.random() * 15,
        maxLife: 35,
        size: 2 + Math.random() * 3,
        color: '#fde68a',
        type: 'sparkle',
        rotation: 0,
        rotationSpeed: 0,
        gravity: 0,
        opacity: 1,
        shape: 'star',
      })
    }
    addParticles(particles)
  }, [addParticles])

  const dustPuff = useCallback((x: number, y: number) => {
    const particles: Particle[] = []
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12
      const speed = 1 + Math.random() * 2
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.5 - 0.5,
        life: 25 + Math.random() * 15,
        maxLife: 40,
        size: 5 + Math.random() * 6,
        color: '#a5b4c7',
        type: 'dust',
        rotation: 0,
        rotationSpeed: 0,
        gravity: -0.01,
        opacity: 0.6,
        shape: 'circle',
      })
    }
    addParticles(particles)
  }, [addParticles])

  const lightningFlash = useCallback((x: number, y: number) => {
    const particles: Particle[] = []
    for (let i = 0; i < 15; i++) {
      const angle = (Math.random() - 0.5) * Math.PI
      const speed = 3 + Math.random() * 5
      particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 15 + Math.random() * 10,
        maxLife: 25,
        size: 2 + Math.random() * 3,
        color: '#fbbf24',
        type: 'lightning',
        rotation: Math.random() * Math.PI,
        rotationSpeed: 0.2,
        gravity: 0.05,
        opacity: 1,
        shape: 'rect',
      })
    }
    addParticles(particles)
  }, [addParticles])

  const mudSplatter = useCallback((x: number, y: number) => {
    const colors = ['#92400e', '#78350f', '#a16207', '#6b5b3e']
    const particles: Particle[] = []
    for (let i = 0; i < 18; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2
      const speed = 2 + Math.random() * 4
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 40 + Math.random() * 20,
        maxLife: 60,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'mud',
        rotation: 0,
        rotationSpeed: 0,
        gravity: 0.15,
        opacity: 0.8,
        shape: 'circle',
      })
    }
    addParticles(particles)
  }, [addParticles])

  const rainbowArc = useCallback((x: number, y: number) => {
    const rainbow = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']
    const particles: Particle[] = []
    for (let i = 0; i < 24; i++) {
      const angle = -Math.PI + (Math.PI * i) / 23
      const speed = 2 + Math.random() * 2
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 35 + Math.random() * 15,
        maxLife: 50,
        size: 4 + Math.random() * 3,
        color: rainbow[i % rainbow.length],
        type: 'rainbow',
        rotation: 0,
        rotationSpeed: 0,
        gravity: 0.03,
        opacity: 0.9,
        shape: 'circle',
      })
    }
    addParticles(particles)
  }, [addParticles])

  const bananaSpin = useCallback((x: number, y: number) => {
    const particles: Particle[] = []
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12
      const speed = 1.5 + Math.random() * 2
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 15,
        maxLife: 45,
        size: 4 + Math.random() * 3,
        color: '#fde047',
        type: 'banana',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.5,
        gravity: 0.06,
        opacity: 0.9,
        shape: 'arc',
      })
    }
    addParticles(particles)
  }, [addParticles])

  const sparkleBurst = useCallback((x: number, y: number) => {
    const colors = ['#fbbf24', '#f9a8d4', '#c4b5fd', '#fde68a']
    const particles: Particle[] = []
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20
      const speed = 1.5 + Math.random() * 3
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 25 + Math.random() * 20,
        maxLife: 45,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'star',
        rotation: Math.random() * Math.PI,
        rotationSpeed: 0.1,
        gravity: 0,
        opacity: 1,
        shape: 'star',
      })
    }
    addParticles(particles)
  }, [addParticles])

  const shieldShimmer = useCallback((x: number, y: number) => {
    const particles: Particle[] = []
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16
      const radius = 15 + Math.random() * 10
      particles.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        vx: Math.cos(angle) * 0.5,
        vy: Math.sin(angle) * 0.5,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        size: 3 + Math.random() * 3,
        color: '#7dd3fc',
        type: 'shield',
        rotation: 0,
        rotationSpeed: 0,
        gravity: 0,
        opacity: 0.8,
        shape: 'circle',
      })
    }
    addParticles(particles)
  }, [addParticles])

  // Set up the API once
  useEffect(() => {
    setApi({
      confettiBurst, sparkleTrail, dustPuff, lightningFlash,
      mudSplatter, rainbowArc, bananaSpin, sparkleBurst, shieldShimmer,
    })
  }, [confettiBurst, sparkleTrail, dustPuff, lightningFlash, mudSplatter, rainbowArc, bananaSpin, sparkleBurst, shieldShimmer])

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawStar = (cx: number, cy: number, size: number, rotation: number) => {
      const spikes = 4
      const outerRadius = size
      const innerRadius = size * 0.4
      ctx.beginPath()
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius
        const angle = rotation + (Math.PI * i) / spikes
        const px = cx + Math.cos(angle) * r
        const py = cy + Math.sin(angle) * r
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fill()
    }

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const particles = particlesRef.current

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life--
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }

        p.x += p.vx
        p.y += p.vy
        p.vy += p.gravity
        p.rotation += p.rotationSpeed

        const lifeRatio = p.life / p.maxLife
        const alpha = p.opacity * Math.min(lifeRatio * 2, 1)

        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color

        if (p.shape === 'star') {
          drawStar(p.x, p.y, p.size, p.rotation)
        } else if (p.shape === 'rect') {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rotation)
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
          ctx.restore()
        } else if (p.shape === 'arc') {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rotation)
          ctx.beginPath()
          ctx.arc(0, 0, p.size, 0, Math.PI, false)
          ctx.fill()
          ctx.restore()
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * lifeRatio, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.globalAlpha = 1
      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  return (
    <ParticleContext.Provider value={api}>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-50 pointer-events-none"
        style={{ touchAction: 'none' }}
      />
      {children}
    </ParticleContext.Provider>
  )
}
