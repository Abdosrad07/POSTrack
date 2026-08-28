import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { NAV_LEVELS, STORAGE_KEYS } from '../utils/constants';
import useAuth from '../hooks/useAuth';

/**
 * Contexte du niveau de navigation actif dans la sidebar (Partenaire / DSM / POS).
 *
 * Contrairement à une détection purement basée sur l'URL, le niveau est un état
 * explicite : une fois entré dans la navigation DSM (ou POS), l'utilisateur y
 * reste pendant toute sa session de navigation et ne revient au niveau
 * Partenaire que via le bouton de retour de la sidebar. Le niveau survit au
 * rechargement de la page (persistance localStorage) et est réinitialisé à la
 * déconnexion.
 */
export const NavLevelContext = createContext(null);

/**
 * Détection du niveau par URL — utilisée au premier chargement (ouverture
 * directe d'une URL /dsm ou /pos sans niveau mémorisé) et comme repli.
 */
export const detectLevelFromPath = (pathname = '/') => {
  if (pathname === '/dsm' || pathname.startsWith('/dsm/')) {
    return NAV_LEVELS.DSM;
  }
  if (pathname === '/pos' || pathname.startsWith('/pos/')) {
    return NAV_LEVELS.POS;
  }
  return NAV_LEVELS.PARTNER;
};

const readStoredLevel = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NAV_LEVEL);
    return Object.values(NAV_LEVELS).includes(raw) ? raw : null;
  } catch {
    return null;
  }
};

const persistLevel = (value) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NAV_LEVEL, String(value));
  } catch {
    /* stockage indisponible — l'état reste valable pour la session courante */
  }
};

const clearStoredLevel = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.NAV_LEVEL);
  } catch {
    /* noop */
  }
};

export const NavLevelProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [level, setLevelState] = useState(() => {
    return readStoredLevel() || detectLevelFromPath(window.location.pathname);
  });

  const setLevel = useCallback((next) => {
    setLevelState((current) => {
      if (current === next) return current;
      persistLevel(next);
      return next;
    });
  }, []);

  // Nouvelle session (déconnexion) : retour au niveau Partenaire.
  useEffect(() => {
    if (!isAuthenticated) {
      clearStoredLevel();
      setLevelState(NAV_LEVELS.PARTNER);
    }
  }, [isAuthenticated]);

  const value = useMemo(() => ({ level, setLevel }), [level, setLevel]);

  return <NavLevelContext.Provider value={value}>{children}</NavLevelContext.Provider>;
};

export default NavLevelProvider;