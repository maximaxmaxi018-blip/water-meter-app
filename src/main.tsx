import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// GitHub Pages SPA redirect handling
if (window.location.search.includes('?/')) {
  const path = window.location.search.slice(2) + window.location.hash
  window.history.replaceState(null, '', path)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)