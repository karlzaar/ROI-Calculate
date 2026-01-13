import { useState, useCallback, useRef, useEffect } from 'react';
import { useInvestment } from '../../hooks/useInvestment';
import { useArchivedDrafts, type ArchivedDraft } from '../../hooks/useArchivedDrafts';
import {
  PropertyDetails,
  PaymentTerms,
  ExitStrategySection,
  ProjectForecast,
} from '../../components';
import { Toast } from '../../components/ui/Toast';
import { DraftSelector } from '../../components/ui/DraftSelector';
import AuthModal, { type User } from '../../components/ui/AuthModal';
import { ReportView } from './components/ReportView';
import type { InvestmentData } from '../../types/investment';

export function XIRRCalculator() {
  const {
    data,
    result,
    currency,
    symbol,
    rate,
    ratesLoading,
    ratesError,
    ratesSource,
    refreshRates,
    formatDisplay,
    formatAbbrev,
    idrToDisplay,
    displayToIdr,
    updateProperty,
    updatePriceFromDisplay,
    updateExitPriceFromDisplay,
    updatePayment,
    regenerateSchedule,
    updateScheduleEntry,
    updateExit,
    reset,
    saveDraft,
    loadDraft,
  } = useInvestment();

  const { drafts, saveDraft: saveArchivedDraft, deleteDraft } = useArchivedDrafts<InvestmentData>('xirr');
  const [currentDraftName, setCurrentDraftName] = useState<string | undefined>();

  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('roi_calculate_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showReportView, setShowReportView] = useState(false);

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('roi_calculate_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('roi_calculate_user');
    }
  }, [user]);

  const handleSaveDraft = useCallback(() => {
    setIsSaving(true);
    const success = saveDraft();
    setTimeout(() => {
      setIsSaving(false);
      if (success) {
        setToast({ message: 'Draft saved successfully!', type: 'success' });
      } else {
        setToast({ message: 'Failed to save draft', type: 'error' });
      }
    }, 300);
  }, [saveDraft]);

  const handleReset = useCallback(() => {
    if (showResetConfirm) {
      reset();
      setCurrentDraftName(undefined);
      setShowResetConfirm(false);
      setToast({ message: 'All values reset', type: 'success' });
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  }, [showResetConfirm, reset]);

  const handleSelectDraft = useCallback((draft: ArchivedDraft<InvestmentData>) => {
    loadDraft(draft.data);
    setCurrentDraftName(draft.name);
    setToast({ message: `Loaded "${draft.name}"`, type: 'success' });
  }, [loadDraft]);

  const handleSaveArchive = useCallback((name: string) => {
    saveArchivedDraft(name, data);
    setCurrentDraftName(name);
    setToast({ message: `Saved "${name}"`, type: 'success' });
  }, [saveArchivedDraft, data]);

  const handleDeleteDraft = useCallback((id: string) => {
    deleteDraft(id);
    setToast({ message: 'Draft deleted', type: 'success' });
  }, [deleteDraft]);

  const dataRef = useRef(data);
  const resultRef = useRef(result);
  const currencyRef = useRef(currency);
  const symbolRef = useRef(symbol);
  const rateRef = useRef(rate);
  const formatDisplayRef = useRef(formatDisplay);
  const formatAbbrevRef = useRef(formatAbbrev);

  useEffect(() => {
    dataRef.current = data;
    resultRef.current = result;
    currencyRef.current = currency;
    symbolRef.current = symbol;
    rateRef.current = rate;
    formatDisplayRef.current = formatDisplay;
    formatAbbrevRef.current = formatAbbrev;
  }, [data, result, currency, symbol, rate, formatDisplay, formatAbbrev]);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleExportPDF = useCallback(() => {
    setShowReportView(true);
  }, []);

  const handleLoginFromReport = useCallback((u: User) => {
    setUser(u);
  }, []);

  const displayPrice = idrToDisplay(data.property.totalPrice);
  const displayExitPrice = idrToDisplay(data.exit.projectedSalesPrice);

  // Validate that down payment + scheduled payments = total price
  const downPaymentIDR = data.property.totalPrice * (data.payment.downPaymentPercent / 100);
  const scheduleTotalIDR = data.payment.schedule.reduce((sum, entry) => sum + entry.amount, 0);
  const totalPaymentsIDR = downPaymentIDR + scheduleTotalIDR;
  const isPaymentValid = data.property.totalPrice === 0 || Math.abs(totalPaymentsIDR - data.property.totalPrice) < 1;

  // Show Report View
  if (showReportView) {
    return (
      <ReportView
        data={data}
        result={result}
        currency={currency}
        symbol={symbol}
        rate={rate}
        formatDisplay={formatDisplay}
        formatAbbrev={formatAbbrev}
        user={user}
        onLogin={handleLoginFromReport}
        onBack={() => setShowReportView(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-primary-light selection:text-primary -mx-4 md:-mx-10 lg:-mx-20 -my-8 px-6 py-8">
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={(u) => {
          setUser(u);
          setShowAuth(false);
        }}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-[100%] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <header className="lg:col-span-9 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-2.5 rounded-lg shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">XIRR Calculator</h1>
                <p className="text-text-muted text-xs mt-1 max-w-md">
                  Calculate your real estate investment returns based on purchase price, payment schedule, and projected sale price
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
            {currency !== 'IDR' && (
              <div className="flex items-center gap-3 bg-surface px-4 py-2 rounded-lg border border-border shadow-sm">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                  1 {currency} = {rate.toLocaleString()} IDR
                </span>
                {ratesLoading ? (
                  <span className="text-yellow-500 text-xs">(loading...)</span>
                ) : ratesError ? (
                  <span className="text-negative text-xs" title={ratesError}>!</span>
                ) : (
                  <span className="text-accent text-xs" title={`Source: ${ratesSource}`}>✓</span>
                )}
                <button
                  onClick={refreshRates}
                  className="text-primary hover:text-primary-dark text-xs underline"
                  disabled={ratesLoading}
                >
                  Refresh
                </button>
              </div>
            )}

            <div className="flex items-center bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mr-3">Currency</span>
              <select
                value={currency}
                onChange={(e) => updateProperty('currency', e.target.value as 'IDR' | 'USD' | 'AUD' | 'EUR' | 'GBP' | 'INR' | 'CNY' | 'AED' | 'RUB')}
                className="bg-transparent text-slate-900 text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="IDR">Rp IDR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="AUD">A$ AUD</option>
                <option value="GBP">£ GBP</option>
                <option value="INR">₹ INR</option>
                <option value="CNY">¥ CNY</option>
                <option value="AED">د.إ AED</option>
                <option value="RUB">₽ RUB</option>
              </select>
            </div>

            <DraftSelector
              drafts={drafts}
              onSelect={handleSelectDraft}
              onSave={handleSaveArchive}
              onDelete={handleDeleteDraft}
              currentName={currentDraftName}
            />

            <button
              onClick={handleReset}
              className={`px-5 py-2 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95 ${
                showResetConfirm
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {showResetConfirm ? 'Click to Confirm' : 'Reset Values'}
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="bg-primary text-white px-5 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Draft</span>
              )}
            </button>
            </div>
          </header>

          {/* Profile Section - Top Right */}
          <div className="lg:col-span-3 flex justify-end items-start">
            {user ? (
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary uppercase">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-700">{user.name}</span>
                  <span className="text-[10px] text-slate-400">{user.email}</span>
                </div>
                <button
                  onClick={() => setUser(null)}
                  className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Sign out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs font-semibold text-slate-600">Sign In</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9 space-y-6">
            <PropertyDetails
              data={data.property}
              symbol={symbol}
              displayPrice={displayPrice}
              onUpdate={updateProperty}
              onPriceChange={updatePriceFromDisplay}
            />

            <PaymentTerms
              data={data.payment}
              totalPriceIDR={data.property.totalPrice}
              symbol={symbol}
              formatDisplay={formatDisplay}
              displayToIdr={displayToIdr}
              idrToDisplay={idrToDisplay}
              onUpdate={updatePayment}
              onRegenerateSchedule={regenerateSchedule}
              onUpdateScheduleEntry={updateScheduleEntry}
              isPaymentValid={isPaymentValid}
            />

            <ExitStrategySection
              data={data.exit}
              totalPriceIDR={data.property.totalPrice}
              displayExitPrice={displayExitPrice}
              symbol={symbol}
              handoverDate={data.property.handoverDate}
              propertySize={data.property.propertySize}
              displayToIdr={displayToIdr}
              idrToDisplay={idrToDisplay}
              onUpdate={updateExit}
              onExitPriceChange={updateExitPriceFromDisplay}
            />
          </div>

          <div className="lg:col-span-3">
            <ProjectForecast
              result={result}
              symbol={symbol}
              formatDisplay={formatDisplay}
              onExportPDF={handleExportPDF}
              isPaymentValid={isPaymentValid}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default XIRRCalculator;
