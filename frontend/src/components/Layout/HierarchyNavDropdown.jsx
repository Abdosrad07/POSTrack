import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import usePartner from '../../hooks/usePartner';
import { hierarchyService } from '../../services/hierarchyService';
import { normalizeRole } from '../../utils/roles';

const findPartner = (tree, partnerId) => tree.find((p) => String(p.id) === String(partnerId)) || null;

const HierarchyNavDropdown = () => {
  const { user } = useAuth();
  const { partner, partnerContextId, setPartner, clearPartner } = usePartner();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hierarchy, setHierarchy] = useState([]);
  const [error, setError] = useState('');

  const role = normalizeRole(user?.role);
  const isOperationnel = role === 'OPERATIONNEL';

  useEffect(() => {
    if (!open || isOperationnel) return;
    let ignore = false;

    const load = async () => {
      if (hierarchy.length) return;
      setLoading(true);
      setError('');
      try {
        const response = await hierarchyService.getHierarchy();
        const data = Array.isArray(response) ? response : response?.data ?? response ?? [];
        if (!ignore) setHierarchy(Array.isArray(data) ? data : []);
      } catch {
        if (!ignore) setError('Impossible de charger la hiérarchie.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void load();
    return () => {
      ignore = true;
    };
  }, [open, hierarchy.length, isOperationnel]);

  const activeLabel = useMemo(() => {
    if (!partner) return 'Tous les partenaires';
    return partner.nom || partner.code_partenaire || `Partenaire #${partnerContextId}`;
  }, [partner, partnerContextId]);

  const handleSelect = (item) => {
    setPartner(item);
    setOpen(false);
    navigate('/');
  };

  if (isOperationnel) {
    return (
      <div className="hidden sm:block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <div className="font-semibold text-slate-900">{activeLabel}</div>
        <div>Contexte verrouillé sur votre Partenaire assigné</div>
      </div>
    );
  }

  return (
    <div className="relative hidden sm:block">
      <button
        type="button"
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm hover:bg-slate-50"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Hiérarchie"
      >
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Hiérarchie</div>
          <div className="text-sm font-semibold text-slate-900">{activeLabel}</div>
        </div>
        <span className="text-xs text-slate-500">Partenaire → DSM → POS</span>
      </button>

      {open ? (
        <div role="dialog" aria-label="Navigation réseau" className="absolute left-0 top-full z-50 mt-2 w-[min(92vw,32rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Navigation réseau</div>
              <div className="text-xs text-slate-500">Sélectionnez un partenaire pour filtrer le dashboard et la sidebar.</div>
            </div>
            <button type="button" className="text-xs text-slate-500 hover:text-slate-900" onClick={() => { clearPartner(); setOpen(false); navigate('/'); }}>
              Réinitialiser
            </button>
          </div>

          {loading ? <div className="py-6 text-sm text-slate-500">Chargement...</div> : null}
          {error ? <div className="py-6 text-sm text-red-600">{error}</div> : null}

          {!loading && !error ? (
            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {(hierarchy || []).map((p) => (
                <div key={p.id} className="rounded-xl border border-slate-200 p-3">
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => handleSelect(p)}
                  >
                    <div className="font-semibold text-slate-900">{p.nom ?? p.code_partenaire ?? `Partenaire #${p.id}`}</div>
                    <div className="text-xs text-slate-500">{p.code_partenaire || '—'}</div>
                  </button>
                  <div className="mt-2 space-y-2 pl-3 border-l border-slate-100">
                    {(p.dsms || []).map((dsm) => (
                      <div key={dsm.id} className="text-sm text-slate-700">
                        <div className="font-medium">{dsm.nom ?? dsm.nom_complet ?? `DSM #${dsm.id}`}</div>
                        <div className="text-xs text-slate-500">{dsm.matricule || dsm.code_dsm || '—'}</div>
                        {(dsm.pos || []).length ? (
                          <div className="mt-1 pl-3 text-xs text-slate-500">
                            {(dsm.pos || []).map((pos) => (
                              <div key={pos.id}>• {pos.code_pos || pos.nom || `POS #${pos.id}`}</div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {!hierarchy.length ? <div className="py-6 text-sm text-slate-500">Aucun partenaire disponible.</div> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default HierarchyNavDropdown;