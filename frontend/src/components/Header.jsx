// src/components/Header.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut } from 'lucide-react';

export default function Header() {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="glass-card" style={{ margin: '1rem', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--neon-violet)' }}>
                ReceiptAI
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {theme === 'dark' ? <Sun /> : <Moon />}
                </button>
                <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LogOut size={20} /> Logout
                </button>
            </nav>
        </header>
    );
}