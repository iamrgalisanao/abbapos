import { useState, useEffect } from 'react'
import identityEngine from '@abbapos/core/identity'
import './App.css'

function App() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    // Initial load from the JS core
    // In a real app, this might be triggered by a sync or login
    const currentStatus = identityEngine.getStatus()
    setStatus(currentStatus)
  }, [])

  if (!status) return <div className="loading">Initializing System Core...</div>

  return (
    <div className="dashboard-root">
      <header className="glass-panel main-header">
        <div className="brand">
          <div className="logo-orb"></div>
          <h1>{status.store?.storeName || 'ABBA POS'}</h1>
        </div>
        <div className="compliance-badge badge">
          PCI-DSS & BIR COMPLIANT
        </div>
      </header>

      <main className="content-grid">
        <section className="glass-panel identity-overview">
          <h2>Terminal ID: {status.terminal?.terminalId || 'UNREGISTERED'}</h2>
          <div className="stats">
            <div className="stat-item">
              <label>PTU Number</label>
              <span>{status.terminal?.ptuNumber}</span>
            </div>
            <div className="stat-item">
              <label>Accreditation</label>
              <span>{status.terminal?.accreditationNumber}</span>
            </div>
            <div className="stat-item">
              <label>System State</label>
              <span className={status.initialized ? 'text-success' : 'text-error'}>
                {status.initialized ? 'OPERATIONAL' : 'SETUP REQUIRED'}
              </span>
            </div>
          </div>
        </section>

        <section className="glass-panel live-feed">
          <h2>Recent Activity</h2>
          <div className="activity-placeholder">
             Waiting for transactions...
          </div>
        </section>
      </main>

      <footer className="footer shadow-text">
        Modernization Phase 5 | ReactJS + JS Core Bridge
      </footer>
    </div>
  )
}

export default App
