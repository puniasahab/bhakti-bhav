import React, { createContext, useContext, useState } from 'react';

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const [paymentResponse, setPaymentResponse] = useState(null);
  const [selectedPlanData, setSelectedPlanData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const setPaymentData = (response, planData, profile) => {
    setPaymentResponse(response);
    setSelectedPlanData(planData);
    setUserProfile(profile);
  };

  const clearPaymentData = () => {
    setPaymentResponse(null);
    setSelectedPlanData(null);
    setUserProfile(null);
  };

  return (
    <PaymentContext.Provider
      value={{
        paymentResponse,
        selectedPlanData,
        userProfile,
        setPaymentData,
        clearPaymentData,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};
