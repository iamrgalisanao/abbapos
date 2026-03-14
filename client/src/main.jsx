import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import persistenceManager from '../../core/engines/PersistenceManager.js'
import identityEngine from '../../core/engines/identity.js'
import authEngine from '../../core/engines/auth.js'
import catalogEngine from '../../core/engines/catalog/index.js'
import { MOCK_CATALOG } from './data/catalog'

async function init() {
  console.log('[POS-INIT] Starting bootstrap...')
  await persistenceManager.bootstrap()
  console.log('[POS-INIT] Bootstrap complete.')

  // Synchronize MOCK_CATALOG with CatalogEngine
  if (!catalogEngine.initialized) {
    console.log('[POS-INIT] Initializing catalog...')
    const categories = [...new Set(MOCK_CATALOG.map(item => item.category))].map(name => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name
    }))
    
    const items = MOCK_CATALOG.map(item => ({
      id: item.id,
      name: item.name,
      basePrice: item.price,
      categoryId: item.category.toLowerCase().replace(/\s+/g, '-'),
      modifierGroups: [] // Mock is simple for now
    }))

    catalogEngine.loadCatalog({ categories, items })
    console.log(`[POS-INIT] Catalog synchronized with ${items.length} items.`)
  }
  
  if (!identityEngine.getStatus().initialized) {
    console.log('[POS-INIT] Identity not found, registering default...')
    identityEngine.registerStore({ 
      name: 'ABBA POS Restaurant', 
      tin: '123-456-789-000', 
      branchCode: 'BR01',
      address: '123 Compliance St, Quezon City, Metro Manila' 
    })
    identityEngine.registerTerminal({ 
      terminalId: 'TERM-01', 
      ptuNumber: 'PTU-1234-567-890',
      ptuDate: '2026-03-14',
      accreditationNumber: 'ACC-0987-654-321',
      accreditationDate: '2026-03-14',
      serialNumber: 'SN-00000001-VIRTUAL'
    })
    identityEngine.verifyIdentity()
  } else {
    console.log('[POS-INIT] Identity loaded from persistence.')
  }
  
  console.log('[POS-INIT] Authenticating...')
  try { authEngine.login('cashier1', 'password') } catch (e) { console.error('[POS-INIT] Login failed', e) }

  console.log('[POS-INIT] Rendering App...')
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

init().catch(err => {
  console.error('[POS-INIT] CRITICAL FAILURE:', err)
  // Fallback render to at least show the dashboard (though engines will be uninitialized)
  createRoot(document.getElementById('root')).render(<div>Critical System Error: Check Console</div>)
})
