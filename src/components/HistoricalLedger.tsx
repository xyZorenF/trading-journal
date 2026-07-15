import React from 'react';

interface Trade {
  timestamp: string;
  ticker: string;
  direction: string;
  setup_name: string;
  entry: number;
  exit: number;
  raw_pnl: number;
  r_multiple: number;
  mistake: string;
}

export default function HistoricalLedger({ trades }: { trades: Trade[] }) {
  if (trades.length === 0) {
    return (
      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No trades logged yet. Submit your first trade to populate the ledger.</p>
      </div>
    );
  }

  // Sort trades by timestamp descending (newest first)
  const sortedTrades = [...trades].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <h3 className="header-subtitle" style={{ color: "var(--text-primary)", fontWeight: "600", fontSize: "1.1rem", marginBottom: "20px" }}>Historical Ledger</h3>
      
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Ticker</th>
              <th>Dir</th>
              <th>Setup</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>PnL</th>
              <th>R-Mult</th>
              <th>Mistake</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrades.map((t, idx) => {
              const pnlClass = t.raw_pnl > 0 ? "val-positive" : t.raw_pnl < 0 ? "val-negative" : "";
              const date = new Date(t.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              
              return (
                <tr key={idx}>
                  <td style={{ color: "var(--text-secondary)" }}>{date}</td>
                  <td style={{ fontWeight: "bold" }}>{t.ticker}</td>
                  <td style={{ color: t.direction === 'Long' ? 'var(--success-color)' : 'var(--danger-color)' }}>{t.direction}</td>
                  <td>{t.setup_name}</td>
                  <td>{t.entry.toFixed(2)}</td>
                  <td>{t.exit.toFixed(2)}</td>
                  <td className={pnlClass}>${t.raw_pnl.toFixed(2)}</td>
                  <td className={pnlClass}>{t.r_multiple.toFixed(2)}R</td>
                  <td style={{ color: t.mistake !== 'None' ? 'var(--danger-color)' : 'var(--text-secondary)' }}>{t.mistake}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
