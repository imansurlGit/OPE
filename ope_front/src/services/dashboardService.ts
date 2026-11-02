import api from "./api";

export interface TimelinePoint {
  label: string;
  value: number;
  new: number;
  period_info?: string;
}

export interface DashboardStats {
  total: number;
  statuts: {
    admis: number;
    preselectionne: number;
    en_revue: number;
    soumis: number;
    rejete: number;
  };
  parite: {
    femmes: number;
    hommes: number;
    pct_f: number;
    pct_m: number;
  };
  domaines: {
    STEAM: number;
    LP: number;
    MC2: number;
  };
  regions: { region: string; count: number; percentage: number }[];
  max_region_count: number;
  timeline_30d: TimelinePoint[];
  timeline_week?: TimelinePoint[];
  timeline_month?: TimelinePoint[];
  regions_couvertes: number;
}

const dashboardService = {
  // Statistiques réservées à l'administration : envoyées avec le jeton de connexion
  async getStats(): Promise<DashboardStats> {
    return api.get<DashboardStats>("candidatures/stats/");
  },
};

export default dashboardService;
