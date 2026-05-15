import { useEffect, useState } from 'react';
import {
  getSuppliers, createSupplier, updateSupplier, deleteSupplier,
  getSupplierTransactions, addSupplierTransaction
} from '../api/supplierApi';
import SupplierForm from '../components/SupplierForm';
import TransactionModal from '../components/TransactionModal';

export default function Suppliers() {
  const [suppliers, setSuppliers]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editing, setEditing]           = useState(null);
  const [selected, setSelected]         = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showTxn, setShowTxn]           = useState(false);
  const [txnTarget, setTxnTarget]       = useState(null);

  const fetchSuppliers = async () => {
    try {
      const res = await getSuppliers();
      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateSupplier(editing._id, data);
      } else {
        await createSupplier(data);
      }
      setShowForm(false);
      setEditing(null);
      fetchSuppliers();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    try {
      await deleteSupplier(id);
      fetchSuppliers();
      if (selected?._id === id) setSelected(null);
    } catch (err) {
      alert('Error deleting supplier.');
    }
  };

  const openHistory = async (supplier) => {
    setSelected(supplier);
    try {
      const res = await getSupplierTransactions(supplier._id);
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTransaction = async (data) => {
    try {
      await addSupplierTransaction(txnTarget._id, data);
      setShowTxn(false);
      setTxnTarget(null);
      const updated = await getSuppliers();
      setSuppliers(updated.data);
      if (selected?._id === txnTarget._id) {
        const res = await getSupplierTransactions(txnTarget._id);
        setTransactions(res.data);
        const updatedSupplier = updated.data.find(s => s._id === txnTarget._id);
        if (updatedSupplier) setSelected(updatedSupplier);
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const totalDebt = suppliers.reduce((sum, s) => sum + (s.balance > 0 ? s.balance : 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#1a1a2e' }}>Suppliers</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          style={{
            background: '#e94560', color: '#fff', border: 'none',
            padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer',
            fontSize: '14px', fontWeight: 500
          }}
        >
          + Add Supplier
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '1rem 1.5rem', flex: 1 }}>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Total suppliers</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a2e' }}>{suppliers.length}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '1rem 1.5rem', flex: 1 }}>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Total debt outstanding</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#e94560' }}>Rs. {totalDebt.toLocaleString()}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '1rem 1.5rem', flex: 1 }}>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Suppliers with balance</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a2e' }}>
            {suppliers.filter(s => s.balance > 0).length}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Supplier table */}
        <div style={{ flex: selected ? 1 : 2 }}>
          {loading ? (
            <p style={{ color: '#888' }}>Loading...</p>
          ) : suppliers.length === 0 ? (
            <div style={{
              background: '#fff', borderRadius: '10px', padding: '4rem',
              textAlign: 'center', color: '#aaa', border: '1px dashed #ddd'
            }}>
              No suppliers yet. Click <strong>+ Add Supplier</strong> to register one.
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#1a1a2e', color: '#fff' }}>
                  <tr>
                    {['Name', 'Phone', 'Address', 'Balance', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '13px', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s, i) => (
                    <tr
                      key={s._id}
                      style={{
                        background: selected?._id === s._id ? '#fff5f7' : i % 2 === 0 ? '#fff' : '#fafafa',
                        borderBottom: '1px solid #eee', cursor: 'pointer'
                      }}
                      onClick={() => openHistory(s)}
                    >
                      <td style={{ padding: '0.75rem 1rem', fontSize: '14px', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '30px', height: '30px', borderRadius: '50%',
                            background: '#1a1a2e', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 600, flexShrink: 0
                          }}>
                            {s.name.charAt(0).toUpperCase()}
                          </span>
                          {s.name}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '13px', color: '#666' }}>{s.phone || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '13px', color: '#666' }}>{s.address || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: s.balance > 0 ? '#e94560' : '#2d6a4f' }}>
                          Rs. {s.balance?.toLocaleString() ?? 0}
                        </span>
                        {s.balance > 0 && <span style={{ fontSize: '11px', color: '#e94560', marginLeft: '6px' }}>owed</span>}
                        {s.balance <= 0 && <span style={{ fontSize: '11px', color: '#2d6a4f', marginLeft: '6px' }}>clear</span>}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => { setTxnTarget(s); setShowTxn(true); }}
                          style={{
                            marginRight: '6px', padding: '4px 10px', fontSize: '12px',
                            border: '1px solid #e94560', borderRadius: '4px',
                            cursor: 'pointer', background: '#fff', color: '#e94560', fontWeight: 500
                          }}
                        >
                          + Txn
                        </button>
                        <button
                          onClick={() => { setEditing(s); setShowForm(true); }}
                          style={{
                            marginRight: '6px', padding: '4px 10px', fontSize: '12px',
                            border: '1px solid #ddd', borderRadius: '4px',
                            cursor: 'pointer', background: '#fff', color: '#333', fontWeight: 500
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s._id)}
                          style={{
                            padding: '4px 10px', fontSize: '12px',
                            border: '1px solid #ddd', borderRadius: '4px',
                            cursor: 'pointer', background: '#fff', color: '#999', fontWeight: 500
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transaction history panel */}
        {selected && (
          <div style={{ width: '340px', background: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600 }}>{selected.name}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{selected.phone || 'No phone'}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888' }}>×</button>
            </div>

            <div style={{
              background: selected.balance > 0 ? '#fff5f7' : '#f0faf4',
              border: `1px solid ${selected.balance > 0 ? '#f5c0c8' : '#b7dfca'}`,
              borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '12px', color: '#888' }}>Outstanding debt</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: selected.balance > 0 ? '#e94560' : '#2d6a4f' }}>
                Rs. {selected.balance?.toLocaleString() ?? 0}
              </div>
              {selected.balance > 0 && <div style={{ fontSize: '11px', color: '#e94560' }}>You owe this amount</div>}
              {selected.balance <= 0 && <div style={{ fontSize: '11px', color: '#2d6a4f' }}>Account is clear</div>}
            </div>

            <button
              onClick={() => { setTxnTarget(selected); setShowTxn(true); }}
              style={{
                width: '100%', padding: '0.6rem', background: '#e94560', color: '#fff',
                border: 'none', borderRadius: '6px', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500, marginBottom: '1rem'
              }}
            >
              + Add Transaction
            </button>

            <div style={{ fontSize: '13px', fontWeight: 500, color: '#555', marginBottom: '0.5rem' }}>
              History ({transactions.length})
            </div>
            {transactions.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#aaa' }}>No transactions yet.</p>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {transactions.map(t => (
                  <div key={t._id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    padding: '0.6rem 0', borderBottom: '1px solid #f0f0f0'
                  }}>
                    <div>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: 500, marginBottom: '2px',
                        background: t.type === 'debt' ? '#fce8e8' : '#e6f4ea',
                        color: t.type === 'debt' ? '#c0392b' : '#2d6a4f'
                      }}>
                        {t.type === 'debt' ? 'Debt' : 'Payment'}
                      </span>
                      <div style={{ fontSize: '11px', color: '#aaa' }}>
                        {new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      {t.note && <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{t.note}</div>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: t.type === 'debt' ? '#e94560' : '#2d6a4f' }}>
                      {t.type === 'debt' ? '+' : '-'} Rs. {t.amount?.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <SupplierForm
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {showTxn && txnTarget && (
        <TransactionModal
          entity={txnTarget}
          entityType="supplier"
          onSave={handleAddTransaction}
          onClose={() => { setShowTxn(false); setTxnTarget(null); }}
        />
      )}
    </div>
  );
}