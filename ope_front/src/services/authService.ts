import type { User, LoginResponse, RefreshResponse } from "./types";

const ACCESS_TOKEN_KEY = "ope_access_token";
const REFRESH_TOKEN_KEY = "ope_refresh_token";
const USER_KEY = "ope_user";
const REMEMBER_ME_KEY = "ope_remember_me";
const SAVED_USERNAME_KEY = "ope_saved_username";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:7777/api";

/**
 * Décode le payload d'un token JWT de manière sécurisée sans librairie externe.
 */
function decodeJwtPayload(token: string): { exp?: number; [key: string]: unknown } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

class AuthService {
  /**
   * Détermine le stockage actif :
   * - localStorage si "Se souvenir de moi" est activé
   * - sessionStorage sinon (session fermée avec l'onglet/navigateur)
   */
  private getStorage(): Storage {
    const isRemembered = localStorage.getItem(REMEMBER_ME_KEY) === "true";
    return isRemembered ? localStorage : sessionStorage;
  }

  /**
   * Récupère le token d'accès actuellement stocké.
   */
  public getAccessToken(): string | null {
    return (
      sessionStorage.getItem(ACCESS_TOKEN_KEY) ||
      localStorage.getItem(ACCESS_TOKEN_KEY)
    );
  }

  /**
   * Récupère le refresh token actuellement stocké.
   */
  public getRefreshToken(): string | null {
    return (
      sessionStorage.getItem(REFRESH_TOKEN_KEY) ||
      localStorage.getItem(REFRESH_TOKEN_KEY)
    );
  }

  /**
   * Récupère l'utilisateur connecté actuellement.
   */
  public getUser(): User | null {
    const raw =
      sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Récupère le nom d'utilisateur mémorisé pour pré-remplir le champ de login.
   */
  public getSavedUsername(): string {
    return localStorage.getItem(SAVED_USERNAME_KEY) || "";
  }

  /**
   * Vérifie si "Se souvenir de moi" était coché lors de la dernière connexion.
   */
  public isRememberMeEnabled(): boolean {
    return localStorage.getItem(REMEMBER_ME_KEY) === "true";
  }

  /**
   * Vérifie si un token JWT est expiré avec une marge de tolérance (buffer de sécurité en secondes).
   */
  public isTokenExpired(token: string | null, bufferSeconds = 30): boolean {
    if (!token) return true;
    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== "number") return true;

    const currentTimeSeconds = Math.floor(Date.now() / 1000);
    return payload.exp - currentTimeSeconds <= bufferSeconds;
  }

  /**
   * Vérifie si l'utilisateur est authentifié avec une session valide.
   */
  public isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (accessToken && !this.isTokenExpired(accessToken, 0)) {
      return true;
    }
    // Si l'access token est expiré mais qu'on a un refresh token valide
    if (refreshToken && !this.isTokenExpired(refreshToken, 0)) {
      return true;
    }
    return false;
  }

  /**
   * Enregistre les tokens et l'utilisateur dans le stockage approprié (localStorage ou sessionStorage).
   */
  public saveAuthData(
    accessToken: string,
    refreshToken?: string,
    user?: User,
    rememberMe = false
  ): void {
    // Nettoyer d'abord les deux espaces pour éviter toute désynchronisation
    this.clearStorage();

    const targetStorage = rememberMe ? localStorage : sessionStorage;

    targetStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      targetStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    if (user) {
      targetStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, "true");
      if (user?.username) {
        localStorage.setItem(SAVED_USERNAME_KEY, user.username);
      }
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
      localStorage.removeItem(SAVED_USERNAME_KEY);
    }
  }

  /**
   * Connexion à l'API Django CustomLoginView.
   */
  public async login(
    username: string,
    password: string,
    rememberMe = false
  ): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Permet la réception et l'envoi des cookies HttpOnly du backend Django
      body: JSON.stringify({
        username: username.trim(),
        password: password,
      }),
    });

    const data: LoginResponse = await response.json();

    if (response.ok && data.success) {
      this.saveAuthData(data.access, data.refresh, data.user, rememberMe);
    }

    return data;
  }

  /**
   * Restaure un nouvel access_token via CustomRefreshView.
   */
  public async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();

    try {
      const response = await fetch(`${API_BASE_URL}/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          refresh: refreshToken || "",
        }),
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const data: RefreshResponse = await response.json();

      if (data.success && data.access) {
        const storage = this.getStorage();
        storage.setItem(ACCESS_TOKEN_KEY, data.access);
        if (data.refresh) {
          storage.setItem(REFRESH_TOKEN_KEY, data.refresh);
        }
        if (data.user) {
          storage.setItem(USER_KEY, JSON.stringify(data.user));
        }
        return data.access;
      }

      this.logout();
      return null;
    } catch {
      this.logout();
      return null;
    }
  }

  /**
   * Déconnexion complète et purge des données de session.
   */
  public logout(): void {
    this.clearStorage();
    window.dispatchEvent(new Event("ope:auth_logout"));
  }

  private clearStorage(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export const authService = new AuthService();
export default authService;
