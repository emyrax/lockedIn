import { useState, useEffect, useCallback } from 'react';

export default function SponsorshipModal({ isOpen, onClose, defaultAmount = 5000000 }) {
  const [method, setMethod] = useState('card');
  const [amount, setAmount] = useState(defaultAmount);

  const escHandler = useCallback((e) => { if (e.key === 'Escape') onClose?.(); }, [onClose]);
  useEffect(() => {
    if (isOpen) document.addEventListener('keydown', escHandler);
    return () => document.removeEventListener('keydown', escHandler);
  }, [isOpen, escHandler]);

  if (!isOpen) return null;

  const fmt = (n) => '₦' + n.toLocaleString('en-US');

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="page-card max-w-lg w-full p-6 lg:p-8 relative">
        <div className="flex items-center justify-between mb-5">
          <h5 className="font-bold text-base" style={{ color: 'var(--emerald)' }}>Partner with NUESA UNN</h5>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg border-0 text-lg cursor-pointer transition-colors"
            style={{ color: 'var(--text-light)' }}
            onClick={onClose}
            onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            &times;
          </button>
        </div>

        <div className="flex gap-1 mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
          {[
            { key: 'card', label: 'Online Payment' },
            { key: 'wire', label: 'Bank Transfer' },
            { key: 'hardware', label: 'In-Kind' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setMethod(tab.key)}
              className="flex-1 py-2 text-xs font-semibold cursor-pointer border-0 bg-transparent transition-all duration-200"
              style={{
                borderBottom: method === tab.key ? '2px solid var(--gold)' : '2px solid transparent',
                color: method === tab.key ? 'var(--gold)' : 'var(--text-muted)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {method === 'card' && (
          <div>
            <label className="form-label">Amount (NGN)</label>
            <div className="flex gap-2 mb-3 flex-wrap">
              {[1000000, 5000000, 10000000, 25000000, 50000000, 100000000].map(v => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer border-0 transition-all"
                  style={{
                    background: amount === v ? 'var(--gold)' : '#f3f4f6',
                    color: amount === v ? 'white' : 'var(--text)',
                  }}
                >
                  {fmt(v)}
                </button>
              ))}
            </div>
            <input type="number" className="form-input mb-4" value={amount} onChange={e => setAmount(Number(e.target.value))} />
            <button
              className="btn-nuesa btn-primary w-full justify-center text-sm !py-3"
              onClick={() => alert(`Paystack integration — charging ${fmt(amount)}`)}
            >
              Proceed to Secure Checkout
            </button>
          </div>
        )}

        {method === 'wire' && (
          <div className="page-card p-4 text-xs space-y-2" style={{ background: 'var(--bg-alt)' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Bank Name:</span> Fidelity Bank PLC / Zenith Bank</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Account Name:</span> NUESA UNN Faculty Advancement Fund</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Account Number:</span> <strong style={{ color: 'var(--gold)' }}>1234567890</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>TIN / Tax Ref:</span> UNN-FE-TAX-2026-X</div>
            <div className="pt-2 text-[10px]" style={{ color: 'var(--text-light)' }}>* Quote your organization name in the transfer reference.</div>
          </div>
        )}

        {method === 'hardware' && (
          <div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              Donate equipment — computers, oscilloscopes, 3D printers, sensors, or any engineering tools.
            </p>
            <textarea className="form-textarea mb-3" rows={3} placeholder="Describe the equipment you'd like to donate..." />
            <button className="btn-nuesa btn-primary w-full justify-center text-sm !py-3">
              Submit Donation Inquiry
            </button>
          </div>
        )}

        <p className="text-center mt-4 mb-0 text-[10px]" style={{ color: 'var(--text-light)' }}>
          All contributions support the Faculty of Engineering, University of Nigeria, Nsukka.
        </p>
      </div>
    </div>
  );
}
