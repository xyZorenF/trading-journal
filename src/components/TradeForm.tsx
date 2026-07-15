"use client";

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export default function TradeForm({ onTradeLogged }: { onTradeLogged: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ticker: '',
    direction: 'Long',
    setup_name: '',
    entry: '',
    exit: '',
    stop_loss: '',
    position_size: '',
    emotional_state: '',
    mistake: 'None'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const entry = parseFloat(formData.entry);
    const exitPrice = parseFloat(formData.exit);
    const stopLoss = parseFloat(formData.stop_loss);
    const positionSize = parseFloat(formData.position_size);
    
    let raw_pnl = 0.0;
    if (formData.direction === "Long") {
      raw_pnl = (exitPrice - entry) * positionSize;
    } else {
      raw_pnl = (entry - exitPrice) * positionSize;
    }
    
    let r_multiple = 0.0;
    const risk = Math.abs(entry - stopLoss);
    
    if (risk > 0) {
      if (formData.direction === "Long") {
        r_multiple = (exitPrice - entry) / risk;
      } else {
        r_multiple = (entry - exitPrice) / risk;
      }
    }

    if (r_multiple < 0) {
      r_multiple = Math.max(-1.0, r_multiple);
    }

    const trade = {
      timestamp: new Date().toISOString(),
      ticker: formData.ticker.toUpperCase(),
      direction: formData.direction,
      setup_name: formData.setup_name,
      entry,
      exit: exitPrice,
      stop_loss: stopLoss,
      raw_pnl: parseFloat(raw_pnl.toFixed(2)),
      r_multiple: parseFloat(r_multiple.toFixed(2)),
      emotional_state: formData.emotional_state,
      mistake: formData.mistake
    };

    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trade),
      });
      if (res.ok) {
        onTradeLogged();
        setFormData({
          ...formData,
          ticker: '',
          entry: '',
          exit: '',
          stop_loss: '',
          position_size: '',
        });
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to log trade", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="btn-primary" 
        style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Plus size={16} /> Log Trade
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Log Trade</h2>
              <button className="btn-icon" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Ticker</label>
                    <input type="text" name="ticker" value={formData.ticker} onChange={handleChange} className="form-input" placeholder="AAPL, BTC" required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Direction</label>
                    <select name="direction" value={formData.direction} onChange={handleChange} className="form-select">
                      <option value="Long">Long</option>
                      <option value="Short">Short</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Setup Name</label>
                  <input type="text" name="setup_name" value={formData.setup_name} onChange={handleChange} className="form-input" placeholder="e.g., Breakout" required />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Entry Price</label>
                    <input type="number" step="any" name="entry" value={formData.entry} onChange={handleChange} className="form-input" required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Exit Price</label>
                    <input type="number" step="any" name="exit" value={formData.exit} onChange={handleChange} className="form-input" required />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Stop Loss</label>
                    <input type="number" step="any" name="stop_loss" value={formData.stop_loss} onChange={handleChange} className="form-input" required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Position Size</label>
                    <input type="number" step="any" name="position_size" value={formData.position_size} onChange={handleChange} className="form-input" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mistake</label>
                  <select name="mistake" value={formData.mistake} onChange={handleChange} className="form-select">
                    <option value="None">None</option>
                    <option value="FOMO Entry">FOMO Entry</option>
                    <option value="Chased Price">Chased Price</option>
                    <option value="Moved Stop Loss">Moved Stop Loss</option>
                    <option value="Early Exit">Early Exit</option>
                    <option value="Overleveraged">Overleveraged</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '16px' }}>
                  {loading ? 'Processing...' : 'Save & Calculate Metrics'}
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
