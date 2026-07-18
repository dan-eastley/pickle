import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { installGlobalErrorReporting } from './lib/reportError'

// Capture errors React boundaries don't (async, event handlers, promise
// rejections) and ship them to the server log.
installGlobalErrorReporting()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
