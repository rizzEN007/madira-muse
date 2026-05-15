import { useState } from 'react';

export default function TransactionModal({ entity, entityType, onSave, onClose }) {
  // entityType: 'customer' or 'supplier'
  // entity: the customer or supplier object

  const isCustomer = entityType === 'customer';
  const creditLabel = isCustomer ? 'Credit (gave items)' : 'Debt (received stock)';
  const paymentLabel = isCustomer ? 'Payment received' : 'Payment made';
  const typeCredit = isCustomer ? 'credit' : 'debt';

  const [type, setType]     = useState(typeCredit);
  const [amount, setAmount] = useState('');
  const [note, setNote]     = useState('');
  const [error, setError]   = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) { setError('Amount must be greater than 0.'); return; }
    setError('');
    onSave({ type, amount: Number(amount), note });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
    }}>
      <div style={{ background: '#fff', borderRadius: '10px', padding: '2rem', width: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Add Transaction</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>×</button>
        </div>

        <p style={{ fontSize: '13px', color: '#888', marginBottom: '1.25rem' }}>
          {isCustomer ? 'Customer' : 'Supplier'}: <strong>{entity.name}</strong>
          {' · '}Current balance:
          <strong style={{ color: entity.balance > 0 ? '#e94560' : '#2d6a4f' }}>
            {' '}Rs. {entity.balance?.toLocaleString() ?? 0}
          </strong>
        </p>

        {error && (
          <div style={{ background: '#fce8e8', color: '#c0392b', padding: '0.6rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          {/* Type selector */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#555' }}>Transaction type</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setType(typeCredit)}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: '6px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 500,
                  background: type === typeCredit ? '#fce8e8' : '#f5f5f5',
                  color: type === typeCredit ? '#e94560' : '#555',
                  border: type === typeCredit ? '1px solid #e94560' : '1px solid #eee'
                }}
              >
                {creditLabel}
              </button>
              <button
                type="button"
                onClick={() => setType('payment')}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: '6px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 500,
                  background: type === 'payment' ? '#e6f4ea' : '#f5f5f5',
                  color: type === 'payment' ? '#2d6a4f' : '#555',
                  border: type === 'payment' ? '1px solid #2d6a4f' : '1px solid #eee'
                }}
              >
                {paymentLabel}
              </button>
            </div>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>
              Amount (Rs.) *
            </label>
            <input
              type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0"
              style={{
                width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd',
                borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Note */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>Note</label>
            <input
              type="text" value={note} onChange={e => setNote(e.target.value)}
              placeholder="Optional note"
              style={{
                width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd',
                borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{
              flex: 1, background: '#e94560', color: '#fff', border: 'none',
              padding: '0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
            }}>
              Save
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