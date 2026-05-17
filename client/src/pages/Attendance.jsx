import { useEffect, useState } from 'react';
import { getStaff, addStaff, deleteStaff, markAttendance, getAttendance, getSalaryReport } from '../api/staffApi';
import { getSetting, setSetting, verifyPin } from '../api/settingsApi';

const statusColors = {
  present: { bg: '#e6f4ea', color: '#2d6a4f', label: 'Present' },
  absent:  { bg: '#fce8e8', color: '#c0392b', label: 'Absent' },
  half:    { bg: '#fff8e1', color: '#b45309', label: 'Half day' },
};

const today = new Date();
const todayStr = today.toISOString().split('T')[0];

const to24h = (timeStr) => {
  if (!timeStr) return '';
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match) {
    let h = parseInt(match[1]);
    const m = match[2];
    const period = match[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  }
  return timeStr;
};

const toDisplayTime = (value) => {
  if (!value) return '';
  const [h, m] = value.split(':');
  const hour = parseInt(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayH = hour % 12 || 12;
  return `${String(displayH).padStart(2, '0')}:${m} ${period}`;
};

// PIN Gate component
function PinGate({ onUnlock, onSetPin, pinExists }) {
  const [input, setInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [settingPin, setSettingPin] = useState(false);

  const handleVerify = async () => {
    if (!input) return;
    const res = await verifyPin(input);
    if (res.data.valid) {
      onUnlock();
    } else {
      setError('Incorrect PIN. Try again.');
      setInput('');
    }
  };

  const handleSetPin = async () => {
    if (newPin.length < 4) return setError('PIN must be at least 4 digits');
    if (newPin !== confirmPin) return setError('PINs do not match');
    await setSetting('owner_pin', newPin);
    onSetPin();
    onUnlock();
  };

  if (!pinExists || settingPin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '2.5rem', width: '320px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '32px', marginBottom: '0.5rem' }}>🔐</div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '18px' }}>Set Owner PIN</h2>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '1.5rem' }}>
            Create a PIN to protect salary and staff information.
          </p>
          <input
            type="password" inputMode="numeric" maxLength={6}
            placeholder="New PIN (4-6 digits)"
            value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', textAlign: 'center', letterSpacing: '6px', boxSizing: 'border-box', marginBottom: '0.75rem' }}
          />
          <input
            type="password" inputMode="numeric" maxLength={6}
            placeholder="Confirm PIN"
            value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', textAlign: 'center', letterSpacing: '6px', boxSizing: 'border-box', marginBottom: '1rem' }}
          />
          {error && <div style={{ color: '#e94560', fontSize: '13px', marginBottom: '1rem' }}>{error}</div>}
          <button onClick={handleSetPin} style={{ width: '100%', background: '#e94560', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 500 }}>
            Set PIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '2.5rem', width: '320px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '32px', marginBottom: '0.5rem' }}>🔒</div>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '18px' }}>Owner Access</h2>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '1.5rem' }}>
          Enter your PIN to view salary and staff details.
        </p>
        <input
          type="password" inputMode="numeric" maxLength={6}
          placeholder="Enter PIN"
          value={input} onChange={e => setInput(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && handleVerify()}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '20px', textAlign: 'center', letterSpacing: '8px', boxSizing: 'border-box', marginBottom: '1rem' }}
          autoFocus
        />
        {error && <div style={{ color: '#e94560', fontSize: '13px', marginBottom: '1rem' }}>{error}</div>}
        <button onClick={handleVerify} style={{ width: '100%', background: '#1a1a2e', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 500 }}>
          Unlock
        </button>
      </div>
    </div>
  );
}

export default function Attendance() {
  const [tab, setTab]               = useState('today');
  const [staff, setStaff]           = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [salaryReport, setSalaryReport] = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [month, setMonth]           = useState(today.getMonth() + 1);
  const [year, setYear]             = useState(today.getFullYear());
  const [form, setForm]             = useState({ name: '', role: '', phone: '', monthlySalary: '' });

  // PIN state
  const [pinExists, setPinExists]   = useState(false);
  const [unlocked, setUnlocked]     = useState(false);
  const [pinLoading, setPinLoading] = useState(true);

  // Check if PIN exists on mount
  useEffect(() => {
    getSetting('owner_pin').then(res => {
      setPinExists(!!res.data);
      setPinLoading(false);
    }).catch(() => setPinLoading(false));
  }, []);

  // Lock again when leaving protected tabs
  useEffect(() => {
    if (tab === 'today' || tab === 'monthly') setUnlocked(false);
  }, [tab]);

  const fetchStaff      = async () => { const res = await getStaff(); setStaff(res.data); };
  const fetchAttendance = async () => { const res = await getAttendance(month, year); setAttendance(res.data); };
  const fetchSalary     = async () => { const res = await getSalaryReport(month, year); setSalaryReport(res.data); };

  useEffect(() => { fetchStaff(); }, []);
  useEffect(() => { fetchAttendance(); fetchSalary(); }, [month, year]);

  const getRecord = (staffId, date) =>
    attendance.find(a => a.staff?._id === staffId && a.date === date) || null;
  const getStatus = (staffId, date) => getRecord(staffId, date)?.status || null;

  const handleMark = async (staffId, status) => {
    const existing = getRecord(staffId, todayStr);
    const checkInTime = (status !== 'absent' && !existing?.checkInTime)
      ? toDisplayTime(new Date().toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit', hour12: false }))
      : existing?.checkInTime;
    await markAttendance({ staffId, date: todayStr, status, checkInTime, checkOutTime: existing?.checkOutTime || '' });
    fetchAttendance();
    fetchSalary();
  };

  const handleCheckInTime = async (staffId, checkInTime) => {
    const existing = getRecord(staffId, todayStr);
    if (!existing) return;
    await markAttendance({ staffId, date: todayStr, status: existing.status, checkInTime, checkOutTime: existing.checkOutTime || '' });
    fetchAttendance();
  };

  const handleCheckOutTime = async (staffId, checkOutTime) => {
    const existing = getRecord(staffId, todayStr);
    if (!existing) return;
    await markAttendance({ staffId, date: todayStr, status: existing.status, checkInTime: existing.checkInTime || '', checkOutTime });
    fetchAttendance();
  };

  const calcHoursWorked = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    const toMinutes = (t) => {
      const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return null;
      let h = parseInt(match[1]);
      const m = parseInt(match[2]);
      const p = match[3].toUpperCase();
      if (p === 'PM' && h !== 12) h += 12;
      if (p === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };
    const inMin = toMinutes(checkIn);
    const outMin = toMinutes(checkOut);
    if (inMin === null || outMin === null || outMin <= inMin) return null;
    const diff = outMin - inMin;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    await addStaff(form);
    setShowForm(false);
    setForm({ name: '', role: '', phone: '', monthlySalary: '' });
    fetchStaff();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this staff member? This cannot be undone.')) return;
    await deleteStaff(id);
    fetchStaff();
  };

  const tabStyle = (key) => ({
    padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer',
    borderRadius: '6px', fontSize: '13px', fontWeight: 500,
    background: tab === key ? '#e94560' : 'transparent',
    color: tab === key ? '#fff' : '#666',
  });

  const timeInput = (label, value, onChange) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '12px', color: '#888', minWidth: '90px' }}>{label}</span>
      <input
        type="time" value={to24h(value)}
        onChange={e => { if (!e.target.value) return; onChange(toDisplayTime(e.target.value)); }}
        style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', color: '#333' }}
      />
      {value && <span style={{ fontSize: '12px', color: '#2d6a4f', fontWeight: 500 }}>{value}</span>}
    </div>
  );

  // Protected tabs require PIN
  const isProtectedTab = tab === 'salary' || tab === 'staff';

  if (pinLoading) return <p style={{ padding: '2rem', color: '#aaa' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '22px' }}>Attendance & Salary</h1>
        {(!isProtectedTab) && (
          <button onClick={() => setShowForm(true)} style={{
            background: '#e94560', color: '#fff', border: 'none',
            padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
          }}>+ Add Staff</button>
        )}
        {isProtectedTab && unlocked && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowForm(true)} style={{
              background: '#e94560', color: '#fff', border: 'none',
              padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
            }}>+ Add Staff</button>
            <button onClick={() => setUnlocked(false)} style={{
              background: '#fff', color: '#666', border: '1px solid #ddd',
              padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
            }}>🔒 Lock</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: '#f0f0f0', padding: '4px', borderRadius: '8px', marginBottom: '1.5rem', width: 'fit-content' }}>
        <button style={tabStyle('today')}   onClick={() => setTab('today')}>Today</button>
        <button style={tabStyle('monthly')} onClick={() => setTab('monthly')}>Monthly</button>
        <button style={tabStyle('salary')}  onClick={() => setTab('salary')}>
          🔒 Salary
        </button>
        <button style={tabStyle('staff')}   onClick={() => setTab('staff')}>
          🔒 Staff list
        </button>
      </div>

      {/* PIN gate for protected tabs */}
      {isProtectedTab && !unlocked && (
        <PinGate
          pinExists={pinExists}
          onUnlock={() => setUnlocked(true)}
          onSetPin={() => setPinExists(true)}
        />
      )}

      {/* Month/Year picker */}
      {(tab === 'monthly' || (tab === 'salary' && unlocked)) && (
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
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '1rem' }}>
            {today.toLocaleDateString('en-NP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          {staff.length === 0 ? (
            <p style={{ color: '#aaa' }}>No staff added yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {staff.map(s => {
                const record = getRecord(s._id, todayStr);
                const status = record?.status || null;
                const hoursWorked = calcHoursWorked(record?.checkInTime, record?.checkOutTime);
                return (
                  <div key={s._id} style={{ background: '#fff', borderRadius: '10px', padding: '1rem 1.25rem', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 500 }}>{s.name}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{s.role}</div>
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
                          }}>{statusColors[st].label}</button>
                        ))}
                      </div>
                    </div>
                    {status && status !== 'absent' && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f0f0f0', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                        {timeInput('Check-in', record?.checkInTime, (val) => handleCheckInTime(s._id, val))}
                        {timeInput('Check-out', record?.checkOutTime, (val) => handleCheckOutTime(s._id, val))}
                        {hoursWorked && (
                          <span style={{ fontSize: '12px', background: '#e6f4ea', color: '#2d6a4f', padding: '3px 10px', borderRadius: '20px', fontWeight: 500 }}>
                            {hoursWorked} worked
                          </span>
                        )}
                      </div>
                    )}
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
                <th style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>P</th>
                <th style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>H</th>
                <th style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>A</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s, si) => {
                const monthRecords = Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => {
                  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
                  return getStatus(s._id, dateStr);
                });
                const presentCount = monthRecords.filter(r => r === 'present').length;
                const halfCount    = monthRecords.filter(r => r === 'half').length;
                const absentCount  = monthRecords.filter(r => r === 'absent').length;
                return (
                  <tr key={s._id} style={{ background: si % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{s.name}</td>
                    {monthRecords.map((status, i) => (
                      <td key={i} style={{ padding: '0.5rem', textAlign: 'center' }}>
                        {status === 'present' && <span style={{ color: '#2d6a4f', fontWeight: 600 }}>P</span>}
                        {status === 'absent'  && <span style={{ color: '#c0392b', fontWeight: 600 }}>A</span>}
                        {status === 'half'    && <span style={{ color: '#b45309', fontWeight: 600 }}>H</span>}
                        {!status && <span style={{ color: '#ddd' }}>—</span>}
                      </td>
                    ))}
                    <td style={{ padding: '0.5rem 1rem', textAlign: 'center', color: '#2d6a4f', fontWeight: 600 }}>{presentCount}</td>
                    <td style={{ padding: '0.5rem 1rem', textAlign: 'center', color: '#b45309', fontWeight: 600 }}>{halfCount}</td>
                    <td style={{ padding: '0.5rem 1rem', textAlign: 'center', color: '#c0392b', fontWeight: 600 }}>{absentCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SALARY TAB — PIN protected */}
      {tab === 'salary' && unlocked && (
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

      {/* STAFF LIST TAB — PIN protected */}
      {tab === 'staff' && unlocked && (
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
                  <td style={{ padding: '0.75rem 1rem', display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleDelete(s._id)} style={{
                      padding: '4px 12px', fontSize: '12px', border: '1px solid #e94560',
                      borderRadius: '4px', cursor: 'pointer', background: '#fff', color: '#e94560'
                    }}>Delete</button>
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