"use client";

import React, { useEffect, useState } from 'react';
import TradeForm from '@/components/TradeForm';
import PerformanceHUD from '@/components/PerformanceHUD';
import DashboardCharts from '@/components/DashboardCharts';
import HistoricalLedger from '@/components/HistoricalLedger';
import SettingsPanel from '@/components/SettingsPanel';

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

export default function Home() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTrade, setEditTrade] = useState<Trade | null>(null);
  const [commission, setCommission] = useState(0);

  const fetchTrades = async () => {
    try {
      const res = await fetch('/api/trades');
      if (res.ok) {
        const data = await res.json();
        setTrades(data);
      }
    } catch (error) {
      console.error("Failed to fetch trades", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleSettingsChange = ({ commission: c }: { commission: number; accountBalance: number }) => {
    setCommission(c);
  };

  return (
    <main className="container">
      
      <header className="header-row">
        <div className="brand-title">
          <span style={{ color: "var(--accent-color)" }}>⚡</span> Vibe Journal
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <SettingsPanel onChange={handleSettingsChange} />
          <TradeForm
            onTradeLogged={fetchTrades}
            editTrade={editTrade}
            onEditClose={() => setEditTrade(null)}
          />
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "100px" }}>
          Loading your edge...
        </div>
      ) : (
        <>
          <PerformanceHUD trades={trades} commission={commission} />

          <DashboardCharts trades={trades} commission={commission} />

          <HistoricalLedger
            trades={trades}
            onTradeDeleted={fetchTrades}
            onEditTrade={(trade) => setEditTrade(trade)}
            commission={commission}
          />
        </>
      )}

    </main>
  );
}
