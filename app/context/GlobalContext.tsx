"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type GlobalContextType = {
  headerTitleLabel: string; // Save the label key instead of the translated title
  setHeaderTitleLabel: (label: string) => void;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [headerTitleLabel, setHeaderTitleLabelState] = useState("defaultTitle"); // Default label key

  // Load label from localStorage when the component mounts
  useEffect(() => {
    const storedLabel = localStorage.getItem("headerTitleLabel");
    if (storedLabel) {
      setHeaderTitleLabelState(storedLabel);
    }
  }, []);

  // Save the label to localStorage whenever it changes
  const setHeaderTitleLabel = (label: string) => {
    setHeaderTitleLabelState(label);
    localStorage.setItem("headerTitleLabel", label);
  };

  return (
    <GlobalContext.Provider value={{ headerTitleLabel, setHeaderTitleLabel }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
