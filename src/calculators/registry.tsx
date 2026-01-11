import { lazy } from 'react';
import type { CalculatorConfig } from './types';

// Lazy load calculators for better performance
const XIRRCalculator = lazy(() => import('./XIRRCalculator'));
const RentalROICalculator = lazy(() => import('./RentalROI'));

export const CALCULATORS: CalculatorConfig[] = [
  {
    id: 'xirr',
    name: 'XIRR Calculator',
    shortName: 'XIRR',
    description: 'Calculate internal rate of return for villa flip investments with irregular cash flows',
    icon: 'trending_up',
    color: 'green',
    component: XIRRCalculator,
    tags: ['flip', 'irr', 'investment', 'returns'],
  },
  {
    id: 'rental-roi',
    name: '10-Year Rental ROI',
    shortName: 'Rental ROI',
    description: 'Project rental income and ROI over a 10-year investment horizon',
    icon: 'home_work',
    color: 'indigo',
    component: RentalROICalculator,
    tags: ['rental', 'income', 'long-term', 'projections'],
  },
  // Future calculators can be added here:
  // {
  //   id: 'flip-analysis',
  //   name: 'Flip Analysis',
  //   shortName: 'Flip',
  //   description: 'Analyze potential profit from property flipping',
  //   icon: 'swap_horiz',
  //   color: 'orange',
  //   component: FlipAnalysisCalculator,
  //   tags: ['flip', 'profit', 'quick'],
  // },
  // {
  //   id: 'mortgage',
  //   name: 'Mortgage Calculator',
  //   shortName: 'Mortgage',
  //   description: 'Calculate mortgage payments and amortization schedules',
  //   icon: 'account_balance',
  //   color: 'cyan',
  //   component: MortgageCalculator,
  //   tags: ['mortgage', 'loan', 'payments'],
  // },
  // {
  //   id: 'cashflow',
  //   name: 'Cash Flow Analyzer',
  //   shortName: 'Cash Flow',
  //   description: 'Analyze and forecast property cash flows',
  //   icon: 'payments',
  //   color: 'purple',
  //   component: CashFlowCalculator,
  //   tags: ['cashflow', 'income', 'expenses'],
  // },
];

export function getCalculatorById(id: string): CalculatorConfig | undefined {
  return CALCULATORS.find(calc => calc.id === id);
}

export function getCalculatorsByTag(tag: string): CalculatorConfig[] {
  return CALCULATORS.filter(calc => calc.tags.includes(tag.toLowerCase()));
}
