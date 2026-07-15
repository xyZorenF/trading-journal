import React from 'react';

interface Trade {
  raw_pnl: number;
  r_multiple: number;
  timestamp: string;
}

function calcWorstStreak(trades: Trade[]): number {
  // Sort chronologically for accurate streak calculation
  const sorted = [...trades].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  let worst = 0, current = 0;
  for (const t of sorted) {
    if (t.raw_pnl < 0) {
      current++;
      if (current > worst) worst = current;
    } else {
      current = 0;
    }
  }
  return worst;
}

export default function PerformanceHUD({ trades, commission = 0 }: { trades: Trade[], commission?: number }) {
  const totalTrades = trades.length;
  const wins = trades.filter(t => (t.raw_pnl - commission) > 0);
  const losses = trades.filter(t => (t.raw_pnl - commission) <= 0);

  const winRate = totalTrades > 0 ? wins.length / totalTrades : 0;
  const lossRate = 1 - winRate;

  const grossProfit = wins.reduce((acc, t) => acc + (t.raw_pnl - commission), 0);
  const grossLoss = Math.abs(losses.reduce((acc, t) => acc + (t.raw_pnl - commission), 0));

  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? grossProfit : 0);

  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const expectancy = (avgWin * winRate) - (avgLoss * lossRate);

  const totalR = trades.reduce((acc, t) => acc + t.r_multiple, 0);
  const avgR = totalTrades > 0 ? totalR / totalTrades : 0;
  const totalPnL = trades.reduce((acc, t) => acc + (t.raw_pnl - commission), 0);
  const worstStreak = calcWorstStreak(trades);

  const metrics = [
    {
      label: 'Total PNL',
      value: `$${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: totalPnL >= 0 ? 'var(--success-color)' : 'var(--danger-color)',
    },
    { label: 'Trades', value: String(totalTrades), color: 'var(--text-primary)' },
    { label: 'Win Rate', value: `${(winRate * 100).toFixed(1)}%`, color: 'var(--success-color)' },
    {
      label: 'W / L',
      value: null,
      wins: wins.length,
      losses: losses.length,
    },
    { label: 'Profit Factor', value: profitFactor.toFixed(2), color: profitFactor >= 1 ? 'var(--success-color)' : 'var(--danger-color)' },
    {
      label: 'Expectancy',
      value: `${expectancy >= 0 ? '+' : ''}$${expectancy.toFixed(2)}/trade`,
      color: expectancy >= 0 ? 'var(--success-color)' : 'var(--danger-color)',
    },
    { label: 'Avg R', value: `${avgR >= 0 ? '+' : ''}${avgR.toFixed(2)}R`, color: 'var(--text-primary)' },
    { label: 'Worst Streak', value: `${worstStreak}L`, color: worstStreak >= 5 ? 'var(--danger-color)' : 'var(--text-secondary)' },
  ];

  return (
    <div className="hud-bar" style={{ flexWrap: 'wrap' }}>
      {metrics.map((m, i) => (
        <div key={i} className="hud-metric">
          <div className="hud-label">{m.label}</div>
          {m.value !== null && m.value !== undefined ? (
            <div className="hud-value" style={{ color: m.color, fontSize: '1rem' }}>{m.value}</div>
          ) : (
            <div className="hud-value" style={{ fontSize: '1rem' }}>
              <span style={{ color: 'var(--success-color)' }}>{m.wins}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}> / </span>
              <span style={{ color: 'var(--danger-color)' }}>{m.losses}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
