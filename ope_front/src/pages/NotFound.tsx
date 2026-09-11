import { Link } from "react-router-dom";
import logoOpe from "../assets/logo_ope.png";
import logoEvent from "../assets/logo_event.png";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ope-bg flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-ope-border shadow-sm p-8 sm:p-10 animate-fade-up">
        {/* Logos */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img
            src={logoOpe}
            alt="OPE"
            className="w-12 h-12 object-contain rounded-xl border border-ope-border p-1 bg-white"
          />
          <div className="h-6 w-px bg-ope-border" />
          <img
            src={logoEvent}
            alt="CNCEIZ"
            className="w-12 h-12 object-contain rounded-xl border border-ope-border p-1 bg-white"
          />
        </div>

        {/* Code d'erreur 404 */}
        <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-50 text-ope-orange border border-orange-200 mb-3">
          Erreur 404
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-ope-text tracking-tight mb-2">
          Page introuvable
        </h1>

        <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed mb-6">
          La page que vous recherchez n'existe pas, a été déplacée ou son URL est incorrecte.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Link
            to="/"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm text-white bg-ope-orange hover:bg-ope-orange-dark active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Retour à l'accueil
          </Link>
          <button
            onClick={() => window.history.back()}
            className="py-3 px-5 rounded-xl font-semibold text-xs sm:text-sm text-ope-text bg-ope-bg hover:bg-slate-200 active:scale-95 transition-all border border-ope-border cursor-pointer"
          >
            Page précédente
          </button>
        </div>
      </div>

      <p className="text-[11px] text-ope-text-muted mt-6">
        © 2026 Propulsé par e-IMAN. Tous droits réservés.
      </p>
    </div>
  );
}
