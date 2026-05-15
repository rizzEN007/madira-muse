import { useState, useEffect } from 'react';
import { getCategories } from '../api/categoryApi';

const empty = {
  name: '', sku: '', category: '', unit: 'bottle',
  bottleSizeMl: '', costPrice: '', sellingPrice: '',
  stockQty: '', lowStockThreshold: 5, expiryDate: ''
};

export default function ProductForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? {
    ...initial,
    category: initial.category?._id || initial.category || ''
  } : empty);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const field = (label, name, type = 'text') => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>{label}</label>
      <input
        type={type} name={name} value={form[name] ?? ''} onChange={handle}
        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
      />
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#fff', borderRadius: '10px', padding: '2rem',
        width: '480px', maxHeight: '85vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>{initial ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>×</button>
        </div>
        <form onSubmit={submit}>
          {field('Product name *', 'name')}
          {field('SKU *', 'sku')}

          {/* Category dropdown */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handle}
              style={{
                width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd',
                borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box',
                background: '#fff', color: '#333'
              }}
            >
              <option value="">— Select category —</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {field('Unit (bottle / can / pack)', 'unit')}
          {field('Bottle size (ml)', 'bottleSizeMl', 'number')}
          {field('Cost price (Rs.) *', 'costPrice', 'number')}
          {field('Selling price (Rs.) *', 'sellingPrice', 'number')}
          {field('Stock quantity', 'stockQty', 'number')}
          {field('Low stock threshold', 'lowStockThreshold', 'number')}
          {field('Expiry date', 'expiryDate', 'date')}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" style={{
              flex: 1, background: '#e94560', color: '#fff', border: 'none',
              padding: '0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
            }}>
              {initial ? 'Update' : 'Add Product'}
            </button>
            <button type="button" onClick={onClose} style={{
              flex: 1, background: '#fff', border: '1px solid #ddd',
              padding: '0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
            }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}