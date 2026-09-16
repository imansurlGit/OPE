import { Link } from "react-router-dom";

export type AdminTab =
  | "dashboard"
  | "talents"
  | "actualites"
  | "membres"
  | "partenaires"
  | "contact"
  | "galerie";

interface SideBarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function SideBar({
  activeTab,
  onSelectTab,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
}: SideBarProps) {
  const navItems = [
    {
      id: "dashboard" as AdminTab,
      label: "Tableau de bord",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      id: "talents" as AdminTab,
      label: "Les 1000 talents",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
    },
    {
      id: "actualites" as AdminTab,
      label: "Actualités",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "membres" as AdminTab,
      label: "Membres OPE",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      id: "partenaires" as AdminTab,
      label: "Partenaires",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      id: "contact" as AdminTab,
      label: "Contact",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "galerie" as AdminTab,
      label: "Galerie",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-6">
      {/* ── Haut : Marque & Navigation ── */}
      <div>
        {/* Liste des onglets de navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#B85028] text-white shadow-sm"
                    : "text-gray-600 hover:bg-[#FAF7F2] hover:text-[#B85028]"
                }`}
              >
                <span className={isActive ? "text-white" : "text-gray-500"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Bas : Action & Déconnexion ── */}
      <div className="pt-6 space-y-3">
        {/* Liens de sortie */}
        <div className="flex items-center justify-between pt-2 border-t border-[#EFECE6] text-xs">
          <Link
            to="/"
            className="text-gray-500 hover:text-[#B85028] font-medium transition-colors"
          >
            ← Site public
          </Link>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="text-red-600 hover:text-red-700 font-semibold cursor-pointer transition-colors"
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Sidebar pour Bureau (Desktop fixe) ── */}
      <aside className="hidden lg:block w-64 xl:w-72 bg-white border-r border-[#EFECE6] h-screen sticky top-0 shrink-0 select-none">
        {sidebarContent}
      </aside>

      {/* ── Drawer Mobile avec overlay ── */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl z-10 flex flex-col">
            <button
              onClick={onCloseMobile}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800"
              aria-label="Fermer le menu"
            >
              ✕
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
