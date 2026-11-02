import { useEffect, useState } from "react";

// Ouverture des candidatures : 3 novembre 2026 à 0h00, heure du Niger (UTC+1)
export const FORMULAIRE_OUVERTURE = new Date("2026-11-03T00:00:00+01:00");

// setTimeout ne gère pas les délais supérieurs à ~24,8 jours : on replanifie par tranches de 24 h
const DELAI_MAX = 24 * 60 * 60 * 1000;

export function isFormulaireOuvert(now: number = Date.now()): boolean {
  return now >= FORMULAIRE_OUVERTURE.getTime();
}

/** Indique si le formulaire de candidature est ouvert, et bascule automatiquement à l'heure d'ouverture. */
export function useFormulaireOuvert(): boolean {
  const [ouvert, setOuvert] = useState(() => isFormulaireOuvert());

  useEffect(() => {
    if (ouvert) return;
    let timer: ReturnType<typeof setTimeout>;
    const planifier = () => {
      const delai = Math.min(Math.max(FORMULAIRE_OUVERTURE.getTime() - Date.now(), 0), DELAI_MAX);
      timer = setTimeout(() => (isFormulaireOuvert() ? setOuvert(true) : planifier()), delai);
    };
    planifier();
    return () => clearTimeout(timer);
  }, [ouvert]);

  return ouvert;
}
