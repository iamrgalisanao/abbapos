import { useState, useEffect } from 'react'
import identityEngine from '@abbapos/core/identity'
import authEngine from '@abbapos/core/auth'
import orderEngine from '@abbapos/core/order'
import settlementEngine from '@abbapos/core/settlement'
import taxEngine from '@abbapos/core/tax'
import { MOCK_CATALOG } from './data/catalog'
import './App.css'

function App() {
  const [status, setStatus] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [syncStatus, setSyncStatus] = useState('IDLE')
  const [showCheckout, setShowCheckout] = useState(false)
  const [receipt, setReceipt] = useState(null)

  useEffect(() => {
    setStatus(identityEngine.getStatus())
    // Auto-login cashier for testing POS
    try {
      authEngine.login('cashier1', 'password')
    } catch(e) {}
  }, [])

  const processCheckout = () => {
    try {
      // 1. Create native Order via Core
      const order = orderEngine.createOrder('DINE_IN')
      
      // 2. Add Cart Items to Order
      cartItems.forEach(item => {
        orderEngine.addItem(order.id, item.id, item.qty, {})
      })

      // 3. Process Settlement via Core
      const settlementDetails = {
        method: 'CASH',
        amountPaid: order.total // exact amount for demo
      }
      
      const { receipt: officialReceipt } = settlementEngine.settleOrder(order.id, settlementDetails)
      
      setReceipt(officialReceipt)
      setShowCheckout(true)
      
      // 4. Queue for Cloud Sync
      const syncedOrder = {
        id: order.id,
        terminalId: status.terminal.terminalId,
        cashierId: authEngine.getCurrentUser().id,
        serviceType: order.serviceType,
        status: order.status,
        subtotal: order.subtotal,
        total: order.total,
        items: order.items.map(i => ({
          itemId: i.itemId, name: i.name, qty: i.qty, basePrice: i.basePrice, totalAmount: i.totalAmount
        })),
        synced: false
      }
      setTransactions([syncedOrder, ...transactions])
      
      // Reset Cart
      setCartItems([])
    } catch (err) {
      alert(`Checkout Failed: ${err.message}`)
    }
  }

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, qty: item.qty + 1 } 
            : item
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta)
        return { ...item, qty: newQty }
      }
      return item
    }).filter(item => item.qty > 0))
  }

  const syncAll = async () => {
    setSyncStatus('SYNCING')
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    try {
      // In a real app, you'd send transactions to your backend
      // For this demo, we just mark them as synced
      setTransactions(prev => prev.map(t => ({ ...t, synced: true })))
      setSyncStatus('SUCCESS')
    } catch (error) {
      console.error("Sync failed:", error)
      setSyncStatus('ERROR')
    } finally {
      setTimeout(() => setSyncStatus('IDLE'), 3000) // Reset status after a delay
    }
  }

  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0)
  const cartVat = cartSubtotal * 0.12 // Simple mock VAT for UI phase
  const cartTotal = cartSubtotal + cartVat

  if (!status) return <div className="loading ripple">Initializing System Core...</div>

  return (
    <div className="dashboard-root">
      <header className="glass-panel main-header">
        <div className="brand">
          <div className="logo-orb pulse"></div>
          <div>
            <h1>{status.store?.storeName || 'ABBA POS'}</h1>
            <p className="dim">Terminal {status.terminal?.terminalId || 'Offline'}</p>
          </div>
        </div>
        <div className="compliance-badge badge">
          PCI-DSS & BIR COMPLIANT
        </div>
      </header>

      <main className="pos-layout">
        <section className="catalog-grid">
          {MOCK_CATALOG.map(product => (
            <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
              <div className="product-icon">{product.image}</div>
              <div className="product-name">{product.name}</div>
              <div className="product-price">₱{product.price.toFixed(2)}</div>
            </div>
          ))}
        </section>

        <section className="glass-panel cart-panel">
          <h2>Current Order</h2>
          <div className="cart-items">
            {cartItems.length === 0 ? (
              <p className="dim" style={{textAlign: 'center', marginTop: '20px'}}>Cart is empty.</p>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div>
                    <h4>{item.name}</h4>
                    <p>₱{item.price.toFixed(2)}</p>
                  </div>
                  <div className="qty-controls">
                    <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>-</button>
                    <span className="mono bold" style={{width: '20px', textAlign: 'center'}}>{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="cart-totals">
            <div className="total-row dim">
              <span>Subtotal</span>
              <span>₱{cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="total-row dim">
              <span>VAT (12%)</span>
              <span>₱{cartVat.toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total</span>
              <span>₱{cartTotal.toFixed(2)}</span>
            </div>
          </div>
          <button className="primary checkout-btn" disabled={cartItems.length === 0} onClick={processCheckout}>
             Charge ₱{cartTotal.toFixed(2)}
          </button>
        </section>
      </main>

      {/* Sync Queue Monitor Strip */}
      <footer className="glass-panel sync-footer">
        <div className="sync-status">
            <span>Offline Queue: {transactions.filter(t=>!t.synced).length}</span>
            <button onClick={syncAll} disabled={syncStatus === 'SYNCING' || transactions.filter(t=>!t.synced).length === 0}>
              {syncStatus === 'SYNCING' ? 'Syncing...' : 'Sync to Cloud'}
            </button>
            {syncStatus === 'SUCCESS' && <span className="text-success ml-2">✓ Success</span>}
            {syncStatus === 'ERROR' && <span className="text-error ml-2">⚠ Failed</span>}
        </div>
      </footer>

      {showCheckout && receipt && (
        <div className="modal-overlay">
          <div className="modal-content receipt-modal">
            <h2>Payment Successful</h2>
            <div className="receipt-preview mono">
              <pre>{receipt.content}</pre>
            </div>
            <button className="primary" onClick={() => setShowCheckout(false)}>
              Start Next Order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
