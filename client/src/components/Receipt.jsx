export default function Receipt({ invoice, items, total, discount, subtotal, paymentMethod, onClose, mode = 'vat' }) {
  const handlePrint = () => window.print();

  const now = new Date().toLocaleString('en-NP', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // VAT calculation — extract from VAT-inclusive MRP
  // VAT rate: 13%, so taxable = total * 100/113, vat = total * 13/113
  const taxableAmount = Math.round((total * 100) / 113 * 100) / 100;
  const vatAmount     = Math.round((total * 13)  / 113 * 100) / 100;

  const isVAT = mode === 'vat';

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-print, #receipt-print * { visibility: visible; }
          #receipt-print {
            position: fixed;
            top: 0; left: 0;
            width: 80mm;
            padding: 0; margin: 0;
            font-size: 12px;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
      }}>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '2rem', width: '400px', maxHeight: '90vh', overflowY: 'auto' }}>

          {/* Action buttons */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '16px' }}>
              {isVAT ? '🧾 VAT Bill' : '📋 Estimated Bill'}
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handlePrint} style={{
                background: '#1a1a2e', color: '#fff', border: 'none',
                padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
              }}>🖨 Print</button>
              <button onClick={onClose} style={{
                background: 'none', border: '1px solid #ddd',
                padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
              }}>Close</button>
            </div>
          </div>

          {/* Receipt body */}
          <div id="receipt-print" style={{ fontFamily: 'monospace', fontSize: '13px' }}>

            {/* Shop header */}
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #ccc', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '2px' }}>MADIRA MUSE</div>
              <div style={{ fontSize: '11px', color: '#666' }}>Bhaktapur, Nepal</div>
              {isVAT && (
                <>
                  <div style={{ fontSize: '11px', color: '#666' }}>VAT No: [YOUR-PAN-NUMBER]</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px', color: '#1a1a2e' }}>TAX INVOICE</div>
                </>
              )}
              {!isVAT && (
                <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px', color: '#b45309' }}>ESTIMATED BILL</div>
              )}
            </div>

            {/* Invoice / date info */}
            <div style={{ fontSize: '12px', marginBottom: '0.75rem' }}>
              {isVAT && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Invoice:</span>
                  <span style={{ fontWeight: 600 }}>{invoice}</span>
                </div>
              )}
              {!isVAT && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ref:</span>
                  <span style={{ color: '#888' }}>Estimate (not a tax invoice)</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Date:</span>
                <span>{now}</span>
              </div>
              {isVAT && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Payment:</span>
                  <span style={{ textTransform: 'capitalize' }}>{paymentMethod}</span>
                </div>
              )}
            </div>

            {/* Line items */}
            <div style={{ borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', padding: '0.75rem 0', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', marginBottom: '6px' }}>
                <span style={{ flex: 2 }}>Item</span>
                <span style={{ flex: 1, textAlign: 'center' }}>Qty</span>
                <span style={{ flex: 1, textAlign: 'right' }}>Price</span>
                <span style={{ flex: 1, textAlign: 'right' }}>Total</span>
              </div>
              {items.map((item, i) => (
                <div key={i} style={{ marginBottom: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 500 }}>{item.productName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#444' }}>
                    <span style={{ flex: 2 }}></span>
                    <span style={{ flex: 1, textAlign: 'center' }}>{item.quantity}</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>Rs.{item.unitPrice}</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>Rs.{item.lineTotal}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ fontSize: '12px', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Subtotal</span><span>Rs. {subtotal}</span>
              </div>

              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#e94560' }}>
                  <span>Discount</span><span>- Rs. {discount}</span>
                </div>
              )}

              {isVAT && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', borderTop: '1px dashed #eee', paddingTop: '4px' }}>
                    <span>Taxable amount</span><span>Rs. {taxableAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#1a56db' }}>
                    <span>VAT (13%)</span><span>Rs. {vatAmount.toFixed(2)}</span>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px', borderTop: '1px solid #ccc', paddingTop: '6px', marginTop: '4px' }}>
                <span>Total</span><span>Rs. {total}</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#888', borderTop: '1px dashed #ccc', paddingTop: '0.75rem' }}>
              {isVAT ? (
                <>
                  <div>Thank you for your purchase!</div>
                  <div style={{ marginTop: '4px' }}>*** {invoice} ***</div>
                </>
              ) : (
                <>
                  <div>This is an estimate only.</div>
                  <div>Not a valid tax invoice.</div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}