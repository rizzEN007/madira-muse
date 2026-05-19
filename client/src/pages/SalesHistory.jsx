import { useEffect, useState, useCallback } from 'react';
import { getSalesHistory, getClosingBalance, getSaleDetail } from '../api/salesHistoryApi';
import { formatDate, formatDateTime } from '../utils/dateUtils';

const paymentColors = {
  cash:   { bg: '#e6f4ea', color: '#2d6a4f' },
  card:   { bg: '#e8f0fe', color: '#1a56db' },
  esewa:  { bg: '#fff8e1', color: '#b45309' },
  credit: { bg: '#fce8e8', color: '#c0392b' },
};

export default function SalesHistory() {
  const [tab, setTab]             = useState('history');
  const [sales, setSales]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');
  const [from, setFrom]           = useState('');
  const [to, setTo]               = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetail, setSaleDetail]     = useState(null);
  const [closing, setClosing]     = useState(null);
  const [closingType, setClosingType] = useState('daily');
  const [closingDate, setClosingDate] = useState(new Date().toISOString().split('T')[0]);
  const [closingLoading, setClosingLoading] = useState(false);

  const limit = 50;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSalesHistory({ from, to, search, page, limit });
      setSales(res.data.sales);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [from, to, search, page]);

  useEffect(() => {
    if (tab === 'history') setTimeout(() => fetchHistory(), 0);
  }, [tab, fetchHistory]);

  const fetchClosing = useCallback(async () => {
    setClosingLoading(true);
    try {
      const res = await getClosingBalance(closingType, closingDate);
      setClosing(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setClosingLoading(false);
    }
  }, [closingType, closingDate]);

  useEffect(() => {
   if (tab === 'closing') setTimeout(() => fetchClosing(), 0);
  }, [tab, fetchClosing]);

  const openDetail = async (sale) => {
    setSelectedSale(sale);
    const res = await getSaleDetail(sale._id);
    setSaleDetail(res.data);
  };

  const tabStyle = (key) => ({
    padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer',
    borderRadius: '6px', fontSize: '13px', fontWeight: 500,
    background: tab === key ? '#e94560' : 'transparent',
    color: tab === key ? '#fff' : '#666',
  });

  const statCard = (label, value, color = '#1a1a2e') => (
    <div style={{ background: '#fff', borderRadius: '10px', padding: '1rem 1.25rem', flex: 1, minWidth: '140px' }}>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 600, color }}>{value}</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '22px' }}>Sales History</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: '#f0f0f0', padding: '4px', borderRadius: '8px', marginBottom: '1.5rem', width: 'fit-content' }}>
        <button style={tabStyle('history')} onClick={() => setTab('history')}>Sales History</button>
        <button style={tabStyle('closing')} onClick={() => setTab('closing')}>Closing Balance</button>
      </div>

      {/* SALES HISTORY TAB */}
      {tab === 'history' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Search invoice</label>
              <input
                type="text" placeholder="e.g. MM-2026-0001"
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '200px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>From (AD)</label>
              <input
                type="date" value={from} onChange={e => setFrom(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>To (AD)</label>
              <input
                type="date" value={to} onChange={e => setTo(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <button onClick={() => { setFrom(''); setTo(''); setSearch(''); setPage(1); }} style={{
              padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '6px',
              background: '#fff', cursor: 'pointer', fontSize: '13px'
            }}>Clear</button>
            <button onClick={fetchHistory} style={{
              padding: '0.5rem 1rem', border: 'none', borderRadius: '6px',
              background: '#e94560', color: '#fff', cursor: 'pointer', fontSize: '13px'
            }}>Search</button>
          </div>

          <div style={{ fontSize: '13px', color: '#888', marginBottom: '0.75rem' }}>
            {total} transactions found
          </div>

          {/* Table */}
          <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#1a1a2e', color: '#fff' }}>
                <tr>
                  {['Invoice', 'Date', 'Items', 'Subtotal', 'Discount', 'Total', 'Payment', 'Customer', ''].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '13px', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>Loading...</td></tr>
                ) : sales.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>No sales found</td></tr>
                ) : sales.map((s, i) => (
                  <tr key={s._id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #eee', cursor: 'pointer' }}
                    onClick={() => openDetail(s)}>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '13px', fontWeight: 500 }}>{s.invoiceNo}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '12px', color: '#555' }}>
                      {formatDateTime(s.createdAt, 'AD')}
                      <div style={{ fontSize: '11px', color: '#aaa' }}>{formatDate(s.createdAt, 'BS')}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '13px' }}>—</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '13px' }}>Rs. {s.subtotal}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '13px', color: s.discount > 0 ? '#e94560' : '#aaa' }}>
                      {s.discount > 0 ? `- Rs. ${s.discount}` : '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '14px', fontWeight: 600 }}>Rs. {s.total}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        background: paymentColors[s.isCredit ? 'credit' : s.paymentMethod]?.bg || '#f0f0f0',
                        color: paymentColors[s.isCredit ? 'credit' : s.paymentMethod]?.color || '#333',
                        padding: '2px 10px', borderRadius: '20px', fontSize: '12px', textTransform: 'capitalize'
                      }}>
                        {s.isCredit ? 'Credit' : s.paymentMethod}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '13px', color: '#666' }}>
                      {s.customer?.name || '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontSize: '12px', color: '#e94560' }}>View →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > limit && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1rem' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                padding: '6px 14px', border: '1px solid #ddd', borderRadius: '6px',
                background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1
              }}>← Prev</button>
              <span style={{ padding: '6px 12px', fontSize: '13px', color: '#666' }}>
                Page {page} of {Math.ceil(total / limit)}
              </span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)} style={{
                padding: '6px 14px', border: '1px solid #ddd', borderRadius: '6px',
                background: '#fff', cursor: page >= Math.ceil(total / limit) ? 'not-allowed' : 'pointer',
                opacity: page >= Math.ceil(total / limit) ? 0.5 : 1
              }}>Next →</button>
            </div>
          )}
        </div>
      )}

      {/* CLOSING BALANCE TAB */}
      {tab === 'closing' && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Period</label>
              <select value={closingType} onChange={e => setClosingType(e.target.value)} style={{
                padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px'
              }}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Date (AD)</label>
              <input
                type="date" value={closingDate} onChange={e => setClosingDate(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <button onClick={fetchClosing} style={{
              padding: '0.5rem 1.25rem', background: '#e94560', color: '#fff',
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 500
            }}>
              Generate Report
            </button>
          </div>

          {closingLoading && <p style={{ color: '#aaa' }}>Generating...</p>}

          {closing && !closingLoading && (
            <div>
              <div style={{ background: '#1a1a2e', color: '#fff', borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, textTransform: 'capitalize' }}>{closing.type} Closing Report</div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
                    {new Date(closing.from).toLocaleDateString('en-NP')} — {new Date(closing.to).toLocaleDateString('en-NP')}
                  </div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#e94560' }}>
                  Rs. {closing.totalRevenue.toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {statCard('Total Sales', closing.totalSales)}
                {statCard('Revenue', `Rs. ${closing.totalRevenue.toLocaleString()}`, '#2d6a4f')}
                {statCard('Discount', `Rs. ${closing.totalDiscount.toLocaleString()}`, '#e94560')}
                {statCard('Expenses', `Rs. ${closing.totalExpenses.toLocaleString()}`, '#b45309')}
                {statCard('Net Profit', `Rs. ${closing.profit.toLocaleString()}`, closing.profit >= 0 ? '#2d6a4f' : '#c0392b')}
              </div>

              <div style={{ background: '#fff', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '1rem' }}>Payment breakdown</div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Cash',   value: closing.cashSales,   ...paymentColors.cash   },
                    { label: 'Card',   value: closing.cardSales,   ...paymentColors.card   },
                    { label: 'eSewa',  value: closing.esewaS,      ...paymentColors.esewa  },
                    { label: 'Credit', value: closing.creditSales, ...paymentColors.credit },
                  ].map(p => (
                    <div key={p.label} style={{ background: p.bg, borderRadius: '8px', padding: '0.75rem 1.25rem', flex: 1, minWidth: '120px' }}>
                      <div style={{ fontSize: '12px', color: p.color, marginBottom: '4px' }}>{p.label}</div>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: p.color }}>Rs. {p.value.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {closing.topItems.length > 0 && (
                <div style={{ background: '#fff', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '1rem' }}>Top selling items</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #eee' }}>
                        {['Product', 'Qty sold', 'Revenue'].map(h => (
                          <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {closing.topItems.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                          <td style={{ padding: '0.6rem 0.75rem', fontSize: '13px', fontWeight: 500 }}>{item.name}</td>
                          <td style={{ padding: '0.6rem 0.75rem', fontSize: '13px' }}>{item.qty}</td>
                          <td style={{ padding: '0.6rem 0.75rem', fontSize: '13px', fontWeight: 500, color: '#2d6a4f' }}>Rs. {item.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SALE DETAIL MODAL */}
      {selectedSale && saleDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '520px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px' }}>{saleDetail.sale.invoiceNo}</h2>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  {formatDateTime(saleDetail.sale.createdAt, 'AD')}
                  {' · '}
                  {formatDateTime(saleDetail.sale.createdAt, 'BS')}
                </div>
              </div>
              <button onClick={() => { setSelectedSale(null); setSaleDetail(null); }} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888' }}>×</button>
            </div>

            {saleDetail.sale.customer && (
              <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', fontSize: '13px' }}>
                Customer: <strong>{saleDetail.sale.customer.name}</strong>
                {saleDetail.sale.customer.phone && ` · ${saleDetail.sale.customer.phone}`}
                {saleDetail.sale.isCredit && <span style={{ marginLeft: '8px', color: '#c0392b', fontWeight: 500 }}>Credit sale</span>}
              </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  {['Item', 'Qty', 'Unit price', 'Total'].map(h => (
                    <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {saleDetail.items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '0.6rem 0.75rem', fontSize: '13px', fontWeight: 500 }}>{item.productName}</td>
                    <td style={{ padding: '0.6rem 0.75rem', fontSize: '13px' }}>{item.quantity}</td>
                    <td style={{ padding: '0.6rem 0.75rem', fontSize: '13px' }}>Rs. {item.unitPrice}</td>
                    <td style={{ padding: '0.6rem 0.75rem', fontSize: '13px', fontWeight: 500 }}>Rs. {item.lineTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span>Subtotal</span><span>Rs. {saleDetail.sale.subtotal}</span>
              </div>
              {saleDetail.sale.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: '#e94560' }}>
                  <span>Discount</span><span>- Rs. {saleDetail.sale.discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, marginTop: '8px' }}>
                <span>Total</span><span>Rs. {saleDetail.sale.total}</span>
              </div>
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
                Payment: <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                  {saleDetail.sale.isCredit ? 'Credit' : saleDetail.sale.paymentMethod}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}