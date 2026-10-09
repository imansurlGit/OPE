interface ApiErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ApiErrorState({
  title = "Impossible de charger les données",
  message = "Une erreur de connexion s'est produite. Vérifiez votre connexion Internet et réessayez.",
  onRetry,
  className = "",
}: ApiErrorStateProps) {
  return (
    <div
      className={`py-14 sm:py-16 flex flex-col items-center justify-center text-center gap-3.5 sm:gap-4 ${className}`}
      role="alert"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 shrink-0">
        <svg
          className="w-7 h-7 sm:w-8 sm:h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.6}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h3 className="font-extrabold text-gray-800 text-base sm:text-lg">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-gray-500 max-w-sm leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#C25E38] hover:bg-[#a04a2a] active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
