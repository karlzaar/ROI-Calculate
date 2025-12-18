import { useState, useMemo, useCallback, useRef } from 'react';
import type { InvestmentData, XIRRResult, CashFlowEntry } from '../types/investment';
import { calculateInvestmentReturn } from '../utils/xirr';
import { v4 as uuidv4 } from 'uuid';
import { useCurrency } from './useCurrency';

const DEFAULT_INVESTMENT: InvestmentData = {
  property: {
    projectName: 'Villa Matahari Phase 1',
    location: 'Canggu, Bali',
    totalPrice: 3_500_000_000,
    handoverDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'IDR'
  },
  payment: {
    type: 'plan',
    downPaymentPercent: 50,
    installmentMonths: 5
  },
  exit: {
    projectedSalesPrice: 4_200_000_000,
    closingCostPercent: 2.5
  },
  additionalCashFlows: [
    {
      id: uuidv4(),
      date: new Date().toISOString().split('T')[0],
      description: 'Furniture Package',
      type: 'outflow',
      amount: 150_000_000
    }
  ]
};

export function useInvestment() {
  const [data, setData] = useState<InvestmentData>(DEFAULT_INVESTMENT);
  const { convert, formatCurrency, loading: ratesLoading, lastUpdated } = useCurrency();
  
  // Track the previous currency to enable conversion
  const previousCurrency = useRef(data.property.currency);
  
  const result: XIRRResult = useMemo(() => {
    return calculateInvestmentReturn(data);
  }, [data]);
  
  const updateProperty = useCallback(<K extends keyof InvestmentData['property']>(
    key: K,
    value: InvestmentData['property'][K]
  ) => {
    setData(prev => {
      // Handle currency change with conversion
      if (key === 'currency' && value !== prev.property.currency) {
        const oldCurrency = prev.property.currency;
        const newCurrency = value as 'IDR' | 'USD' | 'AUD' | 'EUR';
        
        // Convert all monetary values
        const newTotalPrice = convert(prev.property.totalPrice, oldCurrency, newCurrency);
        const newSalesPrice = convert(prev.exit.projectedSalesPrice, oldCurrency, newCurrency);
        const newCashFlows = prev.additionalCashFlows.map(cf => ({
          ...cf,
          amount: convert(cf.amount, oldCurrency, newCurrency)
        }));
        
        previousCurrency.current = newCurrency;
        
        return {
          ...prev,
          property: { 
            ...prev.property, 
            currency: newCurrency,
            totalPrice: newTotalPrice 
          },
          exit: {
            ...prev.exit,
            projectedSalesPrice: newSalesPrice
          },
          additionalCashFlows: newCashFlows
        };
      }
      
      return {
        ...prev,
        property: { ...prev.property, [key]: value }
      };
    });
  }, [convert]);
  
  const updatePayment = useCallback(<K extends keyof InvestmentData['payment']>(
    key: K,
    value: InvestmentData['payment'][K]
  ) => {
    setData(prev => ({
      ...prev,
      payment: { ...prev.payment, [key]: value }
    }));
  }, []);
  
  const updateExit = useCallback(<K extends keyof InvestmentData['exit']>(
    key: K,
    value: InvestmentData['exit'][K]
  ) => {
    setData(prev => ({
      ...prev,
      exit: { ...prev.exit, [key]: value }
    }));
  }, []);
  
  const addCashFlow = useCallback((entry: Omit<CashFlowEntry, 'id'>) => {
    setData(prev => ({
      ...prev,
      additionalCashFlows: [
        ...prev.additionalCashFlows,
        { ...entry, id: uuidv4() }
      ]
    }));
  }, []);
  
  const removeCashFlow = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      additionalCashFlows: prev.additionalCashFlows.filter(cf => cf.id !== id)
    }));
  }, []);
  
  const updateCashFlow = useCallback((id: string, updates: Partial<CashFlowEntry>) => {
    setData(prev => ({
      ...prev,
      additionalCashFlows: prev.additionalCashFlows.map(cf =>
        cf.id === id ? { ...cf, ...updates } : cf
      )
    }));
  }, []);
  
  const reset = useCallback(() => {
    setData(DEFAULT_INVESTMENT);
    previousCurrency.current = 'IDR';
  }, []);
  
  return {
    data,
    result,
    updateProperty,
    updatePayment,
    updateExit,
    addCashFlow,
    removeCashFlow,
    updateCashFlow,
    reset,
    // Currency utilities
    formatCurrency,
    ratesLoading,
    lastUpdated
  };
}
