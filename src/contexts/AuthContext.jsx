import React, { useState, useEffect, useMemo, createContext, useContext, useCallback } from 'react';

// Create auth context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    // Initialize from localStorage only once
    return {
      token: localStorage.getItem('token'),
      subscriptionStatus: localStorage.getItem('subscriptionStatus') === 'true',
      mobileNumber: localStorage.getItem('mobileNumber'),
      deviceId: localStorage.getItem('deviceId'),
      userProfile: JSON.parse(localStorage.getItem('userProfile') || 'null'),
    };
  });

  // Sync token to localStorage
  useEffect(() => {
    if (authState.token) {
      localStorage.setItem('token', authState.token);
    } else {
      localStorage.removeItem('token');
    }
  }, [authState.token]);

  // Sync subscription status to localStorage
  useEffect(() => {
    localStorage.setItem('subscriptionStatus', String(authState.subscriptionStatus));
  }, [authState.subscriptionStatus]);

  // Sync mobile number to localStorage
  useEffect(() => {
    if (authState.mobileNumber) {
      localStorage.setItem('mobileNumber', authState.mobileNumber);
    }
  }, [authState.mobileNumber]);

  // Sync user profile to localStorage
  useEffect(() => {
    if (authState.userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(authState.userProfile));
    } else {
      localStorage.removeItem('userProfile');
    }
  }, [authState.userProfile]);

  const setToken = useCallback((token) => {
    setAuthState(prev => ({ ...prev, token }));
  }, []);

  const setSubscriptionStatus = useCallback((status) => {
    setAuthState(prev => ({ ...prev, subscriptionStatus: status }));
  }, []);

  const setMobileNumber = useCallback((mobileNumber) => {
    setAuthState(prev => ({ ...prev, mobileNumber }));
  }, []);

  const setUserProfile = useCallback((profile) => {
    setAuthState(prev => ({ ...prev, userProfile: profile }));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('subscriptionStatus');
    localStorage.removeItem('userProfile');
    setAuthState(prev => ({
      token: null,
      subscriptionStatus: false,
      mobileNumber: null,
      deviceId: prev.deviceId, // Keep device ID
      userProfile: null,
    }));
  }, []);

  const getDeviceId = useCallback(() => {
    if (authState.deviceId) {
      return authState.deviceId;
    }
    // Generate a new device ID if doesn't exist
    const newDeviceId = crypto.randomUUID();
    localStorage.setItem('deviceId', newDeviceId);
    setAuthState(prev => ({ ...prev, deviceId: newDeviceId }));
    return newDeviceId;
  }, [authState.deviceId]);

  const value = useMemo(() => ({
    ...authState,
    isLoggedIn: !!authState.token,
    isSubscribed: authState.subscriptionStatus,
    setToken,
    setSubscriptionStatus,
    setMobileNumber,
    setUserProfile,
    logout,
    getDeviceId,
  }), [authState, setToken, setSubscriptionStatus, setMobileNumber, setUserProfile, logout, getDeviceId]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
