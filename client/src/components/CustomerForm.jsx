import { useState } from 'react';

const empty = { name: '', phone: '', note: '' };

export default function CustomerForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || empty);
  const [error, setError] = useState('');

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setError('');
    onSave(form);
  };

  const inputStyle = {
    width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd',
    borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box'
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', borderRadius: '10px', padding: '2rem', width: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>{initial ? 'Edit Customer' : 'Add Customer'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>×</button>
        </div>

        {error && (
          <div style={{ background: '#fce8e8', color: '#c0392b', padding: '0.6rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Name *</label>
            <input name="name" value={form.name} onChange={handle} style={inputStyle} placeholder="Customer name" />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Phone</label>
            <input name="phone" value={form.phone} onChange={handle} style={inputStyle} placeholder="98XXXXXXXX" />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Note</label>
            <textarea name="note" value={form.note} onChange={handle} rows={2}
              style={{ ...inputStyle, resize: 'vertical' }} placeholder="Optional note" />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" style={{
              flex: 1, background: '#e94560', color: '#fff', border: 'none',
              padding: '0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
            }}>
              {initial ? 'Update' : 'Add Customer'}
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