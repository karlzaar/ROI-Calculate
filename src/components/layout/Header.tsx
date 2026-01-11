export function Header() {
  return (
    <header className="w-full bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 md:px-10 lg:px-20 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-200">
            <span className="material-symbols-outlined text-2xl text-white">ssid_chart</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">BaliInvest</h1>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Property Investment Tools</p>
          </div>
        </div>
      </div>
    </header>
  );
}
