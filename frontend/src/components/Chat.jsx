// src/components/Chat.jsx

import React, { useState } from 'react';
import { askChat } from '../api';
import { Send } from 'lucide-react';

export default function Chat() {
    const [messages, setMessages] = useState([
        { from: 'assistant', text: "Ask me about your recent spending." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // ===================================================================
    // 1. ADDED: List of predefined questions
    // ===================================================================
    const faqQuestions = [
        "How much did I spend on food?",
        "What was my biggest expense?",
        "Give me some tips to save money"
    ];

    // ===================================================================
    // 2. MODIFIED: The handleSend function now accepts a question directly
    // ===================================================================
    const handleSend = async (questionToSend) => {
        const question = typeof questionToSend === 'string' ? questionToSend : input;
        if (!question.trim() || loading) return;

        const newMessages = [...messages, { from: 'user', text: question }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const res = await askChat(question);
            setMessages([...newMessages, { from: 'assistant', text: res.data.answer }]);
        } catch (error) {
            setMessages([...newMessages, { from: 'assistant', text: "Sorry, I couldn't get a response." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Ask AI</h3>
            <div style={{ height: '150px', overflowY: 'auto', marginBottom: '1rem', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ marginBottom: '0.5rem', textAlign: msg.from === 'user' ? 'right' : 'left' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '1rem',
                            backgroundColor: msg.from === 'user' ? 'var(--neon-violet)' : 'var(--border-color)',
                            color: msg.from === 'user' ? 'white' : 'var(--text-primary)',
                            maxWidth: '80%'
                        }}>
                            {msg.text}
                        </span>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a question..."
                    className="glass-input"
                    style={{ flexGrow: 1 }}
                />
                <button onClick={() => handleSend()} disabled={loading} className="neon-button">
                    <Send size={20}/>
                </button>
            </div>

            {/* =================================================================== */}
            {/* 3. ADDED: This is the new JSX for the FAQ buttons */}
            {/* =================================================================== */}
            <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Or try one of these:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {faqQuestions.map((q) => (
                        <button
                            key={q}
                            onClick={() => handleSend(q)}
                            disabled={loading}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-muted)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '99px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseOver={e => e.target.style.borderColor = 'var(--neon-teal)'}
                            onMouseOut={e => e.target.style.borderColor = 'var(--border-color)'}
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}