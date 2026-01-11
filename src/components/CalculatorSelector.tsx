import type { CalculatorConfig } from '../calculators/types';

interface Props {
  calculators: CalculatorConfig[];
  activeId: string;
  onSelect: (id: string) => void;
}

const COLOR_CLASSES: Record<CalculatorConfig['color'], { bg: string; text: string; border: string; activeBg: string }> = {
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    activeBg: 'bg-green-100',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    activeBg: 'bg-indigo-100',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    activeBg: 'bg-orange-100',
  },
  cyan: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
    activeBg: 'bg-cyan-100',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    activeBg: 'bg-purple-100',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-200',
    activeBg: 'bg-rose-100',
  },
};

export function CalculatorSelector({ calculators, activeId, onSelect }: Props) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20">
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mr-2 whitespace-nowrap">
            Calculator:
          </span>

          {calculators.map((calc) => {
            const isActive = calc.id === activeId;
            const colors = COLOR_CLASSES[calc.color];

            return (
              <button
                key={calc.id}
                onClick={() => onSelect(calc.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200 whitespace-nowrap
                  ${isActive
                    ? `${colors.activeBg} ${colors.text} border-2 ${colors.border}`
                    : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                  }
                `}
              >
                <span className={`material-symbols-outlined text-lg ${isActive ? colors.text : 'text-gray-400'}`}>
                  {calc.icon}
                </span>
                <span>{calc.shortName}</span>
                {isActive && (
                  <span className={`w-2 h-2 rounded-full ${colors.text.replace('text', 'bg')}`} />
                )}
              </button>
            );
          })}

          {/* More calculators indicator */}
          <div className="flex items-center gap-2 px-3 py-2 text-gray-300">
            <span className="text-xs font-medium">More coming soon</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        </div>
      </div>
    </div>
  );
}
