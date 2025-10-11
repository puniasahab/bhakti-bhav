import React, { createContext, useContext, useState } from 'react';

const PujaKareContext = createContext();

export const usePujaKare = () => {
  const context = useContext(PujaKareContext);
  if (!context) {
    throw new Error('usePujaKare must be used within a PujaKareProvider');
  }
  return context;
};

export const PujaKareProvider = ({ children }) => {
  const [pujaKareItems, setPujaKareItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const updatePujaKareItems = (items) => {
    console.log("Updating PujaKareContext with items:", items);
    setPujaKareItems(items);
  };

  const selectPujaKareItem = (itemId) => {
    const item = pujaKareItems.find(item => item._id === itemId);
    setSelectedItem(item);
    return item;
  };

  const getPujaKareItemById = (itemId) => {
    return pujaKareItems.find(item => item._id === itemId);
  };

  const value = {
    pujaKareItems,
    selectedItem,
    updatePujaKareItems,
    selectPujaKareItem,
    getPujaKareItemById
  };

  return (
    <PujaKareContext.Provider value={value}>
      {children}
    </PujaKareContext.Provider>
  );
};
