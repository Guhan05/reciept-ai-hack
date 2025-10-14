// src/components/Gamification.jsx

import React, { useState } from 'react';
import { Award, Shield, TrendingUp } from 'lucide-react';

export default function Gamification() {
    const [points, setPoints] = useState(120);
    const [level, setLevel] = useState("Budget Rookie");
    const [badges, setBadges] = useState(["Starter", "First Upload"]);

    return (
        <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)'}}>Your Progress</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <TrendingUp color="var(--neon-teal)" />
                    <div>
                        <p style={{ fontWeight: '600' }}>{points} Points</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Earn more by tracking expenses!</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Shield color="var(--neon-violet)" />
                    <div>
                        <p style={{ fontWeight: '600' }}>Level: {level}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Next level at 200 points</p>
                    </div>
                </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Award color="var(--accent-green)" />
                    <div>
                        <p style={{ fontWeight: '600' }}>Badges</p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                            {badges.map(badge => (
                                <span key={badge} style={{ fontSize: '0.75rem', backgroundColor: 'var(--border-color)', padding: '0.25rem 0.5rem', borderRadius: '99px' }}>
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}