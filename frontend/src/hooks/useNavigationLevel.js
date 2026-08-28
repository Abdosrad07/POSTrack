import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { NAV_LEVELS } from '../utils/constants';

/**
 * Hook pour détecter le niveau hiérarchique actuel dans la sidebar.
 * 
 * Règles de détection :
 * - /dsm ou /dsm/* → niveau DSM
 * - /pos ou /pos/* → niveau POS
 * - tout autre → niveau Partenaire
 */
export const useNavigationLevel = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const level = useMemo(() => {
    // DSM routes
    if (pathname === '/dsm' || pathname.startsWith('/dsm/')) {
      return NAV_LEVELS.DSM;
    }
    
    // POS routes
    if (pathname === '/pos' || pathname.startsWith('/pos/')) {
      return NAV_LEVELS.POS;
    }
    
    // Default to PARTNER level
    return NAV_LEVELS.PARTNER;
  }, [pathname]);

  return {
    level,
    isPartner: level === NAV_LEVELS.PARTNER,
    isDsm: level === NAV_LEVELS.DSM,
    isPos: level === NAV_LEVELS.POS,
  };
};

export default useNavigationLevel;
