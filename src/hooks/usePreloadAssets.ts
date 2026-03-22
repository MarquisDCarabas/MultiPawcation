import { useState, useEffect } from 'react'
import { ANIMALS } from '../data/animals'

export function usePreloadAssets() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const images = ANIMALS.map((animal) => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve() // don't block on errors
        img.src = animal.image
      })
    })

    Promise.all(images).then(() => setLoaded(true))
  }, [])

  return loaded
}
