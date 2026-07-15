"use client";

import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface Trade {
  timestamp: string;
  raw_pnl: number;
  setup_name: string;
}

function buildSetupStats(trades: Trade[], commission: number) {
  const map: Record<string, { wins: number; losses: number; totalPnl: number; grossProfit: number; grossLoss: number }> = {};
  for (const t of trades) {
    const key = t.setup_name || 'Unknown';
    if (!map[key]) map[key] = { wins: 0, losses: 0, totalPnl: 0, grossProfit: 0, grossLoss: 0 };
    const adjPnl = t.raw_pnl - commission;
    map[key].totalPnl += adjPnl;
    if (adjPnl > 0) { map[key].wins++; map[key].grossProfit += adjPnl; }
    else { map[key].losses++; map[key].grossLoss += Math.abs(adjPnl); }
  }
  return Object.entries(map)
    .map(([name, s]) => ({
      name,
      trades: s.wins + s.losses,
      winRate: s.wins + s.losses > 0 ? ((s.wins / (s.wins + s.losses)) * 100).toFixed(0) : '0',
      totalPnl: parseFloat(s.totalPnl.toFixed(2)),
      pf: s.grossLoss > 0 ? parseFloat((s.grossProfit / s.grossLoss).toFixed(2)) : (s.grossProfit > 0 ? 99 : 0),
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl);
}

export default function DashboardCharts({ trades, commission = 0 }: { trades: Trade[], commission?: number }) {
  const sortedTrades = [...trades].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  let cumPnL = 0;
  const equityData = sortedTrades.map((t, idx) => {
    cumPnL += (t.raw_pnl - commission);
    return { name: `#${idx + 1}`, pnl: parseFloat(cumPnL.toFixed(2)) };
  });

  const wins = trades.filter(t => (t.raw_pnl - commission) > 0).length;
  const losses = trades.filter(t => (t.raw_pnl - commission) <= 0).length;
  const total = wins + losses;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
  
  const pieData = [
    { name: 'Wins', value: wins },
    { name: 'Losses', value: losses }
  ];
  const COLORS = ['#00e5ff', '#ff3366'];
  const setupStats = buildSetupStats(trades, commission);

  return (
    <>
      <div className="dashboard-grid">
        
        {/* Equity Curve */}
        <div className="col-span-8 glass-panel">
          <h3 className="form-label">Equity Curve</h3>
          <div style={{ height: 230, marginTop: '16px' }}>
            {equityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#00e5ff' }}
                    formatter={(value: any) => [`$${value}`, 'Cumulative PnL']}
                  />
                  <Area type="monotone" dataKey="pnl" stroke="#00e5ff" strokeWidth={2} fillOpacity={1} fill="url(#colorPnL)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#52525b' }}>
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Win/Loss Donut */}
        <div className="col-span-4 glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="form-label">Win / Loss Ratio</h3>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
            {total > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={76} stroke="none" paddingAngle={4} dataKey="value">
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#00e5ff' }}>{winRate}%</div>
                  <div style={{ fontSize: '0.6rem', color: '#a1a1aa' }}>Win Rate</div>
                </div>
              </>
            ) : (
              <div style={{ color: '#52525b' }}>No data</div>
            )}
          </div>
          {total > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00e5ff' }}></div>
                <span>Wins: {wins}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ff3366' }}></div>
                <span>Losses: {losses}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Setup Performance Table */}
      {setupStats.length > 0 && (
        <div className="glass-panel" style={{ marginTop: '0' }}>
          <h3 className="form-label" style={{ marginBottom: '16px' }}>Setup Performance</h3>
          <table className="data-table" style={{ fontSize: '0.82rem' }}>
            <thead>
              <tr>
                <th>Setup</th>
                <th>Trades</th>
                <th>Win Rate</th>
                <th>Profit Factor</th>
                <th>Total PnL</th>
              </tr>
            </thead>
            <tbody>
              {setupStats.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.trades}</td>
                  <td style={{ color: parseInt(s.winRate) >= 50 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                    {s.winRate}%
                  </td>
                  <td style={{ color: s.pf >= 1 ? 'var(--success-color)' : 'var(--danger-color)', fontFamily: 'var(--font-mono)' }}>
                    {s.pf === 99 ? '∞' : s.pf.toFixed(2)}
                  </td>
                  <td className={s.totalPnl >= 0 ? 'val-positive' : 'val-negative'} style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {s.totalPnl >= 0 ? '+' : ''}${s.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
