// src/components/TransactionsList.jsx

import React from 'react';
import { motion } from 'framer-motion';

// This helper now formats the number but leaves the sign to be determined by the component
const formatCurrency = (v) => `₹${Math.abs(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const groupTransactionsByDate = (transactions) => {
    const groups = transactions.reduce((groups, tx) => {
        const date = new Date(tx.date).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(tx);
        return groups;
    }, {});
    return Object.entries(groups);
};

const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function TransactionsList({ transactions }) {
    const groupedTransactions = groupTransactionsByDate(transactions);

    return (
        <div>
            <h2 style={{ marginBottom: '1rem' }}>Transaction Timeline</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '1rem' }}>
                {groupedTransactions.length === 0 ? (
                    <div style={{textAlign: 'center', color: 'var(--text-muted)', paddingTop: '2rem'}}>No transactions yet.</div>
                ) : (
                    groupedTransactions.map(([date, txs], groupIndex) => (
                        <div key={date}>
                            <h4 style={{ color: 'var(--text-muted)', margin: '1rem 0 0.5rem', fontSize: '0.9rem' }}>
                                {formatDateForDisplay(date)}
                            </h4>
                            {txs.map((tx, txIndex) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: (groupIndex * 0.1) + (txIndex * 0.05) }}
                                    style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border-color)'}}
                                >
                                    <div>
                                        <p style={{ fontWeight: 600 }}>{tx.merchant}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tx.category} • {tx.mode}</p>
                                    </div>

                                    {/* === MODIFICATION START === */}
                                    <div style={{ 
                                            color: tx.amount > 0 ? 'var(--accent-green)' : 'var(--accent-red)', 
                                            fontWeight: 600, 
                                            textAlign: 'right' 
                                        }}>
                                        {tx.amount > 0 ? '+' : '-'} {formatCurrency(tx.amount)}
                                    </div>
                                    {/* === MODIFICATION END === */}

                                </motion.div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}