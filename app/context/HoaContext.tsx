"use client";

import { createContext, useContext, useEffect, useState } from "react";

/**
 * 🧱 HOA MODEL (CLEAN)
 * - NO sandbox state stored
 * - NO environment-based auth logic
 * - environment is ONLY a property of HOA entity
 */
type Hoa = {
  id: string;
  name: string;
  environment?: "production" | "sandbox";
};

type HoaContextType = {
  activeHoa: Hoa | null;
  setActiveHoa: (hoa: Hoa | null) => void;

  /**
   * 🧠 DERIVED STATE ONLY
   * sandbox is NOT stored or controlled manually
   */
  isSandbox: boolean;
};

const HoaContext = createContext<HoaContextType | null>(null);

export function HoaProvider({ children }: { children: React.ReactNode }) {
  const [activeHoa, setActiveHoaState] = useState<Hoa | null>(null);

  // =========================
  // LOAD ACTIVE HOA (LOCAL STORAGE ONLY)
  // =========================
  useEffect(() => {
    const savedHoa = localStorage.getItem("activeHoa");

    if (savedHoa) {
      try {
        const parsed = JSON.parse(savedHoa);

        if (parsed?.id) {
          setActiveHoaState(parsed);
        }
      } catch (err) {
        console.error("Invalid activeHoa in storage");
      }
    }
  }, []);

  // =========================
  // SET ACTIVE HOA
  // =========================
  const setActiveHoa = (hoa: Hoa | null) => {
    if (!hoa?.id) {
      setActiveHoaState(null);
      localStorage.removeItem("activeHoa");
      return;
    }

    setActiveHoaState(hoa);
    localStorage.setItem("activeHoa", JSON.stringify(hoa));
  };

  // =========================
  // DERIVED STATE (IMPORTANT FIX)
  // =========================
  const isSandbox = activeHoa?.environment === "sandbox";

  return (
    <HoaContext.Provider
      value={{
        activeHoa,
        setActiveHoa,
        isSandbox,
      }}
    >
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