import { useState, useCallback, Suspense } from 'react';
import { Header } from './components';
import { CalculatorSelector } from './components/CalculatorSelector';
import { CALCULATORS, getCalculatorById } from './calculators/registry';

const ACTIVE_CALCULATOR_KEY = 'baliinvest_active_calculator';

function App() {
  const [activeCalculatorId, setActiveCalculatorId] = useState<string>(() => {
    const saved = localStorage.getItem(ACTIVE_CALCULATOR_KEY);
    return saved && getCalculatorById(saved) ? saved : 'xirr';
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleCalculatorChange = useCallback((id: string) => {
    setActiveCalculatorId(id);
    localStorage.setItem(ACTIVE_CALCULATOR_KEY, id);
  }, []);

  const handleSaveDraft = useCallback(() => {
    setIsSaving(true);
    // Each calculator handles its own saving
    setTimeout(() => setIsSaving(false), 500);
  }, []);

  const handleClearAll = useCallback(() => {
    if (showClearConfirm) {
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  }, [showClearConfirm]);

  const activeCalculator = getCalculatorById(activeCalculatorId);
  const ActiveComponent = activeCalculator?.component;

  return (
    <div className="bg-background text-text-primary font-display min-h-screen flex flex-col">
      <Header
        onSaveDraft={handleSaveDraft}
        onClearAll={handleClearAll}
        isSaving={isSaving}
        showClearConfirm={showClearConfirm}
      />

      <CalculatorSelector
        calculators={CALCULATORS}
        activeId={activeCalculatorId}
        onSelect={handleCalculatorChange}
      />

      <main className="flex-grow w-full px-4 py-8 md:px-10 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-text-secondary">Loading calculator...</p>
                </div>
              </div>
            }
          >
            {ActiveComponent && <ActiveComponent />}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default App;
