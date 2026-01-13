import { useState, useEffect } from 'react';
import AuthModal, { type User } from '../ui/AuthModal';

export function Header() {
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('roi_calculate_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('roi_calculate_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('roi_calculate_user');
    }
  }, [user]);

  return (
    <header className="w-full bg-white border-b border-slate-200">
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={(u) => {
          setUser(u);
          setShowAuth(false);
        }}
      />

      <div className="mx-auto max-w-7xl px-4 md:px-10 lg:px-20 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-16 h-16"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">ROI Calculate</h1>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Property Investment Tools</p>
            </div>
          </div>

          {/* Profile Section */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-indigo-600 uppercase">
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
                className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs font-semibold text-slate-600">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
