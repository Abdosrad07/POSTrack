import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { queryClient } from '../lib/queryClient';
import { STORAGE_KEYS } from '../utils/constants';
import useAuth from '../hooks/useAuth';

export const PartnerContext = createContext(null);

const readStoredPartner = () => {
  const id = localStorage.getItem(STORAGE_KEYS.PARTNER_CONTEXT_ID);
  const raw = localStorage.getItem(STORAGE_KEYS.PARTNER_CONTEXT);
  if (!id) {
    return { partnerContextId: null, partner: null };
  }
  let partner = null;
  if (raw && raw !== 'undefined') {
    try {
      partner = JSON.parse(raw);
    } catch {
      partner = { id: Number(id) || id };
    }
  }
  return {
    partnerContextId: Number(id) || id,
    partner,
  };
};

export const PartnerProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const initial = readStoredPartner();
  const [partnerContextId, setPartnerContextId] = useState(initial.partnerContextId);
  const [partner, setPartnerState] = useState(initial.partner);

  const clearPartner = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.PARTNER_CONTEXT_ID);
    localStorage.removeItem(STORAGE_KEYS.PARTNER_CONTEXT);
    setPartnerContextId(null);
    setPartnerState(null);
    queryClient.clear();
  }, []);

  const setPartner = useCallback((nextPartner) => {
    if (!nextPartner?.id && nextPartner?.id !== 0) {
      clearPartner();
      return;
    }

    const id = nextPartner.id;
    localStorage.setItem(STORAGE_KEYS.PARTNER_CONTEXT_ID, String(id));
    localStorage.setItem(STORAGE_KEYS.PARTNER_CONTEXT, JSON.stringify(nextPartner));
    setPartnerContextId(id);
    setPartnerState(nextPartner);
    // Invalide caches React Query pour éviter le mélange de données entre partenaires
    queryClient.clear();
  }, [clearPartner]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      clearPartner();
    }
  }, [authLoading, isAuthenticated, clearPartner]);

  const value = useMemo(
    () => ({
      partnerContextId,
      partner,
      setPartner,
      clearPartner,
      hasPartner: partnerContextId != null && partnerContextId !== '',
    }),
    [partnerContextId, partner, setPartner, clearPartner]
  );

  return <PartnerContext.Provider value={value}>{children}</PartnerContext.Provider>;
};

export default PartnerContext;
