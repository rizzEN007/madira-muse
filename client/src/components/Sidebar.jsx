const links = [
  { key: 'dashboard',  label: 'Dashboard' },
  { key: 'sales-history', label: 'Sales History' },
  { key: 'products',   label: 'Inventory' },

  { key: 'stock',      label: 'Stock movements' },
  { key: 'pos',        label: 'Point of Sale' },
  { key: 'categories', label: 'Categories' },
  { key: 'expenses',   label: 'Expenses' },
  { key: 'customers',  label: 'Customers' },
  { key: 'suppliers',  label: 'Suppliers' },
  { key: 'attendance', label: 'Attendance' },
  
];

export default function Sidebar({ current, onNavigate }) {
  return (
    <aside style={{
      width: '200px', background: '#1a1a2e', color: '#fff',
      display: 'flex', flexDirection: 'column', padding: '1.5rem 0'
    }}>
      <div style={{ padding: '0 1.5rem 2rem', fontSize: '18px', fontWeight: 600 }}>
        Madira Muse
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