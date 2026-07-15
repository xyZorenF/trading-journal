"use client";

import React, { useEffect, useState } from 'react';
import TradeForm from '@/components/TradeForm';
import PerformanceHUD from '@/components/PerformanceHUD';
import DashboardCharts from '@/components/DashboardCharts';
import HistoricalLedger from '@/components/HistoricalLedger';

export default function Home() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="container animate-fade-in">
      
      <header className="header-row">
        <div className="brand-title">
          <span style={{ color: "var(--accent-color)" }}>⚡</span> Vibe Journal
        </div>
        <div>
          <TradeForm onTradeLogged={fetchTrades} />
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "100px" }}>
          Loading your edge...
        </div>
      ) : (
        <>
          <PerformanceHUD trades={trades} />
          
          <DashboardCharts trades={trades} />
          
          <HistoricalLedger trades={trades} />
        </>
      )}

    </main>
  );
}
