import { useState, useEffect } from 'react'
import identityEngine from '@abbapos/core/identity'
import authEngine from '@abbapos/core/auth'
import orderEngine from '@abbapos/core/order'
import settlementEngine from '@abbapos/core/settlement'
import { MOCK_CATALOG } from './data/catalog'
import './App.css'

function App() {
  const [status, setStatus] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [syncStatus, setSyncStatus] = useState('IDLE') // IDLE, SYNCING, SUCCESS, ERROR
  const [showCheckout, setShowCheckout] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [transactions, setTransactions] = useState([]) // For offline sync queue
  const [activeCategory, setActiveCategory] = useState('All Items')

  useEffect(() => {
    setStatus(identityEngine.getStatus())
    // Auto-login cashier for testing POS
    try {
      authEngine.login('cashier1', 'password')
    } catch(e) {}
  }, [])

  const processCheckout = () => {
    try {
      const order = orderEngine.createOrder('DINE_IN')
      
      cartItems.forEach(item => {
        orderEngine.addItem(order.id, item.id, item.qty, {})
      })

      const settlementDetails = {
        method: 'CASH',
        amountPaid: order.total
      }
      
      const { receipt: officialReceipt } = settlementEngine.settleOrder(order.id, settlementDetails)
      
      setReceipt(officialReceipt)
      setShowCheckout(true)
      
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
    await new Promise(resolve => setTimeout(resolve, 1500))
    try {
      setTransactions(prev => prev.map(t => ({ ...t, synced: true })))
      setSyncStatus('SUCCESS')
    } catch (error) {
      console.error("Sync failed:", error)
      setSyncStatus('ERROR')
    } finally {
      setTimeout(() => setSyncStatus('IDLE'), 3000)
    }
  }

  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0)
  const cartVat = cartSubtotal * 0.12 
  const cartTotal = cartSubtotal + cartVat

  const filteredCatalog = activeCategory === 'All Items' 
    ? MOCK_CATALOG 
    : MOCK_CATALOG.filter(c => c.category === activeCategory)

  if (!status) return <div className="dashboard-root loading-state">Initializing System Core...</div>

  return (
    <div className="dashboard-root">
      
      {/* Top Header */}
      <header className="main-header">
        <div className="header-left-group">
          <div className="brand-section">
            <div className="logo-orb">
              <span className="material-symbols-outlined">restaurant</span>
            </div>
            <div className="logo-text">ABBA <span>POS</span></div>
          </div>
          
          <div className="search-bar-container">
            <span className="material-symbols-outlined search-icon">search</span>
            <input type="text" placeholder="Search menu items..." className="search-input" />
          </div>
        </div>
        
        <div className="header-badges">
          <div className="terminal-badge">
            <span className="material-symbols-outlined">terminal</span>
            <span>Terminal ID: <span className="id">#{status.terminal?.terminalId || 'Offline'}</span></span>
          </div>
          <div className="compliance-badge">
            <span className="material-symbols-outlined">verified_user</span>
            <span>PCI-DSS & BIR COMPLIANT</span>
          </div>
          <div className="user-avatar">
             <img src="https://ui-avatars.com/api/?name=Cashier&background=9d25f4&color=fff" alt="User" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pos-layout">
        
        {/* Product Catalog Grid */}
        <section className="catalog-section">
          <div className="category-header-wrap">
            <div className="category-titles">
              <h1>Menu Categories</h1>
              <p>Select items to add to current order</p>
            </div>
            <div className="category-pills">
               {['All Items', 'Burgers', 'Pizza', 'Drinks'].map(cat => (
                 <button 
                  key={cat} 
                  className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                 >
                   {cat}
                 </button>
               ))}
            </div>
          </div>

          <div className="catalog-grid">
            {filteredCatalog.map(product => (
              <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
                <div className="product-image-placeholder" style={{backgroundImage: `url('${product.image}')`}}>
                  <div className="product-hover-overlay">
                    <span className="material-symbols-outlined">add_circle</span>
                  </div>
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <div className="product-price-row">
                    <span className="product-price">${product.price.toFixed(2)}</span>
                    <span className="product-category-tag">{product.tag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sidebar Cart Panel */}
        <aside className="cart-sidebar">
          <div className="cart-header">
            <div>
              <h2>Current Order</h2>
              <p>Order ID: <span>#ORD-2891</span></p>
            </div>
            <div className="cart-icon-bg">
              <span className="material-symbols-outlined">shopping_basket</span>
            </div>
          </div>

          <div className="cart-items">
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <span className="material-symbols-outlined" style={{fontSize: '48px', opacity: 0.5}}>receipt_long</span>
                <p>Order is empty</p>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-icon">
                    <span className="material-symbols-outlined">{item.category === 'Drinks' ? 'coffee_maker' : item.category === 'Pizza' ? 'local_pizza' : 'lunch_dining'}</span>
                  </div>
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p>${item.price.toFixed(2)}</p>
                  </div>
                  <div className="cart-qty-controls">
                    <button className="cart-qty-btn" onClick={() => updateQty(item.id, -1)}>
                      <span className="material-symbols-outlined" style={{fontSize: '16px'}}>remove</span>
                    </button>
                    <span className="cart-qty-value">{item.qty}</span>
                    <button className="cart-qty-btn add" onClick={() => updateQty(item.id, 1)}>
                      <span className="material-symbols-outlined" style={{fontSize: '16px'}}>add</span>
                    </button>
                  </div>
                  <div className="cart-item-total">
                    ${(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <div className="cart-totals">
              <div className="totals-row">
                <span className="label">Subtotal</span>
                <span className="value">${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span className="label">VAT (12%)</span>
                <span className="value">${cartVat.toFixed(2)}</span>
              </div>
              <div className="totals-grand">
                <span className="label">Grand Total</span>
                <span className="value">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
            <button className="btn-charge" disabled={cartItems.length === 0} onClick={processCheckout}>
              <span className="material-symbols-outlined">payments</span> CHARGE
            </button>
          </div>
        </aside>

      </main>

      {/* Footer Status Bar */}
      <footer className="status-footer">
        <div className="status-indicators">
          <div className="status-item">
            <div className={`status-dot ${transactions.filter(t=>!t.synced).length > 0 ? 'dot-pulse' : 'dot-stable'}`} style={{background: transactions.filter(t=>!t.synced).length > 0 ? '#fb923c' : '#fb923c'}}></div>
            <span>Offline Transactions: <span className="value">{transactions.filter(t=>!t.synced).length || 5}</span></span>
          </div>
          <div className="status-item">
            <div className="status-dot dot-stable"></div>
            <span>Server Status: <span className="value" style={{color: 'var(--success)'}}>Stable</span></span>
          </div>
        </div>
        
        <button 
          className="btn-sync" 
          onClick={syncAll} 
          disabled={syncStatus === 'SYNCING' || transactions.filter(t=>!t.synced).length === 0}
        >
          <span className="material-symbols-outlined">cloud_sync</span>
          {syncStatus === 'SYNCING' ? 'SYNCING...' : 'SYNC TO CLOUD'}
          {syncStatus === 'SUCCESS' && <span style={{color: 'var(--success)', marginLeft: '8px'}}>✓</span>}
        </button>
      </footer>

      {/* Checkout Modal Overlay */}
      {showCheckout && receipt && (
        <div className="modal-overlay">
          <div className="modal-content receipt-modal">
            <h2>Payment Successful</h2>
            <div className="receipt-preview">
              <pre>{receipt.content}</pre>
            </div>
            <button className="btn-primary" onClick={() => setShowCheckout(false)}>
              START NEXT ORDER
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default App
