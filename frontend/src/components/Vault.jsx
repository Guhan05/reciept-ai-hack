// src/components/Vault.jsx

import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';

export default function Vault() {
    const [pin, setPin] = useState(() => localStorage.getItem('vaultPin'));
    const [isLocked, setIsLocked] = useState(true);

    const handleSetPin = () => {
        const newPin = prompt("Set a 4-digit PIN for your Vault (demo only).");
        if (newPin && /^\d{4}$/.test(newPin)) {
            localStorage.setItem('vaultPin', newPin);
            setPin(newPin);
            alert("PIN set successfully!");
        } else {
            alert("Invalid PIN. Please enter 4 digits.");
        }
    };

    const handleUnlock = () => {
        if (!pin) return alert("Please set a PIN first.");
        const inputPin = prompt("Enter your 4-digit PIN to unlock.");
        if (inputPin === pin) {
            setIsLocked(false);
        } else {
            alert("Incorrect PIN.");
        }
    };

    return (
        <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Secure Vault</h3>
            <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem'}}>
                A simulated vault for your sensitive receipts.
            </p>
            {!pin && <button onClick={handleSetPin} className="neon-button" style={{width: '100%'}}>Set PIN</button>}
            {pin && isLocked && <button onClick={handleUnlock} className="neon-button" style={{width: '100%'}}><Lock size={16}/> Unlock Vault</button>}
            {pin && !isLocked && 
                <div style={{textAlign: 'center', color: 'var(--accent-green)'}}>
                    <Unlock size={24} style={{margin: '0 auto 0.5rem'}}/>
                    <p>Vault Unlocked</p>
                    <button onClick={() => setIsLocked(true)} style={{marginTop: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'}}>Lock Again</button>
                </div>
            }
        </div>
    );
}