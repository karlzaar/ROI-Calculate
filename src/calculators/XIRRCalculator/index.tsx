import { useState, useCallback, useRef, useEffect } from 'react';
import { useInvestment } from '../../hooks/useInvestment';
import {
  PropertyDetails,
  PaymentTerms,
  ExitStrategySection,
  ProjectForecast,
} from '../../components';
import { Toast } from '../../components/ui/Toast';
import { generatePDFReport } from '../../utils/pdfExport';

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
    ratesLastUpdated,
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
  } = useInvestment();

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
    try {
      generatePDFReport({
        data: dataRef.current,
        result: resultRef.current,
        currency: currencyRef.current,
        symbol: symbolRef.current,
        formatDisplay: formatDisplayRef.current,
        formatAbbrev: formatAbbrevRef.current,
        rate: rateRef.current,
      });
      setToast({ message: 'PDF exported successfully!', type: 'success' });
    } catch (error) {
      console.error('PDF export error:', error);
      setToast({ message: 'Failed to export PDF', type: 'error' });
    }
  }, []);

  const displayPrice = idrToDisplay(data.property.totalPrice);
  const displayExitPrice = idrToDisplay(data.exit.projectedSalesPrice);

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight">
          XIRR Calculator
        </h1>
        <p className="text-text-muted text-lg mt-2">
          Calculate the internal rate of return for your Bali villa investment with irregular cash flows.
        </p>

        {currency !== 'IDR' && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-text-secondary">
              Exchange Rate: 1 {currency} = {rate.toLocaleString()} IDR
            </span>
            {ratesLoading ? (
              <span className="text-yellow-400 text-xs">(loading...)</span>
            ) : ratesError ? (
              <span className="text-red-400 text-xs" title={ratesError}>⚠️ Using fallback</span>
            ) : (
              <span className="text-green-400 text-xs" title={`Source: ${ratesSource}`}>
                ✓ Updated {ratesLastUpdated}
              </span>
            )}
            <button
              onClick={refreshRates}
              className="text-accent hover:text-white text-xs underline ml-2"
              disabled={ratesLoading}
            >
              Refresh
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <PropertyDetails
            data={data.property}
            symbol={symbol}
            rate={rate}
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
          />

          <ExitStrategySection
            data={data.exit}
            totalPriceIDR={data.property.totalPrice}
            displayExitPrice={displayExitPrice}
            symbol={symbol}
            handoverDate={data.property.handoverDate}
            displayToIdr={displayToIdr}
            idrToDisplay={idrToDisplay}
            onUpdate={updateExit}
            onExitPriceChange={updateExitPriceFromDisplay}
          />
        </div>

        <div className="lg:col-span-4">
          <ProjectForecast
            result={result}
            symbol={symbol}
            formatDisplay={formatDisplay}
            onExportPDF={handleExportPDF}
          />
        </div>
      </div>
    </>
  );
}

export default XIRRCalculator;
