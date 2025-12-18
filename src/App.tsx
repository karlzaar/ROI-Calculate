import { useInvestment } from './hooks/useInvestment';
import {
  Header,
  PropertyDetails,
  PaymentTerms,
  ExitStrategy,
  CashFlows,
  ProjectForecast
} from './components';

function App() {
  const {
    data,
    result,
    updateProperty,
    updatePayment,
    updateExit,
    addCashFlow,
    removeCashFlow,
    updateCashFlow,
    ratesLoading,
    lastUpdated
  } = useInvestment();

  const handleCalculate = () => {
    // The calculation is already reactive, but we can add feedback here
    console.log('XIRR Result:', result);
    // Could trigger a toast notification or detailed breakdown modal
  };

  return (
    <div className="bg-[#112217] text-white font-display overflow-x-hidden antialiased min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow w-full px-4 py-8 md:px-10 lg:px-20">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8 flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              New Investment Calculation
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl">
              Enter the financial details of your Bali villa project to forecast returns and calculate XIRR.
            </p>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column - Forms */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              <PropertyDetails 
                data={data.property} 
                onUpdate={updateProperty}
                ratesLoading={ratesLoading}
                lastUpdated={lastUpdated}
              />
              
              <PaymentTerms 
                data={data.payment}
                property={data.property}
                onUpdate={updatePayment}
              />
              
              <ExitStrategy
                data={data.exit}
                totalPrice={data.property.totalPrice}
                currency={data.property.currency}
                onUpdate={updateExit}
              />
              
              <CashFlows
                entries={data.additionalCashFlows}
                currency={data.property.currency}
                onAdd={addCashFlow}
                onRemove={removeCashFlow}
                onUpdate={updateCashFlow}
              />
            </div>

            {/* Right Column - Results */}
            <div className="lg:col-span-4">
              <ProjectForecast
                result={result}
                location={data.property.location}
                currency={data.property.currency}
                onCalculate={handleCalculate}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
