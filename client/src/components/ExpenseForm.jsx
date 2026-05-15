import { useState } from 'react';

const empty = {
  title: '', amount: '', category: 'other',
  paidTo: '', note: '', date: new Date().toISOString().slice(0, 10)
};

const CATEGORIES = [
  { value: 'rent',        label: 'Rent' },
  { value: 'utilities',   label: 'Utilities' },
  { value: 'supplies',    label: 'Supplies' },
  { value: 'salary',      label: 'Salary' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other',       label: 'Other' },
];

export default function ExpenseForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? {
    ...initial,
    date: initial.date ? new Date(initial.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  } : empty);
  const [error, setError] = useState('');

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.amount || form.amount <= 0) { setError('Amount must be greater than 0.'); return; }
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
      <div style={{
        background: '#fff', borderRadius: '10px', padding: '2rem',
        width: '440px', maxHeight: '85vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>{initial ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>×</button>
        </div>

        {error && (
          <div style={{ background: '#fce8e8', color: '#c0392b', padding: '0.6rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Title *</label>
            <input name="title" value={form.title} onChange={handle} style={inputStyle} placeholder="e.g. Monthly rent" />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Amount (Rs.) *</label>
            <input name="amount" type="number" value={form.amount} onChange={handle} style={inputStyle} placeholder="0" />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Category</label>
            <select name="category" value={form.category} onChange={handle} style={{ ...inputStyle, background: '#fff' }}>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Paid to</label>
            <input name="paidTo" value={form.paidTo} onChange={handle} style={inputStyle} placeholder="e.g. Landlord name" />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Date</label>
            <input name="date" type="date" value={form.date} onChange={handle} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Note</label>
            <textarea name="note" value={form.note} onChange={handle} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Optional note" />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" style={{
              flex: 1, background: '#e94560', color: '#fff', border: 'none',
              padding: '0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
            }}>
              {initial ? 'Update' : 'Add Expense'}
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