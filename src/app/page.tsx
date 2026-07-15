"use client";

import React, { useEffect, useState } from 'react';
import TradeForm from '@/components/TradeForm';
import PerformanceHUD from '@/components/PerformanceHUD';
import MistakeHeatmap from '@/components/MistakeHeatmap';
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
    <main className="container">
      <header className="header animate-fade-in">
        <h1 className="header-title">⚡ Vibe Trading Journal</h1>
        <p className="header-subtitle">Minimalist, local-first execution tracker. No fluff, just math and mindset.</p>
      </header>

      <div className="grid-layout">
        {/* Left Column - Logging */}
        <section>
          <TradeForm onTradeLogged={fetchTrades} />
        </section>

        {/* Right Column - Analysis */}
        <section>
          {loading ? (
            <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px" }}>Loading data...</div>
          ) : (
            <>
              <PerformanceHUD trades={trades} />
              
              <MistakeHeatmap trades={trades} />
              
              <div className="divider"></div>
              
              <HistoricalLedger trades={trades} />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
