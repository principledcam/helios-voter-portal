"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Hoa = {
  id: string;
  name: string;
};

type HoaContextType = {
  activeHoa: Hoa | null;
  setActiveHoa: (hoa: Hoa | null) => void;

  // 🟢 SANDBOX MODE
  isSandbox: boolean;
  setSandbox: (value: boolean) => void;
};

const HoaContext = createContext<HoaContextType | null>(null);

export function HoaProvider({ children }: { children: React.ReactNode }) {
  const [activeHoa, setActiveHoaState] = useState<Hoa | null>(null);
  const [isSandbox, setSandboxState] = useState(false);

  // =========================
  // LOAD FROM LOCAL STORAGE
  // =========================
  useEffect(() => {
    const savedHoa = localStorage.getItem("activeHoa");
    const savedSandbox = localStorage.getItem("sandboxMode");

    // HOA LOAD
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

    // SANDBOX LOAD
    if (savedSandbox !== null) {
      try {
        setSandboxState(JSON.parse(savedSandbox));
      } catch (err) {
        console.error("Invalid sandboxMode in storage");
      }
    }
  }, []);

  // =========================
  // HOA SETTER
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
  // SANDBOX TOGGLE
  // =========================
  const setSandbox = (value: boolean) => {
    setSandboxState(value);
    localStorage.setItem("sandboxMode", JSON.stringify(value));
  };

  return (
    <HoaContext.Provider
      value={{
        activeHoa,
        setActiveHoa,
        isSandbox,
        setSandbox,
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