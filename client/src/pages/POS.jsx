import { useEffect, useState } from 'react';
import { getProducts } from '../api/productApi';
import { completeSale } from '../api/salesApi';
import { getCustomers } from '../api/customerApi';
import Receipt from '../components/Receipt';

// Popup to choose Single vs Case/Pack
function VariantPicker({ product, onSelect, onClose }) {
  const unitLabel     = product.unit || 'unit';
  const caseLabel     = ['stick', 'pack'].includes(product.unit) ? 'Pack' : 'Case';
  const singleLabel   = product.unit.charAt(0).toUpperCase() + product.unit.slice(1);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '2rem',
        width: '320px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}>
        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '0.4rem' }}>{product.name}</div>
        {product.size && (
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '1.25rem' }}>{product.size}</div>
        )}
        <div style={{ fontSize: '13px', color: '#888', marginBottom: '1.25rem' }}>How are you selling this?</div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Single */}
          <button
            onClick={() => onSelect('single')}
            style={{
              flex: 1, padding: '1rem', borderRadius: '8px', cursor: 'pointer',
              border: '2px solid #1a1a2e', background: '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
            }}
          >
            <span style={{ fontSize: '22px' }}>🍺</span>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{singleLabel}</span>
            <span style={{ fontSize: '13px', color: '#e94560', fontWeight: 500 }}>Rs. {product.sellingPrice}</span>
          </button>

          {/* Case/Pack */}
          <button
            onClick={() => onSelect('case')}
            style={{
              flex: 1, padding: '1rem', borderRadius: '8px', cursor: 'pointer',
              border: '2px solid #e94560', background: '#fff5f7',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
            }}
          >
            <span style={{ fontSize: '22px' }}>📦</span>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{caseLabel}</span>
            <span style={{ fontSize: '12px', color: '#888' }}>{product.caseQty} {unitLabel}s</span>
            <span style={{ fontSize: '13px', color: '#e94560', fontWeight: 500 }}>Rs. {product.casePrice}</span>
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: '1rem', background: 'none', border: 'none',
            color: '#aaa', cursor: 'pointer', fontSize: '13px'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function POS() {
  const [products, setProducts]       = useState([]);
  const [customers, setCustomers]     = useState([]);
  const [search, setSearch]           = useState('');
  const [cart, setCart]               = useState([]);
  const [discount, setDiscount]       = useState(0);
  const [payment, setPayment]         = useState('cash');
  const [isCredit, setIsCredit]       = useState(false);
  const [customerId, setCustomerId]   = useState('');
  const [lastInvoice, setLastInvoice] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [receipt, setReceipt]         = useState(null);
  const [variantFor, setVariantFor]   = useState(null); // product awaiting variant pick

  useEffect(() => {
    getProducts().then(res => setProducts(res.data));
    getCustomers().then(res => setCustomers(res.data));
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product, variant = 'single') => {
    const isCase     = variant === 'case';
    const unitPrice  = isCase ? product.casePrice  : product.sellingPrice;
    const qtyDeduct  = isCase ? product.caseQty    : 1;
    const variantLabel = isCase
      ? (['stick','pack'].includes(product.unit) ? 'Pack' : 'Case')
      : (product.unit.charAt(0).toUpperCase() + product.unit.slice(1));

    // Cart key includes variant so single and case can coexist
    const cartKey = `${product._id}_${variant}`;
    const exists  = cart.find(c => c.cartKey === cartKey);

    if (exists) {
      setCart(cart.map(c => c.cartKey === cartKey
        ? { ...c, quantity: c.quantity + 1, lineTotal: (c.quantity + 1) * unitPrice }
        : c
      ));
    } else {
      setCart([...cart, {
        cartKey,
        productId:    product._id,
        productName:  product.size
          ? `${product.name} ${product.size} (${variantLabel})`
          : `${product.name} (${variantLabel})`,
        unitPrice,
        qtyDeduct,
        variant,
        quantity:  1,
        lineTotal: unitPrice,
      }]);
    }
    setSearch('');
  };

  const handleProductClick = (product) => {
    // If product has case/pack option, show picker
    if (product.caseQty && product.casePrice) {
      setVariantFor(product);
    } else {
      addToCart(product, 'single');
    }
  };

  const handleVariantSelect = (variant) => {
    addToCart(variantFor, variant);
    setVariantFor(null);
  };

  const updateQty = (cartKey, qty) => {
    if (qty < 1) return removeFromCart(cartKey);
    setCart(cart.map(c => c.cartKey === cartKey
      ? { ...c, quantity: qty, lineTotal: qty * c.unitPrice }
      : c
    ));
  };

  const removeFromCart = (cartKey) => {
    setCart(cart.filter(c => c.cartKey !== cartKey));
  };

  const subtotal = cart.reduce((sum, c) => sum + c.lineTotal, 0);
  const total    = subtotal - Number(discount);

  const handleCompleteSale = async () => {
    if (cart.length === 0) return alert('Cart is empty');
    if (total < 0) return alert('Discount cannot exceed subtotal');
    if (isCredit && !customerId) return alert('Please select a customer for credit sale');
    setLoading(true);
    try {
      // Build items — qtyDeduct tells backend how many stock units to deduct
      const items = cart.map(c => ({
        productId:   c.productId,
        productName: c.productName,
        quantity:    c.quantity,
        qtyDeduct:   c.qtyDeduct * c.quantity, // total stock units to deduct
        unitPrice:   c.unitPrice,
        lineTotal:   c.lineTotal,
      }));

      const res = await completeSale({
        items,
        discount:      Number(discount),
        paymentMethod: payment,
        isCredit,
        customerId:    isCredit ? customerId : null,
      });

      setReceipt({
        invoice:       res.data.invoiceNo,
        items:         [...cart],
        subtotal,
        discount:      Number(discount),
        total,
        paymentMethod: isCredit ? 'credit' : payment,
      });
      setCart([]);
      setDiscount(0);
      setSearch('');
      setIsCredit(false);
      setCustomerId('');
      setLastInvoice(res.data.invoiceNo);
    } catch (err) {
      alert('Error: ' + err.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: '100%' }}>

      {/* Variant picker popup */}
      {variantFor && (
        <VariantPicker
          product={variantFor}
          onSelect={handleVariantSelect}
          onClose={() => setVariantFor(null)}
        />
      )}

      {/* Left — product search */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '22px', marginTop: 0 }}>Point of Sale</h1>
        <input
          type="text"
          placeholder="Search product by name or SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '0.6rem 1rem', marginBottom: '1rem',
            border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {(search ? filtered : products).map(p => (
            <div key={p._id} onClick={() => handleProductClick(p)} style={{
              background: '#fff', border: '1px solid #eee', borderRadius: '8px',
              padding: '1rem', cursor: 'pointer', transition: 'border-color 0.2s',
              position: 'relative'
            }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#e94560'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#eee'}
            >
              {/* Case badge */}
              {p.caseQty && (
                <span style={{
                  position: 'absolute', top: '8px', right: '8px',
                  background: '#1a1a2e', color: '#fff',
                  fontSize: '10px', padding: '2px 6px', borderRadius: '20px'
                }}>
                  {['stick','pack'].includes(p.unit) ? 'Pack' : 'Case'} avail.
                </span>
              )}
              <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>{p.name}</div>
              {p.size && <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '2px' }}>{p.size}</div>}
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>{p.sku}</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#e94560' }}>Rs. {p.sellingPrice}</div>
              {p.casePrice && (
                <div style={{ fontSize: '11px', color: '#888' }}>
                  {['stick','pack'].includes(p.unit) ? 'Pack' : 'Case'}: Rs. {p.casePrice}
                </div>
              )}
              <div style={{ fontSize: '12px', color: p.stockQty <= p.lowStockThreshold ? '#e94560' : '#aaa', marginTop: '4px' }}>
                Stock: {p.stockQty}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — cart */}
      <div style={{ width: '320px', background: '#fff', borderRadius: '10px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '16px', marginTop: 0, marginBottom: '1rem' }}>Cart</h2>

        {lastInvoice && (
          <div style={{ background: '#e6f4ea', color: '#2d6a4f', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '13px' }}>
            Sale complete! Invoice: <strong>{lastInvoice}</strong>
          </div>
        )}

        {cart.length === 0 ? (
          <p style={{ color: '#aaa', fontSize: '14px' }}>No items in cart. Click a product to add.</p>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {cart.map(item => (
              <div key={item.cartKey} style={{ borderBottom: '1px solid #eee', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500, flex: 1, marginRight: '8px' }}>{item.productName}</span>
                  <button onClick={() => removeFromCart(item.cartKey)} style={{
                    background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: '16px', lineHeight: 1
                  }}>×</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => updateQty(item.cartKey, item.quantity - 1)} style={{
                      width: '24px', height: '24px', border: '1px solid #ddd', borderRadius: '4px',
                      background: '#fff', cursor: 'pointer', fontSize: '14px'
                    }}>−</button>
                    <span style={{ fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.cartKey, item.quantity + 1)} style={{
                      width: '24px', height: '24px', border: '1px solid #ddd', borderRadius: '4px',
                      background: '#fff', cursor: 'pointer', fontSize: '14px'
                    }}>+</button>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>Rs. {item.lineTotal}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Totals */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginTop: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '14px' }}>
            <span>Subtotal</span><span>Rs. {subtotal}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '14px' }}>
            <span>Discount</span>
            <input type="number" value={discount} onChange={e => setDiscount(e.target.value)}
              style={{ width: '80px', padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', textAlign: 'right' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '16px', fontWeight: 600 }}>
            <span>Total</span><span>Rs. {total}</span>
          </div>

          {/* Credit toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '0.75rem', padding: '0.6rem 0.75rem',
            background: isCredit ? '#fff5f7' : '#f9f9f9',
            border: `1px solid ${isCredit ? '#f5c0c8' : '#eee'}`,
            borderRadius: '6px'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: isCredit ? '#e94560' : '#555' }}>Credit sale</span>
            <div onClick={() => { setIsCredit(!isCredit); setCustomerId(''); }} style={{
              width: '36px', height: '20px', borderRadius: '20px', cursor: 'pointer',
              background: isCredit ? '#e94560' : '#ddd', position: 'relative', transition: 'background 0.2s'
            }}>
              <div style={{
                width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
                position: 'absolute', top: '3px', left: isCredit ? '19px' : '3px', transition: 'left 0.2s'
              }} />
            </div>
          </div>

          {isCredit && (
            <select value={customerId} onChange={e => setCustomerId(e.target.value)} style={{
              width: '100%', padding: '0.5rem', border: '1px solid #e94560',
              borderRadius: '6px', fontSize: '14px', marginBottom: '0.75rem', background: '#fff'
            }}>
              <option value="">— Select customer —</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.phone ? `· ${c.phone}` : ''} {c.balance > 0 ? `· owes Rs.${c.balance}` : ''}
                </option>
              ))}
            </select>
          )}

          {!isCredit && (
            <select value={payment} onChange={e => setPayment(e.target.value)} style={{
              width: '100%', padding: '0.5rem', border: '1px solid #ddd',
              borderRadius: '6px', fontSize: '14px', marginBottom: '0.75rem'
            }}>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="esewa">eSewa</option>
            </select>
          )}

          <button onClick={handleCompleteSale} disabled={loading || cart.length === 0} style={{
            width: '100%', background: isCredit ? '#b85c00' : '#e94560',
            color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px',
            cursor: 'pointer', fontSize: '15px', fontWeight: 500,
            opacity: cart.length === 0 ? 0.5 : 1
          }}>
            {loading ? 'Processing...' : isCredit ? 'Complete Credit Sale' : 'Complete Sale'}
          </button>
        </div>
      </div>

      {receipt && (
        <Receipt
          invoice={receipt.invoice}
          items={receipt.items}
          subtotal={receipt.subtotal}
          discount={receipt.discount}
          total={receipt.total}
          paymentMethod={receipt.paymentMethod}
          onClose={() => setReceipt(null)}
        />
      )}
    </div>
  );
}