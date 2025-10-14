// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, register, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        let success = false;
        if (isLogin) {
            success = await login(username, password);
        } else {
            success = await register(username, password);
            if(success) {
                alert('Registration successful! Please log in.');
                setIsLogin(true);
                setUsername('');
                setPassword('');
            }
        }
        if (success && isLogin) {
            navigate('/');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}
            >
                <h1 style={{ textAlign: 'center', color: 'var(--neon-violet)', marginBottom: '2rem' }}>
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            className="glass-input"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="glass-input"
                            required
                        />
                    </div>
                    {error && <p style={{ color: 'var(--accent-red)', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
                    <button type="submit" className="neon-button" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--neon-teal)', cursor: 'pointer', marginLeft: '0.5rem' }}>
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
}