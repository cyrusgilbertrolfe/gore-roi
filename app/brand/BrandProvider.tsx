"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type BrandProfile,
  BRAND_STORAGE_KEY,
  DEFAULT_BRAND,
} from "./brandTypes";

type BrandContextValue = {
  brand: BrandProfile;
  setBrand: (b: BrandProfile) => void;
  resetBrand: () => void;
};

const BrandContext = createContext<BrandContextValue | null>(null);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrandState] = useState<BrandProfile>(DEFAULT_BRAND);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BRAND_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BrandProfile;
        setBrandState({ ...DEFAULT_BRAND, ...parsed });
      }
    } catch {
      // ignore — keep DEFAULT_BRAND
    }
  }, []);

  const setBrand = (b: BrandProfile) => {
    setBrandState(b);
    try {
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(b));
    } catch {
      // ignore
    }
  };

  const resetBrand = () => {
    setBrandState(DEFAULT_BRAND);
    try {
      localStorage.removeItem(BRAND_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <BrandContext.Provider value={{ brand, setBrand, resetBrand }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used within BrandProvider");
  return ctx;
}
