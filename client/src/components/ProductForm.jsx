import { useState, useEffect } from 'react';
import { getCategories } from '../api/categoryApi';

const empty = {
  name: '', sku: '', category: '', unit: 'bottle',
  size: '', bottleSizeMl: '', costPrice: '', sellingPrice: '',
  caseQty: '', casePrice: '',
  stockQty: '', lowStockThreshold: 5, expiryDate: ''
};

export default function ProductForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? {
    ...initial,
    category: initial.category?._id || initial.category || '',
    caseQty: initial.caseQty ?? '',
    casePrice: initial.casePrice ?? '',
    size: initial.size ?? '',
  } : empty);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then(res => setCategories(res.data)).catch(console.error);
  }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      caseQty:   form.caseQty   ? Number(form.caseQty)   : null,
      casePrice: form.casePrice ? Number(form.casePrice) : null,
    };
    onSave(data);
  };

  const inputStyle = {
    width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd',
    borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box'
  };

  const field = (label, name, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>{label}</label>
      <input
        type={type} name={name} value={form[name] ?? ''} onChange={handle}
        placeholder={placeholder} style={inputStyle}
      />
    </div>
  );

  const hasCaseFields = !!form.caseQty;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#fff', borderRadius: '10px', padding: '2rem',
        width: '500px', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>{initial ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>×</button>
        </div>

        <form onSubmit={submit}>
          {field('Product name *', 'name')}
          {field('SKU *', 'sku')}

          {/* Category */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Category</label>
            <select name="category" value={form.category} onChange={handle} style={{ ...inputStyle, background: '#fff' }}>
              <option value="">— Select category —</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Unit & Size */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Unit</label>
              <select name="unit" value={form.unit} onChange={handle} style={{ ...inputStyle, background: '#fff' }}>
                <option value="bottle">Bottle</option>
                <option value="can">Can</option>
                <option value="pack">Pack</option>
                <option value="stick">Stick</option>
                <option value="packet">Packet</option>
                <option value="piece">Piece</option>
              </select>
            </div>
            <div style={{ flex: 1, marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Size (e.g. 330ml, 500ml)</label>
              <input name="size" value={form.size} onChange={handle} placeholder="optional" style={inputStyle} />
            </div>
          </div>

          {/* Prices */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Cost price (Rs.) *</label>
              <input type="number" name="costPrice" value={form.costPrice} onChange={handle} style={inputStyle} />
            </div>
            <div style={{ flex: 1, marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Selling price (Rs.) *</label>
              <input type="number" name="sellingPrice" value={form.sellingPrice} onChange={handle} style={inputStyle} />
            </div>
          </div>

          {/* Case / Pack section */}
          <div style={{
            background: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px',
            padding: '1rem', marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#555', marginBottom: '0.75rem' }}>
              Case / Pack selling <span style={{ fontWeight: 400, color: '#aaa' }}>(optional — enables bulk selling at POS)</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>
                  Units per case/pack
                </label>
                <input
                  type="number" name="caseQty" value={form.caseQty} onChange={handle}
                  placeholder="e.g. 24 for beer case, 20 for cig pack"
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>
                  Case/pack price (Rs.)
                </label>
                <input
                  type="number" name="casePrice" value={form.casePrice} onChange={handle}
                  placeholder="selling price for whole case"
                  style={{ ...inputStyle, borderColor: hasCaseFields && !form.casePrice ? '#e94560' : '#ddd' }}
                />
                {hasCaseFields && !form.casePrice && (
                  <div style={{ fontSize: '11px', color: '#e94560', marginTop: '3px' }}>Required if case qty is set</div>
                )}
              </div>
            </div>
          </div>

          {/* Stock */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Stock quantity</label>
              <input type="number" name="stockQty" value={form.stockQty} onChange={handle} style={inputStyle} />
            </div>
            <div style={{ flex: 1, marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Low stock threshold</label>
              <input type="number" name="lowStockThreshold" value={form.lowStockThreshold} onChange={handle} style={inputStyle} />
            </div>
          </div>

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