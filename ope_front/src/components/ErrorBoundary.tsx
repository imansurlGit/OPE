import { Component, type ErrorInfo, type ReactNode } from "react";
import { logError } from "../utils/errorHandler";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, { componentStack: errorInfo.componentStack });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ope-bg flex flex-col items-center justify-center p-4 sm:p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl border border-ope-border shadow-sm p-6 sm:p-8 animate-fade-up">
            {/* Icône d'alerte élégante */}
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-ope-text tracking-tight mb-2">
              Une erreur inattendue est survenue
            </h1>

            <p className="text-xs sm:text-sm text-ope-text-muted leading-relaxed mb-6">
              L'application a rencontré une anomalie temporaire. Nos équipes techniques en ont été informées afin de résoudre la situation au plus vite.
            </p>

            {/* En mode développement uniquement, affichage des détails techniques */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left overflow-auto max-h-36">
                <p className="text-[10px] font-mono text-red-600 font-bold mb-1">
                  [Détails techniques - Environnement DEV]
                </p>
                <pre className="text-[10px] font-mono text-slate-700 whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
              </div>
            )}

            {/* Boutons d'action de reprise */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-ope-orange hover:bg-ope-orange-dark active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                Actualiser la page
              </button>
              <button
                onClick={this.handleGoHome}
                className="py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-ope-text bg-ope-bg hover:bg-slate-200 active:scale-95 transition-all border border-ope-border cursor-pointer"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>

          <p className="text-[11px] text-ope-text-muted mt-6">
            © 2026 Propulsé par e-IMAN. Tous droits réservés.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
