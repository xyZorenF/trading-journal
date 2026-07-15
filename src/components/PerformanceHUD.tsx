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

  return (
    <div className="metrics-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="metric-card">
        <div className="metric-label">Win Rate</div>
        <div className="metric-value">{winRate.toFixed(1)}%</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Profit Factor</div>
        <div className="metric-value">{profitFactor.toFixed(2)}</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Avg R-Multiple</div>
        <div className="metric-value">{avgR.toFixed(2)}R</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Total R Captured</div>
        <div className="metric-value val-positive">{totalR.toFixed(2)}R</div>
      </div>
    </div>
  );
}
