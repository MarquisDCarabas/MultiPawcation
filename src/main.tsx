import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ParticleProvider } from './components/ParticleCanvas'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ParticleProvider>
      <App />
    </ParticleProvider>
  </StrictMode>,
)
