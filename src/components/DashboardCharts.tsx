"use client";

import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface Trade {
  timestamp: string;
  raw_pnl: number;
}

export default function DashboardCharts({ trades }: { trades: Trade[] }) {
  // Process Equity Curve Data
  // Sort trades chronologically
  const sortedTrades = [...trades].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  let cumPnL = 0;
  const equityData = sortedTrades.map((t, idx) => {
    cumPnL += t.raw_pnl;
    return {
      name: `Trade ${idx + 1}`,
      pnl: parseFloat(cumPnL.toFixed(2))
    };
  });

  // Process Win/Loss Ratio Data
  const wins = trades.filter(t => t.raw_pnl > 0).length;
  const losses = trades.filter(t => t.raw_pnl < 0).length;
  const total = wins + losses;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
  
  const pieData = [
    { name: 'Wins', value: wins },
    { name: 'Losses', value: losses }
  ];
  const COLORS = ['#00e5ff', '#ff3366'];

  return (
    <div className="dashboard-grid">
      
      {/* Equity Curve */}
      <div className="col-span-8 glass-panel">
        <h3 className="form-label">Equity Curve</h3>
        <div style={{ height: 250, marginTop: '20px' }}>
          {equityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
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
              No data
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
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    stroke="none"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00e5ff' }}>{winRate}%</div>
                <div style={{ fontSize: '0.65rem', color: '#a1a1aa' }}>Win Rate</div>
              </div>
            </>
          ) : (
             <div style={{ color: '#52525b' }}>No data</div>
          )}
        </div>
        
        {total > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#00e5ff' }}></div>
              <span>Wins: {wins}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ff3366' }}></div>
              <span>Losses: {losses}</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
