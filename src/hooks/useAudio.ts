import { useRef, useCallback, useEffect } from 'react'
import { Howl, Howler } from 'howler'

const BASE = import.meta.env.BASE_URL

const MUTE_KEY = 'multipawcation-muted'
const VOLUME_KEY = 'multipawcation-volume'

// ─── File-based sounds (Howler.js) ───

function createSound(src: string, opts?: { loop?: boolean; volume?: number }): Howl {
  return new Howl({
    src: [src],
    preload: true,
    loop: opts?.loop ?? false,
    volume: opts?.volume ?? 1.0,
  })
}

// ─── Web Audio API synth sounds ───

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.15,
  ramp?: 'up' | 'down',
) {
  const ctx = getAudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.value = volume
  if (ramp === 'up') {
    osc.frequency.setValueAtTime(frequency * 0.5, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(frequency, ctx.currentTime + duration)
  } else if (ramp === 'down') {
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(frequency * 0.5, ctx.currentTime + duration)
  }
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

function playSynthSpeedBonus() {
  playTone(523, 0.1, 'square', 0.12)
  setTimeout(() => playTone(659, 0.1, 'square', 0.12), 80)
  setTimeout(() => playTone(784, 0.15, 'square', 0.12), 160)
}

function playSynthMasteryBonus() {
  playTone(440, 0.12, 'triangle', 0.15)
  setTimeout(() => playTone(554, 0.12, 'triangle', 0.15), 100)
  setTimeout(() => playTone(659, 0.12, 'triangle', 0.15), 200)
  setTimeout(() => playTone(880, 0.2, 'triangle', 0.15), 300)
}

function playSynthSpecialSpace() {
  playTone(392, 0.08, 'square', 0.1)
  setTimeout(() => playTone(523, 0.08, 'square', 0.1), 60)
  setTimeout(() => playTone(659, 0.12, 'square', 0.1), 120)
}

function playSynthAiMove() {
  playTone(220, 0.08, 'sine', 0.06)
  setTimeout(() => playTone(262, 0.08, 'sine', 0.06), 60)
}

function playSynthUnlock() {
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, 'triangle', 0.15), i * 150)
  })
}

function playSynthDefeat() {
  playTone(392, 0.3, 'sawtooth', 0.1, 'down')
  setTimeout(() => playTone(330, 0.3, 'sawtooth', 0.1, 'down'), 250)
  setTimeout(() => playTone(262, 0.5, 'sawtooth', 0.1, 'down'), 500)
}

// ─── Background music generator ───

class BgMusic {
  private ctx: AudioContext | null = null
  private intervalId: ReturnType<typeof setInterval> | null = null
  private gainNode: GainNode | null = null
  private _tempo = 280 // ms between notes
  private _playing = false
  private noteIndex = 0
  private scale = [262, 294, 330, 349, 392, 440, 494, 523] // C major scale

  get playing() { return this._playing }

  start(volume: number) {
    if (this._playing) return
    this.ctx = getAudioContext()
    this.gainNode = this.ctx.createGain()
    this.gainNode.gain.value = volume * 0.08
    this.gainNode.connect(this.ctx.destination)
    this._playing = true
    this.noteIndex = 0
    this.scheduleNext()
  }

  stop() {
    this._playing = false
    if (this.intervalId) {
      clearTimeout(this.intervalId)
      this.intervalId = null
    }
  }

  setTempo(ms: number) {
    this._tempo = ms
  }

  setVolume(v: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = v * 0.08
    }
  }

  private scheduleNext() {
    if (!this._playing || !this.ctx || !this.gainNode) return

    const pattern = [0, 2, 4, 5, 4, 2, 0, 2, 4, 7, 5, 4, 2, 0, -1, 0]
    const idx = pattern[this.noteIndex % pattern.length]

    if (idx >= 0) {
      const freq = this.scale[idx % this.scale.length]
      const osc = this.ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = freq
      const noteGain = this.ctx.createGain()
      noteGain.gain.value = 1.0
      noteGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + this._tempo / 1200)
      osc.connect(noteGain).connect(this.gainNode!)
      osc.start()
      osc.stop(this.ctx.currentTime + this._tempo / 1000)
    }

    this.noteIndex++
    this.intervalId = setTimeout(() => this.scheduleNext(), this._tempo)
  }
}

// ─── Hook ───

