import { useEffect, useState } from 'react';
import { getDashboardStats, getRecentSales } from '../api/dashboardApi';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';

const StatCard = ({ label, value, sub }) => (
  <div style={{
    background: '#fff', borderRadius: '10px', padding: '1.25rem 1.5rem',
    flex: 1, minWidth: '160px'
  }}>
    <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>{label}</div>
    <div style={{ fontSize: '26px', fontWeight: 600, color: '#1a1a2e' }}>{value}</div>
    {sub && <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>{sub}</div>}
  </div>
);

const PRESETS = [
  { label: 'Today',      key: 'today' },
  { label: 'This week',  key: 'week'  },
  { label: 'This month', key: 'month' },
  { label: 'This year',  key: 'year'  },
  { label: 'Custom',     key: 'custom'},
];

function getPresetRange(key) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  switch (key) {
    case 'today':
      return {
        from: new Date(y, m, d).toISOString().slice(0, 10),
        to:   new Date(y, m, d).toISOString().slice(0, 10),
      };
    case 'week': {
      const day = now.getDay(); // 0=Sun
      const monday = new Date(y, m, d - ((day + 6) % 7));
      return {
        from: monday.toISOString().slice(0, 10),
        to:   new Date(y, m, d).toISOString().slice(0, 10),
      };
    }
    case 'month':
      return {
        from: new Date(y, m, 1).toISOString().slice(0, 10),
        to:   new Date(y, m, d).toISOString().slice(0, 10),
      };
    case 'year':
      return {
        from: new Date(y, 0, 1).toISOString().slice(0, 10),
        to:   new Date(y, m, d).toISOString().slice(0, 10),
      };
    default:
      return null;
  }
}

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [preset,  setPreset]  = useState('today');
  const [from,    setFrom]    = useState(() => new Date().toISOString().slice(0, 10));
  const [to,      setTo]      = useState(() => new Date().toISOString().slice(0, 10));

  const fetchData = async (fromDate, toDate) => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([
        getDashboardStats(fromDate, toDate),
        getRecentSales(fromDate, toDate),
      ]);
      setStats(s.data);
      setRecent(r.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount with today preset
  useEffect(() => {
    const range = getPresetRange('today');
    fetchData(range.from, range.to);
  }, []);

  const handlePreset = (key) => {
    setPreset(key);
    if (key !== 'custom') {
      const range = getPresetRange(key);
      setFrom(range.from);
      setTo(range.to);
      fetchData(range.from, range.to);
    }
  };

  const handleCustomApply = () => {
    if (!from || !to) return;
    fetchData(from, to);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '22px', margin: 0 }}>Dashboard</h1>
      </div>

      {/* Date range filter bar */}
      <div style={{
        background: '#fff', borderRadius: '10px', padding: '0.85rem 1.25rem',
        marginBottom: '1.5rem', display: 'flex', alignItems: 'center',
        gap: '8px', flexWrap: 'wrap'
      }}>
        {PRESETS.map(p => (
          <button
            key={p.key}
            onClick={() => handlePreset(p.key)}
            style={{
              padding: '5px 14px', borderRadius: '20px', fontSize: '13px',
              cursor: 'pointer', fontWeight: preset === p.key ? 600 : 400,
              background: preset === p.key ? '#e94560' : '#f5f5f5',
              color: preset === p.key ? '#fff' : '#555',
              border: preset === p.key ? '1px solid #e94560' : '1px solid #eee',
              transition: 'all 0.15s'
            }}
          >
            {p.label}
          </button>
        ))}

        {/* Custom date pickers — only shown when Custom is selected */}
        {preset === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '4px' }}>
            <input
              type="date" value={from} onChange={e => setFrom(e.target.value)}
              style={{
                padding: '4px 10px', border: '1px solid #ddd', borderRadius: '6px',
                fontSize: '13px', color: '#333'
              }}
            />
            <span style={{ fontSize: '13px', color: '#888' }}>to</span>
            <input
              type="date" value={to} onChange={e => setTo(e.target.value)}
              style={{
                padding: '4px 10px', border: '1px solid #ddd', borderRadius: '6px',
                fontSize: '13px', color: '#333'
              }}
            />
            <button
              onClick={handleCustomApply}
              style={{
                padding: '5px 14px', background: '#1a1a2e', color: '#fff',
                border: 'none', borderRadius: '6px', fontSize: '13px',
                cursor: 'pointer', fontWeight: 500
              }}
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p style={{ color: '#888' }}>Loading dashboard...</p>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <StatCard
              label="Revenue"
              value={`Rs. ${stats.rangeRevenue?.toLocaleString() ?? 0}`}
              sub={PRESETS.find(p => p.key === preset)?.label}
            />
            <StatCard
              label="Total sales"
              value={stats.totalSales}
              sub="In selected period"
            />
            <StatCard
              label="Low stock alerts"
              value={stats.lowStock.length}
              sub={stats.lowStock.length > 0 ? 'Items need restocking' : 'All stock levels ok'}
            />
            <StatCard
  label="Profit"
  value={`Rs. ${(stats.rangeRevenue - stats.totalExpenses).toLocaleString()}`}
  sub={`Expenses: Rs. ${stats.totalExpenses?.toLocaleString()}`}
