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
      setActiveHoaState(JSON.parse(saved));
    }
  }, []);

  const setActiveHoa = (hoa: Hoa | null) => {
    setActiveHoaState(hoa);

    if (hoa) {
      localStorage.setItem("activeHoa", JSON.stringify(hoa));
    }
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