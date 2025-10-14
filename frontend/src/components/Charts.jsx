// src/components/Charts.jsx

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#a259ff', '#00f6ff', '#22c55e', '#ef4444', '#f59e0b', '#3b82f6'];

const aggregateByCategory = (transactions) => {
    const spend = transactions.filter(t => t.amount < 0 && t.category !== 'ATM Withdrawal');
    const map = spend.reduce((acc, t) => {
        const cat = t.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
        return acc;
    }, {});
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) })).sort((a,b) => b.value - a.value);
};

export default function Charts({ transactions }) {
    const categoryData = aggregateByCategory(transactions);

    if (categoryData.length === 0) {
        return (
            <div>
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)'}}>Spending by Category</h2>
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>
                    No expense data to display.
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)'}}>Spending by Category</h2>
            <div style={{ height: '200px' }}>
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                        >
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)"}}/>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}