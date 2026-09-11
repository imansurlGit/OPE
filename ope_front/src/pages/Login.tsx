import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services";
import { getProductionErrorMessage, logError, type ErrorDetails } from "../utils/errorHandler";

export default function Login() {
  const navigate = useNavigate();

  // Pré-remplissage avec les préférences mémorisées si "Se souvenir de moi" était coché
  const [username, setUsername] = useState(() => authService.getSavedUsername());
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => authService.isRememberMeEnabled());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [showForgotHelp, setShowForgotHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation préalable côté client
    if (!username.trim() || !password.trim()) {
      setError({
        title: "Champs obligatoires",
        message: "Veuillez renseigner votre identifiant et votre mot de passe pour vous connecter.",
        retryable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const data = await authService.login(username, password, rememberMe);

      if (data.success) {
        // Redirection immédiate vers l'espace d'administration
        navigate("/admin", { replace: true });
        return;
      } else {
        // Normalisation de l'erreur renvoyée par le backend
        const productionError = getProductionErrorMessage(data, data.status_code || 401);
        setError(productionError);
        logError(data, { status: data.status_code, endpoint: "/login/" });
      }
    } catch (err: any) {
      // Gestion d'une erreur réseau ou exception non traitée
      const status = err?.status || err?.data?.status_code;
      const productionError = getProductionErrorMessage(err, status);
      setError(productionError);
      logError(err, { endpoint: "/login/" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ope-bg py-8 sm:py-12 px-4 flex flex-col justify-center items-center relative overflow-hidden">
      {/* ── Éléments décoratifs d'ambiance OPE ── */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-ope-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-ope-orange/5 blur-3xl pointer-events-none" />

      {/* ── Carte Principale de Connexion ── */}
      <div className="w-full max-w-md bg-ope-white rounded-3xl border border-ope-border shadow-sm p-6 sm:p-9 relative z-10 animate-fade-up">
        {/* ── Alerte Erreur de Production ── */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3 animate-fade-up shadow-2xs"
          >
            <div className="p-1 rounded-lg bg-red-100 text-red-600 shrink-0 mt-0.5">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-red-900 leading-tight">{error.title}</p>
              <p className="text-red-700 mt-0.5 leading-relaxed">{error.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 p-0.5 cursor-pointer"
              aria-label="Fermer l'alerte"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Aide Mot de passe oublié (Accessible, pas d'alert()) ── */}
        {showForgotHelp && (
          <div
            role="status"
            className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 animate-fade-up"
          >
            <div className="p-1 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-900 leading-tight">
                Assistance Réinitialisation
              </p>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                Pour des raisons de sécurité, la réinitialisation des accès administrateur est gérée par le support technique OPE. Veuillez contacter la coordination ou utiliser le formulaire de contact du site.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForgotHelp(false)}
              className="text-amber-600 hover:text-amber-900 p-0.5 cursor-pointer font-bold"
              aria-label="Fermer le message d'aide"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Formulaire ── */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Champ Identifiant / Nom d'utilisateur */}
          <div>
            <label
              htmlFor="username-input"
              className="block text-xs font-bold text-ope-text mb-1.5"
            >
              Identifiant / Nom d'utilisateur{" "}
              <span className="text-ope-orange">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ope-text-muted">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <input
                id="username-input"
                type="text"
                required
                autoComplete="username"
                placeholder="Ex: admin ou prenom.nom"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-invalid={error?.title === "Champs obligatoires" && !username.trim()}
                className="w-full pl-10 pr-4 py-3 bg-[#FAF5EE] border border-[#E8DEC8] rounded-xl text-xs sm:text-sm text-ope-text placeholder-[#A89A88] focus:outline-none focus:border-ope-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password-input"
                className="block text-xs font-bold text-ope-text"
              >
                Mot de passe <span className="text-ope-orange">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotHelp((prev) => !prev)}
                className="text-[11px] font-semibold text-ope-primary hover:text-ope-orange transition-colors cursor-pointer"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ope-text-muted">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={error?.title === "Champs obligatoires" && !password.trim()}
                className="w-full pl-10 pr-11 py-3 bg-[#FAF5EE] border border-[#E8DEC8] rounded-xl text-xs sm:text-sm text-ope-text placeholder-[#A89A88] focus:outline-none focus:border-ope-primary focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ope-text-muted hover:text-ope-text transition-colors cursor-pointer"
                title={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? (
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                    />
                  </svg>
                ) : (
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Se souvenir de moi */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#E8DEC8] text-ope-orange focus:ring-ope-orange/30 accent-ope-orange cursor-pointer"
              />
              <span className="text-xs font-semibold text-ope-text-muted">
                Se souvenir de moi
              </span>
            </label>
          </div>

          {/* Bouton de Soumission */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-ope-orange hover:bg-ope-orange-dark active:scale-[0.98] transition-all shadow-md shadow-ope-orange/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
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
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Mention de bas de page */}
      <p className="text-[11px] text-ope-text-muted/70 text-center mt-6">
        © 2026 Propulsé par e-IMAN. Tous droits réservés.
      </p>
    </div>
  );
}
