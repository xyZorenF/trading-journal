"use client";

import React, { useState } from 'react';

export default function TradeForm({ onTradeLogged }: { onTradeLogged: () => void }) {
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
        // Reset specific fields but keep others that might repeat
        setFormData({
          ...formData,
          ticker: '',
          entry: '',
          exit: '',
          stop_loss: '',
          position_size: '',
        });
      }
    } catch (error) {
      console.error("Failed to log trade", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in">
      <h2 className="header-subtitle" style={{ color: "var(--text-primary)", fontWeight: "600", fontSize: "1.2rem", marginBottom: "20px" }}>Log Trade</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Ticker</label>
          <input type="text" name="ticker" value={formData.ticker} onChange={handleChange} className="form-input" placeholder="e.g., AAPL, BTC" required />
        </div>
        
        <div className="form-group">
          <label className="form-label">Direction</label>
          <select name="direction" value={formData.direction} onChange={handleChange} className="form-select">
            <option value="Long">Long</option>
            <option value="Short">Short</option>
          </select>
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
            <label className="form-label">Position Size (Shares/Units)</label>
            <input type="number" step="any" name="position_size" value={formData.position_size} onChange={handleChange} className="form-input" required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Emotional State / Mindset</label>
          <input type="text" name="emotional_state" value={formData.emotional_state} onChange={handleChange} className="form-input" placeholder="e.g., Calm, Anxious" />
        </div>

        <div className="form-group">
          <label className="form-label">Execution Mistake</label>
          <select name="mistake" value={formData.mistake} onChange={handleChange} className="form-select">
            <option value="None">None</option>
            <option value="FOMO Entry">FOMO Entry</option>
            <option value="Chased Price">Chased Price</option>
            <option value="Moved Stop Loss">Moved Stop Loss</option>
            <option value="Early Exit">Early Exit</option>
            <option value="Overleveraged">Overleveraged</option>
          </select>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
          {loading ? 'Logging...' : 'Save Trade'}
        </button>
      </form>
    </div>
  );
}
