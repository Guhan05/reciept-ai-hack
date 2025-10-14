// src/components/Layout.jsx

import React from 'react';
import Header from './Header';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }) {
    const location = useLocation();
    return (
        <>
            <Header />
            <main style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </>
    );
}