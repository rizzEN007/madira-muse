import { useEffect, useState } from 'react';
import { getMovements, addMovement } from '../api/stockApi';
import { getProducts } from '../api/productApi';
import { getSuppliers } from '../api/supplierApi';

const typeColors = {
  purchase:   { bg: '#e6f4ea', color: '#2d6a4f' },
  adjustment: { bg: '#e8f0fe', color: '#1a56db' },
  sale:       { bg: '#fce8e8', color: '#c0392b' },
  return:     { bg: '#fff8e1', color: '#b45309' },
};

const inputStyle = {
  width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd',
  borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box'
};

export default function Stock() {
  const [movements, setMovements]         = useState([]);
  const [products, setProducts]           = useState([]);
  const [suppliers, setSuppliers]         = useState([]);
  const [showForm, setShowForm]           = useState(false);
  const [filterProduct, setFilterProduct] = useState('');
  const [isCredit, setIsCredit]           = useState(false);
  const [form, setForm] = useState({
    productId: '', movementType: 'purchase', quantity: '',
    unitCost: '', note: '', supplierId: ''
  });

  const fetchMovements = async () => {
    const res = await getMovements(filterProduct || null);
    setMovements(res.data);
  };

  useEffect(() => {
    getProducts().then(res => setProducts(res.data));
    getSuppliers().then(res => setSuppliers(res.data));
  }, []);

  useEffect(() => { fetchMovements(); }, [filterProduct]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.quantity) return alert('Product and quantity are required');
    if (isCredit && !form.supplierId) return alert('Please select a supplier for credit restock');
    if (isCredit && !form.unitCost) return alert('Unit cost is required for credit restock to calculate debt');
    try {
      await addMovement({ ...form, isCredit, supplierId: isCredit ? form.supplierId : null });
      setShowForm(false);
      setIsCredit(false);
      setForm({ productId: '', movementType: 'purchase', quantity: '', unitCost: '', note: '', supplierId: '' });
      fetchMovements();
    } catch (err) {
      alert('Error: ' + err.response?.data?.error);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setIsCredit(false);
    setForm({ productId: '', movementType: 'purchase', quantity: '', unitCost: '', note: '', supplierId: '' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '22px' }}>Stock movements</h1>
        <button onClick={() => setShowForm(true)} style={{
          background: '#e94560', color: '#fff', border: 'none',
          padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
        }}>
          + Restock / Adjust
        </button>
      </div>

      {/* Filter by product */}
      <select
        value={filterProduct}
        onChange={e => setFilterProduct(e.target.value)}
        style={{
          padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '6px',
          fontSize: '14px', marginBottom: '1rem', minWidth: '220px'
        }}
      >
        <option value="">All products</option>
        {products.map(p => (
          <option key={p._id} value={p._id}>{p.name}</option>
        ))}
      </select>

      {/* Movements table */}
      <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#1a1a2e', color: '#fff' }}>
            <tr>
              {['Date', 'Product', 'Type', 'Qty', 'Unit cost', 'Supplier', 'Credit', 'Note'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '13px', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No movements recorded yet</td></tr>
            ) : movements.map((m, i) => (
              <tr key={m._id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem 1rem', fontSize: '12px', color: '#888' }}>
                  {new Date(m.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '14px' }}>{m.productName}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{
                    background: typeColors[m.movementType]?.bg,
                    color: typeColors[m.movementType]?.color,
                    padding: '2px 10px', borderRadius: '20px', fontSize: '12px', textTransform: 'capitalize'
                  }}>
                    {m.movementType}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '14px', fontWeight: 500 }}>
                  {m.movementType === 'sale' ? `-${m.quantity}` : `+${m.quantity}`}
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '13px', color: '#666' }}>
                  {m.unitCost ? `Rs. ${m.unitCost}` : '—'}
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '13px', color: '#666' }}>
                  {m.supplier?.name || '—'}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {m.isCredit ? (
                    <span style={{ background: '#fce8e8', color: '#c0392b', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 500 }}>
                      Credit
                    </span>
                  ) : '—'}
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '13px', color: '#666' }}>{m.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Restock modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: '10px', padding: '2rem', width: '440px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>Restock / Adjust stock</h2>
              <button onClick={closeForm} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>

              {/* Product */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Product *</label>
                <select name="productId" value={form.productId} onChange={handle} required style={inputStyle}>
                  <option value="">Select product</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name} (stock: {p.stockQty})</option>)}
                </select>
              </div>

              {/* Movement type */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Movement type *</label>
                <select name="movementType" value={form.movementType} onChange={handle} style={inputStyle}>
                  <option value="purchase">Purchase (restock)</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="return">Return</option>
                </select>
              </div>

              {/* Quantity */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Quantity *</label>
                <input type="number" name="quantity" value={form.quantity} onChange={handle} style={inputStyle} />
              </div>

              {/* Unit cost */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>
                  Unit cost (Rs.) {isCredit && <span style={{ color: '#e94560' }}>*</span>}
                </label>
                <input type="number" name="unitCost" value={form.unitCost} onChange={handle} style={inputStyle} />
              </div>

              {/* Supplier dropdown */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>
                  Supplier {isCredit && <span style={{ color: '#e94560' }}>*</span>}
                </label>
                <select name="supplierId" value={form.supplierId} onChange={handle} style={inputStyle}>
                  <option value="">— Select supplier (optional) —</option>
                  {suppliers.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.phone ? `· ${s.phone}` : ''} {s.balance > 0 ? `· owes Rs.${s.balance}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Credit restock toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '1rem', padding: '0.6rem 0.75rem',
                background: isCredit ? '#fff5f7' : '#f9f9f9',
                border: `1px solid ${isCredit ? '#f5c0c8' : '#eee'}`,
                borderRadius: '6px'
              }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: isCredit ? '#e94560' : '#555' }}>
                    Credit restock
                  </span>
                  <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                    Stock received but not yet paid
                  </div>
                </div>
                <div
                  onClick={() => setIsCredit(!isCredit)}
                  style={{
                    width: '36px', height: '20px', borderRadius: '20px', cursor: 'pointer',
                    background: isCredit ? '#e94560' : '#ddd',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0
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

              {/* Credit info box */}
              {isCredit && (
                <div style={{
                  background: '#fff8f0', border: '1px solid #ffd6a5', borderRadius: '6px',
                  padding: '0.6rem 0.75rem', marginBottom: '1rem', fontSize: '12px', color: '#b45309'
                }}>
                  Debt of Rs. {(Number(form.quantity || 0) * Number(form.unitCost || 0)).toLocaleString()} will be added to the selected supplier's balance.
                </div>
              )}

              {/* Note */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Note</label>
                <input type="text" name="note" value={form.note} onChange={handle} style={inputStyle} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" style={{
                  flex: 1, background: '#e94560', color: '#fff', border: 'none',
                  padding: '0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
                }}>
                  Save movement
                </button>
                <button type="button" onClick={closeForm} style={{
                  flex: 1, background: '#fff', border: '1px solid #ddd',
                  padding: '0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}