// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [user, setUser] = useState(null); // Could decode token to get user info
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (token) {
            localStorage.setItem('authToken', token);
            // You might want to decode the token here to get user info
            // For now, just having a token means we are "logged in"
        } else {
            localStorage.removeItem('authToken');
        }
    }, [token]);

    const login = async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiLogin(username, password);
            setToken(response.data.token);
            return true;
        } catch (err) {
            setError(err.response?.data?.detail || "Login failed");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            await apiRegister(username, password);
            return true;
        } catch (err) {
            setError(err.response?.data?.detail || "Registration failed");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
    };

    const value = { token, user, login, logout, register, loading, error };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);