/**
 * Utilitaires de gestion d'erreurs en environnement de production.
 * Garantit qu'aucun détail technique sensible n'est exposé à l'utilisateur final.
 */

export interface ErrorDetails {
  title: string;
  message: string;
  code?: string | number;
  retryable?: boolean;
}

/**
 * Traduit un statut HTTP ou une exception réseau en message utilisateur professionnel et sécurisé.
 */
export function getProductionErrorMessage(
  errorOrResponse?: unknown,
  statusCode?: number
): ErrorDetails {
  // Détection du mode hors-ligne du navigateur
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return {
      title: "Connexion Internet interrompue",
      message:
        "Vous semblez être hors ligne. Veuillez vérifier votre connexion Internet avant de réessayer.",
      code: "OFFLINE",
      retryable: true,
    };
  }

  // Traitement selon le code de statut HTTP
  if (statusCode) {
    switch (statusCode) {
      case 400:
      case 401:
        return {
          title: "Authentification requise",
          message:
            "Identifiant ou mot de passe incorrect. Veuillez vérifier vos accès et réessayer.",
          code: 401,
          retryable: true,
        };

      case 403:
        return {
          title: "Accès non autorisé",
          message:
            "Votre compte ne dispose pas des autorisations nécessaires pour accéder à cet espace d'administration.",
          code: 403,
          retryable: false,
        };

      case 404:
        return {
          title: "Ressource introuvable",
          message:
            "Le service ou l'élément demandé n'est pas accessible actuellement.",
          code: 404,
          retryable: false,
        };

      case 429:
        return {
          title: "Trop de tentatives",
          message:
            "Par mesure de sécurité suite à plusieurs échecs, l'accès est temporairement suspendu. Veuillez patienter quelques minutes.",
          code: 429,
          retryable: true,
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          title: "Service temporairement indisponible",
          message:
            "Nos serveurs rencontrent actuellement une indisponibilité passagère. Nos équipes techniques en sont informées. Veuillez réessayer dans quelques instants.",
          code: statusCode,
          retryable: true,
        };

      default:
        return {
          title: "Erreur inattendue",
          message:
            "Une anomalie est survenue lors de la communication avec le serveur. Veuillez réitérer votre demande.",
          code: statusCode,
          retryable: true,
        };
    }
  }

  // Détection des erreurs de connectivité fetch / réseau
  if (
    errorOrResponse instanceof TypeError ||
    (errorOrResponse as Error)?.name === "TypeError"
  ) {
    return {
      title: "Serveur inaccessible",
      message:
        "Impossible de contacter nos serveurs. Veuillez vérifier votre connexion ou réessayer dans un instant.",
      code: "NETWORK_ERROR",
      retryable: true,
    };
  }

  return {
    title: "Erreur de traitement",
    message:
      "Une erreur est survenue lors du traitement de l'opération. Veuillez vérifier les informations saisies et réessayer.",
    code: "GENERIC_ERROR",
    retryable: true,
  };
}

/**
 * Journalise les erreurs en environnement de développement ou transmet à un service de monitoring (ex: Sentry) en prod.
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.error("[DEV Error Log]", error, context);
  } else {
    // En production : possibilité d'envoyer vers un système de monitoring distant
    // (ex: Sentry, LogRocket, Datadog) sans impacter l'utilisateur.
  }
}
