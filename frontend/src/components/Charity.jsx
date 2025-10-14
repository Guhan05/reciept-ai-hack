// src/components/Charity.jsx

import React, { useMemo } from 'react';
import { Heart } from 'lucide-react';

const formatCurrency = (v) => `₹${Math.round(v).toLocaleString('en-IN')}`;

export default function Charity({ transactions, onDonate }) {
    const suggestion = useMemo(() => {
        const now = new Date();
        // Set to the first day of the previous month
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        // Set to the first day of the current month
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        // Set to the first day of the next month
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const calcSavings = (txs, start, end) => {
            const relevantTxs = txs.filter(t => new Date(t.date) >= start && new Date(t.date) < end);
            const income = relevantTxs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
            const expenses = relevantTxs.filter(t => t.amount < 0 && t.category !== 'Charity').reduce((s, t) => s + t.amount, 0);
            return income + expenses;
        };

        const lastMonthSavings = calcSavings(transactions, lastMonthStart, thisMonthStart);
        const thisMonthSavings = calcSavings(transactions, thisMonthStart, nextMonthStart);
        
        if (thisMonthSavings > lastMonthSavings && thisMonthSavings > 0) {
            const surplus = thisMonthSavings - Math.max(0, lastMonthSavings);
            const donationAmount = Math.max(50, Math.round(surplus * 0.05)); // Suggest 5% or min ₹50
            return {
                text: `You saved ${formatCurrency(surplus)} more than last month!`,
                suggestion: `Consider donating ${formatCurrency(donationAmount)}.`,
                rawAmount: donationAmount
            };
        }
        return null;
    }, [transactions]);

    const handleDonate = () => {
        const defaultAmount = suggestion ? suggestion.rawAmount : 50;
        const amountStr = prompt("Enter the amount you'd like to donate:", defaultAmount);

        if (amountStr) {
            const amount = parseFloat(amountStr);
            if (!isNaN(amount) && amount > 0) {
                // Call the function passed down from the Dashboard
                onDonate(amount);
            } else {
                alert("Please enter a valid positive number.");
            }
        }
    };

    return (
        <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Charity Suggestion</h3>
            <div style={{textAlign: 'center'}}>
                <Heart color="var(--accent-red)" size={32} style={{margin: '0 auto 1rem'}}/>
                {suggestion ? (
                    <>
                        <p style={{fontSize: '0.9rem', color: 'var(--text-primary)'}}>{suggestion.text}</p>
                        <p style={{fontSize: '1rem', fontWeight: 'bold', color: 'var(--neon-teal)', marginTop: '0.5rem'}}>{suggestion.suggestion}</p>
                        <button onClick={handleDonate} className="neon-button" style={{marginTop: '1rem'}}>
                            Donate Now
                        </button>
                    </>
                ) : (
                    <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Keep saving to unlock donation suggestions!</p>
                )}
            </div>
        </div>
    );
}