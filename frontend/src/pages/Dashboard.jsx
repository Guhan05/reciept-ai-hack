// src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { getDashboardData, addManualTransaction } from '../api';
import AnimatedCard from '../components/AnimatedCard';

// Import all our feature components
import FinancialSummary from '../components/FinancialSummary';
import TransactionsList from '../components/TransactionsList';
import ReceiptUpload from '../components/ReceiptUpload';
import ManualEntry from '../components/ManualEntry';
import Charts from '../components/Charts';
import TimelineChart from '../components/TimelineChart'; // <-- IMPORT THE NEW CHART
import Gamification from '../components/Gamification';
import Chat from '../components/Chat';
import EmiTools from '../components/EmiTools';
import Vault from '../components/Vault';
import Charity from '../components/Charity';


export default function Dashboard() {
    const [data, setData] = useState({ transactions: [], receipts: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [handCash, setHandCash] = useState(500);

    const fetchData = async () => {
        try {
            const response = await getDashboardData();
            setData(response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            setError("Could not load data. Please check your connection or try logging in again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDataRefresh = (newTx, type) => {
        if (newTx && type === 'manual') {
            if (newTx.category === 'ATM Withdrawal') {
                setHandCash(prev => prev + Math.abs(newTx.amount));
            } else {
                setHandCash(prev => prev - Math.abs(newTx.amount));
            }
        }
        fetchData();
    };

    const handleDonation = async (amount) => {
        try {
            await addManualTransaction({
                merchant: "Charity Donation",
                amount: amount,
                category: "Charity"
            });
            alert('Thank you for your generous donation!');
            fetchData();
        } catch (error) {
            alert('Donation failed. Please try again.');
            console.error("Donation error:", error);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading Dashboard...</div>;
    }
    
    if (error) {
        return <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--accent-red)' }}>{error}</div>;
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 'minmax(100px, auto)', gap: '1.5rem' }}>
            
            <div style={{ gridColumn: 'span 4' }}>
                <AnimatedCard>
                    <FinancialSummary transactions={data.transactions} handCash={handCash} />
                </AnimatedCard>
            </div>
            
            <div style={{ gridColumn: 'span 2', gridRow: 'span 2' }}>
                <AnimatedCard delay={0.1}>
                    <TransactionsList transactions={data.transactions} />
                </AnimatedCard>
            </div>

            {/* === ANALYTICS ROW === */}
            <div style={{ gridColumn: 'span 2' }}>
                <AnimatedCard delay={0.2}>
                    <Charts transactions={data.transactions} />
                </AnimatedCard>
            </div>
             <div style={{ gridColumn: 'span 2' }}>
                <AnimatedCard delay={0.3}>
                    <TimelineChart transactions={data.transactions} />
                </AnimatedCard>
            </div>
            {/* === END ANALYTICS ROW === */}
            
            <div style={{ gridColumn: 'span 2' }}>
                 <AnimatedCard delay={0.4}>
                    <ManualEntry onEntrySuccess={handleDataRefresh} transactions={data.transactions} />
                </AnimatedCard>
            </div>

            <div style={{ gridColumn: 'span 1' }}>
                <AnimatedCard delay={0.5}>
                    <ReceiptUpload onUploadSuccess={fetchData} />
                </AnimatedCard>
            </div>

             <div style={{ gridColumn: 'span 1' }}>
                <AnimatedCard delay={0.6}>
                    <Gamification />
                </AnimatedCard>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
                <AnimatedCard delay={0.7}>
                    <Chat />
                </AnimatedCard>
            </div>
            
            <div style={{ gridColumn: 'span 1' }}>
                <AnimatedCard delay={0.8}>
                    <EmiTools />
                </AnimatedCard>
            </div>
            <div style={{ gridColumn: 'span 1' }}>
                 <AnimatedCard delay={0.9}>
                    <Vault />
                </AnimatedCard>
            </div>
             <div style={{ gridColumn: 'span 2' }}>
                 <AnimatedCard delay={1.0}>
                    <Charity transactions={data.transactions} onDonate={handleDonation} />
                </AnimatedCard>
            </div>

        </div>
    );
}