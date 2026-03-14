import { useState, useEffect } from 'react'
import identityEngine from '../../core/engines/identity.js'
import authEngine from '../../core/engines/auth.js'
import orderEngine from '../../core/engines/order/index.js'
import settlementEngine from '../../core/engines/settlement.js'
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
  const [operationsMenuOpen, setOperationsMenuOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  
  // Operations State
  const [selectedCartItem, setSelectedCartItem] = useState(null)
  const [heldOrders, setHeldOrders] = useState([])
  const [cartDiscount, setCartDiscount] = useState(null) // { type: 'PERCENT'|'AMOUNT'|'SENIOR', value }
  
  // Sub-Modals
  const [managerAuthOpen, setManagerAuthOpen] = useState(false)
  const [managerPin, setManagerPin] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  const [resumeModalOpen, setResumeModalOpen] = useState(false)
  const [discountModalOpen, setDiscountModalOpen] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [tenderedAmount, setTenderedAmount] = useState('')
  
  // Customization State
  const [customizingItem, setCustomizingItem] = useState(null)
  const [selectedModifiers, setSelectedModifiers] = useState({})
  
  const MODIFIER_OPTIONS = {
    'ITEM-001': { // Classic Burger
      required: { temp: ['Rare', 'Med-Rare', 'Medium', 'Med-Well', 'Well-done'] },
      extras: [
        { id: 'ext-cheese', name: 'Extra Cheese', price: 1.00 },
        { id: 'ext-bacon', name: 'Crispy Bacon', price: 2.00 },
        { id: 'ext-avo', name: 'Avocado', price: 1.50 },
        { id: 'ext-gf', name: 'Gluten-Free Bun', price: 2.00 }
      ]
    }
  }

  useEffect(() => {
    setStatus(identityEngine.getStatus())
  }, [])

  // Pricing Calculations
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0)
  
  let cartVat = 0
  let cartTotal = 0

  if (cartDiscount && cartDiscount.type === 'SENIOR') {
    // SC/PWD: VAT Exempt on subtotal, then 20% off
    const vatExemptAmount = cartSubtotal / 1.12
    cartTotal = vatExemptAmount * 0.80
    cartVat = 0
  } else {
    let discountAmount = 0
    if (cartDiscount) {
      if (cartDiscount.type === 'PERCENT') discountAmount = cartSubtotal * (cartDiscount.value / 100)
      if (cartDiscount.type === 'AMOUNT') discountAmount = cartDiscount.value
    }
    const netSubtotal = Math.max(0, cartSubtotal - discountAmount)
    cartVat = netSubtotal * 0.12
    cartTotal = netSubtotal + cartVat
  }

  // --- Operations Menu Logic ---
  
  const handleVoidItemClick = () => {
    setOperationsMenuOpen(false)
    if (!selectedCartItem) {
      alert('Please select an item from the cart to void.')
      return
    }
    setPendingAction({ type: 'VOID', payload: selectedCartItem })
    setManagerAuthOpen(true)
  }

  const handleHoldOrder = () => {
    if (cartItems.length === 0) return
    setHeldOrders(prev => [...prev, { id: `HLD-${Date.now()}`, items: cartItems, timestamp: new Date().toLocaleTimeString() }])
    setCartItems([])
    setCartDiscount(null)
    setSelectedCartItem(null)
    setOperationsMenuOpen(false)
  }

  const handleResumeClick = () => {
    setOperationsMenuOpen(false)
    setResumeModalOpen(true)
  }

  const handleDiscountClick = () => {
    setOperationsMenuOpen(false)
    setDiscountModalOpen(true)
  }

  const executeManagerAction = () => {
    if (managerPin !== '1234') { // Mock RBAC PIN Check
      alert('Invalid Manager PIN!')
      return
    }
    
    if (pendingAction.type === 'VOID') {
      // Void item
      setCartItems(prev => prev.filter(item => item.cartId !== pendingAction.payload))
      setSelectedCartItem(null)
    }
    
    setManagerAuthOpen(false)
    setManagerPin('')
    setPendingAction(null)
  }

  const handleResumeOrder = (heldOrder) => {
    setCartItems(heldOrder.items)
    setHeldOrders(prev => prev.filter(h => h.id !== heldOrder.id))
    setResumeModalOpen(false)
  }

  // --- End Operations Logic ---

  const handleKeypadPress = (key) => {
    if (key === 'backspace') {
      setTenderedAmount(prev => prev.slice(0, -1))
    } else if (key === 'exact') {
      setTenderedAmount(cartTotal.toFixed(2))
    } else {
      setTenderedAmount(prev => prev + key)
    }
  }

  const openPaymentModal = () => {
    setPaymentMethod('CASH')
    setTenderedAmount('')
    setPaymentModalOpen(true)
  }

  const processTransaction = () => {
    try {
      const order = orderEngine.createOrder('DINE_IN')
      cartItems.forEach(item => {
        orderEngine.addItem(order.id, item.id, item.qty, {})
      })

      const tenderedFloat = parseFloat(tenderedAmount) || 0
      
      const settlementDetails = {
        method: paymentMethod,
        amountPaid: tenderedFloat
      }
      
      const { receipt: officialReceipt } = settlementEngine.settleOrder(order.id, settlementDetails)
      
      setReceipt(officialReceipt)
      setPaymentModalOpen(false)
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

  const handleProductClick = (product) => {
    if (MODIFIER_OPTIONS[product.id]) {
      setCustomizingItem(product)
      setSelectedModifiers({
        temp: 'Medium', // Default required
        extras: []
      })
    } else {
      addToCart(product, null)
    }
  }

  const addToCart = (product, modifiers) => {
    setCartItems(prev => {
      // Create a unique instance ID if modifiers exist to separate them in cart
      const customInstanceId = modifiers 
        ? `${product.id}-${modifiers.temp}-${modifiers.extras.join('-')}` 
        : product.id

      // Calculate new base price based on extras
      let calculatedPrice = product.price
      if (modifiers && modifiers.extras.length > 0) {
        const itemOptions = MODIFIER_OPTIONS[product.id].extras
        modifiers.extras.forEach(extId => {
          const addon = itemOptions.find(opt => opt.id === extId)
          if (addon) calculatedPrice += addon.price
        })
      }

      const existing = prev.find(item => item.cartId === customInstanceId)
      if (existing) {
        return prev.map(item => 
          item.cartId === customInstanceId 
            ? { ...item, qty: item.qty + 1 } 
            : item
        )
      }

      // Display name with temp
      const finalName = modifiers ? `${product.name} (${modifiers.temp})` : product.name

      return [...prev, { 
        ...product, 
        cartId: customInstanceId, 
        name: finalName,
        price: calculatedPrice,
        qty: 1,
        modifiers: modifiers 
      }]
    })
    setCustomizingItem(null)
  }

  const updateQty = (cartId, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.cartId === cartId) {
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
              <div key={product.id} className="product-card" onClick={() => handleProductClick(product)}>
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
                <div 
                  key={item.cartId} 
                  className={`cart-item ${selectedCartItem === item.cartId ? 'selected-cart-item' : ''}`}
                  onClick={() => setSelectedCartItem(item.cartId)}
                >
                  <div className="cart-item-icon">
                    <span className="material-symbols-outlined">{item.category === 'Drinks' ? 'coffee_maker' : item.category === 'Pizza' ? 'local_pizza' : 'lunch_dining'}</span>
                  </div>
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p>${item.price.toFixed(2)}</p>
                  </div>
                  <div className="cart-qty-controls">
                    <button className="cart-qty-btn" onClick={() => updateQty(item.cartId, -1)}>
                      <span className="material-symbols-outlined" style={{fontSize: '16px'}}>remove</span>
                    </button>
                    <span className="cart-qty-value">{item.qty}</span>
                    <button className="cart-qty-btn add" onClick={() => updateQty(item.cartId, 1)}>
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
              {cartDiscount && (
                <div className="totals-row discount-row" style={{color: '#ff3b30'}}>
                  <span className="label">Discount ({cartDiscount.label})</span>
                  <span className="value">-</span>
                </div>
              )}
              <div className="totals-grand">
                <span className="label">Grand Total</span>
                <span className="value">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="cart-action-buttons">
              <button className="btn-operations" onClick={() => setOperationsMenuOpen(true)}>
                <span className="material-symbols-outlined">more_horiz</span> OPTIONS
              </button>
              <button className="btn-charge" disabled={cartItems.length === 0} onClick={openPaymentModal}>
                <span className="material-symbols-outlined">payments</span> CHARGE
              </button>
            </div>
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

      {/* Item Customization Modal */}
      {customizingItem && (
        <div className="modal-overlay">
          <div className="modal-content customize-modal">
            <div className="customize-header">
              <h2>Customize Item: <span>{customizingItem.name}</span></h2>
              <button className="btn-close-icon" onClick={() => setCustomizingItem(null)}>
                 <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="customize-body">
              {MODIFIER_OPTIONS[customizingItem.id].required && (
                <div className="modifier-group">
                   <h3>Select Meat Temp <span className="req-tag">(Required)</span></h3>
                   <div className="pill-group">
                     {MODIFIER_OPTIONS[customizingItem.id].required.temp.map(tempOpt => (
                       <button 
                        key={tempOpt} 
                        className={`opt-pill ${selectedModifiers.temp === tempOpt ? 'active' : ''}`}
                        onClick={() => setSelectedModifiers(prev => ({...prev, temp: tempOpt}))}
                       >
                         {tempOpt}
                       </button>
                     ))}
                   </div>
                </div>
              )}

              {MODIFIER_OPTIONS[customizingItem.id].extras && (
                <div className="modifier-group">
                   <h3>Extras & Add-ons <span className="opt-tag">(Optional)</span></h3>
                   <div className="addon-list">
                     {MODIFIER_OPTIONS[customizingItem.id].extras.map(extra => {
                        const isSelected = selectedModifiers.extras.includes(extra.id)
                        return (
                          <label key={extra.id} className={`addon-row ${isSelected ? 'selected' : ''}`}>
                            <div className="addon-info">
                              <span className="material-symbols-outlined checkbox">
                                {isSelected ? 'check_box' : 'check_box_outline_blank'}
                              </span>
                              <span className="name">{extra.name}</span>
                            </div>
                            <span className="price">+${extra.price.toFixed(2)}</span>
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={(e) => {
                                setSelectedModifiers(prev => {
                                  const newExtras = e.target.checked 
                                    ? [...prev.extras, extra.id] 
                                    : prev.extras.filter(id => id !== extra.id)
                                  return {...prev, extras: newExtras}
                                })
                              }}
                              style={{display: 'none'}}
                            />
                          </label>
                        )
                     })}
                   </div>
                </div>
              )}
            </div>

            <div className="customize-footer">
              <div className="custom-total">
                 <span className="label">Total Item Price:</span>
                 <span className="amount">
                   ${(customizingItem.price + selectedModifiers.extras.reduce((sum, extId) => {
                     const addon = MODIFIER_OPTIONS[customizingItem.id].extras.find(e => e.id === extId)
                     return sum + (addon ? addon.price : 0)
                   }, 0)).toFixed(2)}
                 </span>
              </div>
              <button 
                className="btn-complete glow"
                onClick={() => addToCart(customizingItem, selectedModifiers)}
              >
                ADD TO CART
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Checkout Modal Overlay */}
      {paymentModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content payment-modal">
            <div className="payment-header">
              <h2>Select Payment Method</h2>
              <p>Choose a provider to complete the transaction</p>
            </div>
            
            <div className="payment-method-grid">
              {['CASH', 'CARD', 'QR PAY', 'LOYALTY'].map(method => (
                <button 
                  key={method}
                  className={`payment-method-card ${paymentMethod === method ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(method)}
                >
                  <div className="method-icon">
                    <span className="material-symbols-outlined">
                      {method === 'CASH' ? 'payments' : method === 'CARD' ? 'credit_card' : method === 'QR PAY' ? 'qr_code_scanner' : 'loyalty'}
                    </span>
                  </div>
                  <span>{method}</span>
                </button>
              ))}
            </div>

            <div className="payment-body">
              <div className="amount-displays">
                <div className="amount-box due">
                  <span className="label">Total Amount Due</span>
                  <div className="value-wrap">
                    <span className="currency">$</span>
                    <span className="amount">{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className="amount-box tendered">
                  <span className="label">TENDERED AMOUNT</span>
                  <div className="value-wrap">
                    <span className="currency">$</span>
                    <input 
                      type="text" 
                      value={tenderedAmount} 
                      readOnly 
                      className="tendered-input"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="numeric-keypad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map(key => (
                  <button key={key} className="keypad-btn num" onClick={() => handleKeypadPress(key.toString())}>
                    {key}
                  </button>
                ))}
                <button className="keypad-btn backspace" onClick={() => handleKeypadPress('backspace')}>
                  <span className="material-symbols-outlined">backspace</span>
                </button>
                <button className="keypad-btn exact-amount" onClick={() => handleKeypadPress('exact')}>
                  Exact Amount
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setPaymentModalOpen(false)}>
                <span className="material-symbols-outlined" style={{fontSize: '18px'}}>close</span> CANCEL
              </button>
              <button 
                className="btn-complete" 
                onClick={processTransaction}
                disabled={parseFloat(tenderedAmount || 0) < cartTotal}
              >
                COMPLETE TRANSACTION <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Overlay */}
      {showCheckout && receipt && (
        <div className="modal-overlay blurred-overlay">
          <div className="modal-content receipt-modal-v2">
            
            <div className="receipt-paper">
              <div className="receipt-header-v2">
                <h2>{receipt.store.name}</h2>
                <p>{receipt.store.address}</p>
                <p>TIN: {receipt.store.tin}</p>
                <p>OR#: {receipt.receiptNumber}</p>
                <p>Date: {new Date(receipt.timestamp).toLocaleString()}</p>
                <p>Cashier: 01-Admin</p>
              </div>

              <div className="receipt-divider">================================</div>

              <div className="receipt-items-list">
                <div className="receipt-items-header">
                  <span className="col-qty">QTY</span>
                  <span className="col-name">ITEM</span>
                  <span className="col-price">PRICE</span>
                </div>
                {receipt.items.map((item, idx) => (
                  <div key={idx} className="receipt-line-item">
                    <span className="col-qty">{item.qty}</span>
                    <span className="col-name">{item.description}</span>
                    <span className="col-price">{item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="receipt-divider">--------------------------------</div>
              
              <div className="receipt-financials">
                <div className="receipt-row">
                  <span>Subtotal:</span>
                  <span>{receipt.totals.subtotal.toFixed(2)}</span>
                </div>
                {receipt.totals.discount > 0 && (
                  <div className="receipt-row receipt-discount">
                    <span>Discount:</span>
                    <span>-{receipt.totals.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="receipt-row">
                  <span>VATable Sales:</span>
                  <span>{receipt.totals.netOfVat.toFixed(2)}</span>
                </div>
                <div className="receipt-row">
                  <span>VAT (12%):</span>
                  <span>{receipt.totals.vatAmount.toFixed(2)}</span>
                </div>
                <div className="receipt-row receipt-grand">
                  <span>Grand Total:</span>
                  <span>{receipt.totals.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="receipt-divider">================================</div>

              <div className="receipt-payment-info">
                <div className="receipt-row">
                  <span>Payment:</span>
                  <span>{receipt.paymentMethod}</span>
                </div>
                <div className="receipt-row">
                  <span>Tendered:</span>
                  <span>{receipt.amountPaid.toFixed(2)}</span>
                </div>
                <div className="receipt-row">
                  <span>Change:</span>
                  <span>{receipt.change.toFixed(2)}</span>
                </div>
              </div>

              <div className="receipt-footer">
                <p>MSN: {receipt.terminal.serialNumber}</p>
                <p>PTU: {receipt.footer.ptuNumber} ({receipt.terminal.ptuDate})</p>
                <p>Accred: {receipt.footer.birAccreditation} ({receipt.terminal.accreditationDate})</p>
                <p>Thank you for dining with us!</p>
                <p>THIS IS AN OFFICIAL RECEIPT</p>
              </div>
              <div className="receipt-torn-edge"></div>
            </div>

            <div className="receipt-actions">
              <div className="receipt-actions-row">
                <button className="btn-receipt-action">
                  <span className="material-symbols-outlined">print</span>
                  Print
                </button>
                <button className="btn-receipt-action">
                  <span className="material-symbols-outlined">mail</span>
                  Email
                </button>
              </div>
              <button 
                className="btn-new-order glow" 
                onClick={() => {
                  setShowCheckout(false);
                  setCartItems([]);
                  setCartDiscount(null);
                  setTenderedAmount('');
                }}
              >
                START NEW ORDER
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Operations Menu Modal */}
      {operationsMenuOpen && (
        <div className="modal-overlay blurred-overlay">
          <div className="modal-content operations-modal">
            <h2 className="operations-title">Operations Menu</h2>
            <div className="operations-grid">
              <button className="btn-op btn-void" onClick={handleVoidItemClick}>
                <span className="material-symbols-outlined">remove_shopping_cart</span>
                <span>Void Item</span>
              </button>
              <button className="btn-op btn-neutral" onClick={handleHoldOrder} disabled={cartItems.length === 0}>
                <span className="material-symbols-outlined">pause_circle</span>
                <span>Hold Order</span>
              </button>
              <button className="btn-op btn-neutral" onClick={handleResumeClick} disabled={heldOrders.length === 0}>
                <span className="material-symbols-outlined">play_circle</span>
                <span>Resume Order</span>
              </button>
              <button className="btn-op btn-accent" onClick={handleDiscountClick}>
                <span className="material-symbols-outlined">loyalty</span>
                <span>Apply Discount</span>
              </button>
            </div>
            <div className="operations-footer">
              <button className="btn-transparent-close" onClick={() => setOperationsMenuOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manager Auth Modal */}
      {managerAuthOpen && (
        <div className="modal-overlay blurred-overlay">
          <div className="modal-content auth-modal">
            <h2>Manager Authorization Required</h2>
            <p>Please enter your Manager PIN to proceed with this action.</p>
            <input 
              type="password" 
              maxLength="4" 
              value={managerPin} 
              onChange={e => setManagerPin(e.target.value)}
              className="pin-input"
              placeholder="••••"
              autoFocus
            />
            <div className="modal-actions-row">
              <button className="btn-cancel" onClick={() => { setManagerAuthOpen(false); setManagerPin(''); }}>Cancel</button>
              <button className="btn-auth-confirm" onClick={executeManagerAction}>Authorize</button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Order Modal */}
      {resumeModalOpen && (
        <div className="modal-overlay blurred-overlay">
          <div className="modal-content list-modal">
            <h2>Select Held Order</h2>
            {heldOrders.length === 0 ? <p>No held orders found.</p> : (
              <div className="held-orders-list">
                {heldOrders.map(h => (
                  <div key={h.id} className="held-order-card" onClick={() => handleResumeOrder(h)}>
                    <div className="held-info">
                      <h4>{h.id}</h4>
                      <span>Hold Time: {h.timestamp}</span>
                    </div>
                    <div className="held-qty">{h.items.length} Items</div>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions-row">
              <button className="btn-transparent-close" onClick={() => setResumeModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Discount Modal */}
      {discountModalOpen && (
        <div className="modal-overlay blurred-overlay">
          <div className="modal-content list-modal">
            <h2>Select Order Discount</h2>
            <div className="discount-grid">
              <button className="btn-discount" onClick={() => { setCartDiscount({ type: 'PERCENT', value: 10, label: '10% Off' }); setDiscountModalOpen(false); }}>
                <h3>10% Off</h3>
                <span>Loyalty</span>
              </button>
              <button className="btn-discount" onClick={() => { setCartDiscount({ type: 'PERCENT', value: 20, label: '20% Off' }); setDiscountModalOpen(false); }}>
                <h3>20% Off</h3>
                <span>Promo</span>
              </button>
              <button className="btn-discount sc-pwd" onClick={() => { setCartDiscount({ type: 'SENIOR', value: 0, label: 'SC/PWD (20% + VAT Ex)' }); setDiscountModalOpen(false); }}>
                <h3>SC / PWD</h3>
                <span>20% Off + VAT Exempt</span>
              </button>
              <button className="btn-discount clear" onClick={() => { setCartDiscount(null); setDiscountModalOpen(false); }}>
                <h3>Remove Discount</h3>
              </button>
            </div>
            <div className="modal-actions-row" style={{marginTop:'24px'}}>
              <button className="btn-transparent-close" onClick={() => setDiscountModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default App
