// src/components/EmiTools.jsx

import React, { useState } from 'react';

const formatCurrency = (v) => `₹${Math.round(v).toLocaleString('en-IN')}`;

export default function EmiTools() {
    const [emis, setEmis] = useState([{ id: 1, name: "iPhone 17", amount: 7500 }]);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');

    const addEmi = (e) => {
        e.preventDefault();
        if (!name || !amount) return;
        setEmis([...emis, { id: Date.now(), name, amount: parseFloat(amount) }]);
        setName('');
        setAmount('');
    };

    const totalEmi = emis.reduce((sum, emi) => sum + emi.amount, 0);

    return (
        <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>EMI Manager</h3>
            <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Monthly EMI</p>
                <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{formatCurrency(totalEmi)}</p>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1rem', fontSize: '0.9rem' }}>
                {emis.map(emi => (
                    <li key={emi.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                        <span>{emi.name}</span>
                        <span>{formatCurrency(emi.amount)}</span>
                    </li>
                ))}
            </ul>
            <form onSubmit={addEmi}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Add New EMI</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="EMI Name" className="glass-input" style={{flex: 2}}/>
                    <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="Amount" className="glass-input" style={{flex: 1}}/>
                    <button type="submit" className="neon-button" style={{padding: '0 1rem'}}>+</button>
                </div>
            </form>
        </div>
    );
}