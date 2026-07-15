"use client";

import React from 'react';
import { Share2, Eye, Edit2, Trash2 } from 'lucide-react';

interface Trade {
  timestamp: string;
  ticker: string;
  direction: string;
  setup_name: string;
  entry: number;
  exit: number;
  stop_loss: number;
  raw_pnl: number;
  r_multiple: number;
  mistake: string;
  emotional_state: string;
}

export default function HistoricalLedger({ trades, onTradeDeleted }: { trades: Trade[], onTradeDeleted: () => void }) {
  const sortedTrades = [...trades].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleDelete = async (timestamp: string, ticker: string) => {
    if (!confirm(`Delete ${ticker} trade? This cannot be undone.`)) return;

    try {
      const res = await fetch('/api/trades', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp }),
      });
      if (res.ok) {
        onTradeDeleted();
      } else {
        alert('Failed to delete trade.');
      }
    } catch {
      alert('Error deleting trade.');
    }
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        Showing {sortedTrades.length} trades
      </div>
      
      <div className="glass-panel" style={{ padding: '0' }}>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Time</th>
                <th>Type</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>Stop Loss</th>
                <th>PNL ($)</th>
                <th>R-Mult</th>
                <th>Setup</th>
                <th>Mistake</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTrades.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                    No trades logged yet.
                  </td>
                </tr>
              )}
              {sortedTrades.map((t, idx) => {
                const dateObj = new Date(t.timestamp);
                const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{t.ticker}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{dateStr} <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{timeStr}</span></td>
                    <td>
                      <span className={t.direction === 'Long' ? 'tag-long' : 'tag-short'}>
                        {t.direction}
                      </span>
                    </td>
                    <td>{t.entry.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                    <td>{t.exit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.stop_loss}</td>
                    
                    <td className={t.raw_pnl >= 0 ? 'val-positive' : 'val-negative'} style={{ fontWeight: '600' }}>
                      {t.raw_pnl > 0 ? '+' : ''}${t.raw_pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={t.r_multiple >= 0 ? 'val-positive' : 'val-negative'}>
                      {t.r_multiple > 0 ? '+' : ''}{t.r_multiple.toFixed(2)}R
                    </td>
                    
                    <td style={{ color: 'var(--text-secondary)' }}>{t.setup_name || '—'}</td>
                    <td style={{ color: t.mistake !== 'None' ? 'var(--danger-color)' : 'var(--text-secondary)' }}>
                      {t.mistake === 'None' ? '—' : t.mistake}
                    </td>
                    
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Share2 size={14} style={{ cursor: 'pointer', opacity: 0.4 }} />
                        <Eye size={14} style={{ cursor: 'pointer', opacity: 0.4 }} />
                        <Edit2 size={14} style={{ cursor: 'pointer', opacity: 0.4 }} />
                        <Trash2
                          size={14}
                          style={{ cursor: 'pointer', color: 'var(--danger-color)', opacity: 0.7, transition: 'opacity 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
                          onClick={() => handleDelete(t.timestamp, t.ticker)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
