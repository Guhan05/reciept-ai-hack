// src/components/FinancialSummary.jsx

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const formatCurrency = (v) => `₹${Math.round(v).toLocaleString('en-IN')}`;

export default function FinancialSummary({ transactions, handCash }) {
    const summary = useMemo(() => {
        // Exclude ATM withdrawals from expenses, as it's just moving money
        const expenses = transactions
            .filter(t => t.amount < 0 && t.category !== 'ATM Withdrawal')
            .reduce((sum, t) => sum + t.amount, 0);

        const income = transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
            
        return { income, expenses, bankBalance: income + expenses };
    }, [transactions]);

    const statVariant = {
        hidden: { opacity: 0, y: 10 },
        visible: i => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1 }
        })
    };

    return (
        <div>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)'}}>Financial Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <motion.div custom={0} variants={statVariant} initial="hidden" animate="visible">
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bank Balance</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>{formatCurrency(summary.bankBalance)}</p>
                </motion.div>
                 <motion.div custom={1} variants={statVariant} initial="hidden" animate="visible">
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hand Cash</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--neon-teal)' }}>{formatCurrency(handCash)}</p>
                </motion.div>
                <motion.div custom={2} variants={statVariant} initial="hidden" animate="visible">
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Expenses</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-red)' }}>{formatCurrency(summary.expenses)}</p>
                </motion.div>
            </div>
        </div>
    );
}