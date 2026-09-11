const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:7777/api";

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
    MCC: number;
  };
  regions: { region: string; count: number; percentage: number }[];
  max_region_count: number;
  timeline_30d: TimelinePoint[];
  timeline_week?: TimelinePoint[];
  timeline_month?: TimelinePoint[];
  regions_couvertes: number;
}

const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE_URL}/candidatures/stats/`);
    if (!res.ok) throw new Error(`Stats API error: ${res.status}`);
    return res.json();
  },
};

export default dashboardService;
