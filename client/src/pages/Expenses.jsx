import { useEffect, useState } from 'react';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../api/expenseApi';
import ExpenseForm from '../components/ExpenseForm';

const CATEGORY_COLORS = {
  rent:        { bg: '#e8f4fd', color: '#1a6fa8' },
  utilities:   { bg: '#e8f8f0', color: '#1a7a4a' },
  supplies:    { bg: '#fef9e7', color: '#9a7d0a' },
  salary:      { bg: '#f4ecf7', color: '#7d3c98' },
  maintenance: { bg: '#fdebd0', color: '#a04000' },
  other:       { bg: '#f2f3f4', color: '#566573' },
};

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [from, setFrom]         = useState('');
  const [to, setTo]             = useState('');

  const fetchExpenses = async () => {
    try {
      const res = await getExpenses(from || undefined, to || undefined);
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateExpense(editing._id, data);
      } else {
        await createExpense(data);
      }
      setShowForm(false);
      setEditing(null);
      fetchExpenses();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      fetchExpenses();
    } catch (err) {
      alert('Error deleting expense.');
    }
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#1a1a2e' }}>Expenses</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          style={{
            background: '#e94560', color: '#fff', border: 'none',
            padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 500
          }}
        >
          + Add Expense
        </button>
      </div>

      {/* Filter bar */}
      <div style={{
        background: '#fff', borderRadius: '10px', padding: '0.85rem 1.25rem',
        marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '13px', color: '#888' }}>Filter by date:</span>
        <input
          type="date" value={from} onChange={e => setFrom(e.target.value)}
          style={{ padding: '4px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }}
        />
        <span style={{ fontSize: '13px', color: '#888' }}>to</span>
        <input
          type="date" value={to} onChange={e => setTo(e.target.value)}
          style={{ padding: '4px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }}
        />
        <button
          onClick={fetchExpenses}
          style={{
            padding: '5px 14px', background: '#1a1a2e', color: '#fff',
            border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
          }}
        >
          Apply
        </button>
        {(from || to) && (
          <button
            onClick={() => { setFrom(''); setTo(''); setTimeout(fetchExpenses, 0); }}
            style={{
              padding: '5px 14px', background: '#f5f5f5', color: '#666',
              border: '1px solid #eee', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}

        {/* Total */}
        <div style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: 600, color: '#e94560' }}>
          Total: Rs. {totalAmount.toLocaleString()}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: '#888' }}>Loading...</p>
      ) : expenses.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: '10px', padding: '4rem',
          textAlign: 'center', color: '#aaa', fontSize: '15px', border: '1px dashed #ddd'
        }}>
          No expenses found. Click <strong>+ Add Expense</strong> to record one.
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#1a1a2e', color: '#fff' }}>
              <tr>
                {['Date', 'Title', 'Category', 'Paid To', 'Amount', 'Note', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '13px', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map((e, i) => {
                const cat = CATEGORY_COLORS[e.category] || CATEGORY_COLORS.other;
                return (
                  <tr key={e._id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '13px', color: '#666' }}>
                      {new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '14px', fontWeight: 500 }}>{e.title}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        background: cat.bg, color: cat.color,
                        padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                        textTransform: 'capitalize'
                      }}>
                        {e.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '13px', color: '#666' }}>{e.paidTo || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '14px', fontWeight: 600, color: '#e94560' }}>
                      Rs. {e.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '13px', color: '#888' }}>{e.note || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button
                        onClick={() => { setEditing(e); setShowForm(true); }}
                        style={{
                          marginRight: '8px', padding: '4px 14px', fontSize: '12px',
                          border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer',
                          background: '#fff', color: '#333', fontWeight: 500
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(e._id)}
                        style={{
                          padding: '4px 14px', fontSize: '12px',
                          border: '1px solid #e94560', borderRadius: '4px',
                          cursor: 'pointer', background: '#fff', color: '#e94560', fontWeight: 500
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ExpenseForm
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}