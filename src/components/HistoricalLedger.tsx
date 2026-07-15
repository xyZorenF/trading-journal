"use client";

import React from 'react';
import { Share2, Edit2, Trash2, Download } from 'lucide-react';

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
  mistake: string;
  emotional_state: string;
}

const EMOTION_COLORS: Record<string, string> = {
  'Calm': 'var(--success-color)',
  'Focused': '#60a5fa',
  'Anxious': 'var(--danger-color)',
  'Overconfident': '#f59e0b',
  'Tired': '#a1a1aa',
  'Revenge Trading': 'var(--danger-color)',
};

const EMOTION_ICONS: Record<string, string> = {
  'Calm': '😌',
  'Focused': '🎯',
  'Anxious': '😰',
  'Overconfident': '😤',
  'Tired': '😴',
  'Revenge Trading': '🔥',
};

function exportCSV(trades: Trade[]) {
  const headers = ['Timestamp', 'Ticker', 'Direction', 'Setup', 'Entry', 'Exit', 'Stop Loss', 'Position Size', 'Raw PnL', 'R-Multiple', 'Risk %', 'Emotion', 'Mistake'];
  const rows = trades.map(t => [
    t.timestamp, t.ticker, t.direction, t.setup_name,
    t.entry, t.exit, t.stop_loss, t.position_size ?? '',
    t.raw_pnl, t.r_multiple, t.risk_pct ?? '',
    t.emotional_state, t.mistake,
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `trades_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function HistoricalLedger({
  trades,
  onTradeDeleted,
  onEditTrade,
  commission = 0,
}: {
  trades: Trade[];
  onTradeDeleted: () => void;
  onEditTrade: (trade: Trade) => void;
  commission?: number;
}) {
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleDelete = async (timestamp: string, ticker: string) => {
    if (!confirm(`Delete ${ticker} trade? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/trades', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp }),
      });
      if (res.ok) onTradeDeleted();
      else alert('Failed to delete trade.');
    } catch {
      alert('Error deleting trade.');
    }
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Showing {sortedTrades.length} trades
        </div>
        <button
          onClick={() => exportCSV(trades)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'transparent', border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)', borderRadius: '6px',
            padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--success-color)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--success-color)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
          }}
        >
          <Download size={13} /> Export CSV
        </button>
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
                <th>Risk %</th>
                <th>Setup</th>
                <th>Emotion</th>
                <th>Mistake</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTrades.length === 0 && (
                <tr>
                  <td colSpan={13} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                    No trades logged yet.
                  </td>
                </tr>
              )}
              {sortedTrades.map((t, idx) => {
                const dateObj = new Date(t.timestamp);
                const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                const adjPnl = t.raw_pnl - commission;
                const emotion = t.emotional_state || '—';

                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{t.ticker}</td>
                    <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {dateStr} <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{timeStr}</span>
                    </td>
                    <td>
                      <span className={t.direction === 'Long' ? 'tag-long' : 'tag-short'}>{t.direction}</span>
                    </td>
                    <td>{t.entry.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                    <td>{t.exit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.stop_loss}</td>

                    <td className={adjPnl >= 0 ? 'val-positive' : 'val-negative'} style={{ fontWeight: 600 }}>
                      {adjPnl > 0 ? '+' : ''}${adjPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={t.r_multiple >= 0 ? 'val-positive' : 'val-negative'}>
                      {t.r_multiple > 0 ? '+' : ''}{t.r_multiple.toFixed(2)}R
                    </td>
                    <td style={{ color: t.risk_pct > 2 ? 'var(--danger-color)' : 'var(--text-secondary)' }}>
                      {t.risk_pct ? `${t.risk_pct.toFixed(2)}%` : '—'}
                    </td>

                    <td style={{ color: 'var(--text-secondary)' }}>{t.setup_name || '—'}</td>
                    <td style={{ color: EMOTION_COLORS[emotion] || 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {EMOTION_ICONS[emotion] || ''} {emotion}
                    </td>
                    <td style={{ color: t.mistake !== 'None' ? 'var(--danger-color)' : 'var(--text-secondary)' }}>
                      {t.mistake === 'None' ? '—' : t.mistake}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <Share2 size={13} style={{ cursor: 'pointer', opacity: 0.3 }} />
                        <Edit2
                          size={13}
                          style={{ cursor: 'pointer', opacity: 0.7, color: '#60a5fa', transition: 'opacity 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
                          onClick={() => onEditTrade(t)}
                        />
                        <Trash2
                          size={13}
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
