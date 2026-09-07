import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoOpe from "../assets/logo_ope.jpeg";
import logoEvent from "../assets/logo_event.jpeg";
import logoIman from "../assets/logo_iman.png";

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer id="footer" className="bg-ope-footer text-ope-white pt-12 pb-8 border-t border-white/10">
            <div className="max-w-6xl mx-auto px-6">
                {/* ── Grille principale 4 colonnes ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10">
                    {/* Colonne 1 : Titre & Mission (largeur 4/12) */}
                    <div className="lg:col-span-4 flex flex-col justify-start">
                        <h3 className="text-base sm:text-lg font-extrabold text-ope-orange mb-3 tracking-tight">
                            {t("footer.title")}
                        </h3>
                        <p className="text-xs sm:text-[13px] text-white/70 leading-relaxed max-w-sm">
                            {t("footer.mission")}
                        </p>
                    </div>

                    {/* Colonne 2 : Navigation (largeur 3/12) */}
                    <div className="lg:col-span-3">
                        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-white/50 mb-3.5">
                            {t("footer.nav_title")}
                        </h4>
                        <ul className="space-y-2 text-xs sm:text-[13px]">
                            <li>
                                <Link to="/" className="text-white/80 hover:text-ope-orange transition-colors">
                                    {t("nav.home")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/apropos" className="text-white/80 hover:text-ope-orange transition-colors">
                                    {t("nav.about")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/talents" className="text-white/80 hover:text-ope-orange transition-colors">
                                    {t("nav.talents")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/categories" className="text-white/80 hover:text-ope-orange transition-colors">
                                    {t("nav.categories")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/membres" className="text-white/80 hover:text-ope-orange transition-colors">
                                    {t("nav.members")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/actualites" className="text-white/80 hover:text-ope-orange transition-colors">
                                    {t("nav.news")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/galerie" className="text-white/80 hover:text-ope-orange transition-colors">
                                    {t("nav.gallery")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Colonne 3 : Informations (largeur 2/12) */}
                    <div className="lg:col-span-2">
                        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-white/50 mb-3.5">
                            {t("footer.info_title")}
                        </h4>
                        <ul className="space-y-2 text-xs sm:text-[13px]">
                            <li>
                                <Link
                                    to="/sponsors"
                                    className="font-bold text-ope-orange hover:text-white transition-colors inline-flex items-center gap-1"
                                >
                                    {t("footer.become_sponsor")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/participer" className="text-white/80 hover:text-ope-orange transition-colors font-medium">
                                    {t("footer.apply_camp")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/apropos" className="text-white/80 hover:text-ope-orange transition-colors">
                                    {t("footer.legal")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-white/80 hover:text-ope-orange transition-colors">
                                    {t("footer.privacy")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/actualites" className="text-white/80 hover:text-ope-orange transition-colors">
                                    {t("footer.press")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Colonne 4 : Contact (largeur 3/12) */}
                    <div className="lg:col-span-3">
                        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-white/50 mb-3.5">
                            {t("footer.contact_title")}
                        </h4>
                        <div className="space-y-3 text-xs sm:text-[13px] text-white/70">
                            <div>
                                <span className="block text-white/50 text-[11px]">{t("footer.headquarters_label")}</span>
                                <span className="text-white/90 font-medium">{t("footer.headquarters_value")}</span>
                            </div>
                            <div>
                                <span className="block text-white/50 text-[11px]">{t("footer.email_label")}</span>
                                <a
                                    href="mailto:contact@ope-niger.org"
                                    className="text-white/90 hover:text-ope-orange transition-colors font-medium break-all"
                                >
                                    contact@ope-niger.org
                                </a>
                            </div>
                            <div>
                                <span className="block text-white/50 text-[11px]">{t("footer.phone_label")}</span>
                                <a
                                    href="tel:+22790000000"
                                    className="text-white/90 hover:text-ope-orange transition-colors font-medium"
                                >
                                    +227 90 00 00 00 / 96 00 00 00
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Barre inférieure (Sub-footer) ── */}
                <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
                    <p className="text-center sm:text-left">
                        {t("footer.copyright")}
                    </p>

                    {/* Logos partenaires & institutions en bas à droite */}
                    <div className="flex items-center gap-4">
                        <img
                            src={logoOpe}
                            alt="OPE Logo"
                            className="h-10 w-auto object-contain rounded-md shadow-xs bg-white p-0.5 border border-white/20"
                        />
                        <img
                            src={logoEvent}
                            alt="Camp National Citoyen"
                            className="h-10 w-auto object-contain rounded-md shadow-xs bg-white p-0.5 border border-white/20"
                        />
                        <img
                            src={logoIman}
                            alt="Camp National Citoyen"
                            className="h-10 w-auto object-contain rounded-md shadow-xs bg-white p-0.5 border border-white/20"
                        />
                    </div>
                </div>
            </div>
        </footer>
    );
}