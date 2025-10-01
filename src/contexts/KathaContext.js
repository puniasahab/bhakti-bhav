import React, { createContext, useContext, useState } from 'react';

const KathaContext = createContext();

export const useKatha = () => {
  const context = useContext(KathaContext);
  if (!context) {
    throw new Error('useKatha must be used within a KathaProvider');
  }
  return context;
};

export const KathaProvider = ({ children }) => {
  const [selectedCategoryKathas, setSelectedCategoryKathas] = useState([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  const setCategoryData = (kathas, categoryName) => {
    setSelectedCategoryKathas(kathas);
    setSelectedCategoryName(categoryName);
  };

  const clearCategoryData = () => {
    setSelectedCategoryKathas([]);
    setSelectedCategoryName('');
  };

  return (
    <KathaContext.Provider
      value={{
        selectedCategoryKathas,
        selectedCategoryName,
        setCategoryData,
        clearCategoryData,
      }}
    >
      {children}
    </KathaContext.Provider>
  );
};
