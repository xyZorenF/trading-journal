import React from 'react';

interface Trade {
  raw_pnl: number;
  r_multiple: number;
}

export default function PerformanceHUD({ trades }: { trades: Trade[] }) {
  const totalTrades = trades.length;
  const wins = trades.filter(t => t.raw_pnl > 0);
  const losses = trades.filter(t => t.raw_pnl < 0);
  
  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
  
  const grossProfit = wins.reduce((acc, t) => acc + t.raw_pnl, 0);
  const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.raw_pnl, 0));
  
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : (grossProfit > 0 ? grossProfit : 0);
  
  const totalR = trades.reduce((acc, t) => acc + t.r_multiple, 0);
  const avgR = totalTrades > 0 ? totalR / totalTrades : 0;
  const totalPnL = trades.reduce((acc, t) => acc + t.raw_pnl, 0);

  return (
    <div className="hud-bar">
      <div className="hud-metric">
        <div className="hud-label">Total PNL</div>
        <div className={`hud-value ${totalPnL >= 0 ? 'val-positive' : 'val-negative'}`}>
          ${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
      
      <div className="hud-metric">
        <div className="hud-label">Total Trades</div>
        <div className="hud-value" style={{ color: "var(--text-primary)" }}>{totalTrades}</div>
      </div>
      
      <div className="hud-metric">
        <div className="hud-label">Win Rate</div>
        <div className="hud-value val-positive">{winRate.toFixed(1)}%</div>
      </div>
      
      <div className="hud-metric">
        <div className="hud-label">W / L</div>
        <div className="hud-value">
          <span className="val-positive">{wins.length}</span> <span style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>/</span> <span className="val-negative">{losses.length}</span>
        </div>
      </div>
      
      <div className="hud-metric">
        <div className="hud-label">Profit Factor</div>
        <div className="hud-value">{profitFactor.toFixed(2)}</div>
      </div>
      
      <div className="hud-metric">
        <div className="hud-label">Avg R-Multiple</div>
        <div className="hud-value" style={{ color: "var(--text-primary)" }}>{avgR.toFixed(2)}R</div>
      </div>
      
      <div className="hud-metric">
        <div className="hud-label">Total R</div>
        <div className={`hud-value ${totalR >= 0 ? 'val-positive' : 'val-negative'}`}>
          {totalR > 0 ? '+' : ''}{totalR.toFixed(2)}R
        </div>
      </div>
    </div>
  );
}
