import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useTranslation } from "react-i18next";
import campNationalCitoyen from "../../assets/camp_natio.png";

export interface MascotteSuccessViewProps {
  reference: string;
  nom: string;
  prenom: string;
  classe?: string;
  etablissement?: string;
  regionVille?: string;
  mascotteNom?: string;
  mascottePourquoi?: string;
  mascotteSignification?: string;
  dessinUrl?: string;
  telephoneTuteur?: string;
  nomTuteur?: string;
  onNewApplication: () => void;
}

export const MascotteSuccessView: React.FC<MascotteSuccessViewProps> = ({
  reference,
  nom,
  prenom,
  classe,
  etablissement,
  regionVille,
  mascotteNom,
  mascottePourquoi,
  mascotteSignification,
  dessinUrl,
  telephoneTuteur,
  nomTuteur,
  onNewApplication,
}) => {
  const { t } = useTranslation();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (!reference) return;

    const qrPayload = JSON.stringify({
      ref: reference,
      nom: `${prenom} ${nom}`,
      concours: "Mascotte Officielle CNCEIZ Agadez 2026",
      mascotte: mascotteNom || "Mascotte Junior",
      etablissement: etablissement || "Collège",
      date: new Date().toLocaleDateString("fr-FR"),
      statut: "œuvre_enregistrée",
    });

    QRCode.toDataURL(qrPayload, {
      width: 220,
      margin: 1,
      color: {
        dark: "#193549",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("Erreur génération QR code mascotte:", err));
  }, [reference, prenom, nom, mascotteNom, etablissement]);

  const explanation = mascotteSignification || mascottePourquoi;

  return (
    <div className="w-full flex flex-col items-center animate-fade-up">
      {/* ── TOP HERO HEADER ── */}
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-2xl sm:text-3xl font-black text-[#193549] tracking-tight">
          {t("mascotte_page.success_congrats", { name: prenom, defaultValue: `Bravo ${prenom} ! Ton dessin est bien enregistré !` })}
        </h1>
        <p className="text-xs sm:text-sm text-[#5C6B76] mt-1">
          {t("mascotte_page.success_mascotte_sub", "Ton dessin pour la mascotte officielle CNCEIZ Agadez 2026 a été enregistré avec succès.")}
        </p>
      </div>

      {/* ── ATTESTATION / CARTE D'ŒUVRE OFFICIELLE (PRINTABLE) ── */}
      <div
        id="attestation-mascotte-print"
        className="w-full max-w-2xl bg-white rounded-3xl border border-[#d0e4f0] shadow-xl overflow-hidden mb-8"
      >
        {/* Banner Top */}
        <div className="bg-[#193549] text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#122838]">
          <div className="flex items-center gap-3">
            <img
              src={campNationalCitoyen}
              alt="CNCEIZ Logo"
              className="w-12 h-12 object-contain rounded-2xl bg-white/10 p-1 border border-white/20"
            />
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#f15b29]">
                Attestation de Dépôt Artistique
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Concours de la Mascotte Officielle
              </h2>
              <div className="text-xs text-white/70">
                Camp National Citoyen • Agadez 2026
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-white/60 mt-1 font-mono">
              {t("mascotte_page.success_badge_ref", "Réf :")} {reference}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Main Visual: Drawing Preview & Title */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Drawing Preview Frame */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-[240px] rounded-2xl overflow-hidden border-2 border-dashed border-[#d0e4f0] bg-[#f4f8fb] flex items-center justify-center p-2 group shadow-inner">
                {dessinUrl ? (
                  <img
                    src={dessinUrl}
                    alt={mascotteNom || "Dessin de la mascotte"}
                    className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4 text-[#5C6B76]">
                    <svg className="w-12 h-12 mb-2 text-[#2F6084]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-bold">{t("form.file_transmitted", "Fichier transmis")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mascot Details */}
            <div className="md:col-span-7 space-y-3">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#2F6084] block">
                  {t("mascotte_page.success_mascotte_name_label", "Nom de la Mascotte")}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#193549]">
                  « {mascotteNom || "Sans titre"} »
                </h3>
              </div>

              {explanation && (
                <div className="bg-[#f4f8fb] rounded-2xl p-3.5 border border-[#d0e4f0] relative">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#5C6B76] block mb-1">
                    {t("mascotte_page.success_mascotte_why_label", "Histoire & Symbolisme de l'idée")}
                  </span>
                  <p className="text-xs text-[#193549] italic leading-relaxed">
                    « {explanation} »
                  </p>
                </div>
              )}

              {/* Young Artist Identity */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#d0e4f0]">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#5C6B76] block">
                    {t("mascotte_page.step_1_short", "Identité")}
                  </span>
                  <span className="text-xs font-bold text-[#193549]">
                    {prenom} {nom}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#5C6B76] block">
                    Classe & Établissement
                  </span>
                  <span className="text-xs font-bold text-[#193549]">
                    {classe ? `Classe de ${classe}` : "Collégien"} {etablissement ? `• ${etablissement}` : ""}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#5C6B76] block">
                    Région / Localité
                  </span>
                  <span className="text-xs font-bold text-[#193549]">
                    {regionVille || "Niger"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#5C6B76] block">
                    {t("mascotte_page.tuteur_label", "Tuteur Légal Référent")}
                  </span>
                  <span className="text-xs font-bold text-[#193549]">
                    {nomTuteur || "Parent / Tuteur"}{telephoneTuteur ? ` (${telephoneTuteur})` : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security / QR Seal */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt={`QR Verification ${reference}`}
                  className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-white p-1"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-200 animate-pulse" />
              )}
              <div className="text-left">
                <span className="text-xs font-black text-[#193549] block">
                  {t("mascotte_page.success_mascotte_certif_title", "Certificat de Participation Officiel")}
                </span>
                <span className="text-[11px] text-[#5C6B76] block leading-tight">
                  {t("mascotte_page.success_mascotte_certif_desc", "Scannez ce QR Code pour vérifier l'authenticité de l'enregistrement auprès de l'OPE.")}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-black uppercase text-[#2F6084] block tracking-wider">
                {t("mascotte_page.success_mascotte_date_label", "Date de soumission")}
              </span>
              <span className="text-xs font-bold text-[#193549]">
                {new Date().toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onNewApplication}
        className="mt-6 text-xs font-semibold text-[#f15b29] hover:underline cursor-pointer"
      >
        {t("mascotte_page.success_mascotte_new", "Soumettre un autre dessin de mascotte")}
      </button>
    </div>
  );
};
