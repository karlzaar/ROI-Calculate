import { useState, useEffect, useCallback } from 'react';

type Currency = 'IDR' | 'USD' | 'AUD' | 'EUR';

interface ExchangeRates {
  IDR: number;
  USD: number;
  AUD: number;
  EUR: number;
}

// Fallback rates if API fails (as of Dec 2024)
const FALLBACK_RATES: ExchangeRates = {
  IDR: 1,
  USD: 0.0000625,  // 1 IDR = 0.0000625 USD (16,000 IDR per USD)
  AUD: 0.0000969,  // ~10,320 IDR per AUD
  EUR: 0.0000595,  // ~16,800 IDR per EUR
};

export function useCurrency(baseCurrency: Currency = 'IDR') {
  const [rates, setRates] = useState<ExchangeRates>(FALLBACK_RATES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch rates from free API (frankfurter.app - no API key needed)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        
        // Frankfurter API - free, no key required
        // We'll get rates relative to EUR and convert
        const response = await fetch(
          'https://api.frankfurter.app/latest?from=USD&to=IDR,AUD,EUR'
        );
        
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        
        // Convert to IDR-based rates
        const usdToIdr = data.rates.IDR || 16000;
        
        setRates({
          IDR: 1,
          USD: 1 / usdToIdr,
          AUD: 1 / (usdToIdr / (data.rates.AUD || 0.65)), // USD/AUD rate
          EUR: 1 / (usdToIdr / (data.rates.EUR || 0.95)), // USD/EUR rate
        });
        
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        console.warn('Using fallback exchange rates:', err);
        setError('Using offline rates');
        // Keep using fallback rates
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    
    // Refresh rates every 30 minutes
    const interval = setInterval(fetchRates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Convert amount from one currency to another
  const convert = useCallback(
    (amount: number, from: Currency, to: Currency): number => {
      if (from === to) return amount;
      
      // Convert to IDR first, then to target currency
      const amountInIDR = amount / rates[from];
      const result = amountInIDR * rates[to];
      
      return Math.round(result);
    },
    [rates]
  );

  // Get display rate (how many units of 'to' currency per 1 unit of 'from')
  const getRate = useCallback(
    (from: Currency, to: Currency): number => {
      return rates[to] / rates[from];
    },
    [rates]
  );

  // Format amount in specific currency
  const formatCurrency = useCallback(
    (amount: number, currency: Currency): string => {
      const symbols: Record<Currency, string> = {
        IDR: 'Rp',
        USD: '$',
        AUD: 'A$',
        EUR: '€',
      };

      const formatted = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: currency === 'IDR' ? 0 : 2,
      }).format(amount);

      return `${symbols[currency]} ${formatted}`;
    },
    []
  );

  return {
    rates,
    loading,
    error,
    lastUpdated,
    convert,
    getRate,
    formatCurrency,
  };
}
