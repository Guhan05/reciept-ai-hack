// src/components/AnimatedCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedCard({ children, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay }}
            className="glass-card"
            style={{ padding: '1.5rem', height: '100%' }}
        >
            {children}
        </motion.div>
    );
}