export interface AudioControls {
  unlock: () => void
  playCorrect: () => void
  playWrong: () => void
  playVictory: () => void
  playDefeat: () => void
  playCountdown: () => void
  playSpeedBonus: () => void
  playMasteryBonus: () => void
  playSpecialSpace: () => void
  playAiMove: () => void
  playUnlock: () => void
  startMusic: () => void
  stopMusic: () => void
  setMusicTempo: (nearFinish: boolean) => void
  isMuted: boolean
  toggleMute: () => void
  volume: number
  setVolume: (v: number) => void
}

export function useAudio(): AudioControls {
  const soundsRef = useRef<{
    correct: Howl
    wrong: Howl
    victory: Howl
    countdown: Howl
  } | null>(null)

  const musicRef = useRef(new BgMusic())
  const mutedRef = useRef(localStorage.getItem(MUTE_KEY) === 'true')
  const volumeRef = useRef(parseFloat(localStorage.getItem(VOLUME_KEY) ?? '0.7'))
  const unlockedRef = useRef(false)

  // Initialize sounds lazily
  const getSounds = useCallback(() => {
    if (!soundsRef.current) {
      soundsRef.current = {
        correct: createSound(`${BASE}assets/sounds/correct.mp3`, { volume: 0.6 }),
        wrong: createSound(`${BASE}assets/sounds/wrong.mp3`, { volume: 0.5 }),
        victory: createSound(`${BASE}assets/sounds/victory.mp3`, { volume: 0.7 }),
        countdown: createSound(`${BASE}assets/sounds/start-countdown.mp3`, { volume: 0.6 }),
      }
    }
    return soundsRef.current
  }, [])

  const unlock = useCallback(() => {
    if (unlockedRef.current) return
    unlockedRef.current = true
    // Unlock Howler audio context for Safari
    getSounds() // trigger lazy init
    Howler.volume(mutedRef.current ? 0 : volumeRef.current)
    // Play a silent sound to unlock audio context
    const silent = new Howl({ src: [`${BASE}assets/sounds/correct.mp3`], volume: 0 })
    silent.play()
    // Also unlock Web Audio API
    try {
      getAudioContext()
    } catch { /* ignore */ }
  }, [getSounds])

  const play = useCallback((fn: () => void) => {
    if (mutedRef.current) return
    fn()
  }, [])

  const playCorrect = useCallback(() => play(() => getSounds().correct.play()), [play, getSounds])
  const playWrong = useCallback(() => play(() => getSounds().wrong.play()), [play, getSounds])
  const playVictory = useCallback(() => play(() => getSounds().victory.play()), [play, getSounds])
  const playDefeat = useCallback(() => play(() => playSynthDefeat()), [play])
  const playCountdown = useCallback(() => play(() => getSounds().countdown.play()), [play, getSounds])
  const playSpeedBonus = useCallback(() => play(() => playSynthSpeedBonus()), [play])
  const playMasteryBonus = useCallback(() => play(() => playSynthMasteryBonus()), [play])
  const playSpecialSpace = useCallback(() => play(() => playSynthSpecialSpace()), [play])
  const playAiMove = useCallback(() => play(() => playSynthAiMove()), [play])
  const playUnlock = useCallback(() => play(() => playSynthUnlock()), [play])

  const startMusic = useCallback(() => {
    if (mutedRef.current) return
    musicRef.current.start(volumeRef.current)
  }, [])

  const stopMusic = useCallback(() => {
    musicRef.current.stop()
  }, [])

  const setMusicTempo = useCallback((nearFinish: boolean) => {
    musicRef.current.setTempo(nearFinish ? 180 : 280)
  }, [])

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current
    localStorage.setItem(MUTE_KEY, String(mutedRef.current))
    Howler.volume(mutedRef.current ? 0 : volumeRef.current)
    if (mutedRef.current) {
      musicRef.current.stop()
    }
  }, [])

  const setVolume = useCallback((v: number) => {
    volumeRef.current = v
    localStorage.setItem(VOLUME_KEY, String(v))
    Howler.volume(mutedRef.current ? 0 : v)
    musicRef.current.setVolume(v)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      musicRef.current.stop()
    }
  }, [])

  return {
    unlock,
    playCorrect,
    playWrong,
    playVictory,
    playDefeat,
    playCountdown,
    playSpeedBonus,
    playMasteryBonus,
    playSpecialSpace,
    playAiMove,
    playUnlock,
    startMusic,
    stopMusic,
    setMusicTempo,
    isMuted: mutedRef.current,
    toggleMute,
    volume: volumeRef.current,
    setVolume,
  }
}
