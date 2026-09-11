import { useState, useEffect, useMemo } from "react";
import dashboardService from "../services/dashboardService";
import type { DashboardStats, TimelinePoint } from "../services/dashboardService";

// ── Couleurs fixes des régions ──
const REGION_COLORS = [
  "from-[#B85028] to-[#D97706]",
  "from-[#2F6084] to-[#4A80A8]",
  "from-amber-600 to-amber-500",
  "from-emerald-600 to-teal-500",
  "from-indigo-600 to-blue-500",
  "from-cyan-600 to-teal-400",
  "from-rose-500 to-orange-400",
  "from-purple-600 to-indigo-400",
];

const HOUSE_CONFIG = [
  {
    key: "STEAM" as const,
    name: "House STEAM",
    badge: "STEAM",
    desc: "Sciences, Technologies, Ingénierie, Arts & Maths",
    color: "#B85028",
    colorClass: "bg-[#B85028]",
    textColor: "text-[#B85028]",
    borderColor: "border-[#B85028]",
    bgSoft: "bg-orange-50",
  },
  {
    key: "LP" as const,
    name: "House LP",
    badge: "LP",
    desc: "Leadership, Politiques Publiques & Entrepreneuriat",
    color: "#2F6084",
    colorClass: "bg-[#2F6084]",
    textColor: "text-[#2F6084]",
    borderColor: "border-[#2F6084]",
    bgSoft: "bg-sky-50",
  },
  {
    key: "MCC" as const,
    name: "House MCC",
    badge: "MCC",
    desc: "Média, Création & Communication",
    color: "#D97706",
    colorClass: "bg-[#D97706]",
    textColor: "text-[#D97706]",
    borderColor: "border-[#D97706]",
    bgSoft: "bg-amber-50",
  },
];

