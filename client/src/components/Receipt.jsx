import { useEffect } from 'react';

export default function Receipt({ invoice, items, total, discount, subtotal, paymentMethod, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handlePrint = () => window.print();

  const now = new Date().toLocaleString('en-NP', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt, #receipt * { visibility: visible; }
          #receipt {
            position: fixed; top: 0; left: 0;
            width: 80mm; padding: 0; margin: 0;
            font-size: 12px;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
      }}>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '2rem', width: '380px', maxHeight: '90vh', overflowY: 'auto' }}>

          {/* Action buttons */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '16px' }}>Sale receipt</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handlePrint} style={{
                background: '#1a1a2e', color: '#fff', border: 'none',
                padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
              }}>Print</button>
              <button onClick={onClose} style={{
                background: 'none', border: '1px solid #ddd',
                padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
              }}>Close</button>
            </div>
          </div>

          {/* Receipt content */}
          <div id="receipt" style={{ fontFamily: 'monospace', fontSize: '13px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '1px dashed #ccc', paddingBottom: '1rem' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '2px' }}>MADIRA MUSE</div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Liquor Shop</div>
              <div style={{ fontSize: '11px', color: '#666' }}>Pokhara, Nepal</div>
            </div>

            {/* Invoice info */}
            <div style={{ marginBottom: '1rem', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Invoice:</span>
                <span style={{ fontWeight: 600 }}>{invoice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Date:</span>
                <span>{now}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Payment:</span>
                <span style={{ textTransform: 'capitalize' }}>{paymentMethod}</span>
              </div>
            </div>

            {/* Items */}
            <div style={{ borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', padding: '0.75rem 0', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', marginBottom: '6px' }}>
                <span>Item</span>
                <span>Qty × Price</span>
                <span>Total</span>
              </div>
              {items.map((item, i) => (
                <div key={i} style={{ marginBottom: '6px' }}>
                  <div style={{ fontWeight: 500, fontSize: '12px' }}>{item.productName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#555' }}>
                    <span></span>
                    <span>{item.quantity} × Rs.{item.unitPrice}</span>
                    <span>Rs.{item.lineTotal}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ fontSize: '12px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Subtotal</span><span>Rs. {subtotal}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#e94560' }}>
                  <span>Discount</span><span>- Rs. {discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px', borderTop: '1px solid #ccc', paddingTop: '6px', marginTop: '4px' }}>
                <span>Total</span><span>Rs. {total}</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#888', borderTop: '1px dashed #ccc', paddingTop: '0.75rem' }}>
              <div>Thank you for your purchase!</div>
              <div style={{ marginTop: '4px' }}>*** {invoice} ***</div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}