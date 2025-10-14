// src/components/ManualEntry.jsx

import React, { useState } from 'react';
import { addManualTransaction } from '../api';

export default function ManualEntry({ onEntrySuccess, transactions }) {
    const [merchant, setMerchant] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Groceries');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!merchant || !amount) {
            alert('Please fill all fields');
            return;
        }

        // De-duplication Logic
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const potentialDuplicates = transactions.filter(t => {
            const txDate = new Date(t.date);
            // Check for similar amount (within ₹1 tolerance) in the last month
            return txDate > oneMonthAgo && Math.abs(Math.abs(t.amount) - parseFloat(amount)) <= 1;
        });

        if (potentialDuplicates.length > 0 && category !== 'ATM Withdrawal') {
            const firstMatch = potentialDuplicates[0];
            const isDuplicate = window.confirm(
                `We found a similar transaction:\n\n${firstMatch.merchant} for ₹${Math.abs(firstMatch.amount)} on ${new Date(firstMatch.date).toLocaleDateString()}.\n\nIs this the same transaction? (Choosing 'OK' will not create a new entry)`
            );
            if (isDuplicate) {
                alert('Transaction matched! No new entry created.');
                setMerchant('');
                setAmount('');
                return;
            }
        }
        
        setSubmitting(true);
        try {
            const newTxData = { merchant, amount, category };
            const response = await addManualTransaction(newTxData);
            alert('Entry added!');
            setMerchant('');
            setAmount('');
            // Pass the new transaction and its type back to the dashboard
            onEntrySuccess(response.data.transaction, 'manual'); 
        } catch (error) {
            alert('Failed to add expense.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <h3 style={{ marginBottom: '1rem' }}>Add Manual Entry</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="Merchant / Item / ATM" className="glass-input" />
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (e.g., 150)" className="glass-input" />
                 <select value={category} onChange={e => setCategory(e.target.value)} className="glass-input">
                    <option>Groceries</option>
                    <option>Dining</option>
                    <option>Transport</option>
                    <option>Shopping</option>
                    <option>Utilities</option>
                    <option>ATM Withdrawal</option>
                    <option>Other</option>
                </select>
                <button type="submit" disabled={submitting} className="neon-button" style={{ borderColor: 'var(--neon-violet)', color: 'var(--neon-violet)'}}>
                    {submitting ? 'Adding...' : 'Add Entry'}
                </button>
            </form>
        </div>
    );
}