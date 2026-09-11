import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SideBar, { type AdminTab } from "../components/SideBar";
import DashboardStats from "../components/DashboardStats";
import AdminTalents from "../components/AdminTalents";
import AdminActualites from "../components/AdminActualites";
import AdminMembres from "../components/AdminMembres";
import AdminGalerie from "../components/AdminGalerie";
import AdminPartenaires from "../components/AdminPartenaires";
import { authService } from "../services";

export default function Admin() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const VALID_TABS: AdminTab[] = ["dashboard", "talents", "actualites", "membres", "galerie", "partenaires"];
  const tabFromUrl = searchParams.get("tab") as AdminTab | null;
  const activeTab: AdminTab = tabFromUrl && VALID_TABS.includes(tabFromUrl) ? tabFromUrl : "dashboard";

  const setActiveTab = (tab: AdminTab) => {
    setSearchParams({ tab }, { replace: true });
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(() => authService.getUser());

  useEffect(() => {
    // Vérification de session
    if (!authService.isAuthenticated()) {
      navigate("/login", { replace: true });
    } else {
      setUser(authService.getUser());
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7F2] text-[#193549]">
      {/* ── Sidebar Navigation ── */}
      <SideBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* ── Contenu Principal ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar mobile pour ouvrir le menu */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#EFECE6] sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-gray-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Ouvrir le menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-extrabold text-[#B85028] text-base">OPE Agadez</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 truncate max-w-[120px]">
              {user?.username || "Admin"}
            </span>
          </div>
        </header>

        {/* ── Corps de l'onglet actif ── */}
        <main className="flex-1 p-5 sm:p-8 lg:p-12 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* ══════════════════════════════════════════════════
              ONGLET : GALERIE
              ══════════════════════════════════════════════════ */}
          {activeTab === "galerie" && <AdminGalerie />}

          {/* ══════════════════════════════════════════════════
              ONGLET : TABLEAU DE BORD (Graphes animés et parlants)
              ══════════════════════════════════════════════════ */}
          {activeTab === "dashboard" && <DashboardStats />}

          {/* ══════════════════════════════════════════════════
              ONGLET : LES 1000 TALENTS
              ══════════════════════════════════════════════════ */}
          {activeTab === "talents" && <AdminTalents />}

          {/* ══════════════════════════════════════════════════
              ONGLET : ACTUALITÉS
              ══════════════════════════════════════════════════ */}
          {activeTab === "actualites" && <AdminActualites />}

          {/* ══════════════════════════════════════════════════
              ONGLET : MEMBRES OPE
              ══════════════════════════════════════════════════ */}
          {activeTab === "membres" && <AdminMembres />}

          {/* ══════════════════════════════════════════════════
              ONGLET : PARTENAIRES
              ══════════════════════════════════════════════════ */}
          {activeTab === "partenaires" && <AdminPartenaires />}
        </main>
      </div>
    </div>
  );
}
