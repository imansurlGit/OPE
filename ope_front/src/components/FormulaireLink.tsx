import React from "react";
import { NavLink } from "react-router-dom";
import { useFormulaireOuvert } from "../hooks/useFormulaireOuvert";

interface FormulaireLinkProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  children: React.ReactNode;
}

/**
 * Lien vers le formulaire de candidature.
 * Avant l'ouverture : même apparence, mais bloqué (aucune navigation, curseur « interdit »).
 * S'active automatiquement à la date d'ouverture, sans recharger la page.
 */
export const FormulaireLink: React.FC<FormulaireLinkProps> = ({ className, style, onClick, children }) => {
  const ouvert = useFormulaireOuvert();

  if (ouvert) {
    return (
      <NavLink to="/formulaire" className={className} style={style} onClick={onClick}>
        {children}
      </NavLink>
    );
  }

  return (
    <a
      role="link"
      aria-disabled="true"
      className={className}
      style={{ ...style, cursor: "not-allowed" }}
      onClick={(e) => e.preventDefault()}
    >
      {children}
    </a>
  );
};
