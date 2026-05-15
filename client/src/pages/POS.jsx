import { useEffect, useState } from 'react';
import { getProducts } from '../api/productApi';
import { completeSale } from '../api/salesApi';
import { getCustomers } from '../api/customerApi';
import Receipt from '../components/Receipt';

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

  useEffect(() => {
    getProducts().then(res => setProducts(res.data));
    getCustomers().then(res => setCustomers(res.data));
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    const exists = cart.find(c => c.productId === product._id);
    if (exists) {
      setCart(cart.map(c => c.productId === product._id
        ? { ...c, quantity: c.quantity + 1, lineTotal: (c.quantity + 1) * c.unitPrice }
        : c
      ));
    } else {
      setCart([...cart, {
        productId: product._id,
        productName: product.name,
        unitPrice: product.sellingPrice,
        quantity: 1,
        lineTotal: product.sellingPrice,
      }]);
    }
    setSearch('');
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) return removeFromCart(productId);
    setCart(cart.map(c => c.productId === productId
      ? { ...c, quantity: qty, lineTotal: qty * c.unitPrice }
      : c
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(c => c.productId !== productId));
  };

  const subtotal = cart.reduce((sum, c) => sum + c.lineTotal, 0);
  const total = subtotal - Number(discount);

  const handleCompleteSale = async () => {
    if (cart.length === 0) return alert('Cart is empty');
    if (total < 0) return alert('Discount cannot exceed subtotal');
    if (isCredit && !customerId) return alert('Please select a customer for credit sale');
    setLoading(true);
    try {
      const res = await completeSale({
        items: cart,
        discount: Number(discount),
        paymentMethod: payment,
        isCredit,
        customerId: isCredit ? customerId : null,
      });
      setReceipt({
        invoice: res.data.invoiceNo,
        items: [...cart],
        subtotal,
        discount: Number(discount),
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
            <div key={p._id} onClick={() => addToCart(p)} style={{
              background: '#fff', border: '1px solid #eee', borderRadius: '8px',
              padding: '1rem', cursor: 'pointer', transition: 'border-color 0.2s'
            }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#e94560'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#eee'}
            >
              <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>{p.name}</div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>{p.sku}</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#e94560' }}>Rs. {p.sellingPrice}</div>
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
              <div key={item.productId} style={{ borderBottom: '1px solid #eee', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.productName}</span>
                  <button onClick={() => removeFromCart(item.productId)} style={{
                    background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: '16px', lineHeight: 1
                  }}>×</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)} style={{
                      width: '24px', height: '24px', border: '1px solid #ddd', borderRadius: '4px',
                      background: '#fff', cursor: 'pointer', fontSize: '14px'
                    }}>−</button>
                    <span style={{ fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.quantity + 1)} style={{
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

          {/* Credit sale toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '0.75rem', padding: '0.6rem 0.75rem',
            background: isCredit ? '#fff5f7' : '#f9f9f9',
            border: `1px solid ${isCredit ? '#f5c0c8' : '#eee'}`,
            borderRadius: '6px'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: isCredit ? '#e94560' : '#555' }}>
              Credit sale
            </span>
            <div
              onClick={() => { setIsCredit(!isCredit); setCustomerId(''); }}
              style={{
                width: '36px', height: '20px', borderRadius: '20px', cursor: 'pointer',
                background: isCredit ? '#e94560' : '#ddd',
                position: 'relative', transition: 'background 0.2s'
              }}
            >
              <div style={{
                width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
                position: 'absolute', top: '3px',
                left: isCredit ? '19px' : '3px',
                transition: 'left 0.2s'
              }} />
            </div>
          </div>

          {/* Customer selector — only shown when credit is on */}
          {isCredit && (
            <select
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              style={{
                width: '100%', padding: '0.5rem', border: '1px solid #e94560',
                borderRadius: '6px', fontSize: '14px', marginBottom: '0.75rem',
                background: '#fff', color: '#333'
              }}
            >
              <option value="">— Select customer —</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.phone ? `· ${c.phone}` : ''} {c.balance > 0 ? `· owes Rs.${c.balance}` : ''}
                </option>
              ))}
            </select>
          )}

          {/* Payment method — hidden when credit */}
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
            width: '100%',
            background: isCredit ? '#b85c00' : '#e94560',
            color: '#fff', border: 'none',
            padding: '0.75rem', borderRadius: '6px', cursor: 'pointer',
            fontSize: '15px', fontWeight: 500,
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