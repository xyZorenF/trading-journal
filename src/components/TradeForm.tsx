"use client";

import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

interface Trade {
  timestamp: string;
  ticker: string;
  direction: string;
  setup_name: string;
  entry: number;
  exit: number;
  stop_loss: number;
  position_size: number;
  raw_pnl: number;
  r_multiple: number;
  risk_pct: number;
  emotional_state: string;
  mistake: string;
}

interface TradeFormProps {
  onTradeLogged: () => void;
  editTrade?: Trade | null;
  onEditClose?: () => void;
}

const EMPTY_FORM = {
  ticker: '',
  direction: 'Long',
  setup_name: '',
  entry: '',
  exit: '',
  stop_loss: '',
  position_size: '',
  emotional_state: 'Calm',
  mistake: 'None',
  timestamp: '',
};

function calcMetrics(formData: typeof EMPTY_FORM, accountBalance: number) {
  const entry = parseFloat(formData.entry);
  const exitPrice = parseFloat(formData.exit);
  const stopLoss = parseFloat(formData.stop_loss);
  const positionSize = parseFloat(formData.position_size);

  if (isNaN(entry) || isNaN(exitPrice) || isNaN(stopLoss) || isNaN(positionSize)) {
    return { raw_pnl: 0, r_multiple: 0, risk_pct: 0 };
  }

  const raw_pnl = formData.direction === 'Long'
    ? (exitPrice - entry) * positionSize
    : (entry - exitPrice) * positionSize;

  const priceRisk = Math.abs(entry - stopLoss);
  let r_multiple = 0;
  if (priceRisk > 0) {
    r_multiple = formData.direction === 'Long'
      ? (exitPrice - entry) / priceRisk
      : (entry - exitPrice) / priceRisk;
  }
  if (r_multiple < -1) r_multiple = -1;

  const dollarRisk = priceRisk * positionSize;
  const risk_pct = accountBalance > 0 ? (dollarRisk / accountBalance) * 100 : 0;

  return {
    raw_pnl: parseFloat(raw_pnl.toFixed(2)),
    r_multiple: parseFloat(r_multiple.toFixed(2)),
    risk_pct: parseFloat(risk_pct.toFixed(2)),
  };
}

