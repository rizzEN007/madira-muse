import { useState } from 'react';

const empty = { name: '', description: '' };

export default function CategoryForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || empty);
  const [error, setError] = useState('');

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Category name is required.'); return; }
    setError('');
    onSave(form);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#fff', borderRadius: '10px', padding: '2rem',
        width: '420px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>{initial ? 'Edit Category' : 'Add Category'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>×</button>
        </div>

        {error && (
          <div style={{ background: '#fce8e8', color: '#c0392b', padding: '0.6rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Category name *</label>
            <input
              name="name" value={form.name} onChange={handle}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Description</label>
            <textarea
              name="description" value={form.description} onChange={handle} rows={3}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" style={{
              flex: 1, background: '#e94560', color: '#fff', border: 'none',
              padding: '0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
            }}>
              {initial ? 'Update' : 'Add Category'}
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