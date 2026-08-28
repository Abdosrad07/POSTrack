import { useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { NavLevelContext, detectLevelFromPath } from '../context/NavLevelContext';
import { NAV_LEVELS } from '../utils/constants';

/**
 * Hook pour connaître le niveau hiérarchique actif dans la sidebar.
 *
 * Le niveau est un état explicite (NavLevelContext) : il ne change plus
 * automatiquement avec l'URL. Après une entrée dans la navigation DSM ou POS,
 * l'utilisateur y reste — y compris sur des routes partagées comme /pos,
 * /ventes ou /requetes — jusqu'à un retour explicite au niveau Partenaire
 * (bouton « Retour au niveau Partenaire » de la sidebar).
 *
 * Sans NavLevelProvider (tests unitaires), repli sur la détection par URL :
 * - /dsm ou /dsm/* → niveau DSM
 * - /pos ou /pos/* → niveau POS
 * - tout autre    → niveau Partenaire
 */
export const useNavigationLevel = () => {
  const context = useContext(NavLevelContext);
  const location = useLocation();
  const pathname = location?.pathname || '/';

  const urlLevel = useMemo(() => detectLevelFromPath(pathname), [pathname]);

  const level = context?.level || urlLevel;

  return {
    level,
    isPartner: level === NAV_LEVELS.PARTNER,
    isDsm: level === NAV_LEVELS.DSM,
    isPos: level === NAV_LEVELS.POS,
    setLevel: context?.setLevel,
  };
};

export default useNavigationLevel;
