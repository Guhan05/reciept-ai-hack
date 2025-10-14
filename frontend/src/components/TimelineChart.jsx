// src/components/TimelineChart.jsx

import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const formatYAxis = (tick) => {
    if (tick >= 1000) {
        return `₹${tick / 1000}k`;
    }
    return `₹${tick}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card" style={{ padding: '0.5rem 1rem' }}>
        <p>{`Date: ${label}`}</p>
        <p style={{ color: 'var(--neon-violet)'}}>{`Balance: ₹${payload[0].value.toLocaleString('en-IN')}`}</p>
      </div>
    );
  }
  return null;
};

export default function TimelineChart({ transactions }) {
    const chartData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];
        
        const sortedTx = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
        const data = [];
        let currentBalance = 0;

        sortedTx.forEach(tx => {
            currentBalance += tx.amount;
            data.push({
                date: new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                balance: Math.round(currentBalance)
            });
        });
        
        // To make the chart more meaningful, we can show the last 30 data points
        return data.slice(-30);
    }, [transactions]);

    if (chartData.length < 2) {
        return (
            <div>
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)'}}>Balance Timeline</h2>
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>
                    Not enough data for a timeline graph.
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)'}}>Balance Timeline</h2>
            <div style={{ height: '200px' }}>
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={"var(--border-color)"} />
                        <XAxis dataKey="date" stroke={"var(--text-muted)"} fontSize={12}/>
                        <YAxis stroke={"var(--text-muted)"} fontSize={12} tickFormatter={formatYAxis}/>
                        <Tooltip content={<CustomTooltip />}/>
                        <Line type="monotone" dataKey="balance" stroke="var(--neon-violet)" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}