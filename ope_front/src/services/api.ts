import authService from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:7777/api";

// Verrou pour éviter des appels simultanés de refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(token: string | null, error: unknown = null) {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
}

export interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Client API universel avec intercepteur d'authentification et auto-refresh transparent.
 */
class ApiClient {
  private formatUrl(endpoint: string): string {
    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
      return endpoint;
    }
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
    return `${API_BASE_URL}/${cleanEndpoint}`;
  }

  /**
   * Effectue un appel fetch avec gestion automatique de l'access token et du renouvellement.
   */
  public async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = true, headers = {}, ...restOptions } = options;
    const url = this.formatUrl(endpoint);

    const requestHeaders = new Headers(headers);
    if (!requestHeaders.has("Content-Type") && !(restOptions.body instanceof FormData)) {
      requestHeaders.set("Content-Type", "application/json");
    }

    // Si la route requiert une authentification
    if (requiresAuth) {
      let accessToken = authService.getAccessToken();

      // 1. Proactive Refresh : Si le token est déjà expiré ou sur le point de l'être
      if (accessToken && authService.isTokenExpired(accessToken, 30)) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            accessToken = await authService.refreshToken();
            processQueue(accessToken);
          } catch (err) {
            processQueue(null, err);
            throw err;
          } finally {
            isRefreshing = false;
          }
        } else {
          // Attendre que le refresh en cours se termine
          accessToken = await new Promise<string | null>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
        }
      }

      if (accessToken) {
        requestHeaders.set("Authorization", `Bearer ${accessToken}`);
      }
    }

    // 2. Exécution de la requête
    let response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
      credentials: "include",
    });

    // 3. Reactive Refresh : Si le serveur renvoie 401 Unauthorized
    if (response.status === 401 && requiresAuth) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newAccessToken = await authService.refreshToken();
          processQueue(newAccessToken);

          if (newAccessToken) {
            requestHeaders.set("Authorization", `Bearer ${newAccessToken}`);
            response = await fetch(url, {
              ...restOptions,
              headers: requestHeaders,
              credentials: "include",
            });
          }
        } catch (refreshErr) {
          processQueue(null, refreshErr);
          throw refreshErr;
        } finally {
          isRefreshing = false;
        }
      } else {
        // Mettre la requête en file d'attente pendant qu'un autre appel rafraîchit le token
        const newAccessToken = await new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });

        if (newAccessToken) {
          requestHeaders.set("Authorization", `Bearer ${newAccessToken}`);
          response = await fetch(url, {
            ...restOptions,
            headers: requestHeaders,
            credentials: "include",
          });
        }
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.message || errorData.detail || `Erreur requête HTTP ${response.status}`
      ) as Error & { status?: number; data?: unknown };
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // Retourne le JSON si du contenu est présent, ou null pour 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return response.json() as Promise<T>;
  }

  public get<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  public put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  public patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  public delete<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient();
export default api;
