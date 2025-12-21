interface HeaderProps {
  onSaveDraft?: () => void;
  onClearAll?: () => void;
  isSaving?: boolean;
  showClearConfirm?: boolean;
}

export function Header({ onSaveDraft, onClearAll, isSaving, showClearConfirm }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-dark bg-[#112217]/95 backdrop-blur-sm px-6 py-4 lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4 text-white">
          <div className="flex items-center justify-center size-8 rounded bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-2xl">ssid_chart</span>
          </div>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            BaliInvest XIRR
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClearAll}
            className={`hidden sm:flex items-center justify-center gap-2 overflow-hidden rounded-lg h-9 px-4 transition-colors text-sm font-medium ${
              showClearConfirm
                ? 'bg-red-500 border border-red-500 text-white animate-pulse'
                : 'bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10'
            }`}
          >
            <span className="material-symbols-outlined text-sm">delete_forever</span>
            <span>{showClearConfirm ? 'Click to Confirm' : 'Clear All'}</span>
          </button>
          <button
            onClick={onSaveDraft}
            disabled={isSaving}
            className="hidden sm:flex items-center justify-center gap-2 overflow-hidden rounded-lg h-9 px-4 bg-transparent border border-primary/30 text-primary hover:bg-primary/10 transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Draft</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
