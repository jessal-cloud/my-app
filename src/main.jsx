import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PasscodeGate from './components/PasscodeGate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PasscodeGate>
      <App />
    </PasscodeGate>
  </StrictMode>,
)