// ── Skeleton Loader ──
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] rounded-xl ${className}`}
      style={{ animation: "shimmer 1.5s infinite linear" }}
    />
  );
}

export type TimelinePeriod = "week" | "month" | "day";

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [timelinePeriod, setTimelinePeriod] = useState<TimelinePeriod>("week");
  const [hoveredPoint, setHoveredPoint] = useState<{
    label: string;
    value: number;
    new: number;
    period_info?: string;
    x: number;
    y: number;
  } | null>(null);
  const [hoveredHouse, setHoveredHouse] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    dashboardService
      .getStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
        setTimeout(() => setIsLoaded(true), 80);
      })
      .catch(() => {
        setError("La connexion au serveur a échoué. Vérifiez que le backend est démarré et réessayez.");
        setLoading(false);
      });
  }, [retryCount]);

  // ── Courbe SVG dynamique selon la période (Semaine / Mois / Jour) ──
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const timelineData: TimelinePoint[] = useMemo(() => {
    if (!stats) return [];
    if (timelinePeriod === "week") return stats.timeline_week || [];
    if (timelinePeriod === "month") return stats.timeline_month || [];
    return stats.timeline_30d || [];
  }, [stats, timelinePeriod]);

  // Si période par jour, sous-échantillonner pour l'axe X ; afficher tous les points pour semaines et mois
  const step = timelinePeriod === "day" ? Math.max(1, Math.floor(timelineData.length / 10)) : 1;
  const displayedPoints = timelineData.filter((_, i) => i % step === 0 || i === timelineData.length - 1);
  const maxValue = Math.max(...displayedPoints.map((d) => d.value), 1);

  const svgPoints = displayedPoints.map((item, index) => {
    const x =
      paddingX +
      (index / Math.max(displayedPoints.length - 1, 1)) * (svgWidth - paddingX * 2);
    const y =
      svgHeight -
      paddingY -
      (item.value / maxValue) * (svgHeight - paddingY * 2);
    return { ...item, x, y };
  });

  const pathD = svgPoints.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const prev = svgPoints[index - 1];
    const cpX1 = prev.x + (point.x - prev.x) / 2;
    const cpX2 = cpX1;
    return `${acc} C ${cpX1} ${prev.y}, ${cpX2} ${point.y}, ${point.x} ${point.y}`;
  }, "");

  const areaD =
    svgPoints.length > 0
      ? `${pathD} L ${svgPoints[svgPoints.length - 1].x} ${svgHeight - paddingY} L ${svgPoints[0].x} ${svgHeight - paddingY} Z`
      : "";

  // ── Donut ──
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  const houseData = HOUSE_CONFIG.map((h) => {
    const count = stats?.domaines[h.key] ?? 0;
    const total = stats?.total ?? 1;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { ...h, count, percentage: pct };
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-7 h-72" />
          <Skeleton className="lg:col-span-5 h-72" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-16 px-8 bg-white rounded-3xl border border-red-100 shadow-2xs text-center">
        {/* Icône SVG shield-alert */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 border border-red-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"
            fill="none" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
            Chargement des données impossible
          </h3>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
            {error}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRetryCount((c) => c + 1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-700 transition-colors cursor-pointer"
        >
          {/* Icône SVG refresh */}
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Réessayer
        </button>
      </div>
    );
  }

  const s = stats!;
  const total = s.total;
  const admis = s.statuts.admis;
  const pctAdmis = total > 0 ? Math.round((admis / total) * 100) : 0;
  const pctF = s.parite.pct_f;
  const pctM = s.parite.pct_m;
  const pariteLabel =
    pctF > 55 ? "Féminine majoritaire" :
    pctM > 55 ? "Masculine majoritaire" : "Équilibre paritaire";

  return (
    <div className="space-y-8 animate-fade-up">
      {/* ── En-tête ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Tableau de bord statistique
        </h1>
        <p className="text-xs text-gray-400 mt-1">Données en temps réel · CNCEIZ 2026</p>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total candidatures */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFECE6] shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1.5">
            <span>Candidatures</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Total
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {total.toLocaleString("fr-FR")}
          </p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">
            Dossiers reçus à ce jour
          </p>
        </div>

        {/* Talents retenus */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFECE6] shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1.5">
            <span>Talents retenus</span>
            <span className="text-[11px] font-bold text-[#2F6084] bg-blue-50 px-2 py-0.5 rounded-full">
              {pctAdmis}%
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {admis.toLocaleString("fr-FR")}{" "}
            <span className="text-xs font-semibold text-gray-400">/ 1 000</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">
            Admis au camp national
          </p>
        </div>

        {/* Parité */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFECE6] shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1.5">
            <span>Parité F / G</span>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              {Math.abs(pctF - pctM) <= 10 ? "Équilibré" : pctF > pctM ? "F+" : "G+"}
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {pctF}%{" "}
            <span className="text-xs font-semibold text-purple-600">F</span> ·{" "}
            {pctM}%{" "}
            <span className="text-xs font-semibold text-blue-600">G</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">{pariteLabel}</p>
        </div>

        {/* Couverture régionale */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFECE6] shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1.5">
            <span>Territoire</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {Math.round((s.regions_couvertes / 8) * 100)}%
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {s.regions_couvertes} / 8
          </p>
          <p className="text-[11px] text-gray-400 mt-1 truncate">
            Régions mobilisées
          </p>
        </div>
      </div>

      {/* ── Graphiques ligne 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
        {/* Courbe d'évolution par semaine / par mois / par jour */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFECE6] shadow-2xs flex flex-col justify-between h-full">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
                Dynamique d'inscription
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {timelinePeriod === "week" && "Cumul des dossiers — Par semaine (8 dernières semaines)"}
                {timelinePeriod === "month" && "Cumul des dossiers — Par mois (6 derniers mois)"}
                {timelinePeriod === "day" && "Cumul des dossiers — Par jour (30 derniers jours)"}
              </p>
            </div>

            {/* Sélecteur de période : Semaine / Mois / Jour */}
            <div className="flex items-center self-start sm:self-auto bg-[#FAF7F2] p-1 rounded-xl border border-[#EFECE6] text-xs font-semibold text-gray-500">
              <button
                type="button"
                onClick={() => {
                  setTimelinePeriod("week");
                  setHoveredPoint(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timelinePeriod === "week"
                    ? "bg-white text-[#B85028] shadow-2xs font-extrabold"
                    : "hover:text-gray-900"
                }`}
              >
                Par semaine
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimelinePeriod("month");
                  setHoveredPoint(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timelinePeriod === "month"
                    ? "bg-white text-[#B85028] shadow-2xs font-extrabold"
                    : "hover:text-gray-900"
                }`}
              >
                Par mois
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimelinePeriod("day");
                  setHoveredPoint(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timelinePeriod === "day"
                    ? "bg-white text-[#B85028] shadow-2xs font-extrabold"
                    : "hover:text-gray-900"
                }`}
              >
                Par jour
              </button>
            </div>
          </div>

          <div className="relative w-full overflow-hidden flex-1 flex items-center">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 sm:h-48 overflow-visible">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B85028" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#B85028" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#B85028" floodOpacity="0.3" />
                </filter>
              </defs>

              {[0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = svgHeight - paddingY - ratio * (svgHeight - paddingY * 2);
                return (
                  <line key={ratio} x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y}
                    stroke="#EFECE6" strokeDasharray="4 4" strokeWidth="1" />
                );
              })}

              {areaD && (
                <path d={areaD} fill="url(#areaGradient)" className="transition-all duration-700 ease-out" />
              )}
              {pathD && (
                <path d={pathD} fill="none" stroke="#B85028" strokeWidth="3.5"
                  strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"
                  className="transition-all duration-700 ease-out" />
              )}

              {svgPoints.map((pt, idx) => {
                const isHovered = hoveredPoint?.label === pt.label;
                return (
                  <g key={idx}>
                    <circle cx={pt.x} cy={pt.y} r={isHovered ? 7 : 4.5}
                      className="fill-white stroke-[#B85028] stroke-3 transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)} />
                    <text x={pt.x} y={svgHeight - 10} textAnchor="middle"
                      className="text-[10px] font-semibold fill-gray-400 select-none">
                      {pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hoveredPoint && (
              <div
                className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-2 rounded-xl bg-gray-900/95 text-white text-xs font-bold shadow-xl backdrop-blur-xs z-20 flex flex-col items-center gap-0.5 border border-white/10"
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: `${Math.max(8, (hoveredPoint.y / svgHeight) * 100 - 6)}%`,
                }}
              >
                <span className="text-gray-300 text-[11px] font-medium">
                  {hoveredPoint.period_info || hoveredPoint.label}
                </span>
                <span className="text-[#F15B29] text-xs font-extrabold">
                  {hoveredPoint.value.toLocaleString("fr-FR")} dossiers au total
                </span>
                {hoveredPoint.new > 0 ? (
                  <span className="text-emerald-400 text-[10px] font-semibold">
                    +{hoveredPoint.new}{" "}
                    {timelinePeriod === "week"
                      ? "cette semaine"
                      : timelinePeriod === "month"
                      ? "ce mois"
                      : "ce jour"}
                  </span>
                ) : (
                  <span className="text-gray-400 text-[10px]">
                    0 nouvelle candidature
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Donut : Répartition par Maison */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFECE6] shadow-2xs flex flex-col justify-between h-full">
          <div className="mb-3">
            <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
              Répartition par Maison
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Équilibre entre les 3 piliers d'excellence</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-1 justify-center my-auto">
            {/* Donut SVG */}
            <div className="relative flex justify-center items-center shrink-0">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 160 160">
                {houseData.map((house) => {
                  const strokeDasharray = `${(house.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -accumulatedOffset;
                  accumulatedOffset += (house.percentage / 100) * circumference;
                  const isHovered = hoveredHouse === house.name;
                  return (
                    <circle key={house.name} cx="80" cy="80" r={radius}
                      fill="transparent" stroke={house.color}
                      strokeWidth={isHovered ? 20 : 16}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={isLoaded ? strokeDashoffset : 0}
                      className="transition-all duration-700 ease-out cursor-pointer hover:opacity-90"
                      onMouseEnter={() => setHoveredHouse(house.name)}
                      onMouseLeave={() => setHoveredHouse(null)} />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-black text-gray-900 leading-none">
                  {hoveredHouse
                    ? `${houseData.find((h) => h.name === hoveredHouse)?.percentage ?? 0}%`
                    : "100%"}
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1 truncate max-w-[80px]">
                  {hoveredHouse || "Total"}
                </span>
              </div>
            </div>

            {/* Légende */}
            <div className="w-full sm:flex-1 space-y-2">
              {houseData.map((house) => (
                <div key={house.name}
                  onMouseEnter={() => setHoveredHouse(house.name)}
                  onMouseLeave={() => setHoveredHouse(null)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    hoveredHouse === house.name
                      ? "bg-[#FAF7F2] border-[#B85028] shadow-xs"
                      : "border-transparent hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: house.color }} />
                    <div>
                      <p className="text-xs font-bold text-gray-900">{house.name}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[130px]">{house.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-gray-900">{house.percentage}%</span>
                    <p className="text-[10px] text-gray-400 font-semibold">{house.count.toLocaleString("fr-FR")} inscrits</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Graphiques ligne 3 : Régions + Pipeline ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Histogramme Régions */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-[#EFECE6] shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
                Répartition géographique
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Candidatures par région du Niger
              </p>
            </div>
            <span className="text-xs font-bold text-[#B85028] bg-orange-50 px-2.5 py-1 rounded-lg">
              {s.regions_couvertes} Régions
            </span>
          </div>

          <div className="space-y-3.5">
            {s.regions.map((reg, idx) => (
              <div key={reg.region} className="group">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-gray-800 group-hover:text-[#B85028] transition-colors">
                    {reg.region}
                  </span>
                  <span className="text-gray-500 font-mono">
                    {reg.count}{" "}
                    <span className="text-gray-300 font-sans font-normal">({reg.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full bg-gradient-to-r ${REGION_COLORS[idx % REGION_COLORS.length]} rounded-full transition-all duration-1000 ease-out`}
                    style={{
                      width: isLoaded
                        ? `${(reg.count / s.max_region_count) * 100}%`
                        : "0%",
                      transitionDelay: `${idx * 80}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline de sélection */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-[#EFECE6] shadow-2xs">
          <div className="mb-5">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
              Entonnoir de sélection
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">État d'avancement des validations</p>
          </div>

          <div className="space-y-4">
            {[
              {
                step: "1. Dossiers Déposés",
                count: total,
                pct: 100,
                color: "bg-gray-600",
                bg: "bg-[#FAF7F2]",
                border: "border-[#EFECE6]",
                textColor: "text-gray-700",
                barBg: "bg-slate-200",
              },
              {
                step: "2. Soumis / En examen",
                count: s.statuts.soumis + s.statuts.en_revue,
                pct: total > 0 ? Math.round(((s.statuts.soumis + s.statuts.en_revue) / total) * 100) : 0,
                color: "bg-[#2F6084]",
                bg: "bg-blue-50/60",
                border: "border-blue-100",
                textColor: "text-[#2F6084]",
                barBg: "bg-blue-100",
              },
              {
                step: "3. Pré-sélectionnés",
                count: s.statuts.preselectionne,
                pct: total > 0 ? Math.round((s.statuts.preselectionne / total) * 100) : 0,
                color: "bg-amber-500",
                bg: "bg-amber-50/60",
                border: "border-amber-100",
                textColor: "text-amber-800",
                barBg: "bg-amber-100",
              },
              {
                step: "4. Admis au Camp",
                count: s.statuts.admis,
                pct: total > 0 ? Math.round((s.statuts.admis / total) * 100) : 0,
                color: "bg-emerald-500",
                bg: "bg-emerald-50/60",
                border: "border-emerald-100",
                textColor: "text-emerald-800",
                barBg: "bg-emerald-100",
              },
            ].map((item, idx) => (
              <div key={idx} className={`p-4 rounded-2xl ${item.bg} border ${item.border}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold ${item.textColor}`}>{item.step}</span>
                  <span className={`text-xs font-black ${item.textColor}`}>
                    {item.count.toLocaleString("fr-FR")}{" "}
                    <span className="font-normal opacity-70">({item.pct}%)</span>
                  </span>
                </div>
                <div className={`h-2 w-full ${item.barBg} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                    style={{
                      width: isLoaded ? `${item.pct}%` : "0%",
                      transitionDelay: `${idx * 150}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
