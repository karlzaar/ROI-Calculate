export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur-sm px-6 py-4 lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center size-8 rounded bg-primary-light text-primary">
            <span className="material-symbols-outlined text-2xl">ssid_chart</span>
          </div>
          <h2 className="text-text-primary text-lg font-bold leading-tight tracking-[-0.015em]">
            BaliInvest
          </h2>
        </div>
      </div>
    </header>
  );
}
