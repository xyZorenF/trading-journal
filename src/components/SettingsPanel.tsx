"use client";

import React, { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';

interface SettingsValues {
  commission: number;
  accountBalance: number;
}

export default function SettingsPanel({ onChange }: { onChange: (s: SettingsValues) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [commission, setCommission] = useState('0');
  const [accountBalance, setAccountBalance] = useState('0');

  useEffect(() => {
    const c = localStorage.getItem('commission') || '0';
    const b = localStorage.getItem('accountBalance') || '0';
    setCommission(c);
    setAccountBalance(b);
    onChange({ commission: parseFloat(c), accountBalance: parseFloat(b) });
  }, []);

  const handleSave = () => {
    const c = parseFloat(commission) || 0;
    const b = parseFloat(accountBalance) || 0;
    localStorage.setItem('commission', String(c));
    localStorage.setItem('accountBalance', String(b));
    onChange({ commission: c, accountBalance: b });
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-icon"
        title="Settings"
        style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 10px' }}
      >
        <Settings size={18} />
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px' }}>

            <div className="modal-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>⚙️ Settings</h2>
              <button className="btn-icon" onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  Paper Trading Adjustments
                </h3>

                <div className="form-group">
                  <label className="form-label">Commission / Slippage per Trade ($)</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={commission}
                    onChange={e => setCommission(e.target.value)}
                    className="form-input"
                    placeholder="e.g. 2.50"
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Subtracted from every trade's PnL to simulate real-world friction.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Account Balance ($)</label>
                  <input
                    type="number" step="1" min="0"
                    value={accountBalance}
                    onChange={e => setAccountBalance(e.target.value)}
                    className="form-input"
                    placeholder="e.g. 10000"
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Used to calculate Risk % per trade in the form preview and ledger.
                  </div>
                </div>
              </div>

              <button onClick={handleSave} className="btn-primary">
                Save Settings
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
