import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoOpe from "../assets/logo_ope.png";
import logoEvent from "../assets/logo_event.png";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Liens principaux toujours visibles
  const MAIN_LINKS = [
    { label: t("nav.home"), to: "/" },
    { label: t("nav.about"), to: "/apropos" },
    { label: t("nav.talents"), to: "/talents" },
    { label: t("nav.news"), to: "/actualites" },
    { label: t("nav.contact"), to: "/contact" },
  ];

  // Liens secondaires regroupés dans "Explorer"
  const DROPDOWN_LINKS = [
    { label: t("nav.members"), to: "/membres" },
    { label: t("nav.categories"), to: "/categories" },
    { label: t("nav.sponsors"), to: "/sponsors" },
    { label: t("nav.gallery"), to: "/galerie" },
  ];

  return (
    <nav
      id="navbar"
      className="fixed top-0 inset-x-0 z-50 bg-ope-white shadow-sm border-b border-ope-border/70 transition-all duration-300"
    >
      <div className="w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* ── Zone 1 : Logo (gauche) ── */}
        <NavLink
          to="/"
          className="flex items-center justify-center gap-1.5 group shrink-0"
        >
          <img
            src={logoOpe}
            alt="OPE Logo"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-md"
          />
        </NavLink>
        <NavLink
          to="/"
          className="flex items-center justify-center gap-1.5 group shrink-0"
        >
          <img
            src={logoEvent}
            alt="OPE Logo"
            className="w-14 h-auto sm:w-16 sm:h-16 object-contain rounded-md"
          />
        </NavLink>

        {/* ── Zone 2 : Liens (centre) ── */}
        <ul className="hidden lg:flex items-center gap-1 mx-auto">
          {MAIN_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors duration-150 ${
                    isActive
                      ? "text-ope-orange underline underline-offset-4 decoration-ope-orange"
                      : "text-ope-text-muted hover:text-ope-primary"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}

          {/* Dropdown "Explorer" */}
          <li
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              className="flex items-center gap-1 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-ope-text-muted hover:text-ope-primary transition-colors cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {t("nav.explore")}
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <ul
              className={`absolute top-full left-0 pt-2 w-56 transition-all duration-200 ${
                dropdownOpen
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-1"
              }`}
            >
              <div className="bg-ope-white rounded-lg shadow-lg border border-ope-border py-2">
                {DROPDOWN_LINKS.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `block px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                          isActive
                            ? "text-ope-orange bg-ope-orange/5"
                            : "text-ope-text-muted hover:text-ope-primary hover:bg-ope-primary/5"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </div>
            </ul>
          </li>
        </ul>

        {/* ── Zone 3 : Switcher de Langue & CTA (droite) ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />

          <NavLink
            to="/formulaire"
            className="hidden lg:inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold text-ope-white bg-ope-orange shrink-0 transition-all duration-200 hover:opacity-90 active:scale-95 shadow-sm"
          >
            {t("nav.join")}
          </NavLink>

          {/* Burger mobile */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <span
              className={`block w-5 h-0.5 bg-ope-text transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-ope-text transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-ope-text transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Menu mobile — hauteur dynamique avec scroll */}
      <div
        className={`lg:hidden overflow-y-auto transition-[max-height] duration-300 ${
          menuOpen ? "max-h-[calc(100vh-4rem)]" : "max-h-0"
        }`}
      >
        <div className="bg-ope-white border-t border-ope-border px-4 py-3 flex flex-col gap-1">
          {[...MAIN_LINKS, ...DROPDOWN_LINKS].map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `px-3 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-md ${
                  isActive
                    ? "text-ope-orange bg-ope-orange/5"
                    : "text-ope-text-muted hover:text-ope-primary hover:bg-ope-primary/5"
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/participer"
            className="mt-2 mb-2 px-5 py-2.5 rounded-full text-sm font-semibold text-ope-white bg-ope-orange text-center shadow-sm"
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.join")}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
