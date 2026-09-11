import { useState } from "react";
import { useTranslation } from "react-i18next";
import { contactService } from "../services";

export default function Contact() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        nom: "",
        email: "",
        sujet: "",
        message: "",
    });

    const [envoye, setEnvoye] = useState(false);
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setChargement(true);
        setErreur(null);
        try {
            await contactService.envoyerMessage(formData);
            setEnvoye(true);
            setFormData({ nom: "", email: "", sujet: "", message: "" });
        } catch (err: any) {
            setErreur(err?.message || "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.");
        } finally {
            setChargement(false);
        }
    };

    return (
        <div className="pt-16 bg-ope-bg min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                {/* ── En-tête de la page ────────────────────────────── */}
                <div className="mb-12">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-ope-text mb-3 tracking-tight">
                        {t("contact.title", "Contactez-nous")}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-ope-text-muted leading-relaxed max-w-2xl">
                        {t("contact.subtitle", "Une question sur le camp, un partenariat ou une candidature ? Notre équipe vous répond avec plaisir.")}
                    </p>
                </div>

                {/* ── Grille Formulaire + Coordonnées ────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* ── Colonne Gauche : Formulaire de Message (7/12) ── */}
                    <div className="lg:col-span-7 bg-ope-white rounded-3xl p-7 sm:p-10 border border-ope-border shadow-2xs">
                        <h2 className="text-lg sm:text-xl font-extrabold text-ope-text mb-6 tracking-tight">
                            {t("contact.form_title", "Envoyer un message")}
                        </h2>

                        {erreur && (
                            <div className="mb-5 p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C] flex items-center gap-3">
                                <svg className="w-5 h-5 shrink-0 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{erreur}</span>
                            </div>
                        )}

                        {envoye ? (
                            <div className="p-6 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-center my-4">
                                <div className="w-12 h-12 rounded-full bg-[#22C55E]/10 text-[#16A34A] mx-auto flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-[#15803D] mb-1">{t("contact.success_title", "Message envoyé avec succès !")}</h3>
                                <p className="text-xs text-[#166534] mb-4">{t("contact.success_desc", "Merci de nous avoir contactés. Notre équipe reviendra vers vous dans les plus brefs délais.")}</p>
                                <button
                                    onClick={() => setEnvoye(false)}
                                    className="text-xs font-bold text-[#15803D] underline cursor-pointer"
                                >
                                    Envoyer un autre message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Ligne 1 : Nom complet & Email */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-ope-text mb-1.5">
                                            {t("full_name", "Nom complet")}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.nom}
                                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                            className="w-full bg-[#FAF5EE] border border-[#E8DEC8] text-ope-text text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-ope-primary transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-ope-text mb-1.5">
                                            {t("email", "Adresse e-mail")}
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-[#FAF5EE] border border-[#E8DEC8] text-ope-text text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-ope-primary transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Ligne 2 : Sujet */}
                                <div>
                                    <label className="block text-[11px] font-bold text-ope-text mb-1.5">
                                        {t("subject", "Sujet")}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.sujet}
                                        onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                                        className="w-full bg-[#FAF5EE] border border-[#E8DEC8] text-ope-text text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-ope-primary transition-colors"
                                    />
                                </div>

                                {/* Ligne 3 : Message */}
                                <div>
                                    <label className="block text-[11px] font-bold text-ope-text mb-1.5">
                                        {t("message", "Message")}
                                    </label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full bg-[#FAF5EE] border border-[#E8DEC8] text-ope-text text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-ope-primary resize-none transition-colors"
                                    />
                                </div>

                                {/* Bouton Soumettre */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={chargement}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-ope-orange hover:bg-ope-orange/90 active:scale-95 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        <span>{chargement ? t("contact.sending", "Envoi en cours...") : t("contact.submit", "Envoyer le message")}</span>
                                        {chargement ? (
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* ── Colonne Droite : Coordonnées & Réseaux Sociaux (5/12) ── */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Carte Coordonnées */}
                        <div className="bg-ope-white rounded-3xl p-7 sm:p-8 border border-ope-border shadow-2xs">
                            <h2 className="text-lg font-extrabold text-ope-text mb-6 tracking-tight">
                                {t("contact.info_title", "Coordonnées")}
                            </h2>

                            <div className="space-y-6">
                                {/* Adresse */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#FDE9E2] text-[#BD5338] flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-ope-text-muted font-medium mb-0.5">{t("contact.address_label", "Siège & Bureaux")}</p>
                                        <p className="text-xs sm:text-sm font-bold text-ope-text leading-snug">
                                            {t("contact.address_val", "Agadez, République du Niger")}
                                        </p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#FDE9E2] text-[#BD5338] flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-ope-text-muted font-medium mb-0.5">Email</p>
                                        <a
                                            href="mailto:contact@ope.ne"
                                            className="text-xs sm:text-sm font-bold text-ope-text hover:text-ope-orange transition-colors"
                                        >
                                            contact@ope.ne
                                        </a>
                                    </div>
                                </div>

                                {/* Permanence & Horaires */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#FDE9E2] text-[#BD5338] flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-ope-text-muted font-medium mb-0.5">{t("contact.hours_label", "Horaires")}</p>
                                        <p className="text-xs sm:text-sm font-bold text-ope-text leading-snug">
                                            {t("contact.hours_val", "Lun - Ven : 08h00 - 17h30")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Carte Réseaux Sociaux */}
                        <div className="bg-ope-white rounded-3xl p-7 sm:p-8 border border-ope-border shadow-2xs">
                            <h2 className="text-lg font-extrabold text-ope-text mb-2 tracking-tight">
                                Réseaux Sociaux
                            </h2>
                            <p className="text-xs text-ope-text-muted leading-relaxed mb-6">
                                Suivez nos actualités et l'évolution des talents OPE.
                            </p>

                            {/* Icônes Réseaux Sociaux */}
                            <div className="flex items-center gap-3">
                                {/* Facebook */}
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-10 h-10 rounded-full bg-[#FAF5EE] border border-[#E8DEC8] flex items-center justify-center text-ope-text hover:bg-[#BD5338] hover:text-white hover:border-[#BD5338] transition-all cursor-pointer"
                                    aria-label="Facebook"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>

                                {/* Twitter / X */}
                                <a
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-10 h-10 rounded-full bg-[#FAF5EE] border border-[#E8DEC8] flex items-center justify-center text-ope-text hover:bg-[#BD5338] hover:text-white hover:border-[#BD5338] transition-all cursor-pointer"
                                    aria-label="Twitter X"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>

                                {/* LinkedIn */}
                                <a
                                    href="https://linkedin.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-10 h-10 rounded-full bg-[#FAF5EE] border border-[#E8DEC8] flex items-center justify-center text-ope-text hover:bg-[#BD5338] hover:text-white hover:border-[#BD5338] transition-all cursor-pointer"
                                    aria-label="LinkedIn"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
