export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="BaliInvest Logo"
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <h3 className="text-white font-bold text-lg">BaliInvest</h3>
                <p className="text-xs text-slate-400">Property Investment Tools</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Professional investment analysis tools for real estate investors.
              Make data-driven decisions with accurate XIRR calculations and ROI projections.
            </p>
          </div>

          {/* Tools Section */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Tools</h4>
            <ul className="space-y-3">
              <li>
                <span className="text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-slate-400">trending_up</span>
                  XIRR Calculator
                </span>
              </li>
              <li>
                <span className="text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-slate-400">home_work</span>
                  Annualized ROI
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-base text-slate-400">mail</span>
                <a href="mailto:info@baliinvest.com" className="hover:text-white transition-colors">
                  info@baliinvest.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-base text-slate-400">location_on</span>
                <span>Bali, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-6">
          <p className="text-sm text-slate-400 text-center">
            © {currentYear} BaliInvest. All rights reserved.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-4">
          <p className="text-xs text-slate-500 text-center leading-relaxed">
            <strong className="text-slate-400">Disclaimer:</strong> The calculations and projections provided by BaliInvest tools are for informational purposes only and should not be considered as financial advice.
            Investment returns are not guaranteed and past performance does not indicate future results. Always consult with a qualified financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
