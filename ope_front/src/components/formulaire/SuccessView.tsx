import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode";
import campNationalCitoyen from "../../assets/camp_natio.png";

interface SuccessViewProps {
  reference: string;
  categorie: "junior" | "senior";
  prenom: string;
  nom: string;
  regionVille: string;
  badgeTag: string; // "Concours Mascotte" ou Domaine STEAM
  photoUrl?: string;
  contactEmail?: string;
  onNewApplication: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  reference,
  categorie,
  prenom,
  nom,
  regionVille,
  badgeTag,
  photoUrl,
  contactEmail,
  onNewApplication,
}) => {
  const { t } = useTranslation();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (!reference) return;

    const qrPayload = JSON.stringify({
      ref: reference,
      nom: `${prenom} ${nom}`,
      categorie: categorie === "junior" ? "Junior (Mascotte)" : "Senior (STEAM)",
      statut: "soumis",
      date: new Date().toLocaleDateString("fr-FR"),
      event: "CNCEIZ Agadez 2026",
    });

    QRCode.toDataURL(qrPayload, {
      width: 280,
      margin: 1,
      color: {
        dark: "#193549",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("Erreur génération QR code:", err));
  }, [reference, prenom, nom, categorie]);

  return (
    <div className="w-full flex flex-col items-center animate-fade-up">
      {/* Header félicitations */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#193549] mt-3">
          Félicitations, {prenom} !
        </h1>
        <p className="text-xs sm:text-sm text-[#5C6B76] max-w-md mx-auto mt-1">
          Votre candidature au CNCEIZ Agadez 2026 a été enregistrée et transmise au comité de sélection.
        </p>
      </div>

      {/* Badge Officiel Candidat */}
      <div
        id="badge-candidat-print"
        className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col items-center text-center animate-fade-up"
      >
        {/* Header aux couleurs officielles */}
        <div className="w-full bg-[#193549] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={campNationalCitoyen}
              alt="CNCEIZ"
              className="w-7 h-7 object-contain rounded-full bg-[#355064] p-0.5"
            />
            <span className="text-xs font-extrabold tracking-tight text-white">
              CNCEIZ Agadez 2026
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#355064] text-white border border-[#587083]">
            {badgeTag}
          </span>
        </div>

        {/* Corps du badge */}
        <div className="p-6 w-full flex flex-col items-center text-center">
          {/* Photo ou icône */}
          <div className="mb-3">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${prenom} ${nom}`}
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-100 shadow-sm mx-auto"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>

          <h2 className="text-lg font-extrabold text-[#193549] leading-tight">
            {prenom} {nom}
          </h2>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-[#193549] mt-1.5">
            <span>Réf:</span>
            <span>{reference}</span>
          </div>

          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-500 font-medium">
            <span>{regionVille || "Niger"}</span>
            <span>•</span>
            <span className="capitalize">{categorie === "junior" ? "Catégorie Junior" : "Catégorie Senior"}</span>
          </div>

          {/* QR Code */}
          <div className="my-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt={`QR Code ${reference}`}
                className="w-36 h-36 object-contain mix-blend-multiply"
              />
            ) : (
              <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">
                Génération...
              </div>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span>Statut :</span>
            <span>Dossier soumis</span>
          </div>

          <p className="text-[10px] text-slate-400 mt-3 font-medium">
            Présentez ce QR code lors des convocations aux pré-camps et à l'accueil du Camp.
          </p>
        </div>
      </div>

      {/* Confirmation email si renseigné */}
      {contactEmail && (
        <div className="w-full max-w-sm mt-3 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 text-center">
          Confirmation transmise à : <strong className="text-slate-800">{contactEmail}</strong>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="w-full max-w-sm mt-5 flex flex-col sm:flex-row gap-3">
        {qrCodeUrl && (
          <a
            href={qrCodeUrl}
            download={`CNCEIZ-Badge-${reference}.png`}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#193549] hover:bg-[#24455d] active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Télécharger le QR Code</span>
          </a>
        )}
        <Link
          to="/"
          className="py-3 px-4 rounded-xl font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 text-center transition-all shadow-sm"
        >
          Retour à l'accueil
        </Link>
      </div>

      <button
        type="button"
        onClick={onNewApplication}
        className="mt-4 text-xs font-semibold text-[#F15B29] hover:underline cursor-pointer"
      >
        Soumettre une nouvelle candidature
      </button>
    </div>
  );
};
