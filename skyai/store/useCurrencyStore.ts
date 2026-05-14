import { create } from "zustand";

interface CurrencyState {
  currency: string;
  rates: Record<string, number>;
  setCurrency: (currency: string) => void;
  fetchRates: () => Promise<void>;
  convertPrice: (priceInUSD: number) => number;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currency: "USD",
  rates: { USD: 1 }, // Default rates
  setCurrency: (currency) => set({ currency }),
  fetchRates: async () => {
    try {
      const res = await fetch("/api/exchange-rates");
      if (res.ok) {
        const data = await res.json();
        if (data.rates) {
          set({ rates: data.rates });
        }
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates", error);
    }
  },
  convertPrice: (priceInUSD) => {
    const { currency, rates } = get();
    const rate = rates[currency] || 1;
    return Math.round(priceInUSD * rate);
  },
}));
