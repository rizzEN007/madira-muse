import { useState, useEffect } from 'react';
import { adToBS, BS_MONTHS } from '../utils/dateUtils';

const links = [
  { key: 'dashboard',     label: 'Dashboard' },
  { key: 'sales-history', label: 'Sales History' },
  { key: 'products',      label: 'Inventory' },
  { key: 'stock',         label: 'Stock movements' },
  { key: 'pos',           label: 'Point of Sale' },
  { key: 'categories',    label: 'Categories' },
  { key: 'expenses',      label: 'Expenses' },
  { key: 'customers',     label: 'Customers' },
  { key: 'suppliers',     label: 'Suppliers' },
  { key: 'attendance',    label: 'Attendance' },
];

export default function Sidebar({ current, onNavigate }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const bs = adToBS(now);
  const time = now.toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <aside style={{
      width: '200px', background: '#1a1a2e', color: '#fff',
      display: 'flex', flexDirection: 'column', padding: '1.5rem 0'
    }}>
      <div style={{ padding: '0 1.5rem 1rem', fontSize: '18px', fontWeight: 600 }}>
        Madira Muse
      </div>

      {/* Clock */}
      <div style={{
        margin: '0 1rem 1.5rem', background: '#16213e', borderRadius: '8px',
        padding: '0.6rem 0.75rem', textAlign: 'center'
      }}>
        <div style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '1px', color: '#fff' }}>
          {time}
        </div>
        <div style={{ fontSize: '11px', color: '#e94560', marginTop: '3px', fontWeight: 500 }}>
          {bs.year} {BS_MONTHS[bs.month - 1]} {bs.day}
        </div>
      </div>

      {links.map(link => (
        <button key={link.key} onClick={() => onNavigate(link.key)} style={{
          background: current === link.key ? '#16213e' : 'transparent',
          color: '#fff', border: 'none', textAlign: 'left',
          padding: '0.75rem 1.5rem', cursor: 'pointer', fontSize: '14px',
          borderLeft: current === link.key ? '3px solid #e94560' : '3px solid transparent'
        }}>
          {link.label}
        </button>
      ))}
    </aside>
  );
}