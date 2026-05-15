import { useEffect, useState } from 'react';
import { getStaff, addStaff, deleteStaff, markAttendance, getAttendance, getSalaryReport } from '../api/staffApi';

const statusColors = {
  present: { bg: '#e6f4ea', color: '#2d6a4f', label: 'Present' },
  absent:  { bg: '#fce8e8', color: '#c0392b', label: 'Absent' },
  half:    { bg: '#fff8e1', color: '#b45309', label: 'Half day' },
};

const today = new Date();
const todayStr = today.toISOString().split('T')[0];

export default function Attendance() {
  const [tab, setTab]           = useState('today');
  const [staff, setStaff]       = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [salaryReport, setSalaryReport] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [month, setMonth]       = useState(today.getMonth() + 1);
  const [year, setYear]         = useState(today.getFullYear());
  const [form, setForm]         = useState({ name: '', role: '', phone: '', monthlySalary: '' });

  const fetchStaff = async () => {
    const res = await getStaff();
    setStaff(res.data);
  };

  const fetchAttendance = async () => {
    const res = await getAttendance(month, year);
    setAttendance(res.data);
  };

  const fetchSalary = async () => {
    const res = await getSalaryReport(month, year);
    setSalaryReport(res.data);
  };

  useEffect(() => { fetchStaff(); }, []);
  useEffect(() => { fetchAttendance(); fetchSalary(); }, [month, year]);

  const getStatus = (staffId, date) => {
    const rec = attendance.find(a => a.staff?._id === staffId && a.date === date);
    return rec?.status || null;
  };

  const handleMark = async (staffId, status) => {
    await markAttendance({ staffId, date: todayStr, status });
    fetchAttendance();
    fetchSalary();
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    await addStaff(form);
    setShowForm(false);
    setForm({ name: '', role: '', phone: '', monthlySalary: '' });
    fetchStaff();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this staff member?')) return;
    await deleteStaff(id);
    fetchStaff();
  };

  const tabStyle = (key) => ({
    padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer',
    borderRadius: '6px', fontSize: '13px', fontWeight: 500,
    background: tab === key ? '#e94560' : 'transparent',
    color: tab === key ? '#fff' : 'var(--color-text-secondary)',
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '22px' }}>Attendance & Salary</h1>
        <button onClick={() => setShowForm(true)} style={{
          background: '#e94560', color: '#fff', border: 'none',
          padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
        }}>+ Add Staff</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--color-background-secondary)', padding: '4px', borderRadius: '8px', marginBottom: '1.5rem', width: 'fit-content' }}>
        <button style={tabStyle('today')} onClick={() => setTab('today')}>Today</button>
        <button style={tabStyle('monthly')} onClick={() => setTab('monthly')}>Monthly</button>
        <button style={tabStyle('salary')} onClick={() => setTab('salary')}>Salary</button>
        <button style={tabStyle('staff')} onClick={() => setTab('staff')}>Staff list</button>
      </div>

      {/* Month/Year picker for monthly + salary tabs */}
      {(tab === 'monthly' || tab === 'salary') && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', alignItems: 'center' }}>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}>
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}

      {/* TODAY TAB */}
      {tab === 'today' && (
        <div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            {today.toLocaleDateString('en-NP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          {staff.length === 0 ? (
            <p style={{ color: '#aaa' }}>No staff added yet. Click + Add Staff to begin.</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {staff.map(s => {
                const status = getStatus(s._id, todayStr);
                return (
                  <div key={s._id} style={{ background: '#fff', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 500 }}>{s.name}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>{s.role} — Rs. {s.monthlySalary}/month</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {status && (
                        <span style={{ background: statusColors[status].bg, color: statusColors[status].color, padding: '3px 12px', borderRadius: '20px', fontSize: '12px', marginRight: '8px' }}>
                          {statusColors[status].label}
                        </span>
                      )}
                      {['present', 'half', 'absent'].map(st => (
                        <button key={st} onClick={() => handleMark(s._id, st)} style={{
                          padding: '5px 12px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer',
                          border: `1px solid ${statusColors[st].color}`,
                          background: status === st ? statusColors[st].bg : '#fff',
                          color: statusColors[st].color, fontWeight: status === st ? 600 : 400
                        }}>
                          {statusColors[st].label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MONTHLY TAB */}
      {tab === 'monthly' && (
        <div style={{ background: '#fff', borderRadius: '10px', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ background: '#1a1a2e', color: '#fff' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Staff</th>
                {Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => (
                  <th key={i} style={{ padding: '0.5rem', textAlign: 'center', minWidth: '32px' }}>{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((s, si) => (
                <tr key={s._id} style={{ background: si % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{s.name}</td>
                  {Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => {
                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
                    const status = getStatus(s._id, dateStr);
                    return (
                      <td key={i} style={{ padding: '0.5rem', textAlign: 'center' }}>
                        {status === 'present' && <span style={{ color: '#2d6a4f', fontWeight: 600 }}>P</span>}
                        {status === 'absent'  && <span style={{ color: '#c0392b', fontWeight: 600 }}>A</span>}
                        {status === 'half'    && <span style={{ color: '#b45309', fontWeight: 600 }}>H</span>}
                        {!status && <span style={{ color: '#ddd' }}>—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SALARY TAB */}
      {tab === 'salary' && (
        <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#1a1a2e', color: '#fff' }}>
              <tr>
                {['Name', 'Role', 'Monthly salary', 'Days in month', 'Present', 'Half days', 'Absent', 'Days worked', 'Payable salary'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '13px', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {salaryReport.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>No data for this month</td></tr>
              ) : salaryReport.map((r, i) => (
                <tr key={r.staff._id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{r.staff.name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#666' }}>{r.staff.role}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>Rs. {r.staff.monthlySalary}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{r.daysInMonth}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#2d6a4f', fontWeight: 500 }}>{r.present}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#b45309' }}>{r.half}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#c0392b' }}>{r.absent}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{r.worked}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#e94560' }}>Rs. {r.salary}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {salaryReport.length > 0 && (
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', fontSize: '15px', fontWeight: 600 }}>
              Total payable: Rs. {salaryReport.reduce((sum, r) => sum + r.salary, 0).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* STAFF LIST TAB */}
      {tab === 'staff' && (
        <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#1a1a2e', color: '#fff' }}>
              <tr>
                {['Name', 'Role', 'Phone', 'Monthly salary', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '13px', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>No staff added yet</td></tr>
              ) : staff.map((s, i) => (
                <tr key={s._id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{s.name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#666' }}>{s.role}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#666' }}>{s.phone || '—'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>Rs. {s.monthlySalary}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '12px', color: '#aaa' }}>{new Date(s.joinDate).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <button onClick={() => handleDelete(s._id)} style={{
                      padding: '4px 12px', fontSize: '12px', border: '1px solid #e94560',
                      borderRadius: '4px', cursor: 'pointer', background: '#fff', color: '#e94560'
                    }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '10px', padding: '2rem', width: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>Add staff member</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>×</button>
            </div>
            <form onSubmit={handleAddStaff}>
              {[
                { label: 'Full name *', name: 'name', type: 'text' },
                { label: 'Role (e.g. Cashier)', name: 'role', type: 'text' },
                { label: 'Phone', name: 'phone', type: 'text' },
                { label: 'Monthly salary (Rs.) *', name: 'monthlySalary', type: 'number' },
              ].map(({ label, name, type }) => (
                <div key={name} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#555' }}>{label}</label>
                  <input type={type} value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ flex: 1, background: '#e94560', color: '#fff', border: 'none', padding: '0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Add staff</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, background: '#fff', border: '1px solid #ddd', padding: '0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}