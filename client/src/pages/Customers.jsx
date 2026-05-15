import { useEffect, useState } from 'react';
import {
  getCustomers, createCustomer, updateCustomer, deleteCustomer,
  getCustomerTransactions, addCustomerTransaction
} from '../api/customerApi';
import CustomerForm from '../components/CustomerForm';
import TransactionModal from '../components/TransactionModal';

export default function Customers() {
  const [customers, setCustomers]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editing, setEditing]           = useState(null);
  const [selected, setSelected]         = useState(null); // customer whose history is open
  const [transactions, setTransactions] = useState([]);
  const [showTxn, setShowTxn]           = useState(false); // transaction modal
  const [txnTarget, setTxnTarget]       = useState(null);  // customer to add txn to

  const fetchCustomers = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateCustomer(editing._id, data);
      } else {
        await createCustomer(data);
      }
      setShowForm(false);
      setEditing(null);
      fetchCustomers();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await deleteCustomer(id);
      fetchCustomers();
      if (selected?._id === id) setSelected(null);
    } catch (err) {
      alert('Error deleting customer.');
    }
  };

  const openHistory = async (customer) => {
    setSelected(customer);
    try {
      const res = await getCustomerTransactions(customer._id);
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTransaction = async (data) => {
    try {
      await addCustomerTransaction(txnTarget._id, data);
      setShowTxn(false);
      setTxnTarget(null);
      fetchCustomers();
      if (selected?._id === txnTarget._id) {
        const res = await getCustomerTransactions(txnTarget._id);
        setTransactions(res.data);
        // Update selected balance
        const updated = await getCustomers();
        setCustomers(updated.data);
        const updatedCustomer = updated.data.find(c => c._id === txnTarget._id);
        if (updatedCustomer) setSelected(updatedCustomer);
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const totalOutstanding = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#1a1a2e' }}>Customers</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          style={{
            background: '#e94560', color: '#fff', border: 'none',
            padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer',
            fontSize: '14px', fontWeight: 500
          }}
        >
          + Add Customer
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '1rem 1.5rem', flex: 1 }}>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Total customers</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a2e' }}>{customers.length}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '1rem 1.5rem', flex: 1 }}>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Total outstanding credit</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#e94560' }}>Rs. {totalOutstanding.toLocaleString()}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '1rem 1.5rem', flex: 1 }}>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Customers with balance</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a2e' }}>
            {customers.filter(c => c.balance > 0).length}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Customer table */}
        <div style={{ flex: selected ? 1 : 2 }}>
          {loading ? (
            <p style={{ color: '#888' }}>Loading...</p>
          ) : customers.length === 0 ? (
            <div style={{
              background: '#fff', borderRadius: '10px', padding: '4rem',
              textAlign: 'center', color: '#aaa', border: '1px dashed #ddd'
            }}>
              No customers yet. Click <strong>+ Add Customer</strong> to register one.
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#1a1a2e', color: '#fff' }}>
                  <tr>
                    {['Name', 'Phone', 'Balance', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '13px', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr
                      key={c._id}
                      style={{
                        background: selected?._id === c._id ? '#fff5f7' : i % 2 === 0 ? '#fff' : '#fafafa',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer'
                      }}
                      onClick={() => openHistory(c)}
                    >
                      <td style={{ padding: '0.75rem 1rem', fontSize: '14px', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '30px', height: '30px', borderRadius: '50%',
                            background: '#1a1a2e', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 600, flexShrink: 0
                          }}>
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                          {c.name}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '13px', color: '#666' }}>{c.phone || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          fontWeight: 600, fontSize: '14px',
                          color: c.balance > 0 ? '#e94560' : '#2d6a4f'
                        }}>
                          Rs. {c.balance?.toLocaleString() ?? 0}
                        </span>
                        {c.balance > 0 && (
                          <span style={{ fontSize: '11px', color: '#e94560', marginLeft: '6px' }}>owes</span>
                        )}
                        {c.balance <= 0 && (
                          <span style={{ fontSize: '11px', color: '#2d6a4f', marginLeft: '6px' }}>clear</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => { setTxnTarget(c); setShowTxn(true); }}
                          style={{
                            marginRight: '6px', padding: '4px 10px', fontSize: '12px',
                            border: '1px solid #e94560', borderRadius: '4px',
                            cursor: 'pointer', background: '#fff', color: '#e94560', fontWeight: 500
                          }}
                        >
                          + Txn
                        </button>
                        <button
                          onClick={() => { setEditing(c); setShowForm(true); }}
                          style={{
                            marginRight: '6px', padding: '4px 10px', fontSize: '12px',
                            border: '1px solid #ddd', borderRadius: '4px',
                            cursor: 'pointer', background: '#fff', color: '#333', fontWeight: 500
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
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
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888' }}
              >×</button>
            </div>

            {/* Balance summary */}
            <div style={{
              background: selected.balance > 0 ? '#fff5f7' : '#f0faf4',
              border: `1px solid ${selected.balance > 0 ? '#f5c0c8' : '#b7dfca'}`,
              borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '12px', color: '#888' }}>Outstanding balance</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: selected.balance > 0 ? '#e94560' : '#2d6a4f' }}>
                Rs. {selected.balance?.toLocaleString() ?? 0}
              </div>
              {selected.balance > 0 && <div style={{ fontSize: '11px', color: '#e94560' }}>Customer owes this amount</div>}
              {selected.balance <= 0 && <div style={{ fontSize: '11px', color: '#2d6a4f' }}>Account is clear</div>}
            </div>

            <button
              onClick={() => { setTxnTarget(selected); setShowTxn(true); }}
              style={{
                width: '100%', padding: '0.6rem', background: '#e94560', color: '#fff',
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
                fontWeight: 500, marginBottom: '1rem'
              }}
            >
              + Add Transaction
            </button>

            {/* Transaction list */}
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
                        background: t.type === 'credit' ? '#fce8e8' : '#e6f4ea',
                        color: t.type === 'credit' ? '#c0392b' : '#2d6a4f'
                      }}>
                        {t.type === 'credit' ? 'Credit' : 'Payment'}
                      </span>
                      <div style={{ fontSize: '11px', color: '#aaa' }}>
                        {new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      {t.note && <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{t.note}</div>}
                    </div>
                    <div style={{
                      fontWeight: 600, fontSize: '14px',
                      color: t.type === 'credit' ? '#e94560' : '#2d6a4f'
                    }}>
                      {t.type === 'credit' ? '+' : '-'} Rs. {t.amount?.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <CustomerForm
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {showTxn && txnTarget && (
        <TransactionModal
          entity={txnTarget}
          entityType="customer"
          onSave={handleAddTransaction}
          onClose={() => { setShowTxn(false); setTxnTarget(null); }}
        />
      )}
    </div>
  );
}