function toLocalDatetimeValue(isoString: string) {
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TradeForm({ onTradeLogged, editTrade, onEditClose }: TradeFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountBalance, setAccountBalance] = useState(0);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [originalTimestamp, setOriginalTimestamp] = useState<string | null>(null);

  // Load account balance from localStorage
  useEffect(() => {
    const bal = parseFloat(localStorage.getItem('accountBalance') || '0');
    setAccountBalance(bal);
  }, [isOpen]);

  // Open in edit mode when editTrade prop changes
  useEffect(() => {
    if (editTrade) {
      setFormData({
        ticker: editTrade.ticker,
        direction: editTrade.direction,
        setup_name: editTrade.setup_name,
        entry: String(editTrade.entry),
        exit: String(editTrade.exit),
        stop_loss: String(editTrade.stop_loss),
        position_size: String(editTrade.position_size ?? ''),
        emotional_state: editTrade.emotional_state || 'Calm',
        mistake: editTrade.mistake || 'None',
        timestamp: toLocalDatetimeValue(editTrade.timestamp),
      });
      setOriginalTimestamp(editTrade.timestamp);
      setIsOpen(true);
    }
  }, [editTrade]);

  const handleClose = () => {
    setIsOpen(false);
    setFormData(EMPTY_FORM);
    setOriginalTimestamp(null);
    onEditClose?.();
  };

  const handleOpen = () => {
    // Default timestamp = now
    setFormData({ ...EMPTY_FORM, timestamp: toLocalDatetimeValue(new Date().toISOString()) });
    setOriginalTimestamp(null);
    setIsOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { raw_pnl, r_multiple, risk_pct } = calcMetrics(formData, accountBalance);
  const isEdit = !!originalTimestamp;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Convert datetime-local back to ISO
    const localTs = formData.timestamp
      ? new Date(formData.timestamp).toISOString()
      : new Date().toISOString();

    const trade: Trade = {
      timestamp: isEdit ? localTs : localTs,
      ticker: formData.ticker.toUpperCase(),
      direction: formData.direction,
      setup_name: formData.setup_name,
      entry: parseFloat(formData.entry),
      exit: parseFloat(formData.exit),
      stop_loss: parseFloat(formData.stop_loss),
      position_size: parseFloat(formData.position_size),
      raw_pnl,
      r_multiple,
      risk_pct,
      emotional_state: formData.emotional_state,
      mistake: formData.mistake,
    };

    try {
      let res: Response;
      if (isEdit) {
        res = await fetch('/api/trades', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ originalTimestamp, updatedTrade: trade }),
        });
      } else {
        res = await fetch('/api/trades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trade),
        });
      }

      if (res.ok) {
        onTradeLogged();
        handleClose();
      }
    } catch (error) {
      console.error('Failed to save trade', error);
    } finally {
      setLoading(false);
    }
  };

  const preview = {
    pnl: isNaN(raw_pnl) ? '—' : `${raw_pnl >= 0 ? '+' : ''}$${Math.abs(raw_pnl).toFixed(2)}`,
    r: isNaN(r_multiple) ? '—' : `${r_multiple >= 0 ? '+' : ''}${r_multiple.toFixed(2)}R`,
    riskPct: isNaN(risk_pct) || risk_pct === 0 ? '—' : `${risk_pct.toFixed(2)}%`,
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="btn-primary"
        style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Plus size={16} /> Log Trade
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                {isEdit ? '✏️ Edit Trade' : '⚡ Log Trade'}
              </h2>
              <button className="btn-icon" onClick={handleClose}><X size={20} /></button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit}>

                {/* Row 1: Ticker + Direction + Timestamp */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Ticker</label>
                    <input type="text" name="ticker" value={formData.ticker} onChange={handleChange} className="form-input" placeholder="BTC, ETH" required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Direction</label>
                    <select name="direction" value={formData.direction} onChange={handleChange} className="form-select">
                      <option value="Long">Long</option>
                      <option value="Short">Short</option>
                    </select>
                  </div>
                </div>

                {/* Row: Timestamp */}
                <div className="form-group">
                  <label className="form-label">Date & Time</label>
                  <input type="datetime-local" name="timestamp" value={formData.timestamp} onChange={handleChange} className="form-input" required />
                </div>

                {/* Row: Setup */}
                <div className="form-group">
                  <label className="form-label">Setup Name</label>
                  <input type="text" name="setup_name" value={formData.setup_name} onChange={handleChange} className="form-input" placeholder="Breakout, Pullback, ORB..." required />
                </div>

                {/* Row: Entry / Exit / Stop */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Entry</label>
                    <input type="number" step="any" name="entry" value={formData.entry} onChange={handleChange} className="form-input" required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Exit</label>
                    <input type="number" step="any" name="exit" value={formData.exit} onChange={handleChange} className="form-input" required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Stop Loss</label>
                    <input type="number" step="any" name="stop_loss" value={formData.stop_loss} onChange={handleChange} className="form-input" required />
                  </div>
                </div>

                {/* Row: Position Size */}
                <div className="form-group">
                  <label className="form-label">Position Size (Shares/Units)</label>
                  <input type="number" step="any" name="position_size" value={formData.position_size} onChange={handleChange} className="form-input" required />
                </div>

                {/* Row: Emotion + Mistake */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Emotional State</label>
                    <select name="emotional_state" value={formData.emotional_state} onChange={handleChange} className="form-select">
                      <option value="Calm">😌 Calm</option>
                      <option value="Focused">🎯 Focused</option>
                      <option value="Anxious">😰 Anxious</option>
                      <option value="Overconfident">😤 Overconfident</option>
                      <option value="Tired">😴 Tired</option>
                      <option value="Revenge Trading">🔥 Revenge Trading</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
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
                </div>

                {/* Live Preview */}
                {(formData.entry && formData.exit && formData.position_size) && (
                  <div style={{
                    display: 'flex', gap: '16px', padding: '12px', marginTop: '4px', marginBottom: '8px',
                    background: '#0f0f13', borderRadius: '6px', border: '1px solid var(--border-color)'
                  }}>
                    <div>
                      <div className="form-label">Calc. PnL</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: raw_pnl >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>{preview.pnl}</div>
                    </div>
                    <div>
                      <div className="form-label">R-Multiple</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: r_multiple >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>{preview.r}</div>
                    </div>
                    {accountBalance > 0 && (
                      <div>
                        <div className="form-label">Risk %</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: risk_pct > 2 ? 'var(--danger-color)' : 'var(--text-primary)' }}>{preview.riskPct}</div>
                      </div>
                    )}
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
                  {loading ? 'Saving...' : isEdit ? 'Update Trade' : 'Save & Calculate'}
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
