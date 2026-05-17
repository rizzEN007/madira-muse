import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export default function AppLoader({ children }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [label, setLabel] = useState('Starting up');

  const checkHealth = useCallback(async () => {
    let attempts = 0;
    const maxAttempts = 30;

    const labels = ['Starting up', 'Starting up.', 'Starting up..', 'Starting up...'];
    let labelIndex = 0;

    const labelTimer = setInterval(() => {
      labelIndex = (labelIndex + 1) % labels.length;
      setLabel(labels[labelIndex]);
    }, 400);

    const poll = setInterval(async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/health', { timeout: 2000 });
        if (res.data.status === 'ok') {
          clearInterval(poll);
          clearInterval(labelTimer);
          setReady(true);
        }
      } catch {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(poll);
          clearInterval(labelTimer);
          setError(true);
        }
      }
    }, 1000);

    return () => {
      clearInterval(poll);
      clearInterval(labelTimer);
    };
  }, []);

  useEffect(() => {
    const cleanup = checkHealth();
    return () => { cleanup.then(fn => fn()); };
  }, [checkHealth]);

  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1a1a2e', color: '#fff' }}>
      <div style={{ fontSize: '32px', marginBottom: '1rem' }}>⚠️</div>
      <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>Could not connect to server</div>
      <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '1.5rem' }}>Make sure MongoDB is running and try again.</div>
      <button onClick={() => window.location.reload()} style={{ background: '#e94560', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
        Retry
      </button>
    </div>
  );

  if (!ready) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1a1a2e', color: '#fff' }}>
      <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '3px', marginBottom: '0.5rem' }}>MADIRA MUSE</div>
      <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '2rem' }}>Liquor Shop Management</div>
      <div style={{ width: '40px', height: '40px', border: '3px solid #333', borderTop: '3px solid #e94560', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1rem' }}></div>
      <div style={{ fontSize: '13px', color: '#666' }}>{label}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return children;
}