/>
          </div>

          {/* Revenue chart + Top products */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>

            {/* Bar chart */}
            <div style={{ flex: 2, background: '#fff', borderRadius: '10px', padding: '1.5rem', minWidth: '300px' }}>
              <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '1rem' }}>
                Revenue — {PRESETS.find(p => p.key === preset)?.label.toLowerCase()}
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.last7Days} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [`Rs. ${v}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#e94560" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top products */}
            <div style={{ flex: 1, background: '#fff', borderRadius: '10px', padding: '1.5rem', minWidth: '220px' }}>
              <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '1rem' }}>Top selling products</div>
              {stats.topProducts.length === 0 ? (
                <p style={{ color: '#aaa', fontSize: '13px' }}>No sales in this period</p>
              ) : stats.topProducts.map((p, i) => (
                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: i === 0 ? '#e94560' : '#f0f0f0',
                      color: i === 0 ? '#fff' : '#888',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 600, flexShrink: 0
                    }}>{i + 1}</span>
                    <span style={{ fontSize: '13px' }}>{p._id}</span>
                  </div>
                  <span style={{ fontSize: '13px', color: '#888' }}>{p.totalQty} sold</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low stock warnings */}
          {stats.lowStock.length > 0 && (
            <div style={{ background: '#fff8f0', border: '1px solid #ffd6a5', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#b85c00', marginBottom: '0.75rem' }}>
                Low stock alerts
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {stats.lowStock.map(p => (
                  <span key={p._id} style={{
                    background: '#fff', border: '1px solid #ffd6a5', borderRadius: '20px',
                    padding: '4px 12px', fontSize: '12px', color: '#b85c00'
                  }}>
                    {p.name} — {p.stockQty} left
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent sales */}
          <div style={{ background: '#fff', borderRadius: '10px', padding: '1.5rem' }}>
            <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '1rem' }}>
              Recent sales
              <span style={{ fontSize: '12px', color: '#aaa', fontWeight: 400, marginLeft: '8px' }}>
                {recent.length} record{recent.length !== 1 ? 's' : ''}
              </span>
            </div>
            {recent.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: '13px' }}>No sales in this period</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    {['Invoice', 'Total', 'Discount', 'Payment', 'Date'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '12px', color: '#888', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map(s => (
                    <tr key={s._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '0.65rem 0.75rem', fontSize: '13px', fontWeight: 500 }}>{s.invoiceNo}</td>
                      <td style={{ padding: '0.65rem 0.75rem', fontSize: '13px' }}>Rs. {s.total}</td>
                      <td style={{ padding: '0.65rem 0.75rem', fontSize: '13px', color: '#888' }}>Rs. {s.discount}</td>
                      <td style={{ padding: '0.65rem 0.75rem', fontSize: '13px', textTransform: 'capitalize' }}>{s.paymentMethod}</td>
                      <td style={{ padding: '0.65rem 0.75rem', fontSize: '12px', color: '#aaa' }}>
                        {new Date(s.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}