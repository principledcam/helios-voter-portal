"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Hoa = {
  id: string;
  name: string;
};

type HoaContextType = {
  activeHoa: Hoa | null;
  setActiveHoa: (hoa: Hoa | null) => void;
};

const HoaContext = createContext<HoaContextType | null>(null);

export function HoaProvider({ children }: { children: React.ReactNode }) {
  const [activeHoa, setActiveHoaState] = useState<Hoa | null>(null);

  // Load saved HOA from browser
  useEffect(() => {
    const saved = localStorage.getItem("activeHoa");

    if (saved) {
      const parsed = JSON.parse(saved);

      // 🟢 HARD GUARD — prevent invalid HOA from loading
      if (parsed?.id) {
        setActiveHoaState(parsed);
      }
    }
  }, []);

  // 🟢 STABLE SETTER (prevents undefined state leaks)
  const setActiveHoa = (hoa: Hoa | null) => {
    // 🚨 CRITICAL RULE: NEVER allow undefined into state
    if (!hoa?.id) {
      setActiveHoaState(null);
      localStorage.removeItem("activeHoa");
      return;
    }

    setActiveHoaState(hoa);

    localStorage.setItem("activeHoa", JSON.stringify(hoa));
  };

  return (
    <HoaContext.Provider value={{ activeHoa, setActiveHoa }}>
      {children}
    </HoaContext.Provider>
  );
}

export function useHoa() {
  const context = useContext(HoaContext);
  if (!context) {
    throw new Error("useHoa must be used within HoaProvider");
  }
  return context;
}