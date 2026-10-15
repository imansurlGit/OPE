import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LogoEvent from "../assets/logo_event.jpeg";

export const MascotteCtaPopup: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [dismissedThisLoad, setDismissedThisLoad] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const participateBtnRef = useRef<HTMLButtonElement>(null);

  const shouldShow = useCallback(() => {
    if (dismissedThisLoad) return false;

    // Pages de la plateforme : pas de popup
    const platformRoutes = ["/admin", "/login", "/concours-mascotte"];
    if (platformRoutes.some((r) => location.pathname.startsWith(r))) return false;

    return true;
  }, [dismissedThisLoad, location.pathname]);

  useEffect(() => {
    if (!shouldShow()) { setIsOpen(false); return; }
    const timer = setTimeout(() => {
      if (shouldShow()) {
        triggerElementRef.current = document.activeElement as HTMLElement;
        setIsOpen(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [shouldShow]);

  const handleClose = useCallback(() => {
    setDismissedThisLoad(true);
    setIsOpen(false);
    triggerElementRef.current?.focus();
  }, []);

  const handleParticipate = useCallback(() => {
    setDismissedThisLoad(true);
    setIsOpen(false);
    navigate("/concours-mascotte");
  }, [navigate]);

  // Focus trap + Escape
  useEffect(() => {
    if (!isOpen) return;
    const focusTimer = setTimeout(() => participateBtnRef.current?.focus(), 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); handleClose(); return; }
      if (e.key === "Tab" && modalRef.current) {
        const els = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!els.length) return;
        const first = els[0], last = els[els.length - 1];
        if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
        else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => { clearTimeout(focusTimer); window.removeEventListener("keydown", handleKeyDown); };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
      role="presentation"
    >
      {/* Card */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mascotte-popup-title"
        aria-describedby="mascotte-popup-desc"
        onClick={(e) => e.stopPropagation()}
        className="
          relative w-full sm:max-w-sm
          bg-white
          rounded-2xl
          shadow-2xl
          overflow-hidden
          animate-fade-up
          motion-reduce:animate-none
        "
      >


        {/* Close */}
        <button
          type="button"
          onClick={handleClose}
          aria-label={t("popup.mascotte.close", "Fermer")}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F15B29]/40 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Body */}
        <div className="flex items-start gap-4 px-5 pt-5 pb-4">
          {/* Logo pill */}
          <div className="shrink-0 w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden">
            <img src={LogoEvent} alt="CNCEIZ" className="w-full h-full object-contain" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 pr-4">
            <span className="inline-block mb-1.5 text-[10px] font-black uppercase tracking-widest text-[#F15B29]">
              Concours Junior
            </span>
            <h2
              id="mascotte-popup-title"
              className="text-sm font-extrabold text-[#193549] leading-snug"
            >
              {t("popup.mascotte.title", "Concours de la mascotte CNCEIZ Agadez 2026")}
            </h2>
          </div>
        </div>

        {/* Description */}
        <p
          id="mascotte-popup-desc"
          className="px-5 pb-5 text-xs text-slate-500 leading-relaxed"
        >
          {t(
            "popup.mascotte.subtitle",
            "Imagine la mascotte du Camp et donne-lui un nom. Dépose ton dessin et tente de remporter les prix."
          )}
        </p>

        {/* Divider */}
        <div className="mx-5 border-t border-slate-100" />

        {/* Actions */}
        <div className="flex items-center gap-2 px-5 py-4">
          <button
            ref={participateBtnRef}
            type="button"
            onClick={handleParticipate}
            className="
              flex-1 flex items-center justify-center gap-1.5
              py-2.5 px-4
              rounded-xl
              bg-[#F15B29] hover:bg-[#d94d1f]
              text-white text-xs font-bold
              transition-all hover:-translate-y-px
              focus:outline-none
              cursor-pointer
            "
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            {t("popup.mascotte.participate", "Je participe")}
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="
              py-2.5 px-4
              rounded-xl
              text-xs font-semibold text-slate-500
              hover:text-slate-700 hover:bg-slate-100
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-slate-200
              cursor-pointer
            "
          >
            {t("popup.mascotte.later", "Plus tard")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MascotteCtaPopup;
