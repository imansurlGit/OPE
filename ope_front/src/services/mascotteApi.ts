/**
 * Service API pour le Concours de la Mascotte CNCEIZ Agadez 2026.
 * Gestion robuste de l'envoi multipart/form-data, du timeout et du typage des erreurs.
 */
import api from "./api";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:7777/api"
).replace(/\/+$/, "");

export interface CandidatureMascotteResponse {
  success: boolean;
  message: string;
  reference: string;
  mascotte_nom: string;
  classe: string;
  created_at: string;
}

export interface CandidatMascotteItem {
  id: number;
  reference: string;
  nom: string;
  prenom: string;
  classe: "6e" | "5e" | "4e" | "3e" | string;
  etablissement?: string;
  region_ville?: string;
  telephone_tuteur: string;
  nom_tuteur: string;
  mascotte_nom: string;
  mascotte_pourquoi?: string;
  mascotte_signification?: string;
  mascotte_dessin: string;
  autorisation_parent: boolean;
  accord_utilisation_dessin: boolean;
  statut: "en_attente" | "valide" | "rejete";
  created_at: string;
  updated_at?: string;
}

export interface MascotteFilterParams {
  search?: string;
  statut?: string;
  classe?: string;
  region?: string;
}

export interface CandidatureMascottePayload {
  nom: string;
  prenom: string;
  classe: "6e" | "5e" | "4e" | "3e" | string;
  etablissement?: string;
  region_ville?: string;
  telephone_tuteur: string;
  nom_tuteur: string;
  mascotte_nom: string;
  mascotte_pourquoi?: string;
  mascotte_signification?: string;
  mascotte_dessin: File;
  autorisation_parent: boolean;
  accord_utilisation_dessin: boolean;
  website?: string;
}

export interface MascotteApiError {
  message: string;
  status?: number;
  fieldErrors?: Record<string, string>;
}

/**
 * Soumission publique d'une candidature au concours de la mascotte
 */
export async function createCandidatureMascotte(
  formData: FormData,
  timeoutMs = 45000
): Promise<CandidatureMascotteResponse> {
  const url = `${API_BASE_URL}/mascotte/candidatures/`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 201) {
      return (await response.json()) as CandidatureMascotteResponse;
    }

    // Gestion des codes d'erreur
    let data: Record<string, unknown> = {};
    try {
      data = await response.json();
    } catch {
      // Pas de corps JSON
    }

    if (response.status === 400) {
      const fieldErrors: Record<string, string> = {};
      let generalMessage = "Veuillez corriger les informations requises dans le formulaire.";

      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
          fieldErrors[key] = value.join(" ");
        } else if (typeof value === "string") {
          fieldErrors[key] = value;
        }
      }

      if (fieldErrors.non_field_errors) {
        generalMessage = fieldErrors.non_field_errors;
      }

      const err: MascotteApiError = {
        message: generalMessage,
        status: 400,
        fieldErrors,
      };
      throw err;
    }

    if (response.status === 429) {
      const err: MascotteApiError = {
        message: "Trop de candidatures envoyées en peu de temps. Merci de patienter une minute avant de réessayer.",
        status: 429,
      };
      throw err;
    }

    if (response.status >= 500) {
      const err: MascotteApiError = {
        message: "Le serveur de l'OPE rencontre un problème momentané. Merci de réessayer dans un instant.",
        status: response.status,
      };
      throw err;
    }

    const defaultErr: MascotteApiError = {
      message: (data?.detail as string) || (data?.message as string) || "Une erreur est survenue lors de l'envoi de votre candidature.",
      status: response.status,
    };
    throw defaultErr;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error && typeof error === "object" && "fieldErrors" in error) {
      throw error;
    }

    if ((error as Error)?.name === "AbortError") {
      const timeoutErr: MascotteApiError = {
        message: "Le délai d'attente est dépassé lors du transfert de votre dessin. Vérifiez votre connexion Internet.",
        status: 408,
      };
      throw timeoutErr;
    }

    const networkErr: MascotteApiError = {
      message: "Impossible de joindre le serveur. Vérifiez votre connexion Internet et réessayez.",
      status: 0,
    };
    throw networkErr;
  }
}

/**
 * Récupération authentifiée (Admin) de la liste des candidats à la mascotte
 */
export async function getCandidaturesMascotte(
  params?: MascotteFilterParams
): Promise<CandidatMascotteItem[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.statut && params.statut !== "all") query.set("statut", params.statut);
  if (params?.classe && params.classe !== "all") query.set("classe", params.classe);
  if (params?.region && params.region !== "Toutes" && params.region !== "all") {
    query.set("region", params.region);
  }

  const qStr = query.toString();
  const endpoint = `mascotte/candidatures/${qStr ? `?${qStr}` : ""}`;
  const res = await api.get<CandidatMascotteItem[] | { results: CandidatMascotteItem[] }>(endpoint);
  return Array.isArray(res) ? res : (res as any)?.results || [];
}

/**
 * Mise à jour authentifiée (Admin) du statut ou des données d'un candidat
 */
export async function updateCandidatureMascotte(
  id: number,
  data: Partial<CandidatMascotteItem> | FormData
): Promise<CandidatMascotteItem> {
  return await api.patch<CandidatMascotteItem>(`mascotte/candidatures/${id}/`, data);
}

/**
 * Suppression authentifiée (Admin) d'une candidature
 */
export async function deleteCandidatureMascotte(id: number): Promise<void> {
  await api.delete(`mascotte/candidatures/${id}/`);
}

/**
 * Création authentifiée (Admin) d'une candidature avec possibilité de choisir le statut
 */
export async function createCandidatureMascotteAdmin(
  formData: FormData
): Promise<CandidatMascotteItem> {
  return await api.post<CandidatMascotteItem>("mascotte/candidatures/", formData);
}

export default {
  createCandidatureMascotte,
  getCandidaturesMascotte,
  updateCandidatureMascotte,
  deleteCandidatureMascotte,
  createCandidatureMascotteAdmin,
};
