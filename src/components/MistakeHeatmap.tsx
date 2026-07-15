import React from 'react';

interface Trade {
  mistake: string;
  raw_pnl: number;
  r_multiple: number;
}

export default function MistakeHeatmap({ trades }: { trades: Trade[] }) {
  const mistakes = trades.filter(t => t.mistake !== 'None');

  if (mistakes.length === 0) {
    return (
      <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h3 className="header-subtitle" style={{ color: "var(--text-primary)", fontWeight: "600", fontSize: "1.1rem" }}>Mistake Cost Analysis</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "10px" }}>No execution mistakes logged yet. Excellent discipline.</p>
      </div>
    );
  }

  // Aggregate mistakes
  const agg: Record<string, { count: number; pnl: number; r: number }> = {};
  
  mistakes.forEach(t => {
    if (!agg[t.mistake]) {
      agg[t.mistake] = { count: 0, pnl: 0, r: 0 };
    }
    agg[t.mistake].count += 1;
    agg[t.mistake].pnl += t.raw_pnl;
    agg[t.mistake].r += t.r_multiple;
  });

  const sortedMistakes = Object.entries(agg)
    .sort((a, b) => a[1].r - b[1].r); // Sort by R-loss (most negative first)
    
  // Find worst loss for heatmap scaling
  const minR = Math.min(...sortedMistakes.map(m => m[1].r));

  return (
    <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <h3 className="header-subtitle" style={{ color: "var(--text-primary)", fontWeight: "600", fontSize: "1.1rem" }}>Mistake Cost Analysis</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>Quantifying psychological leaks and poor execution.</p>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>Mistake</th>
            <th>Count</th>
            <th>Capital Lost</th>
            <th>R Lost</th>
            <th>Impact</th>
          </tr>
        </thead>
        <tbody>
          {sortedMistakes.map(([mistake, data]) => {
            // Calculate percentage width for heatmap bar based on max negative R
            const widthPct = minR < 0 ? Math.min(100, Math.max(0, (data.r / minR) * 100)) : 0;
            return (
              <tr key={mistake}>
                <td>{mistake}</td>
                <td>{data.count}</td>
                <td className="val-negative">${data.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="val-negative">{data.r.toFixed(2)}R</td>
                <td style={{ width: '30%' }}>
                  <div className="heatmap-bar-container">
                    <div className="heatmap-bar" style={{ width: `${widthPct}%` }}></div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
